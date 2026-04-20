import os
import torch
import numpy as np
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import pandas as pd
from pathlib import Path
from transformers import ViTImageProcessor
from torchvision import transforms

# CONFIG
BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
DATA_DIR = BASE_PATH / "ml" / "members" / "member6_vit" / "processed"
RAW_IMAGES_BASE = BASE_PATH / "data" / "raw"
IMG_SIZE = 384

class XRayDataset(Dataset):
    def __init__(self, csv_file, image_base, processor, is_training=False):
        self.df = pd.read_csv(csv_file)
        self.image_base = Path(image_base)
        self.processor = processor
        self.is_training = is_training

        # Advanced Augmentation
        if self.is_training:
            self.aug = transforms.Compose([
                transforms.Resize((IMG_SIZE, IMG_SIZE)),
                transforms.TrivialAugmentWide(),
                transforms.RandomHorizontalFlip(),
                transforms.RandomAdjustSharpness(sharpness_factor=2, p=0.5),
                transforms.ToTensor(),
            ])
        else:
            self.aug = transforms.Compose([
                transforms.Resize((IMG_SIZE, IMG_SIZE)),
                transforms.ToTensor(),
            ])

        self.samples = []
        print(f"Indexing images for {Path(csv_file).name}...")

        folders = [f"images_{str(i).zfill(3)}" for i in range(1, 13)]
        for _, row in self.df.iterrows():
            img_name = row["Image Index"]
            label = row["label"]

            found = False
            for folder in folders:
                full_path = self.image_base / folder / "images" / img_name
                if full_path.exists():
                    self.samples.append((full_path, label))
                    found = True
                    break

        print(f"Successfully indexed {len(self.samples)} images.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        try:
            image = Image.open(img_path).convert("RGB")

            image_tensor = self.aug(image)

            pixel_values = transforms.Normalize(
                mean=self.processor.image_mean,
                std=self.processor.image_std
            )(image_tensor)

            return pixel_values, torch.tensor(label, dtype=torch.long)
        except Exception as e:
            return self.__getitem__(torch.randint(0, len(self.samples), (1,)).item())


def get_dataloaders(batch_size=16, num_workers=4):
    processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-384')

    train_dataset = XRayDataset(DATA_DIR / "train.csv", RAW_IMAGES_BASE, processor, is_training=True)
    val_dataset = XRayDataset(DATA_DIR / "val.csv", RAW_IMAGES_BASE, processor, is_training=False)
    test_dataset = XRayDataset(DATA_DIR / "test.csv", RAW_IMAGES_BASE, processor, is_training=False)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False,
                            num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False,
                             num_workers=num_workers, pin_memory=True)

    return train_loader, val_loader, test_loader