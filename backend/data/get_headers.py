import csv
import glob
import os

with open('../headers.txt', 'w', encoding='utf-8') as out:
    for f in glob.glob('*.csv'):
        with open(f, 'r', encoding='utf-8') as csv_in:
            reader = csv.reader(csv_in)
            try:
                header = next(reader)
                out.write(f"FILE: {os.path.basename(f)}\n")
                out.write(f"COLS: {', '.join(header)}\n\n")
            except Exception as e:
                pass
