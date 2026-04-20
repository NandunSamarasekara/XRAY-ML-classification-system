import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score, f1_score
import numpy as np
import pandas as pd
from tqdm import tqdm
from pathlib import Path
import os

from step_03_dataset_loader import get_dataloaders
from step_04_model import get_vit_base_model

# CONFIG
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EPOCHS = 50
INITIAL_LR = 1e-4
BASE_LR = 2e-5
LR_DECAY_FACTOR = 0.80
WEIGHT_DECAY = 0.05
PATIENCE = 10
BATCH_SIZE = 16

BASE_DIR = Path(r"C:\Users\ASUS TUF\Desktop\XRAY-ML-classification-system\ml\members\member6_vit")
SAVE_PATH = BASE_DIR / "best_model.pth"
LOG_PATH = BASE_DIR / "training_log.csv"

def get_optimizer(model):
    head_params = [p for n, p in model.named_parameters() if "classifier" in n]
    blocks = model.vit.encoder.layer

    params = [{"params": head_params, "lr": BASE_LR * 2.5}]  # Head gets a larger boost

    for i in range(11, -1, -1):
        params.append({
            "params": blocks[i].parameters(),
            "lr": BASE_LR * (LR_DECAY_FACTOR ** (11 - i))
        })

    params.append({
        "params": model.vit.embeddings.parameters(),
        "lr": BASE_LR * (LR_DECAY_FACTOR ** 12)
    })

    return optim.AdamW(params, weight_decay=WEIGHT_DECAY)

def run_epoch(model, loader, optimizer, criterion, device, phase="Training"):
    if phase == "Training":
        model.train()
    else:
        model.eval()

    all_preds, all_labels = [], []
    running_loss = 0.0

    with torch.set_grad_enabled(phase == "Training"):
        for images, labels in tqdm(loader, desc=phase):
            images, labels = images.to(device), labels.to(device)

            if phase == "Training":
                optimizer.zero_grad()
                outputs = model(images).logits
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
            else:
                outputs = model(images).logits
                loss = criterion(outputs, labels)

            running_loss += loss.item()
            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    avg_loss = running_loss / len(loader)
    acc = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds, average='weighted')
    return avg_loss, acc, f1

def main():
    SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Load Data
    train_loader, val_loader, _ = get_dataloaders(batch_size=BATCH_SIZE, num_workers=4)

    # Setup Model
    model = get_vit_base_model(pretrained=True).to(DEVICE)

    # RESUME LOGIC
    if os.path.exists(SAVE_PATH):
        print(f"Loading existing best model from {SAVE_PATH} to continue training...")
        model.load_state_dict(torch.load(SAVE_PATH))

    class_weights = torch.tensor([
        1.0,
        0.7,
        2.2,
        2.0,
        1.2,
        1.4
    ]).to(DEVICE)

    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.1)

    # INITIAL STABILIZATION
    print("\nFreezing backbone - Stabilizing head (5 Epochs)")
    for name, param in model.named_parameters():
        if "classifier" not in name:
            param.requires_grad = False

    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()),
                            lr=INITIAL_LR, weight_decay=WEIGHT_DECAY)

    best_val_loss = float('inf')
    epochs_no_improve = 0
    history = []

    for epoch in range(EPOCHS):
        # SWITCH TO DISCRIMINATIVE FINE-TUNING
        if epoch == 5:
            print(f"\nUnfreezing with LLRD (Base LR: {BASE_LR})")
            for param in model.parameters():
                param.requires_grad = True

            optimizer = get_optimizer(model)
            scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
                optimizer, T_0=15, T_mult=1, eta_min=1e-7
            )

        print(f"\nEpoch {epoch + 1}/{EPOCHS}")
        train_loss, train_acc, train_f1 = run_epoch(model, train_loader, optimizer, criterion, DEVICE, "Training")
        val_loss, val_acc, val_f1 = run_epoch(model, val_loader, None, criterion, DEVICE, "Validating")

        if epoch >= 5:
            scheduler.step()

        current_lr = optimizer.param_groups[0]['lr']
        history.append({
            "epoch": epoch + 1, "train_loss": train_loss, "train_acc": train_acc,
            "val_loss": val_loss, "val_acc": val_acc, "val_f1": val_f1, "lr": current_lr
        })

        print(f"LR: {current_lr:.2e} | Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            epochs_no_improve = 0
            torch.save(model.state_dict(), SAVE_PATH)
            print(f"New best model saved (Loss: {val_loss:.4f})")
        else:
            epochs_no_improve += 1
            print(f"No improvement for {epochs_no_improve} epochs.")

        pd.DataFrame(history).to_csv(LOG_PATH, index=False)

        if epochs_no_improve >= PATIENCE:
            print(f"\nEarly stopping at epoch {epoch + 1}. Training complete.")
            break

if __name__ == '__main__':
    main()