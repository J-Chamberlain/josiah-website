import os
import base64
import concurrent.futures
from pathlib import Path

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_b64_image(b64_data: str, filepath: Path):
    image_bytes = base64.b64decode(b64_data)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    print(f"✓ Saved: {filepath.name}")


def generate(name, prompt, output_path, size="1792x1024"):
    try:
        result = client.images.generate(
            model="gpt-image-2",
            prompt=prompt.strip(),
            size=size,
            quality="high",
            n=1,
        )
        save_b64_image(result.data[0].b64_json, output_path)
    except Exception as e:
        print(f"✗ Failed {name}: {e}")


FIGURES = [
    {
        "name": "figure-02-golden-gate-bridge",
        "output": OUTPUT_DIR / "figure-02-golden-gate-bridge.jpg",
        "size": "1792x1024",
        "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality,
cross-hatching in the style of Renaissance mechanical drawings. Wide landscape format.

A single aerial or slight elevated view of the Golden Gate Bridge rendered as a mechanical study —
the full span visible from above and slightly to the side, both towers present, the suspension cables
rendered with the precision and care da Vinci gave to load-bearing structures. The roadway recedes
into the distance. The bay and headlands fade into the parchment at the edges rather than being
fully rendered.

One view only — no detail insets, no lower panels, no subsidiary sketches. The full width of the
bridge is the subject. Clean, structural, precise.

No color. No annotation lines. No text labels. Warm sepia on cream parchment. The feeling is of an
engineer's first careful study of a structure, rendered in a Renaissance notebook.
"""
    },
    {
        "name": "figure-07-anatomy-spread",
        "output": OUTPUT_DIR / "figure-07-anatomy-spread.jpg",
        "size": "1024x1024",
        "prompt": """
A faithful homage to Leonardo da Vinci's actual anatomical notebook pages. Sepia ink on aged cream
parchment, hand-drawn quality — the style should be indistinguishable from his Windsor Collection
studies.

The page contains multiple disjointed anatomical elements arranged in the manner of his actual
studies — not a complete figure but isolated components at different scales and angles:

- An arm studied from multiple angles, the muscles indicated with fine parallel lines
- A hand in two or three positions, fingers extended or partially closed
- A shoulder and neck study showing the trapezius and deltoid
- Small subsidiary sketches of joints or tendons in the margins

The elements float on the page connected by the logic of inquiry rather than narrative. Annotation
lines point to structures in the manner of his actual labels — fine lines with the suggestion of
mirror-script handwriting at their ends, though the text need not be legible.

This should look like a page that could plausibly have come from his actual notebooks. No invented
symbolism, no spiritual elements, no circles or diagrams that don't appear in his actual anatomy
work. Pure anatomical study in his hand.

Warm sepia on cream parchment. No color.
"""
    },
    {
        "name": "figure-13-walter-white-diptych",
        "output": OUTPUT_DIR / "figure-13-walter-white-diptych.jpg",
        "size": "1024x1024",
        "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality,
cross-hatching in the style of Renaissance figure studies. Da Vinci comparative study format —
two figures side by side on the same page.

Left figure: a middle-aged high school chemistry teacher, early fifties. He wears glasses —
wire-rimmed, rectangular. A button-down shirt with a tie, slightly rumpled. He holds a chemistry
flask or beaker. A chalkboard with molecular diagrams is loosely sketched behind him. The posture
of someone earnest, slightly tired, fundamentally decent. The face of a man who has not yet made
a decision.

Right figure: the same face, same age, unmistakably the same person. He now wears a distinctive
wide-brim porkpie hat — black, the brim level, the crown flat. Open collar shirt, no tie. Behind
him, a vast flat desert landscape fades into the parchment — heat, distance, the suggestion of
the American southwest. The posture has changed completely — settled, certain, still. The glasses
are gone. The eyes are the same but something behind them has shifted permanently.

The hat is the key identifying element — it must be clearly a black wide-brim porkpie hat, iconic
and unmistakable. Anyone who has seen Breaking Bad must recognize this figure immediately.

The space between the two figures on the page is the transformation — unmarked, complete.

No annotation lines. No text labels. No color beyond warm sepia. The parchment between them holds
the weight of everything that happened in between.
"""
    }
]


if __name__ == "__main__":
    print(f"Generating {len(FIGURES)} figures in parallel...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(generate, f["name"], f["prompt"], f["output"], f["size"]): f["name"]
            for f in FIGURES
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"✗ Exception in {name}: {e}")
    print("Done. Review outputs in:", OUTPUT_DIR)
