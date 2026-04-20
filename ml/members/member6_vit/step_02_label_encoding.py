import pandas as pd
import json
from pathlib import Path

BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
DATA_DIR = BASE_PATH / "ml" / "members" / "member6_vit" / "processed"
TRAIN_CSV = DATA_DIR / "train.csv"
VAL_CSV = DATA_DIR / "val.csv"
TEST_CSV = DATA_DIR / "test.csv"
OUTPUT_LABEL_MAP = BASE_PATH / "ml" / "members" / "member6_vit" / "label_map.json"

# Loading data
train_df = pd.read_csv(TRAIN_CSV)
val_df = pd.read_csv(VAL_CSV)
test_df = pd.read_csv(TEST_CSV)

print("Datasets loaded")

# Creating label map
all_labels = sorted(train_df["Finding Labels"].unique())
label_map = {label: idx for idx, label in enumerate(all_labels)}

print("\nLabel Mapping:")
for k, v in label_map.items():
    print(f"{k} -> {v}")

# Applying label map
train_df["label"] = train_df["Finding Labels"].map(label_map)
val_df["label"] = val_df["Finding Labels"].map(label_map)
test_df["label"] = test_df["Finding Labels"].map(label_map)

# Saving the updated data files
train_df.to_csv(TRAIN_CSV, index=False)
val_df.to_csv(VAL_CSV, index=False)
test_df.to_csv(TEST_CSV, index=False)

print("\nUpdated CSV files saved")

# Saving the label map
with open(OUTPUT_LABEL_MAP, "w") as f:
    json.dump(label_map, f, indent=4)

print("\nLabel map saved to:")
print(OUTPUT_LABEL_MAP)
print("\nLabel encoding completed successfully")