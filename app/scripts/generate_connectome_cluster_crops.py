import concurrent.futures
import math
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
SOURCE = OUTPUT_DIR / "persona-connectome-brain-composite.png"


def get_image_center(img):
    return img.width // 2, img.height // 2


# Fallback positions from the visual layout of the diagram.
CLUSTERS = [
    {
        "name": "editorial",
        "output": OUTPUT_DIR / "figure-10-tarot-01-proofreader-wide.jpg",
        "arc_center_deg": 0,
        "label": "The Proofreader",
    },
    {
        "name": "procedural_professional",
        "output": OUTPUT_DIR / "figure-10-tarot-02-researcher-wide.jpg",
        "arc_center_deg": 45,
        "label": "The Researcher",
    },
    {
        "name": "grounded_social",
        "output": OUTPUT_DIR / "figure-10-tarot-03-mentor-wide.jpg",
        "arc_center_deg": 135,
        "label": "The Mentor",
    },
    {
        "name": "other",
        "output": OUTPUT_DIR / "figure-10-tarot-07-other-wide.jpg",
        "arc_center_deg": 200,
        "label": "The Other",
    },
    {
        "name": "combative_iconoclast",
        "output": OUTPUT_DIR / "figure-10-tarot-05-saboteur-wide.jpg",
        "arc_center_deg": 235,
        "label": "The Saboteur",
    },
    {
        "name": "trickster_chaos",
        "output": OUTPUT_DIR / "figure-10-tarot-06-joker-wide.jpg",
        "arc_center_deg": 260,
        "label": "The Joker",
    },
    {
        "name": "mythic_spiritual",
        "output": OUTPUT_DIR / "figure-10-tarot-04-philosopher-wide.jpg",
        "arc_center_deg": 310,
        "label": "The Philosopher",
    },
]


def get_crop_box(img, arc_center_deg, crop_radius_fraction=0.85):
    """
    Calculate crop bounding box centered on the arc position
    but always including the center of the image (the brain).
    Returns (left, top, right, bottom)
    """
    cx, cy = get_image_center(img)
    w, h = img.width, img.height

    # Convert angle to radians (0=top, clockwise)
    angle_rad = math.radians(arc_center_deg - 90)

    # The crop box spans from center toward the arc position
    # Width is 60% of image width, height is 60% of image height
    crop_w = int(w * 0.62)
    crop_h = int(h * 0.62)

    # Calculate offset toward the arc position
    offset_x = int(math.cos(angle_rad) * w * 0.18)
    offset_y = int(math.sin(angle_rad) * h * 0.18)

    # Center the crop box offset toward the arc
    box_cx = cx + offset_x
    box_cy = cy + offset_y

    left = max(0, box_cx - crop_w // 2)
    top = max(0, box_cy - crop_h // 2)
    right = min(w, left + crop_w)
    bottom = min(h, top + crop_h)

    return (left, top, right, bottom)


def generate_crop(cluster):
    try:
        img = Image.open(SOURCE)
        box = get_crop_box(img, cluster["arc_center_deg"])
        cropped = img.crop(box)

        # Resize to 1792x1024 (wide format matching existing tarot cards)
        cropped = cropped.resize((1792, 1024), Image.LANCZOS)

        cropped.save(cluster["output"], quality=92)
        print(f"✓ Saved: {cluster['output'].name}")
    except Exception as e:
        print(f"✗ Failed {cluster['name']}: {e}")


if __name__ == "__main__":
    if not SOURCE.exists():
        print(f"ERROR: Source not found: {SOURCE}")
        exit(1)

    img = Image.open(SOURCE)
    print(f"Source image: {img.width} x {img.height}px")
    print(f"Generating {len(CLUSTERS)} cluster crops in parallel...\n")

    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
        futures = {
            executor.submit(generate_crop, c): c["name"]
            for c in CLUSTERS
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"✗ Exception in {name}: {e}")

    print("\nAll done. Review outputs in:", OUTPUT_DIR)
    print("\nExpected files:")
    for c in CLUSTERS:
        status = "✓" if c["output"].exists() else "✗ MISSING"
        print(f"  {status} {c['output'].name}")
