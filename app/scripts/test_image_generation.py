import base64
import os
from datetime import datetime
from pathlib import Path

from openai import OpenAI

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv() -> None:
        print("Warning: python-dotenv is not installed; skipping .env loading.")


load_dotenv()

API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY, timeout=180.0) if API_KEY else None

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind/test-outputs"
REFERENCE_IMAGE = REPO_ROOT / "public/images/geometry-of-mind/character-reference.jpg"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PRIMARY_MODEL = "gpt-image-2"
FALLBACK_MODEL = "gpt-image-1.5"

PROMPT = """
A da Vinci notebook sketch on aged parchment. Sepia ink on warm cream paper, hand-drawn quality.
A teenage boy, approximately 14-15 years old, crouching down on one knee tying his running shoe.
One knee on the ground, the other raised. The camera angle is low, close to the ground, looking
slightly up at him. His hands are at his shoe, focused on the lace. Early Nike running shoe circa
1978 — canvas Waffle Trainer style with the swoosh visible. The boy has dark center-parted straight
hair, medium brown, slightly shaggy, falling just above the ears. Lean, slightly awkward build.
Face open, slightly uncertain, gaze directed slightly away as if thinking about something just out
of reach. The background is a loosely sketched suburban American driveway, early morning, a
basketball hoop mounted above a garage door visible in the distance. The background fades into the
parchment rather than being fully rendered. No annotation lines. No text labels. No margin drawings.
No Vitruvian Man. No shoe diagrams. Just the single figure against the loosely sketched background.
Warm sepia tones only, no color. The feeling is of a Renaissance figure study applied to a quiet
American moment of becoming.
"""


def save_b64_image(b64_data: str, filename: str) -> Path:
    image_bytes = base64.b64decode(b64_data)
    output_path = OUTPUT_DIR / filename
    with open(output_path, "wb") as f:
        f.write(image_bytes)
    print(f"Saved: {output_path}")
    return output_path


def log(message: str) -> None:
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}", flush=True)


def _error_text(exc: Exception) -> str:
    return str(exc).lower()


def _model_with_fallback(exc: Exception, current_model: str) -> str | None:
    message = _error_text(exc)
    if current_model == PRIMARY_MODEL and (
        "must be verified to use the model" in message
        or f"`{PRIMARY_MODEL}`" in message
        or f"'{PRIMARY_MODEL}'" in message
    ):
        return FALLBACK_MODEL
    return None


def _retry_generate(params: dict) -> object:
    assert client is not None
    model = params.get("model", PRIMARY_MODEL)
    try:
        return client.images.generate(**params)
    except Exception as exc:
        fallback_model = _model_with_fallback(exc, model)
        if fallback_model:
            retry_params = dict(params)
            retry_params["model"] = fallback_model
            log(
                f"Model {model} is unavailable for this org; retrying generation with {fallback_model}."
            )
            return client.images.generate(**retry_params)
        raise


def _retry_edit(params: dict) -> object:
    assert client is not None
    model = params.get("model", FALLBACK_MODEL)
    try:
        return client.images.edit(**params)
    except Exception as exc:
        fallback_model = _model_with_fallback(exc, model)
        if fallback_model:
            retry_params = dict(params)
            retry_params["model"] = fallback_model
            log(
                f"Model {model} is unavailable for this org; retrying edit with {fallback_model}."
            )
            return client.images.edit(**retry_params)
        raise


def _generate_with_quality_fallback(
    *, filename: str, params: dict, fallback_quality: str | None = None
) -> None:
    try:
        result = _retry_generate(params)
    except Exception as exc:
        message = _error_text(exc)
        if (
            fallback_quality
            and params.get("quality") != fallback_quality
            and "quality" in message
        ):
            retry_params = dict(params)
            retry_params["quality"] = fallback_quality
            print(
                f"Warning: quality={params.get('quality')!r} unsupported; "
                f"retrying with quality={fallback_quality!r}."
            )
            result = _retry_generate(retry_params)
        else:
            raise
    save_b64_image(result.data[0].b64_json, filename)


def run_test_1() -> None:
    print("\n--- Test 1: Text only ---")
    try:
        log(f"Starting Test 1 with {PRIMARY_MODEL}...")
        _generate_with_quality_fallback(
            filename="test-01-text-only.png",
            params={
                "model": PRIMARY_MODEL,
                "prompt": PROMPT.strip(),
                "size": "1024x1024",
                "quality": "high",
                "n": 1,
                "output_format": "png",
            },
        )
    except Exception as exc:
        print(f"Test 1 failed: {exc}")


def run_test_2() -> None:
    print("\n--- Test 2: With reference image ---")
    if not REFERENCE_IMAGE.exists():
        print(f"Skipping Test 2 — reference image not found at {REFERENCE_IMAGE}")
        return

    try:
        log(f"Starting Test 2 with {FALLBACK_MODEL} edit flow...")
        with open(REFERENCE_IMAGE, "rb") as img_file:
            params = {
                "model": FALLBACK_MODEL,
                "image": [img_file],
                "prompt": (
                    "Use this image as a character reference for the boy's face and hair only. "
                    "Do not reproduce the scene from the reference image. "
                    "Render the character in a new scene: crouching on one knee tying a Nike "
                    "running shoe on a suburban driveway, early morning, a basketball hoop visible "
                    "in the background. Da Vinci notebook sketch style on aged parchment. Sepia ink "
                    "on warm cream paper. No annotation lines, no text labels, no margin drawings, "
                    "no Vitruvian Man, no shoe diagrams. Warm sepia tones only. The background "
                    "fades into the parchment."
                ),
                "size": "1024x1024",
                "quality": "high",
                "n": 1,
                "output_format": "png",
            }
            result = _retry_edit(params)
        save_b64_image(result.data[0].b64_json, "test-02-with-reference.png")
    except Exception as exc:
        print(f"Test 2 failed: {exc}")


def run_test_3() -> None:
    print("\n--- Test 3: Standard quality ---")
    try:
        log(f"Starting Test 3 with {PRIMARY_MODEL}...")
        _generate_with_quality_fallback(
            filename="test-03-standard-quality.png",
            params={
                "model": PRIMARY_MODEL,
                "prompt": PROMPT.strip(),
                "size": "1024x1024",
                "quality": "standard",
                "n": 1,
                "output_format": "png",
            },
            fallback_quality="medium",
        )
    except Exception as exc:
        print(f"Test 3 failed: {exc}")


if __name__ == "__main__":
    print("OpenAI Image Generation Test")
    print(f"Primary model: {PRIMARY_MODEL}")
    print(f"Fallback model: {FALLBACK_MODEL}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Reference image present: {REFERENCE_IMAGE.exists()}")

    if not API_KEY:
        print("Warning: OPENAI_API_KEY is not set. Add it to .env or your shell environment before running tests.")
    else:
        run_test_1()
        run_test_2()
        run_test_3()

    print(f"\nDone. Review outputs in: {OUTPUT_DIR}")
