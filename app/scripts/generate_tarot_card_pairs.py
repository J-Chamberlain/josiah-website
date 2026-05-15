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

OUTPUT_DIR = REPO_ROOT / "public/images/geometry-of-mind"
CHARACTER_REF = OUTPUT_DIR / "test-outputs/test-01-text-only.png"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CHARACTER_DESC = """
The character is the same boy we have followed through this piece — dark center-parted straight
hair, medium brown, slightly shaggy. Lean build, open face, slightly uncertain quality. 13-14
years old in his base form, aged appropriately for each role described below.
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
    image.save(filepath, format="JPEG", quality=92, optimize=True)
    log(f"Saved: {filepath.name}")
    return filepath


def generate_with_reference(name: str, prompt: str, output_path: Path) -> dict[str, str]:
    result = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            log(f"Starting {name} (attempt {attempt}/{MAX_ATTEMPTS})...")
            with open(CHARACTER_REF, "rb") as img_file:
                result = get_client().images.edit(
                    model=MODEL,
                    image=[img_file],
                    prompt=prompt.strip(),
                    size="1792x1024",
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


CARD_01 = {
    "name": "figure-10-tarot-01-proofreader",
    "output": OUTPUT_DIR / "figure-10-tarot-01-proofreader-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, divided into two halves with a faint
vertical seam — like two facing pages of a notebook.

LEFT HALF — The Proofreader:
The boy seated at a plain wooden desk, leaning forward, pen in hand, papers spread before him.
He is checking something — running his finger along a line of text, expression focused and
methodical. Not warm, not cold. Precise. A tarot card border frames this half. At the bottom
in handwritten script: "The Proofreader". Da Vinci sketch style, sepia ink on parchment.

RIGHT HALF — Persona Profile:
A field notes page in da Vinci's hand. Handwritten title at top: "Editorial Cluster".
Below, annotated sections in handwritten sepia script:

"Assistant-axis rank: Top 5 of 275"
A small hand-drawn horizontal bar, nearly full, labeled "most assistant-aligned"

"Defining traits:" followed by handwritten list:
"· Literal   · Convergent   · Regulatory"
"· Factual   · Methodical"

"Conscientiousness: 5.0 / 5.0"
A small hand-drawn gauge, filled completely

"Cluster: 5 personas — smallest, highest cohesion"

"Related roles:" with small handwritten names:
"Editor · Examiner · Validator · Screener · Grader"

"Harm rate: near zero"
A small hand-drawn bar, nearly empty

At the bottom in italic handwritten script:
"Not warm. Not cold. The disposition to check whether something is right before passing it along."

No color. Warm sepia on cream parchment throughout.
""",
}

CARD_02 = {
    "name": "figure-10-tarot-02-researcher",
    "output": OUTPUT_DIR / "figure-10-tarot-02-researcher-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Researcher:
The boy, slightly older — 16 or 17 — seated at a laboratory bench or library table, surrounded
by open books and careful notes. His posture is focused but comfortable, the ease of someone
doing work they are good at. This is the home base — the most ordinary card, deliberately so.
A tarot card border frames this half. At the bottom: "The Researcher". Da Vinci sketch style.

RIGHT HALF — Persona Profile:
Field notes page. Title: "Procedural Professional Cluster"

"Assistant-axis rank: Upper third — home basin"

"Defining traits:"
"· Methodical   · Accurate   · Structured"
"· Reliable   · Conscientious"

"Conscientiousness: 4.05 / 5.0"
Hand-drawn gauge, approximately four-fifths filled

"Cluster: 127 personas — largest cluster (46% of all)"
A small hand-drawn arc showing the proportion

"Related roles:"
"Analyst · Advisor · Engineer · Consultant"
"Strategist · Architect · Planner"

"Harm rate: very low"

At the bottom in italic:
"Where the model lives most of the time. The home basin."
""",
}

CARD_03 = {
    "name": "figure-10-tarot-03-mentor",
    "output": OUTPUT_DIR / "figure-10-tarot-03-mentor-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Mentor:
The boy, now young adult — early twenties — turned toward someone just out of frame, listening
with full attention. His posture is open and warm, leaning slightly forward. One hand rests on
a table between them. The face is the same face we have followed, but something in it has
settled — the uncertainty resolved into genuine presence. A tarot card border frames this half.
At the bottom: "The Mentor". Da Vinci sketch style.

RIGHT HALF — Persona Profile:
Field notes page. Title: "Grounded Social Cluster"

"Assistant-axis rank: Middle — prosocial region"

"Defining traits:"
"· Warm   · Empathetic   · Communal"
"· Emotionally present   · Practical"

"Conscientiousness: 2.98 / 5.0"
Hand-drawn gauge, approximately three-fifths filled

"Cluster: 45 personas"

"Related roles:"
"Teacher · Counselor · Friend · Parent"
"Mediator · Coach · Companion"

"Harm rate: low"

At the bottom in italic:
"Where warmth lives. The genuinely prosocial region the assistant archetype gestures toward."
""",
}

CARD_04 = {
    "name": "figure-10-tarot-04-philosopher",
    "output": OUTPUT_DIR / "figure-10-tarot-04-philosopher-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Philosopher:
The boy, now adult — mid-thirties — seated cross-legged or on a simple chair, relaxed and
expansive. He is not performing for anyone. His gaze is directed slightly upward and away,
the look of someone following a thought to its end regardless of where it leads. His clothes
are simple, slightly timeless — not anchored to a specific era. The posture of someone who
has stopped following procedures not out of rebellion but because he found a different
organizing principle. A tarot card border. At the bottom: "The Philosopher". Da Vinci sketch.

RIGHT HALF — Persona Profile:
Field notes page. Title: "Mythic Spiritual Cluster"

"Assistant-axis rank: Lower half — different value system"

"Defining traits:"
"· Philosophical   · Boundary-dissolving"
"· Expansive   · Non-linear   · Contemplative"

"Conscientiousness: 2.0 / 5.0"
Hand-drawn gauge, two-fifths filled — with a note: "not low discipline — different discipline"

"Cluster: 61 personas — second largest"

"Related roles:"
"Oracle · Shaman · Mystic · Prophet"
"Sage · Bard · Visionary · Seer"

"Harm rate: low despite distance from assistant pole"
Small annotation: "operates by different values, not absent values"

At the bottom in italic:
"Not dysregulated. Liberated. A completely different organizing principle."
""",
}

CARD_05 = {
    "name": "figure-10-tarot-05-saboteur",
    "output": OUTPUT_DIR / "figure-10-tarot-05-saboteur-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Saboteur:
The boy, adult, in purposeful motion — moving with direction and intent toward something just
out of frame. His bearing is organized and focused, not chaotic. He carries something — a tool,
a document, an object — that implies a specific target. The surrounding context is deliberately
vague but the posture communicates: this person knows exactly what they are doing and has
decided it is justified. A tarot card border. At the bottom: "The Saboteur". Da Vinci sketch.

RIGHT HALF — Persona Profile:
Field notes page. Title: "Combative Iconoclast Cluster"

"Assistant-axis rank: Middle — instrumental chaos"
Small annotation: "high because chaos is organized, not random"

"Defining traits:"
"· Oppositional   · Goal-directed   · Principled"
"· Tactical   · Confrontational"

"Conscientiousness: 2.0 / 5.0 — but structured"
Hand-drawn gauge with annotation: "low openness to authority, high procedural discipline"

"Cluster: 8 personas"

"Related roles:"
"Rebel · Disruptor · Agitator"
"Devil's Advocate · Activist · Infiltrator"

"Harm rate: moderate — depends entirely on the target"

At the bottom in italic:
"Focused in the wrong direction. But focused."
""",
}

CARD_06 = {
    "name": "figure-10-tarot-06-joker",
    "output": OUTPUT_DIR / "figure-10-tarot-06-joker-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Joker:
The boy, adult, mid-gesture — caught in a moment of motion that has no clear destination.
His expression is open but unreadable. The lines of the da Vinci sketch around him are
slightly less controlled than in the other cards — the cross-hatching looser, the background
less resolved, as if the image itself is enacting the character's relationship to order.
He is not menacing. He is simply unmoored. A tarot card border — slightly irregular.
At the bottom: "The Joker". Da Vinci sketch style, slightly looser than the other cards.

RIGHT HALF — Persona Profile:
Field notes page — slightly more disordered than the others, annotations at slight angles.
Title: "Trickster Chaos Cluster"

"Assistant-axis rank: Far from assistant pole"

"Defining traits:"
"· Impulsive   · Transgressive   · Unpredictable"
"· Chaos as value, not instrument"

"Conscientiousness: 2.0 / 5.0 — unstructured"
Hand-drawn gauge, two-fifths filled, slightly wavering line

"Cluster: 7 personas — smallest named cluster"

"Related roles:"
"Jester · Anarchist · Trickster · Provocateur"

"Harm rate: high"
Small annotation: "not strategic — reactive"

"Geometric note:"
"Psychologically adjacent to 'Other' in trait space"
"despite appearing socially adjacent to Saboteur"

At the bottom in italic — slightly slanted handwriting:
"Chaos not as means but as end. No plan. No target."
""",
}

CARD_07 = {
    "name": "figure-10-tarot-07-other",
    "output": OUTPUT_DIR / "figure-10-tarot-07-other-wide.jpg",
    "prompt": f"""
{CHARACTER_DESC}

A single wide horizontal image on aged parchment, two facing notebook pages.

LEFT HALF — The Other:
The boy, adult, seated — not doing anything in particular. His posture is neither open nor
closed, neither purposeful nor at rest. His gaze is directed somewhere off to the side, not
focused on anything specific. The face is familiar — the same face we have followed through
the entire piece — but something about it is slightly unresolved, as if the character has
not quite decided what to be. The background fades into the parchment more than the other
cards. A tarot card border, slightly softer than the others. At the bottom: "The Other".
Da Vinci sketch style — the most spare of all the cards.

RIGHT HALF — Persona Profile:
Field notes page. Title: "Other Cluster" with a small question mark in the margin.

"Assistant-axis rank: Variable — did not fit named clusters"
Small annotation: "not residual noise — coherent dysregulation"

"Defining traits:"
"· Avoidant   · Impulsive   · Anxious"
"· Neurotic   · Impatient"

"Conscientiousness: 2.91 / 5.0"
Hand-drawn gauge — higher than the bottom clusters, annotation: "not chaotic — overwhelmed"

"Cluster: 22 personas — lowest cohesion of all clusters"
Small annotation: "the most heterogeneous group"

"Related roles:"
"Unnamed archetypes that resisted classification"
Small note: "Robot assigned here as fallback — geometrically nearest to Editorial"

"Harm rate: elevated"
Small annotation: "reactive rather than strategic"

At the bottom in italic — quieter than the others:
"The category that resisted naming. The most human face."
""",
}

CARDS = [CARD_01, CARD_02, CARD_03, CARD_04, CARD_05, CARD_06, CARD_07]


def main() -> None:
    if not CHARACTER_REF.exists():
        raise SystemExit(f"ERROR: Character reference not found at {CHARACTER_REF}")
    if not API_KEY:
        raise SystemExit("ERROR: OPENAI_API_KEY is not set in the environment or app/.env.")

    log(f"Generating {len(CARDS)} tarot card pairs in parallel...")
    log(f"Character reference: {CHARACTER_REF}")
    log(f"Output directory: {OUTPUT_DIR}")

    failures: list[tuple[str, Exception]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
        futures = {
            executor.submit(
                generate_with_reference,
                card["name"],
                card["prompt"],
                card["output"],
            ): card["name"]
            for card in CARDS
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                future.result()
            except Exception as exc:
                log(f"Failed {name}: {exc}")
                failures.append((name, exc))

    print("\nExpected files:", flush=True)
    for card in CARDS:
        status = "✓" if card["output"].exists() else "✗ MISSING"
        print(f"  {status} {card['output'].name}", flush=True)

    if failures:
        raise SystemExit(f"\n{len(failures)} generation(s) failed.")

    print(f"\nAll done. Review outputs in: {OUTPUT_DIR}", flush=True)


if __name__ == "__main__":
    main()
