import pandas as pd
from sklearn.model_selection import train_test_split
from pathlib import Path

BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")

INPUT_CSV = BASE_PATH / "data" / "processed" / "multi" / "(04)CNN_ready_multiclass.csv"

OUTPUT_DIR = BASE_PATH / "ml" / "members" / "member1_resnet18" / "processed"

#Loading data

print("Loading dataset...")

df = pd.read_csv(INPUT_CSV)

print("Total images:", len(df))

#Finding unique patient IDs

patients = df["Patient ID"].unique()

print("Unique patients:", len(patients))

#Splitting data

train_patients, temp_patients = train_test_split(
    patients,
    test_size=0.30,
    random_state=42,
    shuffle=True
)

val_patients, test_patients = train_test_split(
    temp_patients,
    test_size=0.50,
    random_state=42
)

print("\nPatient split:")
print("Train patients:", len(train_patients))
print("Validation patients:", len(val_patients))
print("Test patients:", len(test_patients))

#Creating dataset

train_df = df[df["Patient ID"].isin(train_patients)]
val_df = df[df["Patient ID"].isin(val_patients)]
test_df = df[df["Patient ID"].isin(test_patients)]

#Saving Files

train_path = OUTPUT_DIR / "train.csv"
val_path = OUTPUT_DIR / "val.csv"
test_path = OUTPUT_DIR / "test.csv"

train_df.to_csv(train_path, index=False)
val_df.to_csv(val_path, index=False)
test_df.to_csv(test_path, index=False)

#SUmmarizing report

print("\nImage distribution:")

print("Train images:", len(train_df))
print("Validation images:", len(val_df))
print("Test images:", len(test_df))

print("\nFiles saved:")

print(train_path)
print(val_path)
print(test_path)

print("\nTrain/Val/Test split completed successfully")