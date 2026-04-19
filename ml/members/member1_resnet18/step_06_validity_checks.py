import pandas as pd
from pathlib import Path

BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")

DATA_DIR = BASE_PATH / "ml" / "members" / "member1_resnet18" / "processed"
TRAIN_CSV = DATA_DIR / "train.csv"


def main():

    df = pd.read_csv(TRAIN_CSV)

    print("\nTotal samples:", len(df))

    print("\nClass distribution:\n")

    class_counts = df["label"].value_counts().sort_index()

    for label, count in class_counts.items():
        print(f"Class {label}: {count} images")

    print("\nMin images:", class_counts.min())
    print("Max images:", class_counts.max())

    if class_counts.min() == class_counts.max():
        print("\nDataset is PERFECTLY BALANCED")
    else:
        print("\nDataset is IMBALANCED")


if __name__ == "__main__":
    main()