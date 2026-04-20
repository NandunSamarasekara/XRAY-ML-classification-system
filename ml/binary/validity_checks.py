import pandas as pd
from pathlib import Path

BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")

DATA_DIR = BASE_PATH / "ml" / "binary" / "processed"
TRAIN_CSV = DATA_DIR / "train.csv"


def main():

    df = pd.read_csv(TRAIN_CSV)
    print("\nTotal samples:", len(df))
    print("Class distribution:")

    class_counts = df["Binary_Label"].value_counts().sort_index()

    threshold = 0.1 * len(df)

    for label, count in class_counts.items():
        print(f"Class {label}: {count} images")

    if class_counts.max() - class_counts.min() <= threshold:
        print("\n✅ Dataset is PERFECTLY BALANCED")
    else:
        print("\n⚠️ Dataset is IMBALANCED")


if __name__ == "__main__":
    main()