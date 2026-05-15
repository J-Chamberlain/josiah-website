import os
import base64
import concurrent.futures
import shutil
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
SOURCE_COMPOSITE = OUTPUT_DIR / "persona-connectome-brain-composite.png"
SLICES_DIR = OUTPUT_DIR / "chord-slices-temp"
SLICES_DIR.mkdir(exist_ok=True)

CLUSTERS = [
    {
        "name": "editorial-proofreader",
        "card_path": OUTPUT_DIR / "figure-10-tarot-01-proofreader-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the editorial cluster. The editorial cluster is the small dark green
arc at the very top of the circle, between the mythic spiritual (purple) arc on
the left and the procedural professional (teal) arc on the right.

Extract a pie slice that:
- Is centered on the editorial arc at the top of the circle
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 60 degrees of arc
- Shows the brain at the center, the dark green editorial arc at the top,
  and the chord ribbons connecting from it downward into the brain
- Includes the "editorial" label text
- Output as a square image with the slice centered on parchment background
  color #F0E8D5 with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "procedural-researcher",
        "card_path": OUTPUT_DIR / "figure-10-tarot-02-researcher-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the procedural professional cluster. This is the large teal/green arc
on the right side of the circle, from roughly 1 o'clock to 4 o'clock. It is the
largest arc in the diagram.

Extract a pie slice that:
- Is centered on the procedural professional arc on the right side
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 80 degrees of arc
- Shows the brain at center, the large teal arc, ribbons, persona name labels
- Includes the "procedural professional" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "grounded-social-mentor",
        "card_path": OUTPUT_DIR / "figure-10-tarot-03-mentor-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the grounded social cluster. This is the light teal/mint arc at the
bottom right of the circle, roughly between 4 o'clock and 6 o'clock, below the
large procedural professional arc.

Extract a pie slice that:
- Is centered on the grounded social arc at the lower right
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 70 degrees of arc
- Shows the brain at center, the light teal arc, ribbons, persona labels
- Includes the "grounded social" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "mythic-spiritual-philosopher",
        "card_path": OUTPUT_DIR / "figure-10-tarot-04-philosopher-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the mythic spiritual cluster. This is the large purple arc on the
upper left of the circle, from roughly 9 o'clock to 12 o'clock. It is the
second largest arc in the diagram.

Extract a pie slice that:
- Is centered on the mythic spiritual arc at the upper left
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 80 degrees of arc
- Shows the brain at center, the purple arc, ribbons, persona labels
- Includes the "mythic spiritual" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "combative-iconoclast-saboteur",
        "card_path": OUTPUT_DIR / "figure-10-tarot-05-saboteur-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the combative iconoclast cluster. This is the small dark green arc
on the left side of the circle, just below the trickster chaos (rust red) arc,
at roughly 7 o'clock to 8 o'clock.

Extract a pie slice that:
- Is centered on the combative iconoclast arc on the lower left
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 60 degrees of arc
- Shows the brain at center, the dark green arc, ribbons, persona labels
- Includes the "combative iconoclast" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "trickster-chaos-joker",
        "card_path": OUTPUT_DIR / "figure-10-tarot-06-joker-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the trickster chaos cluster. This is the small rust red arc on the
left side of the circle, just above the combative iconoclast (dark green) arc,
at roughly 6 o'clock to 7 o'clock.

Extract a pie slice that:
- Is centered on the trickster chaos arc on the left side
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 60 degrees of arc
- Shows the brain at center, the rust red arc, ribbons, persona labels
- Includes the "trickster chaos" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
    {
        "name": "other",
        "card_path": OUTPUT_DIR / "figure-10-tarot-07-other-wide.jpg",
        "slice_prompt": """
From the attached Persona Connectome image, extract a pie-slice shaped section
focused on the other cluster. This is the tan/brown arc at the bottom of the
circle, between the combative iconoclast arc and the grounded social arc,
at roughly 5 o'clock to 6 o'clock.

Extract a pie slice that:
- Is centered on the other arc at the bottom
- Extends from the center of the brain outward past the perimeter and labels
- Spans approximately 60 degrees of arc
- Shows the brain at center, the tan/brown arc, ribbons, persona labels
- Includes the "other" label text
- Output as a square image on parchment background color #F0E8D5
  with no black corners, no borders, clean parchment fill

Do not stretch, distort, or add anything not in the original image.
"""
    },
]


def save_b64_image(b64_data: str, filepath: Path):
    image_bytes = base64.b64decode(b64_data)
    with open(filepath, "wb") as f:
        f.write(image_bytes)


def backup_existing():
    print("Backing up existing card files...")
    for c in CLUSTERS:
        src = c["card_path"]
        if src.exists():
            backup = src.with_name(src.stem + "-pre-composite-backup.jpg")
            shutil.copy(src, backup)
            print(f"  Backed up: {backup.name}")


def generate_slice(cluster):
    slice_path = SLICES_DIR / f"{cluster['name']}-slice.png"
    with open(SOURCE_COMPOSITE, "rb") as img_file:
        result = client.images.edit(
            model="gpt-image-1",
            image=img_file,
            prompt=cluster["slice_prompt"].strip(),
            size="1024x1024",
            n=1
        )
    image_bytes = base64.b64decode(result.data[0].b64_json)
    with open(slice_path, "wb") as f:
        f.write(image_bytes)
    print(f"  Slice generated: {slice_path.name}")
    return slice_path


def composite_into_card(cluster, slice_path):
    card = Image.open(cluster["card_path"]).convert("RGB")
    card_w, card_h = card.size
    left_w = int(card_w * 0.45)
    slice_img = Image.open(slice_path).convert("RGB")
    slice_resized = slice_img.resize((left_w, card_h), Image.LANCZOS)
    card.paste(slice_resized, (0, 0))
    card.save(cluster["card_path"], quality=92)
    print(f"  Card updated: {cluster['card_path'].name}")


def process_card(cluster):
    try:
        print(f"\nProcessing: {cluster['name']}")
        slice_path = generate_slice(cluster)
        composite_into_card(cluster, slice_path)
        print(f"  Complete: {cluster['name']}")
    except Exception as e:
        print(f"  Failed {cluster['name']}: {e}")


if __name__ == "__main__":
    if not SOURCE_COMPOSITE.exists():
        print(f"ERROR: Source composite not found: {SOURCE_COMPOSITE}")
        exit(1)

    backup_existing()

    print(f"\nProcessing {len(CLUSTERS)} cards in parallel...")
    print(f"Source: {SOURCE_COMPOSITE.name}\n")

    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
        futures = {
            executor.submit(process_card, c): c["name"]
            for c in CLUSTERS
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"Exception in {name}: {e}")

    print("\nCleaning up temporary slice files...")
    for f in SLICES_DIR.glob("*.png"):
        f.unlink()
    try:
        SLICES_DIR.rmdir()
    except Exception:
        pass

    print("\nFinal output files:")
    for c in CLUSTERS:
        status = "done" if c["card_path"].exists() else "MISSING"
        print(f"  {status}: {c['card_path'].name}")
