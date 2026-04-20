import os
from pathlib import Path
from PIL import Image

BASE_PATH = Path(r"E:\Medicine\XRAY-decease-classification\XRAY-ML-system")

# Root folder where all image folders exist
IMAGES_ROOT = BASE_PATH / "data" / "raw"

# Log file
LOG_FILE = BASE_PATH / "ml" / "members" / "member1_resnet18" / "corrupted_images.txt"


def is_image_corrupted(img_path):
    try:
        with Image.open(img_path) as img:
            img.verify()  # check corruption
        return False
    except Exception:
        return True


def main():

    corrupted_images = []

    print("🔍 Scanning for corrupted images...\n")

    # Loop through all image folders (images_001, images_002, ...)
    for folder in IMAGES_ROOT.iterdir():

        if folder.is_dir() and folder.name.startswith("images_"):

            images_folder = folder / "images"

            if not images_folder.exists():
                continue

            print(f"Checking: {images_folder}")

            for img_file in images_folder.glob("*.*"):

                if is_image_corrupted(img_file):
                    print(f"❌ Corrupted: {img_file}")
                    corrupted_images.append(img_file)

    print("\nTotal corrupted images found:", len(corrupted_images))

    # Save log
    with open(LOG_FILE, "w") as f:
        for img_path in corrupted_images:
            f.write(str(img_path) + "\n")

    print(f"\n📝 Log saved to: {LOG_FILE}")

    # Confirm deletion
    confirm = input("\nDo you want to DELETE these images? (yes/no): ")

    if confirm.lower() == "yes":

        for img_path in corrupted_images:
            try:
                os.remove(img_path)
                print(f"Deleted: {img_path}")
            except Exception as e:
                print(f"Error deleting {img_path}: {e}")

        print("\n✅ All corrupted images deleted")

    else:
        print("\n❌ Deletion cancelled")


if __name__ == "__main__":
    main()