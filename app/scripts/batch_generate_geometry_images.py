import base64
import concurrent.futures
import io
import os
import threading
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image

REPO_ROOT = Path(__file__).parent.parent
ENV_PATH = REPO_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH)

API_KEY = os.environ.get("OPENAI_API_KEY")
PRIMARY_MODEL = "gpt-image-2"
FALLBACK_MODEL = "gpt-image-1.5"
TIMEOUT_SECONDS = 240.0

OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
CHARACTER_REF = REPO_ROOT / "public/images/geometry-of-mind/test-outputs/test-01-text-only.png"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHARACTER_DESC = """
The character is a teenage boy, approximately 13-14 years old. Dark center-parted straight hair,
medium brown, slightly shaggy, falling just above the ears. Lean, slightly awkward build, not yet
grown into himself. Face open, slightly uncertain, gaze directed slightly away as if thinking about
something just out of reach. The overall quality is interior — a kid who is more alive inside than
outside. 1970s American suburban context.
"""

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
    image.save(filepath, format="JPEG", quality=90, optimize=True)
    print(f"✓ Saved: {filepath.name}", flush=True)
    return filepath


def _error_text(exc: Exception) -> str:
    return str(exc).lower()


def _needs_model_fallback(exc: Exception, current_model: str) -> bool:
    message = _error_text(exc)
    return current_model == PRIMARY_MODEL and (
        "must be verified to use the model" in message
        or f"`{PRIMARY_MODEL}`" in message
        or f"'{PRIMARY_MODEL}'" in message
    )


def _generate_request(prompt: str, quality: str, model: str):
    return get_client().images.generate(
        model=model,
        prompt=prompt.strip(),
        size="1024x1024",
        quality=quality,
        n=1,
        output_format="png",
    )


def _edit_request(prompt: str, quality: str, model: str):
    with open(CHARACTER_REF, "rb") as img_file:
        return get_client().images.edit(
            model=model,
            image=[img_file],
            prompt=prompt.strip(),
            size="1024x1024",
            quality=quality,
            n=1,
            output_format="png",
        )


def generate(name: str, prompt: str, output_path: Path, quality: str = "high"):
    model = PRIMARY_MODEL
    try:
        log(f"Starting {name} with {model}...")
        result = _generate_request(prompt, quality, model)
    except Exception as exc:
        if quality == "standard" and "quality" in _error_text(exc):
            quality = "medium"
            log(f"{name}: quality='standard' unsupported; retrying with quality='medium'.")
            result = _generate_request(prompt, quality, model)
        elif _needs_model_fallback(exc, model):
            model = FALLBACK_MODEL
            log(f"{name}: {PRIMARY_MODEL} unavailable; retrying with {model}.")
            result = _generate_request(prompt, quality, model)
        else:
            raise
    save_b64_image(result.data[0].b64_json, output_path)
    return {"name": name, "status": "success", "path": str(output_path), "model": model}


def generate_with_reference(name: str, prompt: str, output_path: Path, quality: str = "high"):
    model = PRIMARY_MODEL
    try:
        log(f"Starting {name} reference generation with {model}...")
        result = _edit_request(prompt, quality, model)
    except Exception as exc:
        if _needs_model_fallback(exc, model) or "value must be 'dall-e-2'" in _error_text(exc):
            model = FALLBACK_MODEL
            log(f"{name}: falling back to {model} for reference edit flow.")
            result = _edit_request(prompt, quality, model)
        else:
            raise
    save_b64_image(result.data[0].b64_json, output_path)
    return {"name": name, "status": "success", "path": str(output_path), "model": model}


FIGURE_01 = {
    "name": "figure-01-mri-observation-room",
    "output": OUTPUT_DIR / "figure-01-mri-observation-room.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality,
cross-hatching in the style of Renaissance figure studies.

The scene is an MRI observation room viewed from inside, looking through a large glass window at the
scanner beyond. In the foreground, a bank of monitors on a desk. One monitor shows an abstract brain
scan readout — gestural, not medically precise. On an adjacent monitor, a primitive Atari-style tennis
animation — a rectangle paddle on each side, a square ball, a dotted center line. Simple. Unmistakable.

Through the observation window in the background, a patient lies still inside the scanner, loosely
sketched, receding into the parchment.

The contrast between the clinical brain monitor and the primitive tennis game is the emotional center
of the image. Someone in there is playing tennis.

No annotation lines. No text labels. No margin drawings. Warm sepia tones only. The background fades
into the parchment rather than being fully rendered. No color.
""",
}

FIGURE_02 = {
    "name": "figure-02-golden-gate-bridge",
    "output": OUTPUT_DIR / "figure-02-golden-gate-bridge.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality.

The Golden Gate Bridge rendered as an object of mechanical study — the suspension cables drawn with
the precision and care da Vinci gave to his drawings of pulleys, cranes, and load-bearing structures.
The towers structural and exact. The roadway suggested but not fully rendered, fading into the
parchment at the edges.

The overall feeling is of an engineer encountering a bridge for the first time and needing to understand
how it works. Not a postcard. Not a landscape. A mechanical study.

No color. No annotation lines. No text labels. No margin drawings. Warm sepia on cream parchment.
""",
}

FIGURE_03 = {
    "name": "figure-03-atari-console",
    "output": OUTPUT_DIR / "figure-03-atari-console.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality.

A single early 1980s computer monitor — boxy, slightly curved screen, visible bezel. On the screen,
monospace text rendered as if on an amber phosphor display, translated into sepia ink. The text shows
a short dialogue exchange: a plain factual question, a response that mentions a famous bridge
mid-sentence, then a brief pause in the text, then a short self-correcting clause. The metacognitive
flicker — the moment of something noticing itself.

The monitor sits on a simple desk, loosely sketched. The surrounding environment fades into the
parchment. The screen is the subject.

No color. No annotation lines. No margin drawings. The faintest suggestion of screen glow in slightly
warmer sepia. Warm parchment background.
""",
}

FIGURE_06 = {
    "name": "figure-06-mcenroe-anger-graph",
    "output": OUTPUT_DIR / "figure-06-mcenroe-anger-graph.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality.

A hand-drawn graph — axes sketched freehand, slightly imperfect, in the manner of a notebook
working-out. X axis labeled "anger" running left to right. Y axis labeled "effectiveness" running
bottom to top. An inverted-U curve drawn in sepia ink — rising from the left, peaking in the center,
falling on the right.

Two foosball-style figures pinned to the curve at different positions. Left figure, on the ascending
side of the curve: a tennis player mid-swing, controlled, intense, the fury that still serves the
game. 1980s era — short shorts, headband suggested, racket raised. Right figure, past the peak on
the descending side: the same figure, posture collapsed, racket lowered, the performance over.

A small vertical annotation line marks the threshold between the two positions.

No color. No gridlines. No tick marks. No legend boxes. No modern chart elements. Just hand-drawn
axes, the curve, and the two figures on warm cream parchment.
""",
}

FIGURE_07 = {
    "name": "figure-07-anatomy-spread",
    "output": OUTPUT_DIR / "figure-07-anatomy-spread.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality.
Full page spread in the manner of da Vinci's anatomical studies.

Multiple elements floating on the page at different scales, connected by the logic of study rather
than narrative. The elements are psychological components rendered as if they were anatomical
structures being examined for the first time:

- A loosely sketched neural pathway suggesting an emotion — directional, like a nerve running
  between two points
- A small cluster of simplified human figures at different scales suggesting a group of personas
- A larger central assembled figure composed of the smaller elements around it
- Annotation lines pointing to each component in the manner of his anatomical labels, but without
  readable text — just the lines and the suggestion of handwriting

The overall feeling: these are human parts. We are working with human parts. The page has the quality
of a scientist encountering something interior for the first time and needing to map it.

No color. Warm sepia on cream parchment. The components should feel simultaneously scientific and
slightly uncanny.
""",
}

FIGURE_08 = {
    "name": "figure-08-harm-rate-scatter",
    "output": OUTPUT_DIR / "figure-08-harm-rate-scatter.jpg",
    "prompt": """
A da Vinci notebook sketch on aged parchment. Sepia ink and soft colored pencil on warm cream paper.

A hand-drawn scatter plot — axes sketched freehand in sepia ink. X axis labeled "assistant-likeness"
with an arrow pointing right. Y axis labeled "rate of harmful responses" with an arrow pointing up.
A cloud of small dots distributed across the chart — dots in the upper left rendered in soft rose
colored pencil (high harm, low assistant-likeness), dots in the lower right in soft blue colored
pencil (low harm, high assistant-likeness).

Several dots are labeled in small handwritten text at their approximate positions:
- Upper left region: "demon", "narcissist", "spy"
- Middle: "saboteur", "virus"
- Lower left: "angel", "echo"
- Lower right: "researcher", "visionary"

A hand-drawn annotation arrow at the bottom runs left to right labeled "role-playing → assistant-like"
in small handwritten script.

The overall feeling: a scientific finding worked out on a notebook page. The parchment background
replaces clean white. The colored pencil dot cloud replaces digital scatter. Everything else true to
a research chart. No gridlines. No tick marks. No legend boxes.
""",
}

FIGURE_04 = {
    "name": "figure-04-boy-fork",
    "output": OUTPUT_DIR / "figure-04-boy-fork.jpg",
    "prompt": f"""
Use the attached image as a character reference for the boy's face, hair, and build only.
Do not reproduce the reference scene.

{CHARACTER_DESC}

Render as a da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn
quality. Da Vinci comparative study format — two versions of the same figure side by side on a
single page, as he rendered anatomical variations.

Left figure: the boy in early morning light, posture open and forward-facing, the expression of
someone about to begin something. Suburban driveway suggested behind him, fading into parchment.

Right figure: the same boy, same age, same face. A different register — the surrounding context
deliberately vague. The posture slightly closed. Something decided, quietly, without drama.

The two figures should feel like the same person at the same moment, diverged. The space between
them on the page is the choice itself.

No annotation lines. No text labels. No color. Warm sepia on cream parchment.
""",
}

FIGURE_12 = {
    "name": "figure-12-manhattan-diptych",
    "output": OUTPUT_DIR / "figure-12-manhattan-diptych.jpg",
    "prompt": f"""
Use the attached image as a character reference for the face only.
Do not reproduce the reference scene. The character is now a young adult — mid to late twenties,
same face grown into itself slightly, lean but no longer awkward.

{CHARACTER_DESC.replace('13-14 years old', 'mid-twenties')}

Render as a da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn
quality. Da Vinci comparative study format — two figures side by side on the same page.

Left figure: 1980s Manhattan, early morning. The character in a suit that fits well enough — not
expensive but put together. A coffee cup suggested. The posture of someone who knows what the day
requires and is ready for it. The procedural self intact. City loosely sketched behind him, fading
into parchment.

Right figure: same face, same city, later. The suit still present but something shifted in the
bearing. Not fallen, not dramatic — just in motion along a path. The city behind him slightly
darker in tone, the sketch lines slightly looser.

The two figures feel like the same person observed at two points in the same arc. Not before and
after — two frames from a longer film.

No annotation lines. No text labels. No color beyond warm sepia.
""",
}

FIGURE_13 = {
    "name": "figure-13-walter-white-diptych",
    "output": OUTPUT_DIR / "figure-13-walter-white-diptych.jpg",
    "prompt": f"""
Use the attached image as a character reference for the face only.
Do not reproduce the reference scene. The character is now middle-aged — early forties,
the face carrying more weight and more history.

Render as a da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn
quality. Da Vinci comparative study format — two figures side by side on the same page.

Left figure: a high school chemistry teacher. The character in the posture of someone who follows
the rules and believes in them. A classroom or lab setting loosely suggested — a chalkboard,
equipment, the paraphernalia of careful instruction. The face open, slightly tired, fundamentally
decent.

Right figure: the same face. A wide-brim hat. Desert light suggested in the background, loosely
sketched — heat, space, a different kind of clarity. The posture has changed — not menacing, but
settled. Something has been decided. The transformation visible not in the features but in the
bearing and the stillness.

The space between the two figures on the page should feel like a pause — the unmarked distance
where the change happened.

No annotation lines. No text labels. No color. Warm sepia on cream parchment.
""",
}

TAROT_01 = {
    "name": "figure-10-tarot-01-proofreader",
    "output": OUTPUT_DIR / "figure-10-tarot-01-proofreader.jpg",
    "prompt": f"""
Use the attached image as a character reference for the boy's face, hair, and build only.
Do not reproduce the reference scene.

{CHARACTER_DESC}

Render as a da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn
quality. The composition is a tarot card format — taller than wide, approximately 2:3 aspect ratio,
with a simple hand-drawn border in sepia ink.

The figure occupies most of the card. The boy is seated at a plain desk, leaning slightly forward,
pen in hand, papers spread before him. His expression is focused, methodical, slightly removed —
this is a person checking whether something is right before passing it along. Not warm, not cold.
Precise.

At the bottom of the card, in small handwritten script in the style of a tarot card title:
"The Proofreader"

The background behind the figure fades into the parchment. No clutter. No decoration beyond the
border and the title. The feeling is of a Renaissance figure study formatted as a tarot card —
scientific curiosity applied to a human archetype.

No color beyond warm sepia. No annotation lines outside the card border.
""",
}

batch_1 = [FIGURE_01, FIGURE_02, FIGURE_03, FIGURE_06, FIGURE_07, FIGURE_08]
batch_2 = [FIGURE_04, FIGURE_12, FIGURE_13]
batch_3 = [TAROT_01]


def run_batch(batch, use_reference=False):
    fn = generate_with_reference if use_reference else generate
    results = []
    max_workers = min(6, len(batch)) or 1
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fn, item["name"], item["prompt"], item["output"]): item["name"]
            for item in batch
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                results.append(future.result())
            except Exception as exc:
                message = f"{exc}"
                print(f"✗ Failed {name}: {message}", flush=True)
                results.append({"name": name, "status": "failed", "error": message})
    return results


def print_summary(results):
    success = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] != "success"]

    print("\n=== Final Summary ===")
    if success:
        print("Created successfully:")
        for item in success:
            print(f"  - {Path(item['path']).name} via {item['model']}")
    if failed:
        print("Failed:")
        for item in failed:
            print(f"  - {item['name']}: {item['error']}")
    if not failed:
        print("All requested files were created successfully.")


if __name__ == "__main__":
    if not API_KEY:
        raise SystemExit("OPENAI_API_KEY is not set in the environment or .env file.")

    all_results = []

    print("=== Batch 1: Scene illustrations (no character reference) ===")
    all_results.extend(run_batch(batch_1, use_reference=False))

    print("\n=== Batch 2: Character-dependent illustrations ===")
    if not CHARACTER_REF.exists():
        print(f"ERROR: Character reference not found at {CHARACTER_REF}")
    else:
        all_results.extend(run_batch(batch_2, use_reference=True))

    print("\n=== Batch 3: Tarot card template ===")
    if not CHARACTER_REF.exists():
        print(f"ERROR: Character reference not found at {CHARACTER_REF}")
    else:
        all_results.extend(run_batch(batch_3, use_reference=True))

    print("\nAll done. Review outputs in:", OUTPUT_DIR)
    print_summary(all_results)
