import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path

NUM_OUTPUTS = 1


def get_resnet50_binary_model(pretrained=True, freeze_backbone=False):

    # Load ResNet50
    weights = 'IMAGENET1K_V1' if pretrained else None
    model = models.resnet50(weights=weights)

    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # Get the number of input features for the final FC layer
    in_features = model.fc.in_features

    # Replacing the final layer for binary classification
    model.fc = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(512, NUM_OUTPUTS)
    )

    return model


# Testing
if __name__ == "__main__":
    # Initialize the model
    model = get_resnet50_binary_model(pretrained=True, freeze_backbone=False)

    print("\nResNet50 Binary Model Summary (Tail):\n")
    print(model.fc)

    # Test forward pass
    dummy_input = torch.randn(1, 3, 224, 224)
    output = model(dummy_input)

    print("\nOutput shape:", output.shape)  # Should be [1, 1]

    # Apply sigmoid to see the probability
    probability = torch.sigmoid(output)
    print("Sample probability:", probability.item())