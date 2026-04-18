import os
import yaml
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
import torch
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm
from sklearn.metrics import precision_score, recall_score, f1_score
from torch.utils.data import DataLoader
from torchvision import transforms, models
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from multiclass_dataset import MultiClassImageDataset


# -----------------------------
# Utility functions
# -----------------------------
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def load_config(config_path="multiclass_config.yml"):
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_transforms(image_size=224):
    train_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform


def build_model(num_classes, pretrained=True):
    model = models.densenet121(
        weights=models.DenseNet121_Weights.DEFAULT if pretrained else None
    )
    in_features = model.classifier.in_features
    model.classifier = nn.Linear(in_features, num_classes)
    return model


def calculate_class_weights(csv_path, label_col, num_classes):
    df = pd.read_csv(csv_path)
    label_counts = Counter(df[label_col].tolist())

    total = sum(label_counts.values())
    weights = []

    for i in range(num_classes):
        count = label_counts.get(i, 1)
        weight = total / count
        weights.append(weight)

    weights = torch.tensor(weights, dtype=torch.float)
    return weights


def moving_average(values, window=3):
    smoothed = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        smoothed.append(sum(values[start:i+1]) / len(values[start:i+1]))
    return smoothed


def save_curves(history, output_dir):
    epochs = range(1, len(history["train_loss"]) + 1)

    train_loss_smooth = moving_average(history["train_loss"], window=3)
    val_loss_smooth = moving_average(history["val_loss"], window=3)
    train_acc_smooth = moving_average(history["train_acc"], window=3)
    val_acc_smooth = moving_average(history["val_acc"], window=3)

    plt.figure(figsize=(8, 6))
    plt.plot(epochs, train_loss_smooth, label="Train Loss")
    plt.plot(epochs, val_loss_smooth, label="Val Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training and Validation Loss")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(output_dir, "loss_curve.png"))
    plt.close()

    plt.figure(figsize=(8, 6))
    plt.plot(epochs, train_acc_smooth, label="Train Accuracy")
    plt.plot(epochs, val_acc_smooth, label="Val Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Training and Validation Accuracy")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(output_dir, "accuracy_curve.png"))
    plt.close()

def save_confusion_matrix(cm, output_dir):
    plt.figure(figsize=(8, 6))
    plt.imshow(cm, interpolation="nearest", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.colorbar()
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "confusion_matrix.png"))
    plt.close()


def save_label_distribution(csv_path, label_col, output_dir, name):
    df = pd.read_csv(csv_path)
    counts = df[label_col].value_counts().sort_index()

    plt.figure(figsize=(8, 5))
    counts.plot(kind="bar")
    plt.title(f"{name} Label Distribution")
    plt.xlabel("Class")
    plt.ylabel("Count")
    plt.grid(axis="y")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, f"{name.lower()}_label_distribution.png"))
    plt.close()


# -----------------------------
# Train one epoch
# -----------------------------
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    all_preds = []
    all_labels = []

    progress_bar = tqdm(loader, desc="Training", leave=True)

    for images, labels in progress_bar:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = torch.argmax(outputs, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

        progress_bar.set_postfix(train_loss=f"{loss.item():.3f}")

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)

    return epoch_loss, epoch_acc


# -----------------------------
# Validate one epoch
# -----------------------------
def validate_one_epoch(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []

    progress_bar = tqdm(loader, desc="Validation", leave=True)

    with torch.no_grad():
        for images, labels in progress_bar:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

            progress_bar.set_postfix(val_loss=f"{loss.item():.3f}")

    epoch_loss = running_loss / len(loader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)

    return epoch_loss, epoch_acc, all_labels, all_preds


# -----------------------------
# Main
# -----------------------------
def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, "multiclass_config.yml")
    config = load_config(config_path)

    set_seed(config["seed"])

    train_csv = config["data"]["train_csv"]
    val_csv = config["data"]["val_csv"]
    test_csv = config["data"]["test_csv"]
    image_root = config["data"]["image_root"]
    image_col = config["data"]["image_col"]
    label_col = config["data"]["label_col"]

    num_classes = config["model"]["num_classes"]
    pretrained = config["model"]["pretrained"]

    epochs = config["train"]["epochs"]
    batch_size = config["train"]["batch_size"]
    lr = config["train"]["lr"]
    weight_decay = config["train"]["weight_decay"]
    num_workers = config["train"]["num_workers"]
    image_size = config["train"]["image_size"]
    output_dir = config["train"]["output_dir"]
    patience = config["train"]["early_stopping_patience"]

    os.makedirs(output_dir, exist_ok=True)

    device_name = config["train"]["device"]

    if device_name == "cuda" and not torch.cuda.is_available():
        print("CUDA not available, switching to CPU")
        device_name = "cpu"

    device = torch.device(device_name)

    if device.type == "cuda":
        torch.backends.cudnn.benchmark = True

    train_transform, val_transform = get_transforms(image_size)

    train_dataset = MultiClassImageDataset(
        csv_path=train_csv,
        image_root=image_root,
        image_col=image_col,
        label_col=label_col,
        transform=train_transform,
        skip_broken=True
    )

    val_dataset = MultiClassImageDataset(
        csv_path=val_csv,
        image_root=image_root,
        image_col=image_col,
        label_col=label_col,
        transform=val_transform,
        skip_broken=True
    )

    test_dataset = MultiClassImageDataset(
        csv_path=test_csv,
        image_root=image_root,
        image_col=image_col,
        label_col=label_col,
        transform=val_transform,
        skip_broken=True
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers
    )

    save_label_distribution(train_csv, label_col, output_dir, "Train")
    save_label_distribution(val_csv, label_col, output_dir, "Val")
    save_label_distribution(test_csv, label_col, output_dir, "Test")

    model = build_model(num_classes=num_classes, pretrained=pretrained)
    model = model.to(device)

    class_weights = calculate_class_weights(train_csv, label_col, num_classes).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", patience=2, factor=0.5
    )

    history = {
        "train_loss": [],
        "val_loss": [],
        "train_acc": [],
        "val_acc": []
    }

    best_val_acc = 0.0
    early_stop_counter = 0

    for epoch in range(epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}:")

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )

        val_loss, val_acc, y_true, y_pred = validate_one_epoch(
            model, val_loader, criterion, device
        )

        scheduler.step(val_loss)

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)

        precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
        recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

        print(
            f"Epoch {epoch + 1}: "
            f"train_acc={train_acc:.4f} "
            f"val_loss={val_loss:.4f} "
            f"val_acc={val_acc:.4f} "
            f"precision={precision:.4f} "
            f"recall={recall:.4f} "
            f"f1={f1:.4f}"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            early_stop_counter = 0
            best_model_path = os.path.join(output_dir, "best_model.pth")
            torch.save(model.state_dict(), best_model_path)
            print(f"Saved best model to {best_model_path}")
        else:
            early_stop_counter += 1
            print(f"No improvement for {early_stop_counter}/{patience} epoch(s)")

        if early_stop_counter >= patience:
            print("Early stopping triggered.")
            break

    save_curves(history, output_dir)

    # Final test evaluation
    print("\nLoading best model for test evaluation...")
    model.load_state_dict(torch.load(os.path.join(output_dir, "best_model.pth"), map_location=device))
    model.eval()

    test_loss, test_acc, y_true, y_pred = validate_one_epoch(
        model, test_loader, criterion, device
    )

    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")

    report = classification_report(y_true, y_pred, digits=4)
    cm = confusion_matrix(y_true, y_pred)

    print("\nClassification Report:")
    print(report)

    with open(os.path.join(output_dir, "classification_report.txt"), "w") as f:
        f.write(report)

    save_confusion_matrix(cm, output_dir)

    history_df = pd.DataFrame(history)
    history_df.to_csv(os.path.join(output_dir, "training_history.csv"), index=False)

    print("\nAll outputs saved in:", output_dir)


if __name__ == "__main__":
    main()