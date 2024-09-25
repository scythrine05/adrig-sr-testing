from flask import Flask, request, jsonify
import pandas as pd
from datetime import datetime, timedelta
from flask_cors import CORS 
app = Flask(__name__)
CORS(app, origin=["http://localhost:3000"])
# Load corridor data from CSV with correct time parsing
def load_corridor_data(corridor_csv_path):
    df_corridor = pd.read_csv(corridor_csv_path)
    corridor_data = {}
    for _, row in df_corridor.iterrows():
        section_block = row['Section/ station']
        
        from_time = row['From'].replace(' hrs', '') if pd.notna(row['From']) else "00.00"
        to_time = row['To'].replace(' hrs', '') if pd.notna(row['To']) else "04.00"

        try:
            from_time_converted = datetime.strptime(from_time, "%H.%M").strftime("%H:%M")
        except ValueError:
            from_time_converted = "00:00"  

        try:
            to_time_converted = datetime.strptime(to_time, "%H.%M").strftime("%H:%M")
        except ValueError:
            to_time_converted = "04:00" 

        corridor_data[section_block] = {
            "From": from_time_converted,
            "To": to_time_converted,
            "Duration": row['Duration'] if pd.notna(row['Duration']) else "04:00"
        }

    return corridor_data

# Section data definition
sectionData = {
    "AJJ-RU": {"section": ["AJJ-AJJN", "MLPM-AJJN", "AJJN-TRT", "TRT-POI", "POI-VKZ", "VKZ-NG", "NG-EKM",
                           "EKM-VGA", "VGA-PUT", "PUT-TDK", "TDK-PUDI", "PUDI-RU"]},
    "MAS-AJJ": {"section": ["MAS-BBQ", "MMCC-BBQ", "BBQ-VPY", "VPY-VLK", "VLK-ABU", "ABU-AVD", "AVD-PAB",
                            "PAB-TI", "TI-TRL", "TRL-KBT", "KBT-TO", "TO-AJJ"]},
    # (other sections are as previously defined)
}

def parse_time(time_str):
    try:
        if time_str and isinstance(time_str, str) and time_str.strip():
            return datetime.strptime(time_str.strip(), "%H:%M").time()
        else:
            return None
    except ValueError:
        return None

def is_time_overlap(start1, end1, start2, end2):
    if None in [start1, end1, start2, end2]:
        return False
    return max(start1, start2) < min(end1, end2)

def fit_requests_in_corridor(request, corridor_start, corridor_end):
    req_start = parse_time(request['demandTimeFrom'])
    req_end = parse_time(request['demandTimeTo'])

    if req_start is None or req_end is None or corridor_start is None or corridor_end is None:
        return "", "" 

    req_duration = datetime.combine(datetime.min, req_end) - datetime.combine(datetime.min, req_start)
    req_duration_hours = req_duration.total_seconds() / 3600

    if req_start < corridor_start:
        req_start = corridor_start
    if req_end > corridor_end or req_duration_hours > (corridor_end.hour + corridor_end.minute / 60 - req_start.hour - req_start.minute / 60):
        adjusted_end = (datetime.combine(datetime.min, req_start) + timedelta(hours=req_duration_hours)).time()
        if adjusted_end > corridor_end:
            req_end = corridor_end
        else:
            req_end = adjusted_end

    return req_start.strftime("%H:%M"), req_end.strftime("%H:%M")

def adjust_requests_to_corridor(request_data, corridor_data, section_data):
    optimized_requests = []
    engineering_requests = []
    non_engineering_requests = []

    for request in request_data:
        if request['selectedDepartment'] == 'ENGG':
            engineering_requests.append(request)
        else:
            non_engineering_requests.append(request)

    # Optimize Engineering Requests within the Corridor Block
    for request in engineering_requests:
        mission_block = request['missionBlock']
        corridor_block = corridor_data.get(mission_block, {"From": "00:00", "To": "04:00"})
        
        corridor_start = parse_time(corridor_block['From'])
        corridor_end = parse_time(corridor_block['To'])

        optimised_from, optimised_to = fit_requests_in_corridor(request, corridor_start, corridor_end)
        
        request['Optimisedtimefrom'] = optimised_from
        request['Optimisedtimeto'] = optimised_to
        request['optimization_details'] = (
            f"Engineering request for mission block '{mission_block}' was adjusted to fit within the corridor time block "
            f"from {corridor_start} to {corridor_end}. Original demand was from {request['demandTimeFrom']} to {request['demandTimeTo']} "
            f"adjusted to {optimised_from} to {optimised_to}."
        )
        
        optimized_requests.append(request)

    shadow_blocks = {}
    for eng_request in optimized_requests:
        if eng_request['selectedDepartment'] == 'ENGG':
            mission_block = eng_request['missionBlock']
            for section_name, section_info in section_data.items():
                if mission_block in section_info['section']:
                    shadow_start = parse_time(eng_request['Optimisedtimefrom'])
                    shadow_end = parse_time(eng_request['Optimisedtimeto'])
                    for block in section_info['section']:
                        shadow_blocks[block] = (shadow_start, shadow_end)
                    break

    # Optimize Non-Engineering Requests utilizing shadow blocks or corridor blocks
    for request in non_engineering_requests:
        mission_block = request['missionBlock']

        if mission_block in shadow_blocks:
            shadow_start, shadow_end = shadow_blocks[mission_block]
            req_start = parse_time(request['demandTimeFrom'])
            req_end = parse_time(request['demandTimeTo'])

            if is_time_overlap(req_start, req_end, shadow_start, shadow_end):
                request['Optimisedtimefrom'] = max(req_start, shadow_start).strftime("%H:%M")
                request['Optimisedtimeto'] = min(req_end, shadow_end).strftime("%H:%M")
                request['optimization_details'] = (
                    f"Non-engineering request for mission block '{mission_block}' was fitted within the shadow block time "
                    f"occupied by an upstream engineering request from {shadow_start.strftime('%H:%M')} to {shadow_end.strftime('%H:%M')}."
                )
            else:
                request['Optimisedtimefrom'] = ""
                request['Optimisedtimeto'] = ""
                request['optimization_details'] = (
                    f"Non-engineering request could not be adjusted within the shadow block time "
                    f"occupied by an upstream engineering request from {shadow_start} to {shadow_end}."
                )
        else:
            corridor_block = corridor_data.get(mission_block, {"From": "00:00", "To": "04:00"})
            corridor_start = parse_time(corridor_block['From'])
            corridor_end = parse_time(corridor_block['To'])
            optimised_from, optimised_to = fit_requests_in_corridor(request, corridor_start, corridor_end)
            request['Optimisedtimefrom'] = optimised_from
            request['Optimisedtimeto'] = optimised_to
            request['optimization_details'] = (
                f"Request optimized to fit within the corridor block time from {corridor_start} to {corridor_end}."
            )
        optimized_requests.append(request)

    return optimized_requests

@app.route('/backend/optimize', methods=['POST'])
def optimize():
    try:
        data = request.json
        request_data = data['requestData']

        corridor_csv_path = './corridor.csv'
        corridor_data = load_corridor_data(corridor_csv_path)

        optimized_requests = adjust_requests_to_corridor(request_data, corridor_data, sectionData)

        return jsonify({"optimizedData": optimized_requests})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)