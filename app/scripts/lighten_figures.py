import os
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

REPO_ROOT = Path(__file__).parent.parent
IMG_DIR = REPO_ROOT / "public/images/geometry-of-mind"

# Reference tone: figure-07-anatomy-spread.jpg
# Target: lighten figures 1, 9, and 13 to match

TARGETS = [
    {
        "name": "figure-01-mri-observation-room",
        "input": IMG_DIR / "figure-01-mri-observation-room.jpg",
        "output_preview": IMG_DIR / "figure-01-mri-observation-room-light.jpg",
        "brightness": 1.35,
        "contrast": 0.92,
    },
    {
        "name": "figure-09-severance-session",
        "input": IMG_DIR / "figure-09-severance-session.jpg",
        "output_preview": IMG_DIR / "figure-09-severance-session-light.jpg",
        "brightness": 1.55,
        "contrast": 0.88,
    },
    {
        "name": "figure-13-walter-white-diptych",
        "input": IMG_DIR / "figure-13-walter-white-diptych.jpg",
        "output_preview": IMG_DIR / "figure-13-walter-white-diptych-light.jpg",
        "brightness": 1.40,
        "contrast": 0.90,
    },
]


def lighten(target):
    img = Image.open(target["input"]).convert("RGB")

    # Brighten
    img = ImageEnhance.Brightness(img).enhance(target["brightness"])

    # Slightly reduce contrast to soften toward parchment register
    img = ImageEnhance.Contrast(img).enhance(target["contrast"])

    # Save preview
    img.save(target["output_preview"], quality=92)
    print(f"✓ Preview saved: {target['output_preview'].name}")


if __name__ == "__main__":
    print("Lightening figures to match anatomy spread tone...\n")
    for t in TARGETS:
        if not t["input"].exists():
            print(f"✗ Not found: {t['input'].name}")
            continue
        lighten(t)

    print("\nDone. Review the -light versions before overwriting originals.")
    print("To overwrite, rename each -light file to replace the original.")
