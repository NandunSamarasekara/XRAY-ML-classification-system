import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import ResNet18_Weights
import json
from pathlib import Path

BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")
OUTPUT_LABEL_MAP = BASE_PATH / "ml" / "members" / "member1_resnet18" / "label_map.json"

# Loading the number of classes
with open(OUTPUT_LABEL_MAP, "r") as f:
    label_map = json.load(f)

NUM_CLASSES = len(label_map)
print("Number of classes:", NUM_CLASSES)


# Creating the model function
def get_resnet18_model(weights='DEFAULT', freeze_backbone=False):
    """
    Builds ResNet18 with an improved classification head.
    'DEFAULT' uses the best available ImageNet weights (ResNet18_Weights.IMAGENET1K_V1).
    """

    # Load ResNet18 with modern weights parameter
    model = models.resnet18(weights=weights)

    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # Replacing the final layer with a deeper, more robust head
    in_features = model.fc.in_features

    model.fc = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.BatchNorm1d(512),  # Stabilizes training and allows for higher learning rates
        nn.ReLU(),
        nn.Dropout(0.5),  # Increased dropout to prevent memorization
        nn.Linear(512, 256),
        nn.ReLU(),
        nn.Dropout(0.3),  # Secondary dropout layer
        nn.Linear(256, NUM_CLASSES)
    )

    return model


# Testing
if __name__ == "__main__":
    # Test with default weights
    model = get_resnet18_model()

    print("\nResNet18 Model Summary (Updated Head):")
    print(model.fc)

    # Test forward pass
    dummy_input = torch.randn(1, 3, 224, 224)
    output = model(dummy_input)

    print("\nOutput shape:", output.shape)
    print("Success: Model architecture is ready.")