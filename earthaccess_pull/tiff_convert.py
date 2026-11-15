
import tifffile
import numpy as np
import pandas as pd

# CHANGE FILEPATHS HERE
input_path = r"C:\Users\bertr\VSCODE\InterSESHllar\earthaccess_pull\out.tif"
output_path = r"C:\Users\bertr\VSCODE\InterSESHllar\earthaccess_pull\out.csv"

# Read TIFF file
data = tifffile.imread(input_path)

# Convert to NumPy array
data = np.asarray(data)

# Export to CSV
df = pd.DataFrame(data)
df.to_csv(output_path, index=False, header=False)

print("Conversion complete!")
print("Array dimensions:", data.shape)
print("Data type:", data.dtype)
print("Saved to:", output_path)

import csv

with open("C:\Users\bertr\VSCODE\InterSESHllar\earthaccess_pull\out.csv", mode='r', newline='', encoding='utf-8') as file:
    reader = csv.reader(file)
    for row in reader:
        print(len(row))

