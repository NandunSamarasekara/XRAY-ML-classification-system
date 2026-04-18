import os
from typing import List, Tuple

import pandas as pd
from PIL import Image
from torch.utils.data import Dataset


class BinaryImageDataset(Dataset):
    def __init__(
        self,
        csv_path: str,
        image_root: str,
        image_col: str,
        label_col: str,
        transform=None,
        skip_missing: bool = True,
        skip_broken: bool = True,
        verbose: bool = True,
    ):
        self.csv_path = csv_path
        self.image_root = image_root
        self.image_col = image_col
        self.label_col = label_col
        self.transform = transform

        self.df = pd.read_csv(csv_path)

        if verbose:
            print(f"✅ Loaded CSV: {csv_path}")
            print("✅ CSV columns found:", self.df.columns.tolist())

        if self.image_col not in self.df.columns:
            raise KeyError(
                f"Column '{self.image_col}' not found in {csv_path}. "
                f"Available columns: {self.df.columns.tolist()}"
            )

        if self.label_col not in self.df.columns:
            raise KeyError(
                f"Column '{self.label_col}' not found in {csv_path}. "
                f"Available columns: {self.df.columns.tolist()}"
            )

        # Build image filename index
        if verbose:
            print("🔎 Indexing images...")

        self.image_index = self._build_image_index(self.image_root)

        if verbose:
            print(f"✅ Indexed {len(self.image_index)} image files")
            print("🔎 Validating dataset images...")

        self.samples: List[Tuple[str, int]] = []
        missing_count = 0
        broken_count = 0

        for _, row in self.df.iterrows():
            rel_path = str(row[self.image_col]).strip()
            label = int(row[self.label_col])

            img_path = self._resolve_image_path(rel_path)

            if img_path is None:
                missing_count += 1
                if not skip_missing:
                    self.samples.append((rel_path, label))
                continue

            if skip_broken:
                try:
                    with Image.open(img_path) as img:
                        img.verify()
                except Exception:
                    broken_count += 1
                    continue

            self.samples.append((img_path, label))

        if verbose:
            print(f"✅ Valid samples kept: {len(self.samples)}")
            print(f"⚠️ Missing images skipped: {missing_count}")
            print(f"⚠️ Broken images skipped: {broken_count}")

    def _build_image_index(self, root_dir: str):
        image_index = {}
        valid_exts = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}

        for root, _, files in os.walk(root_dir):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in valid_exts:
                    full_path = os.path.join(root, file)
                    # store by filename only
                    image_index[file] = full_path

        return image_index

    def _resolve_image_path(self, rel_path: str):
        # 1. If CSV already contains a full path
        if os.path.isabs(rel_path) and os.path.exists(rel_path):
            return rel_path

        # 2. Try relative to image_root
        candidate = os.path.join(self.image_root, rel_path)
        if os.path.exists(candidate):
            return candidate

        # 3. Try filename only
        filename = os.path.basename(rel_path)
        if filename in self.image_index:
            return self.image_index[filename]

        return None

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]

        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label