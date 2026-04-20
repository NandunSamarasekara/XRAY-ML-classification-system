import pandas as pd
from pathlib import Path
import json

BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
DATA_DIR = BASE_PATH / "ml" / "members" / "member6_vit" / "processed"
TRAIN_CSV = DATA_DIR / "train.csv"

# Load the mapping
with open(BASE_PATH / "ml" / "members" / "member6_vit" / "label_map.json", "r") as f:
    mapping = json.load(f)

reverse_mapping = {v: k for k, v in mapping.items()}

def main():
    df = pd.read_csv(TRAIN_CSV)
    print("\nTotal samples:", len(df))
    print("Class distribution:")

    class_counts = df["label"].value_counts().sort_index()

    for label_idx, count in class_counts.items():
        print(f"{reverse_mapping[int(label_idx)]}: {count} images")

    print("\nMin images:", class_counts.min())
    print("Max images:", class_counts.max())

    threshold = 0.1 * class_counts.min()
    if class_counts.max() - class_counts.min() <= threshold:
        print("\nDataset is PERFECTLY BALANCED")
    else:
        print("\nDataset is IMBALANCED")

if __name__ == "__main__":
    main()