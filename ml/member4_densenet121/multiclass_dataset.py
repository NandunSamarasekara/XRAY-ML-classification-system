import os
import pandas as pd
from PIL import Image
from torch.utils.data import Dataset


class MultiClassImageDataset(Dataset):
    def __init__(
        self,
        csv_path,
        image_root,
        image_col,
        label_col,
        transform=None,
        skip_missing=True,
        skip_broken=True,
        verbose=True
    ):
        self.df = pd.read_csv(csv_path)
        self.image_root = image_root
        self.image_col = image_col
        self.label_col = label_col
        self.transform = transform
        self.skip_broken = skip_broken

        if verbose:
            print(f"Loaded CSV: {csv_path}")
            print("Columns:", self.df.columns.tolist())

        if self.image_col not in self.df.columns:
            raise KeyError(f"Column '{self.image_col}' not found in CSV")
        if self.label_col not in self.df.columns:
            raise KeyError(f"Column '{self.label_col}' not found in CSV")

        # Build filename -> full path map
        self.image_map = {}
        for root, _, files in os.walk(self.image_root):
            for file in files:
                self.image_map[file] = os.path.join(root, file)

        if verbose:
            print(f"Indexed {len(self.image_map)} image files from: {self.image_root}")

        valid_rows = []
        missing_count = 0
        broken_count = 0

        for _, row in self.df.iterrows():
            img_name = str(row[self.image_col]).strip()

            if img_name not in self.image_map:
                missing_count += 1
                if not skip_missing:
                    raise FileNotFoundError(f"Missing image: {img_name}")
                continue

            img_path = self.image_map[img_name]

            if self.skip_broken:
                try:
                    with Image.open(img_path) as img:
                        img.verify()
                    valid_rows.append(row)
                except Exception:
                    broken_count += 1
            else:
                valid_rows.append(row)

        self.df = pd.DataFrame(valid_rows).reset_index(drop=True)

        if verbose:
            print(f"Valid samples found: {len(self.df)}")
            print(f"Missing samples skipped: {missing_count}")
            print(f"Broken images skipped: {broken_count}")

        if len(self.df) == 0:
            raise ValueError("No valid images found. Check CSV paths and image_root.")

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_name = str(row[self.image_col]).strip()
        label = int(row[self.label_col])

        img_path = self.image_map[img_name]

        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            raise RuntimeError(f"Failed to load image: {img_path}\nReason: {e}")

        if self.transform:
            image = self.transform(image)

        return image, label