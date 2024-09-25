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
        
        # Parse the 'From' and 'To' times formatted as "HH.MM hrs"
        from_time = row['From'].replace(' hrs', '') if pd.notna(row['From']) else "00.00"
        to_time = row['To'].replace(' hrs', '') if pd.notna(row['To']) else "04.00"

        # Convert from "HH.MM" format to "HH:MM"
        try:
            from_time_converted = datetime.strptime(from_time, "%H.%M").strftime("%H:%M")
        except ValueError:
            from_time_converted = "00:00"  # Default to 00:00 if parsing fails

        try:
            to_time_converted = datetime.strptime(to_time, "%H.%M").strftime("%H:%M")
        except ValueError:
            to_time_converted = "04:00"  # Default to 04:00 if parsing fails

        # Store the data in the dictionary
        corridor_data[section_block] = {
            "From": from_time_converted,
            "To": to_time_converted,
            "Duration": row['Duration'] if pd.notna(row['Duration']) else "04:00"
        }

    return corridor_data

# Full section data
sectionData = {
    "AJJ-RU": {"section": ["AJJ-AJJN", "MLPM-AJJN", "AJJN-TRT", "TRT-POI", "POI-VKZ", "VKZ-NG", "NG-EKM",
                           "EKM-VGA", "VGA-PUT", "PUT-TDK", "TDK-PUDI", "PUDI-RU"]},
    "MAS-AJJ": {"section": ["MAS-BBQ", "MMCC-BBQ", "BBQ-VPY", "VPY-VLK", "VLK-ABU", "ABU-AVD", "AVD-PAB",
                            "PAB-TI", "TI-TRL", "TRL-KBT", "KBT-TO", "TO-AJJ"]},
    "MSB-VM": {"section": ["MSB-MS", "MS-MKK", "MKK-MBM", "MBM-STM", "STM-PV", "PV-TBM", "TBM-PRGL",
                           "PRGL-VDR", "VDR-UPM", "UPM-GI", "GI-VVM", "VVM-MSB"]},
    "AJJ-KPD": {"section": ["AJJ-MLPM", "MLPM-CTRE", "CTRE-MDVE", "MDVE-SHU", "SHU-TUG", "TUG-WJR",
                            "WJR-MCN", "MCN-THL", "THL-SVUR", "SVUR-KPD"]},
    "MAS-GDR": {"section": ["MMC-BBQ", "BBQ-KOK", "KOK-TNP", "TNP-TVT", "TVT-ENR", "ENR-AIP", "AIP-AIPP",
                            "AIPP-MJR", "MJR-PON", "PON-KVP", "KVP-GPD", "GPD-ELR", "ELR-AKM", "AKM-TAD",
                            "TAD-AKAT", "AKAT-SPE", "SPE-PEL", "PEL-DVR", "DVR-NYP", "NYP-PYA", "PYA-ODR",
                            "ODR-GDR"]},
    "AJJ-CGL": {"section": ["CGL-RDY", "RDY-VB", "VB-PALR", "PALR-PYV", "PYV-WJ", "WJ-NTT", "NTT-CJ(O)",
                            "CJ(O)-CJ(E)", "CJ(E)-TMLP", "TMLP-TKO", "TKO-MLPM", "MLPM-AJJ"]},
    "KPD-JTJ": {"section": ["KPD-LTI", "LTI-KVN", "KVN-GYM", "GYM-VLT", "VLT-MPI", "MPI-PCKM", "PCKM-AB",
                            "AB-VGM", "VGM-VN", "VN-KDY", "KDY-JTJ"]},
}

def parse_time(time_str):
    try:
        if time_str and isinstance(time_str, str) and time_str.strip():
            return datetime.strptime(time_str.strip(), "%H:%M").time()
        else:
            return None
    except ValueError:
        return None

def find_shadow_blocks(section, mission_block, section_data):
    section_blocks = section_data[section]['section']
    shadow_blocks = []

    try:
        start_index = section_blocks.index(mission_block)
    except ValueError:
        return []  # If missionBlock is not found

    shadow_blocks = section_blocks[start_index+1:]  # All downstream blocks are shadow blocks
    return shadow_blocks

def is_time_overlap(start1, end1, start2, end2):
    if None in [start1, end1, start2, end2]:
        return False
    return max(start1, start2) < min(end1, end2)

def fit_requests_in_corridor(request, corridor_start, corridor_end):
    req_start = parse_time(request['demandTimeFrom'])
    req_end = parse_time(request['demandTimeTo'])

    if req_start is None or req_end is None or corridor_start is None or corridor_end is None:
        return "", ""  # Return empty strings if any value is missing

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

    # Separate Engineering and Non-Engineering Requests
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
        request['optimization_details'] = f"Engineering request optimized to fit within corridor block from {corridor_start} to {corridor_end}."
        
        optimized_requests.append(request)

    # Create Shadow Blocks for Engineering Requests
    shadow_blocks = []
    for eng_request in optimized_requests:
        if eng_request['selectedDepartment'] == 'ENGG':
            section = None
            mission_block = eng_request['missionBlock']
            for sec_name, sec_info in section_data.items():
                if mission_block in sec_info['section']:
                    section = sec_name
                    break
            
            if section:
                shadow_blocks.extend(find_shadow_blocks(section, mission_block, section_data))

    # Optimize Non-Engineering Requests within Shadow Blocks or Corridor
    for request in non_engineering_requests:
        mission_block = request['missionBlock']

        if mission_block in shadow_blocks:
            optimised_from = request['demandTimeFrom']
            optimised_to = request['demandTimeTo']
            request['Optimisedtimefrom'] = optimised_from
            request['Optimisedtimeto'] = optimised_to
            request['optimization_details'] = f"Request fitted inside shadow block of {mission_block}."
        else:
            corridor_block = corridor_data.get(mission_block, {"From": "00:00", "To": "04:00"})
            corridor_start = parse_time(corridor_block['From'])
            corridor_end = parse_time(corridor_block['To'])
            optimised_from, optimised_to = fit_requests_in_corridor(request, corridor_start, corridor_end)
            
            request['Optimisedtimefrom'] = optimised_from
            request['Optimisedtimeto'] = optimised_to
            request['optimization_details'] = f"Request optimized to fit inside corridor block from {corridor_start} to {corridor_end}."
        
        overlap = False
        for existing_request in optimized_requests:
            if is_time_overlap(
                parse_time(request['Optimisedtimefrom']), parse_time(request['Optimisedtimeto']),
                parse_time(existing_request['Optimisedtimefrom']), parse_time(existing_request['Optimisedtimeto'])
            ):
                overlap = True
                break
        
        if overlap:
            request['Optimisedtimefrom'] = ""
            request['Optimisedtimeto'] = ""
            request['optimization_details'] += " Could not fit without overlap."
        
        optimized_requests.append(request)

    return optimized_requests

@app.route('/optimize', methods=['POST'])
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
