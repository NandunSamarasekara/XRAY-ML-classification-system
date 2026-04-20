import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
from pathlib import Path
import json

BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
DATA_DIR = BASE_PATH / "ml" / "binary" / "processed"
RAW_IMAGES_BASE = BASE_PATH / "data" / "raw"

# Transforms
imagenet_stats = ([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize(*imagenet_stats)
])

val_test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(*imagenet_stats)
])


class XRayBinaryDataset(Dataset):
    def __init__(self, csv_path, image_base, transform=None):
        self.df = pd.read_csv(csv_path)
        self.image_base = image_base
        self.transform = transform

        # Standard NIH folder structure
        self.folders = [f"images_{str(i).zfill(3)}" for i in range(1, 13)]

        # Pre-caching paths to avoid disk-checking during training
        self.samples = []
        for _, row in self.df.iterrows():
            img_name = row["Image Index"]
            label = row["Binary_Label"]

            found = False
            for folder in self.folders:
                full_path = self.image_base / folder / "images" / img_name
                if full_path.exists():
                    self.samples.append((full_path, label))
                    found = True
                    break
            if not found:
                print(f"Warning: {img_name} not found.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]

        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            # If an image is broken, return the next one
            return self.__getitem__((idx + 1) % len(self.samples))

        if self.transform:
            image = self.transform(image)

        # Returning label as float for BCEWithLogitsLoss
        return image, torch.tensor(label, dtype=torch.float32)


def get_binary_loaders(batch_size=32):
    train_ds = XRayBinaryDataset(DATA_DIR / "train.csv", RAW_IMAGES_BASE, train_transform)
    val_ds = XRayBinaryDataset(DATA_DIR / "val.csv", RAW_IMAGES_BASE, val_test_transform)
    test_ds = XRayBinaryDataset(DATA_DIR / "test.csv", RAW_IMAGES_BASE, val_test_transform)

    loaders = {
        'train': DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2),
        'val': DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2),
        'test': DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=2)
    }

    return loaders