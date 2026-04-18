import os
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

# ---------------------------
# CONFIG
# ---------------------------
TRAIN_CSV = r"C:\Users\ASUS\PycharmProjects\Wedakam\data\processed\(11)binary_train.csv"
VAL_CSV = r"C:\Users\ASUS\PycharmProjects\Wedakam\data\processed\(12)binary_val.csv"
IMAGE_ROOT = r"C:\Users\ASUS\PycharmProjects\Wedakam\data\raw"

IMAGE_COL = "Image Index"      # change if needed
LABEL_COL = "Binary_Label"     # change if needed

# ---------------------------
# LOAD DATA
# ---------------------------
train_df = pd.read_csv(TRAIN_CSV)
val_df = pd.read_csv(VAL_CSV)

print("Train shape:", train_df.shape)
print("Val shape:", val_df.shape)
print("\nTrain columns:", train_df.columns.tolist())
print("Val columns:", val_df.columns.tolist())


# ---------------------------
# 1. CLASS DISTRIBUTION
# ---------------------------
def plot_class_distribution():
    train_counts = train_df[LABEL_COL].value_counts().sort_index()
    val_counts = val_df[LABEL_COL].value_counts().sort_index()

    plt.figure(figsize=(8, 5))
    x = range(len(train_counts))

    plt.bar([i - 0.2 for i in x], train_counts.values, width=0.4, label="Train")
    plt.bar([i + 0.2 for i in x], val_counts.values, width=0.4, label="Validation")

    plt.xticks(list(x), [str(i) for i in train_counts.index])
    plt.xlabel("Class Label")
    plt.ylabel("Number of Images")
    plt.title("Class Distribution")
    plt.legend()
    plt.tight_layout()
    plt.show()


# ---------------------------
# 2. TRAIN / VAL SIZE
# ---------------------------
def plot_dataset_sizes():
    sizes = [len(train_df), len(val_df)]
    labels = ["Train", "Validation"]

    plt.figure(figsize=(6, 5))
    plt.bar(labels, sizes)
    plt.ylabel("Number of Images")
    plt.title("Train vs Validation Dataset Size")
    plt.tight_layout()
    plt.show()


# ---------------------------
# 3. SAMPLE IMAGES
# ---------------------------
def find_image(image_name):
    for root, _, files in os.walk(IMAGE_ROOT):
        if image_name in files:
            return os.path.join(root, image_name)
    return None


def show_sample_images(num_images=6):
    plt.figure(figsize=(12, 8))

    shown = 0
    for _, row in train_df.iterrows():
        image_name = str(row[IMAGE_COL]).strip()
        label = row[LABEL_COL]

        image_path = find_image(image_name)
        if image_path is None:
            continue

        try:
            img = Image.open(image_path).convert("L")
            plt.subplot(2, 3, shown + 1)
            plt.imshow(img, cmap="gray")
            plt.title(f"Label: {label}")
            plt.axis("off")
            shown += 1

            if shown == num_images:
                break
        except Exception:
            continue

    plt.suptitle("Sample X-ray Images")
    plt.tight_layout()
    plt.show()


# ---------------------------
# 4. IMAGE SIZE DISTRIBUTION
# ---------------------------
def plot_image_size_distribution(sample_limit=500):
    widths = []
    heights = []
    checked = 0

    for _, row in train_df.iterrows():
        image_name = str(row[IMAGE_COL]).strip()
        image_path = find_image(image_name)
        if image_path is None:
            continue

        try:
            img = Image.open(image_path)
            w, h = img.size
            widths.append(w)
            heights.append(h)
            checked += 1
            if checked >= sample_limit:
                break
        except Exception:
            continue

    plt.figure(figsize=(10, 5))
    plt.hist(widths, bins=20, alpha=0.7, label="Width")
    plt.hist(heights, bins=20, alpha=0.7, label="Height")
    plt.xlabel("Pixels")
    plt.ylabel("Count")
    plt.title("Image Size Distribution")
    plt.legend()
    plt.tight_layout()
    plt.show()


# ---------------------------
# 5. MISSING / BROKEN IMAGE CHECK
# ---------------------------
def check_missing_and_broken(sample_limit=1000):
    missing = 0
    broken = 0
    valid = 0
    checked = 0

    for _, row in train_df.iterrows():
        image_name = str(row[IMAGE_COL]).strip()
        image_path = find_image(image_name)

        if image_path is None:
            missing += 1
        else:
            try:
                img = Image.open(image_path)
                img.verify()
                valid += 1
            except Exception:
                broken += 1

        checked += 1
        if checked >= sample_limit:
            break

    labels = ["Valid", "Missing", "Broken"]
    values = [valid, missing, broken]

    plt.figure(figsize=(6, 5))
    plt.bar(labels, values)
    plt.title(f"Image File Check (Sample of {sample_limit})")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.show()

    print(f"Valid: {valid}")
    print(f"Missing: {missing}")
    print(f"Broken: {broken}")


# ---------------------------
# RUN ALL
# ---------------------------
plot_class_distribution()
plot_dataset_sizes()
show_sample_images()
plot_image_size_distribution()
check_missing_and_broken()