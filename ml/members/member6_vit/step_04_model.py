import torch
import torch.nn as nn
from transformers import ViTForImageClassification, ViTConfig
import os

# Set token
os.environ["HF_TOKEN"] = "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"

NUM_CLASSES = 6
IMG_SIZE = 384

def get_vit_base_model(pretrained=True):

    model_name = 'google/vit-base-patch16-384'

    if pretrained:
        print(f"Loading pre-trained {model_name}...")

        config = ViTConfig.from_pretrained(model_name)
        config.num_labels = NUM_CLASSES

        config.hidden_dropout_prob = 0.3
        config.attention_probs_dropout_prob = 0.3

        model = ViTForImageClassification.from_pretrained(
            model_name,
            config=config,
            ignore_mismatched_sizes=True
        )

    else:
        print(f"Initializing {model_name} from scratch...")
        config = ViTConfig.from_pretrained(model_name, num_labels=NUM_CLASSES)
        config.hidden_dropout_prob = 0.3
        config.attention_probs_dropout_prob = 0.3
        config.image_size = IMG_SIZE
        model = ViTForImageClassification(config)

    return model


if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = get_vit_base_model(pretrained=True).to(device)

    # Print relevant config
    print(f"Resolution: {model.config.image_size}x{model.config.image_size}")
    print(f"Hidden Dropout: {model.config.hidden_dropout_prob}")
    print(f"Attention Dropout: {model.config.attention_probs_dropout_prob}")
    print(f"Classifier Head: {model.classifier}")

    # Test forward pass
    model.eval()
    dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)

    with torch.no_grad():
        outputs = model(dummy_input)
        logits = outputs.logits

    print(f"\nOutput shape: {logits.shape}")

    if logits.shape[1] == NUM_CLASSES:
        print(f"Success: Model is configured for {NUM_CLASSES} classes at {IMG_SIZE}px.")
    else:
        print(f"Error: Expected {NUM_CLASSES} classes, but got {logits.shape[1]}")