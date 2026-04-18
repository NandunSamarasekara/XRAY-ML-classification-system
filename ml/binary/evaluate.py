import os
import yaml
import torch
import torch.nn as nn

from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from torch.utils.data import DataLoader

from dataset import BinaryImageDataset
from transforms import get_val_transforms
from model import build_model
from utils import get_device


def load_config(config_path="config.yml"):
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def resolve_path(base_dir: str, path_value: str):
    if os.path.isabs(path_value):
        return path_value
    return os.path.abspath(os.path.join(base_dir, path_value))


@torch.no_grad()
def main(config_path="config.yml"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cfg = load_config(config_path)

    val_csv = resolve_path(script_dir, cfg["data"]["val_csv"])
    image_root = resolve_path(script_dir, cfg["data"]["image_root"])
    output_dir = resolve_path(script_dir, cfg["output"]["dir"])
    best_model_path = os.path.join(output_dir, cfg["output"]["best_model_name"])

    device = get_device(cfg["training"]["device"])

    val_tf = get_val_transforms(cfg["training"]["image_size"])

    val_ds = BinaryImageDataset(
        csv_path=val_csv,
        image_root=image_root,
        image_col=cfg["data"]["image_col"],
        label_col=cfg["data"]["label_col"],
        transform=val_tf,
        skip_missing=True,
        skip_broken=True,
        verbose=True,
    )

    val_loader = DataLoader(
        val_ds,
        batch_size=cfg["training"]["batch_size"],
        shuffle=False,
        num_workers=cfg["training"]["num_workers"],
        pin_memory=(device.type == "cuda"),
    )

    model = build_model(
        model_name=cfg["model"]["name"],
        pretrained=False
    ).to(device)

    model.load_state_dict(torch.load(best_model_path, map_location=device))
    model.eval()

    criterion = nn.BCEWithLogitsLoss()

    all_labels = []
    all_preds = []
    total_loss = 0.0

    for images, labels in val_loader:
        images = images.to(device)
        labels = labels.float().unsqueeze(1).to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)
        total_loss += loss.item()

        probs = torch.sigmoid(outputs)
        preds = (probs >= 0.5).int()

        all_labels.extend(labels.cpu().numpy().astype(int).flatten().tolist())
        all_preds.extend(preds.cpu().numpy().astype(int).flatten().tolist())

    avg_loss = total_loss / len(val_loader)
    acc = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds, zero_division=0)
    recall = recall_score(all_labels, all_preds, zero_division=0)
    f1 = f1_score(all_labels, all_preds, zero_division=0)

    print(f"\nValidation Loss: {avg_loss:.4f}")
    print(f"Accuracy      : {acc:.4f}")
    print(f"Precision     : {precision:.4f}")
    print(f"Recall        : {recall:.4f}")
    print(f"F1 Score      : {f1:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(all_labels, all_preds))

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, digits=4))


if __name__ == "__main__":
    main()