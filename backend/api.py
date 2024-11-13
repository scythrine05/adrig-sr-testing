import pandas as pd
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origin=["https://sr.adrig.co.in"])

# Utility function to log each step for live commentary
def add_optimisation_details(optimisation_steps, message):
    optimisation_steps.append(message)

def find_corridor_timing(mission_block, selected_line, corridor_df):
    corridor_row = corridor_df[(corridor_df['Section/ station'] == mission_block) & 
                               (corridor_df['Line'] == selected_line)]
    if not corridor_row.empty:
        from_time = corridor_row.iloc[0]['From']
        to_time = corridor_row.iloc[0]['To']
        return {"from": from_time, "to": to_time}
    else:
        return {"from": "00:00", "to": "04:00"}

def calculate_total_duration(from_time, to_time):
    from_dt = datetime.strptime(from_time, "%H:%M")
    to_dt = datetime.strptime(to_time, "%H:%M")
    if from_dt > to_dt:
        to_dt += timedelta(hours=24)
    total_duration = (to_dt - from_dt).total_seconds() / 3600
    return total_duration

def calculate_end_time(start_time, duration_hours):
    start_dt = datetime.strptime(start_time, "%H:%M")
    end_dt = start_dt + timedelta(hours=duration_hours)
    end_time = (end_dt.hour % 24, end_dt.minute)  # Get hours and minutes in 24-hour format
    return f"{end_time[0]:02d}:{end_time[1]:02d}"

def calculate_start_time(end_time, duration_hours):
    end_dt = datetime.strptime(end_time, "%H:%M")
    start_dt = end_dt - timedelta(hours=duration_hours)
    start_time = (start_dt.hour % 24, start_dt.minute)  # Get hours and minutes in 24-hour format
    return f"{start_time[0]:02d}:{start_time[1]:02d}"

def find_section(mission_block, section_data):
    for section, data in section_data.items():
        if mission_block in data["section"]:
            return section

def find_direction(section, line, line_data):
    line_info = line_data.get(section)
    if line_info:
        direction = line_info.get(line)
        return direction  # This will return 0, 1, or 2 based on the line_data dictionary
    return None

def find_shadow_blocks(mission_block, section, direction):
    if mission_block not in section:
        return []
    index = section.index(mission_block)
    if direction == 0:
        shadow_blocks = section[index+1:]
    elif direction == 1:
        shadow_blocks = section[:index]
    elif direction == 2:
        shadow_blocks = section[:index] + section[index+1:]
    return shadow_blocks

def optimisationLogic(sorted_group_df, corridor, optimisation_steps):
    cf = datetime.strptime(corridor["from"], "%H:%M").time()
    ct = datetime.strptime(corridor["to"], "%H:%M").time()

    for index, row in sorted_group_df.iterrows():
        row_optimisation_steps = row["optimisation_details"]
        row_optimisation_steps.append(f"Corridor block: From {cf.strftime('%H:%M')} to {ct.strftime('%H:%M')}")

        row["demandTimeFrom"] = str(row["demandTimeFrom"])
        row["demandTimeTo"] = str(row["demandTimeTo"])

        row["demandTimeFrom"] = datetime.strptime(row["demandTimeFrom"], "%H:%M").time()
        row["demandTimeTo"] = datetime.strptime(row["demandTimeTo"], "%H:%M").time()

        if row["demandTimeFrom"] >= cf and row["demandTimeTo"] <= ct:
            row["optimisedTimeFrom"] = row["demandTimeFrom"].strftime("%H:%M")
            row["optimisedTimeTo"] = row["demandTimeTo"].strftime("%H:%M")
            row_optimisation_steps.append(f"Request fits in the corridor from {row['demandTimeFrom']} to {row['demandTimeTo']}")
        elif row["demandTimeFrom"] < cf:
            row["optimisedTimeFrom"] = cf.strftime("%H:%M")
            row["optimisedTimeTo"] = calculate_end_time(cf.strftime("%H:%M"), calculate_total_duration(
                row["demandTimeFrom"].strftime("%H:%M"), row["demandTimeTo"].strftime("%H:%M")
            ))
            row_optimisation_steps.append(f"Adjusted request to fit within corridor: {cf.strftime('%H:%M')} to {row['optimisedTimeTo']}")
        elif row["demandTimeTo"] > ct:
            row["optimisedTimeTo"] = ct.strftime("%H:%M")
            row["optimisedTimeFrom"] = calculate_start_time(ct.strftime("%H:%M"), calculate_total_duration(
                row["demandTimeFrom"].strftime("%H:%M"), row["demandTimeTo"].strftime("%H:%M")
            ))
            row_optimisation_steps.append(f"Adjusted request to fit within corridor: {row['optimisedTimeFrom']} to {ct.strftime('%H:%M')}")

        # Ensure optimisedTimeFrom and optimisedTimeTo are added correctly
        sorted_group_df.at[index, "optimisedTimeFrom"] = row["optimisedTimeFrom"]
        sorted_group_df.at[index, "optimisedTimeTo"] = row["optimisedTimeTo"]
        sorted_group_df.at[index, "optimisation_details"] = row_optimisation_steps

    return sorted_group_df

def engopt(grouped_enggReqs, corridor_df, enggReqs):
    df_list = []
    pushed_rows_list = []
    optimisation_steps = []

    for group_engg_key, group_engg_df in grouped_enggReqs:
        selected_line = group_engg_key[2]
        mission_block = group_engg_key[1]
        date = group_engg_key[0]
        corridor = find_corridor_timing(mission_block, selected_line, corridor_df)
        corridorTotalTime = calculate_total_duration(corridor['from'], corridor['to'])
        total_requests_duration = 0

        group_engg_df['duration'] = group_engg_df.apply(
            lambda row: calculate_total_duration(row['demandTimeFrom'], row['demandTimeTo']),
            axis=1
        )
        group_engg_df["optimisation_details"] = [[] for _ in range(len(group_engg_df))]
        sorted_group_engg_df = group_engg_df.sort_values(by=['pushed', 'duration'], ascending=[False, False])
        
        for index, requests in sorted_group_engg_df.iterrows():
            requestDuration = calculate_total_duration(requests['demandTimeFrom'], requests['demandTimeTo'])
            total_requests_duration += requestDuration
            sorted_group_engg_df.at[index, "optimisation_details"].append(
                f"Processing request {requests['requestId']} with duration {requestDuration}."
            )

        while total_requests_duration > corridorTotalTime and sorted_group_engg_df.shape[0] >= 2:
            last_row = sorted_group_engg_df.iloc[-1]
            sorted_group_engg_df = sorted_group_engg_df.iloc[:-1]
            last_row['date'] = (datetime.strptime(last_row['date'], "%d-%m-%Y") + timedelta(days=1)).strftime("%d-%m-%Y")
            last_row['pushed'] += 1
            last_row["optimisation_details"].append(f"Pushed row {last_row['requestId']} to next day due to corridor limit.")
            pushed_rows_list.append(last_row)
            total_requests_duration -= last_row['duration']

        sorted_group_engg_df = optimisationLogic(sorted_group_engg_df, corridor, optimisation_steps)
        df_list.append(sorted_group_engg_df)

    enggOptiReqs = pd.concat(df_list, ignore_index=True)

    if pushed_rows_list:
        pushed_rows_df = pd.DataFrame(pushed_rows_list)
        grouped_pushed_req = pushed_rows_df.groupby(['date', 'missionBlock', 'selectedLine'])
        pushed_optimised, _ = engopt(grouped_pushed_req, corridor_df, enggReqs)
        enggOptiReqs = pd.concat([enggOptiReqs, pushed_optimised], ignore_index=True)

    return enggOptiReqs, grouped_enggReqs

def nonEngopt(grouped_nonEnggReqs, corridor_df, nonEnggReqs, enggOpti, section_data, line_data):
    nonenggOptiReq = pd.DataFrame()
    next_day_requests = pd.DataFrame()

    for group_nonengg_key, group_nonengg_df in grouped_nonEnggReqs:
        selected_line = group_nonengg_key[2]
        mission_block = group_nonengg_key[1]
        date = group_nonengg_key[0]

        optimisation_steps = []  # Track optimization steps for this group
        
        # Find the corridor timing for the mission block and line
        corridor = find_corridor_timing(mission_block, selected_line, corridor_df)
        corridorTotalTime = calculate_total_duration(corridor['from'], corridor['to'])
        total_requests_duration = 0

        # Calculate the duration for each request in the group
        group_nonengg_df['duration'] = group_nonengg_df.apply(
            lambda row: calculate_total_duration(row['demandTimeFrom'], row['demandTimeTo']),
            axis=1
        )

        # Initialize optimisation_details as an empty list for every row
        group_nonengg_df["optimisation_details"] = [[] for _ in range(len(group_nonengg_df))]

        # Sort the group by 'pushed' and 'duration'
        sorted_group_nonengg_df = group_nonengg_df.sort_values(by=['pushed', 'duration'], ascending=[False, False])

        # Calculate total request durations
        for index, requests in sorted_group_nonengg_df.iterrows():
            total_requests_duration += requests['duration']
            # Add the initial optimization steps for this row
            sorted_group_nonengg_df.at[index, "optimisation_details"].append(
                f"Processing request {requests['requestId']} with duration {requests['duration']}."
            )

        # Find the section and direction
        section = find_section(mission_block, section_data)
        direction = find_direction(section, selected_line, line_data)

        shadow_blocks = []
        if section is not None:
            if direction == 0:
                shadow_blocks = find_shadow_blocks(mission_block, section_data[section], 0)
            elif direction == 1:
                shadow_blocks = find_shadow_blocks(mission_block, section_data[section], 1)
            else:
                shadow_blocks = find_shadow_blocks(mission_block, section_data[section], 2)

        shadow_block_times = []
        for block in shadow_blocks:
            filtered_rows = enggOpti.loc[
                (enggOpti['date'] == date) &
                (enggOpti['missionBlock'] == mission_block) &
                (enggOpti['selectedLine'] == selected_line)
            ]
            for _, rows in filtered_rows.iterrows():
                demandedtimefrom = rows["demandedTimeFrom"]
                demandedtimeto = rows["demandedTimeTo"]
                shadow_block_times.append((demandedtimefrom, demandedtimeto))

        # Handle shadow blocks
        for fr, to in shadow_block_times:
            shadowBlockTime = calculate_total_duration(fr, to)
            optimisation_steps.append(f"Attempting to fit requests into shadow block from {fr} to {to}.")

            # Move the excess requests to next day's shadow block if necessary
            while total_requests_duration > shadowBlockTime and len(sorted_group_nonengg_df) > 1:
                # Move the last ranked request (highest duration) to next day's shadow block
                last_request = sorted_group_nonengg_df.iloc[-1]

                # Remove the last request from the original group
                sorted_group_nonengg_df = sorted_group_nonengg_df.iloc[:-1]

                # Update date for the next day's group
                last_request['date'] = (datetime.strptime(last_request['date'], "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
                last_request['pushed'] += 1  # Increase the push count for priority
                optimisation_steps.append(f"Pushed request {last_request['requestId']} to the next day due to shadow block limit.")

                # Add to the next day's requests for further optimization
                next_day_requests = pd.concat([next_day_requests, pd.DataFrame([last_request])], ignore_index=True)
                total_requests_duration -= last_request['duration']

            # Once all shadow block times are used, optimize the remaining requests
            sorted_group_nonengg_df = optimisationLogic(sorted_group_nonengg_df, corridor, optimisation_steps)
            nonenggOptiReq = pd.concat([nonenggOptiReq, sorted_group_nonengg_df], ignore_index=True)

        # Handle corridor block after shadow blocks
        remaining_requests = sorted_group_nonengg_df
        remaining_corridor_time = corridorTotalTime - total_requests_duration

        # Try to fit the remaining requests in the corridor block
        fr = corridor["from"]
        to = corridor["to"]
        corridorBlockTime = calculate_total_duration(fr, to)

        while total_requests_duration > corridorBlockTime and len(sorted_group_nonengg_df) > 1:
            last_request = sorted_group_nonengg_df.iloc[-1]

            # Remove the last request from the current group
            sorted_group_nonengg_df = sorted_group_nonengg_df.iloc[:-1]

            # Update date for the next day's group
            last_request['date'] = (datetime.strptime(last_request['date'], "%d-%m-%Y") + timedelta(days=1)).strftime("%d-%m-%Y")
            last_request['pushed'] += 1
            optimisation_steps.append(f"Pushed request {last_request['requestId']} to the next day due to corridor block limit.")

            # Add to the next day's requests for further optimization
            next_day_requests = pd.concat([next_day_requests, pd.DataFrame([last_request])], ignore_index=True)
            total_requests_duration -= last_request['duration']

        # Once all corridor block times are used, optimize the remaining requests
        sorted_group_nonengg_df = optimisationLogic(sorted_group_nonengg_df, corridor, optimisation_steps)
        nonenggOptiReq = pd.concat([nonenggOptiReq, sorted_group_nonengg_df], ignore_index=True)

        # Add optimization details to the DataFrame
        sorted_group_nonengg_df['optimisation_details'] = ["; ".join(steps) for steps in sorted_group_nonengg_df['optimisation_details']]

    # If there are pushed rows, re-optimize the next day's groups
    if not next_day_requests.empty:
        next_grouped_nonenggReqs = next_day_requests.groupby(['date', 'missionBlock', 'selectedLine'])
        nonenggOptiReq = pd.concat(
            [nonenggOptiReq, nonEngopt(next_grouped_nonenggReqs, corridor_df, nonEnggReqs, enggOpti, section_data, line_data)[0]],
            ignore_index=True
        )

    return nonenggOptiReq, grouped_nonEnggReqs

# Existing section data
section_data = {
    "AJJ-RU": {"section": ["AJJ-YD","AJJ-AJJN","MLPM -YD","MLPM-AJJN","AJJN-YD","AJJN-TRT","TRT-YD","TRT-POI","POI-YD", "POI-VKZ", "VKZ-NG","NG-YD", "NG-EKM",
                           "EKM-VGA", "VAG-YD","VGA-PUT","PUT-YD", "PUT-TDK","TDK-YD", "TDK-PUDI","PUDI-YD", "PUDI-RU","RU-YD"]},


    "MAS-AJJ": {"section": ["MAS-YD","MAS-BBQ", "MMCC-YD","MMCC-BBQ","BBQ-YD","BBQ-VPY", "VPY-YD", "VPY-VLK","VLK-YD", "VLK-ABU","ABU-YD", 
                            "ABU-AVD","AVD-YD" "AVD-PAB","PAB-YD","PAB-TI","TI-YD", "TI-TRL","TRL-YD", "TRL-KBT","KBT-YD", "KBT-TO","TO-YD", "TO-AJJ","AJJ-YD"]},


    "MSB-VM": {"section": ["MSB-MS","MS-YD", "MS-MKK","MKK-YD", "MKK-MBM","MBM-YD", "MBM-STM","STM-YD", "STM-PV","PV-YD" "PV-TBM", "TBM-YD","TBM-PRGL",
                           "PRGL-VDR", "VDR-YD","VDR-UPM", "UPM-GI","GI-YD","POTI-CTM","CTM-YD","CTM-MMNK","MMNK-SKL","SKL-YD","SKL-PWU","PWU-CGL","CGL-YD", "CGL-OV","OV-YD","OV-PTM","PTM-KGZ","KGZ-YD","KGZ-MMK","MMK-YD","MMK-MLMR","MLMR-YD","MLMR-ACK","ACK-TZD","TZD-YD","TZD-OLA","OLA-YD","OLA-TMV","TMV-YD","TMV-MTL","MTL-YD","MTL-PEI","PEI-YD","PEI-VVN","VVN-YD","VVN-MYP","MYP-YD","MYP-VM","VM-YD"]},


    "AJJ-KPD": {"section": ["AJJ-YD", "AJJ-MLPM","MLPM-YD", "MLPM-CTRE","CTRE-YD", "CTRE-MDVE","MDVE-YD", "MDVE-SHU","SHU-YD", "SHU-TUG","TUG-YD", "TUG-WJR",
                            "WJR-YD","WJR-MCN","MCN-YD", "MCN-THL","THL-YD", "THL-SVUR", "SVUR-YD","SVUR-KPD","KPD-YD"]},



    "MAS-GDR": {"section": ["MMC-YD","MMC-BBQ","BBQ-YD","BBQ-KOK","KOK-YD", "KOK-TNP","TNP-YD", "TNP-TVT","TVT-YD", "TVT-ENR","ENR-YD", "ENR-AIP","AIP-YD",
                            "AIP-AIPP","AIPP-YD","AIPP-MJR", "MJR-YD","MJR-PON","PON-YD", "PON-KVP","KVP-YD", "KVP-GPD","GPD-YD", "GPD-ELR","ELR-YD",
                            "ELR-AKM","AKM-YD", "AKM-TAD","TAD-YD","TAD-AKAT", "AKAT-SPE","SPE-YD", "SPE-PEL","PEL-YD", "PEL-DVR","DVR-YD",
                            "DVR-NYP","NYP-YD", "NYP-PYA", "PYA-YD","PYA-ODR","ODR-YD","ODR-GDR","GDR-YD"]},



    "AJJ-CGL": {"section": ["CGL-RDY","CGL-YD","RDY-VB", "VB-PALR","PALR-YD", "PALR-PYV", "PYV-WJ","WJ-YD", "WJ-NTT", "NTT-CJ(O)","CJ(O)-YD",
                            "CJ(O)-CJ(E)","CJ(E)-YD", "CJ(E)-TMLP","TMLP-YD", "TMLP-TKO", "TKO-MLPM","MLPM-YD" "MLPM-AJJ","AJJ-YD"]},



    "KPD-JTJ": {"section": ["KPD-YD", "KPD-LTI","LTI-YD" "LTI-KVN","KVN-YD", "KVN-GYM","GYM-YD", "GYM-VLT","VLT-YD","VLT-MPI","MPI-YD", "MPI-PCKM","PCKM-YD",
                             "PCKM-AB","AB-YD", "AB-VGM","VGM-YD", "VGM-VN","VN-YD", "VN-KDY","KDY-YD", "KDY-JTJ","JTJ-YD"]},
}

line_data = {
    "AJJ-RU": {"UP":0, "DN": 1},
    "MAS-AJJ": {"Up slow":0, "Down slow": 1, "Up fast":0, "Down fast":1},
    "MSB-VM": {"UP line":0,"Up sub urban":0, "Down Sub urban": 1, "Down line":1, "B line":2, "A line":2},
    "AJJ-KPD": {"UP line":0, "Down line": 1 },
    "MAS-GDR": {"UP slow":0,"UP fast":0, "UP line":0, "Down Slow": 1, "Down Fast":1,"Down line":1},
    "AJJ-CGL": {"UP line": 0, "Down line":1},
    "KPD-JTJ": {"UP line":0, "Down line": 1},
}

# Optimization function
def optimize_request_data(request_data, corridor_df, section_data, line_data):
    # Normalize request data into a DataFrame
    df = pd.json_normalize(request_data)
    df["pushed"] = 0  # Initialize the "pushed" column

    # Separate engineering and non-engineering requests
    enggReqs = df[df['selectedDepartment'] == 'ENGG']  # Engineering requests
    nonEnggReqs = df[df['selectedDepartment'] != 'ENGG']  # Non-engineering requests

    # Group by 'date', 'missionBlock', and 'selectedLine'
    grouped_enggReqs = enggReqs.groupby(['date', 'missionBlock', 'selectedLine'])
    enggOpti, grouped_enggReqs = engopt(grouped_enggReqs, corridor_df, enggReqs)

    # Group by 'date', 'missionBlock', and 'selectedLine' for non-engineering requests
    grouped_nonEnggReqs = nonEnggReqs.groupby(['date', 'missionBlock', 'selectedLine'])
    nonEnggOpti, grouped_nonEnggReqs = nonEngopt(grouped_nonEnggReqs, corridor_df, nonEnggReqs, enggOpti, section_data, line_data)

    # Combine both DataFrames into one final DataFrame
    final_combined_df = pd.concat([enggOpti, nonEnggOpti], ignore_index=True)

    return final_combined_df

@app.route('/backend/optimize', methods=['POST'])
def optimize():
    try:
        # Parse JSON data from the request
        data = request.json
        request_data = data['requestData']

        # Load corridor data from CSV
        corridor_csv_path = './Corridor - Final.csv'
        corridor_df = pd.read_csv(corridor_csv_path)

        # Run the optimization
        optimized_df = optimize_request_data(request_data, corridor_df, section_data, line_data)

        # Convert the optimized DataFrame to JSON format for response
        optimized_data = optimized_df.to_dict(orient='records')

        return jsonify({"optimizedData": optimized_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)