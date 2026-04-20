import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import csv
from pathlib import Path
from tqdm import tqdm

from step_03_dataset_loader import get_dataloaders
from step_04_model import get_resnet18_model
from step_07_focal_loss import FocalLoss


def main():
    # --- Paths and Setup ---
    BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")
    DATA_DIR = BASE_PATH / "ml" / "members" / "member1_resnet18" / "processed"
    TRAIN_CSV = DATA_DIR / "train.csv"

    MODEL_DIR = BASE_PATH / "ml" / "models" / "member1_resnet18"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    BEST_MODEL_PATH = MODEL_DIR / "best_model.pth"
    HISTORY_FILE = MODEL_DIR / "training_history" / "training_history.csv"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # --- Data Loaders ---
    # batch_size 32 is a good balance for CPU/GPU memory
    train_loader, val_loader, _ = get_dataloaders(batch_size=32, num_workers=0)

    # --- Loss & Class Weights ---
    train_df = pd.read_csv(TRAIN_CSV)
    class_counts = train_df["label"].value_counts().sort_index()

    # Inverse frequency weighting for Focal Loss
    weights = 1.0 / class_counts
    weights = weights / weights.sum()
    class_weights = torch.tensor(weights.values, dtype=torch.float).to(device)

    # --- Model, Optimizer, Scheduler ---
    model = get_resnet18_model().to(device)

    # Gamma=2.0 helps the model focus on harder, misclassified X-ray samples
    criterion = FocalLoss(alpha=class_weights, gamma=2.0)

    # weight_decay adds L2 regularization to prevent weight explosion
    optimizer = optim.Adam(model.parameters(), lr=0.0001, weight_decay=1e-4)

    # Reduces LR if validation accuracy plateaus
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.1, patience=2)

    # --- Logging Setup ---
    history_headers = ["epoch", "train_loss", "train_acc", "val_loss", "val_acc"]
    with open(HISTORY_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(history_headers)

    # --- Training Loop ---
    EPOCHS = 12
    best_val_accuracy = 0
    patience_counter = 0
    EARLY_STOPPING_PATIENCE = 4

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch + 1}/{EPOCHS}")

        # --- Training Phase ---
        model.train()
        train_loss, train_correct, train_total = 0, 0, 0

        for images, labels in tqdm(train_loader, desc="Training"):
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()

        train_loss_final = train_loss / train_total
        train_acc_final = 100 * train_correct / train_total

        # --- Validation Phase ---
        model.eval()
        val_loss, val_correct, val_total = 0, 0, 0

        with torch.no_grad():
            for images, labels in tqdm(val_loader, desc="Validating"):
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        val_loss_final = val_loss / val_total
        val_acc_final = 100 * val_correct / val_total

        print(f"Train Loss: {train_loss_final:.4f} | Acc: {train_acc_final:.2f}%")
        print(f"Val Loss: {val_loss_final:.4f} | Acc: {val_acc_final:.2f}%")

        # --- Update Logs ---
        with open(HISTORY_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([epoch + 1, train_loss_final, train_acc_final, val_loss_final, val_acc_final])

        # --- Scheduler & Early Stopping ---
        scheduler.step(val_acc_final)

        if val_acc_final > best_val_accuracy:
            best_val_accuracy = val_acc_final
            torch.save(model.state_dict(), BEST_MODEL_PATH)
            print(f"New Best Model Saved ({val_acc_final:.2f}%)")
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= EARLY_STOPPING_PATIENCE:
                print(f"Alert: Early Stopping triggered after {EARLY_STOPPING_PATIENCE} epochs of no improvement.")
                break

    print(f"\nDone! History saved to {HISTORY_FILE}")


if __name__ == "__main__":
    main()