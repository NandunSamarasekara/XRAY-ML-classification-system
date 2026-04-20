import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from pathlib import Path
from tqdm import tqdm
import json
from step_03_dataset_loader import get_dataloaders
from step_04_model import get_vit_base_model

# CONFIG
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
BEST_MODEL_PATH = BASE_PATH / "ml" / "members" / "member6_vit" / "best_model.pth"
SAVE_DIR = BEST_MODEL_PATH.parent

with open(BASE_PATH / "ml" / "members" / "member6_vit" / "label_map.json", "r") as f:
    mapping = json.load(f)

reverse_mapping = {v: k for k, v in mapping.items()}
CLASS_NAMES = [reverse_mapping[i] for i in range(len(reverse_mapping))]

def evaluate_vit_model():
    # Setup Data
    _, val_loader, _ = get_dataloaders(batch_size=16, num_workers=4)

    # Load the Model Architecture
    print(f"Initializing ViT-Base model...")
    model = get_vit_base_model(pretrained=False).to(DEVICE)

    # Load the Best Saved Weights
    if not BEST_MODEL_PATH.exists():
        print(f"Error: Could not find weights at {BEST_MODEL_PATH}")
        return

    model.load_state_dict(torch.load(BEST_MODEL_PATH))
    model.eval()
    print(f"Loaded best weights from: {BEST_MODEL_PATH}")

    all_labels = []
    all_preds = []

    print("Evaluating on Validation Set...")
    with torch.no_grad():
        for images, labels in tqdm(val_loader):
            images = images.to(DEVICE)

            outputs = model(images).logits
            preds = torch.argmax(outputs, dim=1)

            all_labels.extend(labels.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())

    # CALCULATE METRICS
    # Classification Report
    report = classification_report(all_labels, all_preds, target_names=CLASS_NAMES)
    print("\nClassification Report:")
    print(report)

    # Save report to text file
    with open(SAVE_DIR / "classification_report.txt", "w") as f:
        f.write(report)

    # CONFUSION MATRIX
    cm = confusion_matrix(all_labels, all_preds)

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=CLASS_NAMES,
                yticklabels=CLASS_NAMES)
    plt.title('Confusion Matrix: ViT-Base X-Ray Classifier')
    plt.ylabel('True Pathology')
    plt.xlabel('Predicted Pathology')

    # Save the plot
    plt.tight_layout()
    plt.savefig(SAVE_DIR / 'vit_confusion_matrix.png')
    print(f"\nEvaluation complete. Results saved to {SAVE_DIR}")
    plt.show()

if __name__ == "__main__":
    evaluate_vit_model()