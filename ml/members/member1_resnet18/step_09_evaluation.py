import torch
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix
import json
from tqdm import tqdm

from step_03_dataset_loader import get_dataloaders
from step_04_model import get_resnet18_model


def evaluate_model():
    # --- Setup Paths ---
    BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")
    MODEL_PATH = BASE_PATH / "ml" / "models" / "member1_resnet18" / "best_model.pth"
    LABEL_MAP_PATH = BASE_PATH / "ml" / "members" / "member1_resnet18" / "label_map.json"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating on: {device}")

    # --- Load Label Names ---
    with open(LABEL_MAP_PATH, "r") as f:
        label_map = json.load(f)
    # Reverse map to get {index: "Disease Name"}
    target_names = [name for name, idx in sorted(label_map.items(), key=lambda x: x[1])]

    # --- Load Data ---
    # We use the test_loader specifically for final evaluation
    _, _, test_loader = get_dataloaders(batch_size=32, num_workers=0)

    # --- Load Model ---
    model = get_resnet18_model()
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    print("Running inference on test set...")
    with torch.no_grad():
        for images, labels in tqdm(test_loader):
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    # --- Generate Metrics ---
    print("\n" + "=" * 60)
    print("DETAILED MEDICAL CLASSIFICATION REPORT")
    print("=" * 60)

    report = classification_report(
        all_labels,
        all_preds,
        target_names=target_names,
        digits=4
    )
    print(report)

    # Save report to a text file for documentation
    report_path = MODEL_PATH.parent / "eda" / "test_evaluation_report.txt"
    with open(report_path, "w") as f:
        f.write("X-Ray Disease Classification Results\n")
        f.write("=" * 40 + "\n")
        f.write(report)

    print(f"\nReport successfully saved to: {report_path}")


if __name__ == "__main__":
    evaluate_model()