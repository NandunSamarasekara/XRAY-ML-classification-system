import os
import yaml
import torch
from PIL import Image

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
def predict_image(image_path, config_path="config.yml"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cfg = load_config(config_path)

    output_dir = resolve_path(script_dir, cfg["output"]["dir"])
    best_model_path = os.path.join(output_dir, cfg["output"]["best_model_name"])

    device = get_device(cfg["training"]["device"])

    model = build_model(
        model_name=cfg["model"]["name"],
        pretrained=False
    ).to(device)

    model.load_state_dict(torch.load(best_model_path, map_location=device))
    model.eval()

    transform = get_val_transforms(cfg["training"]["image_size"])

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    logits = model(image)
    prob = torch.sigmoid(logits).item()
    pred = 1 if prob >= 0.5 else 0

    print(f"Image      : {image_path}")
    print(f"Probability: {prob:.4f}")
    print(f"Prediction : {pred}")

    return pred, prob


if __name__ == "__main__":
    test_image = r"C:\Users\ASUS\PycharmProjects\Wedakam\data\raw\all_images\sample.png"
    predict_image(test_image)