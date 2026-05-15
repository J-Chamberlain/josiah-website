import base64
import concurrent.futures
import io
import os
import threading
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
ENV_PATH = REPO_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH)

API_KEY = os.environ.get("OPENAI_API_KEY")
MODEL = "gpt-image-2"
TIMEOUT_SECONDS = 360.0
MAX_ATTEMPTS = 3

GRAYS_DIR = REPO_ROOT / "public/images/geometry-of-mind/grays-anatomy"
OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

_thread_local = threading.local()


def log(message: str) -> None:
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}", flush=True)


def get_client() -> OpenAI:
    if not API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set.")
    client = getattr(_thread_local, "client", None)
    if client is None:
        client = OpenAI(api_key=API_KEY, timeout=TIMEOUT_SECONDS)
        _thread_local.client = client
    return client


def save_b64_image(b64_data: str, filepath: Path) -> Path:
    image_bytes = base64.b64decode(b64_data)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image.save(filepath, format="JPEG", quality=92, optimize=True)
    log(f"Saved: {filepath.name}")
    return filepath


def generate_with_reference(name: str, source_path: Path, prompt: str, output_path: Path, size: str) -> dict[str, str]:
    result = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            log(f"Starting {name} (attempt {attempt}/{MAX_ATTEMPTS})...")
            with open(source_path, "rb") as img_file:
                result = get_client().images.edit(
                    model=MODEL,
                    image=[img_file],
                    prompt=prompt.strip(),
                    size=size,
                    quality="high",
                    n=1,
                    output_format="png",
                )
            break
        except Exception as exc:
            if attempt == MAX_ATTEMPTS or "rate limit" not in str(exc).lower():
                raise
            wait_seconds = 20 * attempt
            log(f"{name}: rate limited; retrying in {wait_seconds}s.")
            time.sleep(wait_seconds)

    if result is None:
        raise RuntimeError(f"No image result returned for {name}.")

    save_b64_image(result.data[0].b64_json, output_path)
    return {"name": name, "path": str(output_path)}


RENDERING_01 = {
    "name": "grays-davinci-face-muscles",
    "source": GRAYS_DIR / "grays-source-face-muscles.jpg",
    "output": OUTPUT_DIR / "grays-davinci-face-muscles.jpg",
    "size": "1792x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration in the style of Leonardo da Vinci's anatomical
notebook pages. Sepia ink on aged cream parchment, hand-drawn quality.

Preserve the full composition exactly — the profile view of the face and neck showing
all muscle groups including the epicranius, frontalis, orbicularis, masseter, platysma,
and sternocleidomastoid. Translate the pink muscle tones into warm sepia cross-hatching
and the blue platysma stripe into a slightly cooler sepia tone. No true color remaining.

All annotation labels preserved in da Vinci's characteristic handwritten style with fine
annotation lines. Background should be aged parchment texture rather than white.

Wide landscape format — the figure sits within a generous parchment field. Should be
indistinguishable in style from da Vinci's Windsor Collection anatomical studies.
""",
}

RENDERING_02 = {
    "name": "grays-davinci-throat-cross",
    "source": GRAYS_DIR / "grays-source-throat-cross.jpg",
    "output": OUTPUT_DIR / "grays-davinci-throat-cross.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the pharynx and throat in cross-section profile
in the style of Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged cream
parchment, hand-drawn quality.

Preserve the full composition showing the pharyngeal constrictors, buccinator, mandible,
maxilla, thyroid cartilage, hyoid bone, and associated structures. Translate the pink
muscle tissue into warm sepia cross-hatching with darker tones for deeper layers.

The quality of interiority — we are looking inside something at its components — should
be preserved and slightly amplified. These are parts not yet understood as a whole.

All labels preserved in da Vinci's handwritten style with fine annotation lines.
Background should be aged parchment. No true color remaining.
""",
}

RENDERING_03 = {
    "name": "grays-davinci-neck-clavicle",
    "source": GRAYS_DIR / "grays-source-neck-clavicle.jpg",
    "output": OUTPUT_DIR / "grays-davinci-neck-clavicle.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the neck muscles and clavicle region in the
style of Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged cream parchment.

Preserve the full three-quarter view showing the sternocleidomastoid, trapezius, scalenes,
digastric, hyoideus muscles, and the clavicle and sternal origin at the base. Translate
the pink muscle tones into warm sepia cross-hatching. The layered quality of the muscles
converging toward the clavicle is the visual centerpiece and should be rendered precisely.

All labels in da Vinci's handwritten style. Background aged parchment. No true color.
""",
}

RENDERING_04 = {
    "name": "grays-davinci-carotid-neck",
    "source": GRAYS_DIR / "grays-source-carotid-neck.jpg",
    "output": OUTPUT_DIR / "grays-davinci-carotid-neck.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the carotid arteries and neck vessels in the
style of Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged cream parchment.

Preserve the full composition showing the internal and external carotid arteries, jugular
vein, and branching vessels of the neck and face including the posterior auricular, occipital,
and facial arteries. The red arterial vessels should be rendered in slightly darker warmer
sepia ink, the blue jugular vein in slightly cooler sepia, the yellow nerves as fine sepia
lines — all distinct in tone but within the warm sepia palette.

The complexity and density of this plate is its strength — preserve all branching detail
with precision. All labels in da Vinci's handwritten style. Background aged parchment.
""",
}

RENDERING_05 = {
    "name": "grays-davinci-arterial-face",
    "source": GRAYS_DIR / "grays-source-arterial-face.jpg",
    "output": OUTPUT_DIR / "grays-davinci-arterial-face.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the arteries of the face in the style of
Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged cream parchment.

Preserve the full profile composition showing the arterial system mapped across the face
and scalp — the superficial temporal, occipital, facial, angular, lateral nasal, labial,
and orbital arteries branching across the head. The red arterial vessels should be rendered
in slightly darker warmer sepia ink that reads as distinct from the grey underlying
structures in lighter sepia cross-hatching.

The branching pattern of vessels across the face is the visual centerpiece — render with
great precision. The quality of luminosity in the pathways should be preserved.

All labels in da Vinci's handwritten style with fine annotation lines. Background aged
parchment. No true color remaining.
""",
}

RENDERING_06 = {
    "name": "grays-davinci-internal-carotid",
    "source": GRAYS_DIR / "grays-source-internal-carotid.jpg",
    "output": OUTPUT_DIR / "grays-davinci-internal-carotid.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the internal carotid and common carotid arterial
system in the style of Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged
cream parchment.

Preserve the full composition showing the common carotid rising from the subclavian,
bifurcating into internal and external carotid, with all major branches including the
basilar, posterior, pharyngeal, stylo-glossus region, and the structures of the deep neck.
The red arterial vessels should be rendered in darker warmer sepia ink against the lighter
grey cross-hatched musculature.

This plate has extraordinary depth and complexity — the vessels seem to emerge from deep
within the neck structure. That quality of depth should be preserved and amplified.

All labels in da Vinci's handwritten style. Background aged parchment. No true color.
""",
}

RENDERING_07 = {
    "name": "grays-davinci-brain-below",
    "source": GRAYS_DIR / "grays-source-brain-below.jpg",
    "output": OUTPUT_DIR / "grays-davinci-brain-below.jpg",
    "size": "1024x1024",
    "prompt": """
Redraw this Gray's Anatomy illustration of the brain viewed from below showing the arterial
system in the style of Leonardo da Vinci's anatomical notebook pages. Sepia ink on aged
cream parchment, hand-drawn quality.

Preserve the full composition — the underside of the brain with its complex folded surface,
the arterial circle of Willis at the center, the basilar artery running up the midline,
the internal carotid arteries entering from the sides, and the fine red arterial branches
spreading across the cerebral hemispheres. The olfactory tract and hypophysis should be
clearly visible.

The brain tissue should be rendered in rich dark sepia cross-hatching — the folds and
sulci of the cerebral cortex rendered with great precision and depth. The arterial system
in slightly warmer, slightly brighter sepia ink running across and between the folds.

This is the most directly relevant of all the plates to the subject of this essay — a mind
viewed from the outside, its pathways mapped, its structure partially understood. That
quality of intimate scientific encounter should be the emotional register of the rendering.

All labels in da Vinci's handwritten style with fine annotation lines pointing to key
structures. Background aged parchment. No true color — rich sepia tones only.
""",
}

RENDERINGS = [
    RENDERING_01,
    RENDERING_02,
    RENDERING_03,
    RENDERING_04,
    RENDERING_05,
    RENDERING_06,
    RENDERING_07,
]


def main() -> None:
    if not API_KEY:
        raise SystemExit("ERROR: OPENAI_API_KEY is not set in the environment or app/.env.")

    missing = [rendering for rendering in RENDERINGS if not rendering["source"].exists()]
    if missing:
        for rendering in missing:
            print(f"ERROR: Source file not found: {rendering['source']}", flush=True)
        raise SystemExit("\nPlease complete Step 0 (rename source files) before running.")

    log(f"Generating {len(RENDERINGS)} Gray's Anatomy renderings in parallel...")
    log(f"Source directory: {GRAYS_DIR}")
    log(f"Output directory: {OUTPUT_DIR}")

    failures: list[tuple[str, Exception]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
        futures = {
            executor.submit(
                generate_with_reference,
                rendering["name"],
                rendering["source"],
                rendering["prompt"],
                rendering["output"],
                rendering["size"],
            ): rendering["name"]
            for rendering in RENDERINGS
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as exc:
                log(f"Failed {name}: {exc}")
                failures.append((name, exc))

    print("\nExpected output files:", flush=True)
    for rendering in RENDERINGS:
        status = "✓" if rendering["output"].exists() else "✗ MISSING"
        print(f"  {status} {rendering['output'].name}", flush=True)

    if failures:
        raise SystemExit(f"\n{len(failures)} generation(s) failed.")

    print(f"\nAll done. Review outputs in: {OUTPUT_DIR}", flush=True)


if __name__ == "__main__":
    main()
