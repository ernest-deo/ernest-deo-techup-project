import openpyxl
import json
import pandas as pd
from datetime import datetime, date
from collections import defaultdict

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f'Type {type(obj)} not serializable')
def rgb_to_hex(rgb):
    if isinstance(rgb, str):
        return rgb  # If it's already a string, assume it's already in the correct format
    elif isinstance(rgb, tuple):
        return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])
    else:
        return None  # Return None for unsupported color formats

def make_unique(columns):
    """Make column names unique by appending a count for duplicates"""
    counts = defaultdict(int)
    new_columns = []
    for col in columns:
        if counts[col] > 0:
            new_columns.append(f"{col}_{counts[col]}")
        else:
            new_columns.append(col)
        counts[col] += 1
    return new_columns
def process_excel(file_path):
    workbook = openpyxl.load_workbook(file_path, data_only=True)
    sheet = workbook.active

    data = []
    styles = {}

    for row in sheet.iter_rows():
        row_data = []
        for cell in row:
            row_data.append(cell.value)

            cell_style = {
                'font': {
                    'bold': cell.font.bold,
                    'color': rgb_to_hex(cell.font.color.rgb) if cell.font.color else None,
                },
                'fill': {
                    'bgcolor': rgb_to_hex(cell.fill.start_color.rgb) if cell.fill.start_color else None,
                },
                'alignment': cell.alignment.horizontal,
            }
            styles[cell.coordinate] = cell_style

        data.append(row_data)

    # Convert data to pandas DataFrame for easier handling
    df = pd.DataFrame(data[1:], columns=data[0])

    # Handle duplicate column names
    df.columns = make_unique(df.columns)
    # Convert DataFrame to dict
    data_dict = df.to_dict(orient='records')

    result = {
        'data': data_dict,
        'styles': styles,
        'columns': df.columns.tolist()
    }

    with open('nba_schedule_with_styles.json', 'w') as f:
        json.dump(result, f, indent=2, default=json_serial)

    print("JSON file created successfully!")

if __name__ == "__main__":
    process_excel("nba_schedule.xlsx")