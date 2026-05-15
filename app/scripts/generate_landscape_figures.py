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

FIGURES = [
    {
        "name": "figure-alphaFold-protein-sketch",
        "output": OUTPUT_DIR / "figure-alphaFold-protein-sketch.jpg",
        "size": "1024x1024",
        "prompt": """
A minimal Renaissance anatomical notebook drawing on aged parchment, inspired by
Leonardo da Vinci. Warm sepia ink on cream paper, delicate hand-drawn linework,
subtle cross-hatching, restrained negative space, no color.

Use the structure of a modern AlphaFold-style protein rendering as the guide:
several large curling alpha helices, a few ribbon loops, and a fine surrounding
network of thin atomic stick bonds. The protein should fill the central field
like a folded molecular sculpture, with the helices clearly readable as broad
twisting ribbons and the atomic side chains drawn as sparse precise ink strokes.

Translate the entire scientific model into da Vinci's visual language: the
ribbons feel like studied tendons, the stick bonds feel like mechanical
investigations, and the whole drawing remains quiet, precise, and minimal.

No text. No labels. No letters. No arrows. No colored elements.
"""
    },
    {
        "name": "figure-moral-landscape-surface",
        "output": OUTPUT_DIR / "figure-moral-landscape-surface.jpg",
        "size": "1536x1024",
        "prompt": """
A minimal Renaissance notebook sketch on aged parchment, inspired by Leonardo
da Vinci. Warm sepia ink on cream paper, delicate hand-drawn linework, subtle
cross-hatching, restrained negative space, no color.

A single floating fabric-like topology surface, drawn as a thin translucent mesh
sheet. Use a topology close to the lower fabric layer in the reference: a long
horizontal wave of soft rolling hills and shallow basins, with a few smooth
rounded swells, a continuous rippling edge, and no dramatic mountain peaks.

The fabric is centered vertically in the composition so the viewer can clearly
see empty parchment space above it and empty parchment space below it. The sheet
spans most of the width, suspended in the middle of the page like a mathematical
cloth seen from a low oblique angle. The mesh texture is sparse, airy, and
minimal, with fine sepia grid lines following the folds.

No text. No labels. No letters. No dotted path. No arrows. No colored elements.
"""
    },
]


def generate(fig):
    try:
        result = client.images.generate(
            model="gpt-image-1",
            prompt=fig["prompt"].strip(),
            size=fig["size"],
            quality="high",
            n=1
        )
        image_bytes = base64.b64decode(result.data[0].b64_json)
        with open(fig["output"], "wb") as f:
            f.write(image_bytes)
        print(f"✓ Saved: {fig['output'].name}")
    except Exception as e:
        print(f"✗ Failed {fig['name']}: {e}")


if __name__ == "__main__":
    print("Generating landscape figures in parallel...\n")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = {
            executor.submit(generate, fig): fig["name"]
            for fig in FIGURES
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"✗ Exception in {name}: {e}")

    print("\nDone. Expected files:")
    for fig in FIGURES:
        status = "✓" if fig["output"].exists() else "✗ MISSING"
        print(f"  {status} {fig['output'].name}")
