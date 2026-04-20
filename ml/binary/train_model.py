import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from model import get_resnet50_binary_model
from dataset_loader import XRayBinaryDataset, DataLoader, train_transform, val_test_transform


# UTILS & METRICS
class EarlyStopping:
    def __init__(self, patience=7, min_delta=0, path='best_resnet50_binary.pth'):
        self.patience = patience
        self.min_delta = min_delta
        self.path = path
        self.counter = 0
        self.best_loss = float('inf')
        self.early_stop = False

    def __call__(self, val_loss, model):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            torch.save(model.state_dict(), self.path)
            print(f"--- Validation loss decreased. Saving model to {self.path} ---")
        else:
            self.counter += 1
            print(f"--- EarlyStopping counter: {self.counter} out of {self.patience} ---")
            if self.counter >= self.patience:
                self.early_stop = True


def calculate_metrics(all_labels, all_preds):
    acc = accuracy_score(all_labels, all_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(
        all_labels, all_preds, average='binary', zero_division=0
    )
    return {
        "accuracy": acc,
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }


def plot_history(history, save_path):
    epochs = range(1, len(history["train_loss"]) + 1)
    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.plot(epochs, history["train_loss"], label='Train Loss')
    plt.plot(epochs, history["val_loss"], label='Val Loss')
    plt.title('Loss History')
    plt.xlabel('Epoch')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(epochs, history["val_f1"], label='F1-Score', color='blue')
    plt.plot(epochs, history["val_acc"], label='Accuracy', color='green')
    plt.title('Performance Metrics')
    plt.xlabel('Epoch')
    plt.legend()

    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()


# CONFIGURATION

CONFIG = {
    "lr": 1e-5,
    "weight_decay": 1e-4,
    "batch_size": 16,
    "epochs": 50,
    "patience": 7,
}

BASE_PATH = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system")
DATA_DIR = BASE_PATH / "ml" / "binary" / "processed"
RAW_IMAGES_BASE = BASE_PATH / "data" / "raw"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# TRAINING
def train():
    # Initialize Model, Optimizer, and Loss
    model = get_resnet50_binary_model().to(DEVICE)
    optimizer = optim.Adam(model.parameters(), lr=CONFIG["lr"], weight_decay=CONFIG["weight_decay"])
    criterion = nn.BCEWithLogitsLoss()

    # Setup EarlyStopping
    save_dir = BASE_PATH / 'ml' / 'binary'
    save_dir.mkdir(parents=True, exist_ok=True)
    best_model_path = save_dir / 'best_resnet50_model.pth'
    stopper = EarlyStopping(patience=CONFIG["patience"], path=str(best_model_path))

    # Data Loaders
    train_ds = XRayBinaryDataset(DATA_DIR / "train.csv", RAW_IMAGES_BASE, train_transform)
    val_ds = XRayBinaryDataset(DATA_DIR / "val.csv", RAW_IMAGES_BASE, val_test_transform)

    train_loader = DataLoader(train_ds, batch_size=CONFIG["batch_size"], shuffle=True, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=CONFIG["batch_size"], shuffle=False, pin_memory=True)

    history = {"train_loss": [], "val_loss": [], "val_acc": [], "val_f1": []}

    print(f"Starting training on {DEVICE} for {CONFIG['epochs']} epochs...")

    for epoch in range(CONFIG["epochs"]):
        print(f"\n--- Epoch {epoch + 1}/{CONFIG['epochs']} ---")

        # Training Phase
        model.train()
        total_train_loss = 0
        for i, (images, labels) in enumerate(train_loader):
            images, labels = images.to(DEVICE), labels.to(DEVICE).unsqueeze(1)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_train_loss += loss.item()

            if (i + 1) % 100 == 0:
                print(f"Batch [{i + 1}/{len(train_loader)}] Loss: {loss.item():.4f}")

        # Validation Phase
        model.eval()
        val_labels, val_preds = [], []
        total_val_loss = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE).unsqueeze(1)

                outputs = model(images)
                total_val_loss += criterion(outputs, labels).item()

                probs = torch.sigmoid(outputs)
                preds = (probs > 0.5).float()

                val_labels.extend(labels.cpu().numpy())
                val_preds.extend(preds.cpu().numpy())

        # Metrics Calculation
        avg_train_loss = total_train_loss / len(train_loader)
        avg_val_loss = total_val_loss / len(val_loader)
        metrics = calculate_metrics(val_labels, val_preds)

        # Update History
        history["train_loss"].append(avg_train_loss)
        history["val_loss"].append(avg_val_loss)
        history["val_acc"].append(metrics['accuracy'])
        history["val_f1"].append(metrics['f1_score'])

        print(f"Summary -> Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}")
        print(
            f"Metrics -> Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1_score']:.4f} | Recall: {metrics['recall']:.4f}")

        # Save Plots Every Epoch
        plot_history(history, save_dir / 'training_plot.png')

        # Early Stopping check
        stopper(avg_val_loss, model)
        if stopper.early_stop:
            print("Early stopping triggered. Training stopped.")
            break

    print("\nTraining Complete.")


if __name__ == "__main__":
    train()