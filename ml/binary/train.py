import os
import csv
import yaml
import torch
import torch.nn as nn
import pandas as pd
import matplotlib.pyplot as plt

from tqdm import tqdm
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from torch.utils.data import DataLoader

from dataset import BinaryImageDataset
from transforms import get_train_transforms, get_val_transforms
from model import build_model
from utils import set_seed, get_device, ensure_dir, save_model


def load_config(config_path="config.yml"):
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def resolve_path(base_dir: str, path_value: str):
    if os.path.isabs(path_value):
        return path_value
    return os.path.abspath(os.path.join(base_dir, path_value))


def append_metrics_row(csv_path, row_dict):
    file_exists = os.path.exists(csv_path)
    with open(csv_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=row_dict.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(row_dict)


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0

    all_labels = []
    all_preds = []

    pbar = tqdm(loader, desc="Training", leave=True)

    for images, labels in pbar:
        images = images.to(device, non_blocking=True)
        labels = labels.float().unsqueeze(1).to(device, non_blocking=True)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        # 🔥 NEW PART
        probs = torch.sigmoid(outputs)
        preds = (probs >= 0.5).int()

        all_labels.extend(labels.cpu().numpy().astype(int).flatten().tolist())
        all_preds.extend(preds.cpu().numpy().astype(int).flatten().tolist())

        pbar.set_postfix(train_loss=f"{loss.item():.3f}")

    train_loss = running_loss / len(loader)
    train_acc = accuracy_score(all_labels, all_preds)

    return train_loss, train_acc


@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()

    running_loss = 0.0
    all_labels = []
    all_preds = []

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        labels = labels.float().unsqueeze(1).to(device, non_blocking=True)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item()

        probs = torch.sigmoid(outputs)
        preds = (probs >= 0.5).int()

        all_labels.extend(labels.cpu().numpy().astype(int).flatten().tolist())
        all_preds.extend(preds.cpu().numpy().astype(int).flatten().tolist())

    val_loss = running_loss / len(loader)
    val_acc = accuracy_score(all_labels, all_preds)
    val_precision = precision_score(all_labels, all_preds, zero_division=0)
    val_recall = recall_score(all_labels, all_preds, zero_division=0)
    val_f1 = f1_score(all_labels, all_preds, zero_division=0)

    return val_loss, val_acc, val_precision, val_recall, val_f1

def plot_training_curves(output_dir, train_losses, val_losses, val_accuracies, train_accuracies):
    epochs = range(1, len(train_losses) + 1)

    # Loss graph
    plt.figure(figsize=(8, 5))
    plt.plot(epochs, train_losses, marker="o", label="Train Loss")
    plt.plot(epochs, val_losses, marker="o", label="Validation Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training and Validation Loss")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "loss_curve.png"))
    plt.show()

    # Validation accuracy graph
    plt.figure(figsize=(8, 5))
    plt.plot(epochs, val_accuracies, marker="o", label="Validation Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Validation Accuracy per Epoch")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "val_accuracy_curve.png"))
    plt.show()

    plt.figure(figsize=(8, 5))
    plt.plot(epochs, train_accuracies, marker="o", label="Train Accuracy")
    plt.plot(epochs, val_accuracies, marker="o", label="Validation Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Train vs Validation Accuracy")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "accuracy_curve.png"))
    plt.show()

def main(config_path="config.yml"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cfg = load_config(config_path)

    print(f"✅ Using config file: {os.path.abspath(config_path)}")
    print(f"✅ Config exists: {os.path.exists(config_path)}")

    train_csv = resolve_path(script_dir, cfg["data"]["train_csv"])
    val_csv = resolve_path(script_dir, cfg["data"]["val_csv"])
    image_root = resolve_path(script_dir, cfg["data"]["image_root"])
    output_dir = resolve_path(script_dir, cfg["output"]["dir"])

    print(f"✅ Resolved train_csv : {train_csv}")
    print(f"✅ Resolved val_csv   : {val_csv}")
    print(f"✅ Resolved image_root: {image_root}")
    print(f"✅ Resolved output_dir: {output_dir}")

    ensure_dir(output_dir)

    set_seed(cfg["training"]["seed"])
    device = get_device(cfg["training"]["device"])

    if device.type == "cuda":
        torch.backends.cudnn.benchmark = True

    image_size = cfg["training"]["image_size"]
    batch_size = cfg["training"]["batch_size"]
    epochs = cfg["training"]["epochs"]
    lr = cfg["training"]["lr"]
    num_workers = cfg["training"]["num_workers"]

    train_tf = get_train_transforms(image_size)
    val_tf = get_val_transforms(image_size)

    train_ds = BinaryImageDataset(
        csv_path=train_csv,
        image_root=image_root,
        image_col=cfg["data"]["image_col"],
        label_col=cfg["data"]["label_col"],
        transform=train_tf,
        skip_missing=True,
        skip_broken=True,
        verbose=True,
    )

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

    print(f"✅ Train samples: {len(train_ds)}")
    print(f"✅ Val samples: {len(val_ds)}")



    if len(train_ds) == 0:
        raise ValueError(
            "Train dataset is empty. Most likely the CSV image names do not match the real image files under image_root."
        )
    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=(device.type == "cuda"),
    )

    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=(device.type == "cuda"),
    )

    print("✅ Testing one batch load...")
    sample_images, sample_labels = next(iter(train_loader))
    print(f"✅ Batch loaded: {sample_images.shape} {sample_labels.shape}")

    model = build_model(
        model_name=cfg["model"]["name"],
        pretrained=cfg["model"]["pretrained"]
    ).to(device)

    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_val_acc = 0.0

    train_losses = []
    val_losses = []
    val_accuracies = []
    train_accuracies = []

    best_model_path = os.path.join(output_dir, cfg["output"]["best_model_name"])
    last_model_path = os.path.join(output_dir, cfg["output"]["last_model_name"])
    metrics_path = os.path.join(output_dir, cfg["output"]["metrics_name"])

    for epoch in range(epochs):
        print(f"Epoch {epoch + 1}/{epochs}:")

        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)

        val_loss, val_acc, val_precision, val_recall, val_f1 = validate(
            model, val_loader, criterion, device
        )

        train_losses.append(train_loss)
        val_losses.append(val_loss)
        val_accuracies.append(val_acc)
        train_accuracies.append(train_acc)

        print(
            f"Epoch {epoch + 1}: "
            f"train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} "
            f"val_acc={val_acc:.4f} "
            f"precision={val_precision:.4f} "
            f"recall={val_recall:.4f} "
            f"f1={val_f1:.4f}"
        )

        append_metrics_row(metrics_path, {
            "epoch": epoch + 1,
            "train_loss": round(train_loss, 6),
            "train_acc": round(train_acc, 6),
            "val_loss": round(val_loss, 6),
            "val_acc": round(val_acc, 6),
            "precision": round(val_precision, 6),
            "recall": round(val_recall, 6),
            "f1": round(val_f1, 6),
        })

        save_model(model, last_model_path)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            save_model(model, best_model_path)
            print(f"✅ Saved best model to {best_model_path}")

    plot_training_curves(output_dir, train_losses, val_losses,val_accuracies, train_accuracies)

    print("✅ Done")


if __name__ == "__main__":
    main()