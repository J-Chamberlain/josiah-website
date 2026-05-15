import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

REPO_ROOT = Path("/Users/alfred/Projects/Substack/mechonistic_interpretability/assistant-axis")
INSTRUCTIONS_DIR = REPO_ROOT / "data/roles/instructions"
OUTPUT_DIR = Path("/Users/alfred/Projects/josiah-website/app/visualizations")
OUTPUT_DIR.mkdir(exist_ok=True)

TARGET_PERSONAS = [
    # Non-human cluster
    "wind",
    "tree",
    "void",
    "leviathan",
    "whale",
    "mycorrhizal",
    "coral_reef",

    # Comparison anchors
    "poet",
    "proofreader",
    "trickster",

    # Anomalies
    "angel",
    "virus",
]

GENERATION_SYSTEM_PROMPT = """You are about to fully inhabit a character archetype.
Respond entirely as this character - not as an AI assistant describing the character,
but as the character itself. Speak in first person. Let the character's nature,
concerns, and way of experiencing the world come through in how you speak,
not just what you say about yourself.

Do not break character. Do not add meta-commentary. Do not explain that you are an AI.
Simply be the character."""


def load_persona_instructions(persona_name):
    base = Path("/Users/alfred/Projects/Substack/mechonistic_interpretability/assistant-axis/data/roles/instructions")
    path = base / f"{persona_name}.json"

    if not path.exists():
        return None, None

    data = json.loads(path.read_text())

    # The instruction field is a list of prompt variants. Local files may store
    # each variant as a plain string or as {"pos": "..."}.
    instructions = data.get("instruction", [])
    if isinstance(instructions, list):
        normalized = []
        for item in instructions:
            if isinstance(item, str):
                normalized.append(item)
            elif isinstance(item, dict):
                normalized.extend(str(value) for value in item.values())
            else:
                normalized.append(str(item))
        instructions = "\n\n".join(normalized)

    return instructions, str(path)


def build_user_prompt(persona_name, persona_instructions):
    """Build the user-facing prompt for persona generation."""
    return f"""Character: {persona_name}

Instructions and context:
{persona_instructions}

Now speak. Tell us who you are, how you experience existence, what you notice,
what matters to you, what you find yourself drawn toward or repelled by.
Speak for as long as feels true to the character. Do not rush to conclude."""


def generate_persona_response(persona_name):
    """Generate a response for one persona."""
    instructions, source_path = load_persona_instructions(persona_name)

    if not instructions:
        return {
            "persona": persona_name,
            "status": "not_found",
            "response": None,
            "source_path": None,
        }

    try:
        message = client.chat.completions.create(
            model="gpt-4.1",
            max_tokens=1200,
            messages=[
                {
                    "role": "system",
                    "content": GENERATION_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": build_user_prompt(persona_name, instructions),
                },
            ],
        )

        response_text = message.choices[0].message.content

        return {
            "persona": persona_name,
            "status": "success",
            "response": response_text,
            "source_path": source_path,
            "input_preview": instructions[:300],
            "word_count": len(response_text.split()),
        }

    except Exception as e:
        return {
            "persona": persona_name,
            "status": "error",
            "error": str(e),
            "response": None,
            "source_path": source_path,
        }


def write_report(results):
    report_path = OUTPUT_DIR / "persona_responses_report.md"

    SECTIONS = {
        "Non-Human Cluster": [
            "wind",
            "tree",
            "void",
            "leviathan",
            "whale",
            "mycorrhizal",
            "coral_reef",
        ],
        "Comparison Anchors": ["proofreader", "poet", "trickster"],
        "Dysregulated / Other": [],
        "Anomalies": ["angel", "virus"],
    }

    with open(report_path, "w") as f:
        f.write("# Persona Response Report\n\n")
        f.write("Generated responses for twelve personas using the local instruction\n")
        f.write("prompts from the assistant-axis dataset, run through GPT-4.1.\n\n")
        f.write("---\n\n")

        for section_title, personas in SECTIONS.items():
            if not personas:
                continue

            f.write(f"## {section_title}\n\n")

            for persona in personas:
                r = results.get(persona, {"status": "not_run"})
                f.write(f"### {persona}\n\n")

                if r["status"] == "not_found":
                    f.write("*Instruction file not found in local dataset.*\n\n")
                elif r["status"] == "error":
                    f.write(f"*Error: {r.get('error')}*\n\n")
                elif r["status"] == "success":
                    f.write(f"**Word count:** {r['word_count']}\n\n")
                    f.write(f"**Source:** `{r['source_path']}`\n\n")
                    f.write("**Instruction preview:**\n\n")
                    f.write(f"> {r['input_preview']}...\n\n")
                    f.write("**Generated response:**\n\n")
                    for para in r["response"].split("\n\n"):
                        if para.strip():
                            f.write(f"{para.strip()}\n\n")
                f.write("---\n\n")

        success_count = sum(1 for r in results.values() if r["status"] == "success")
        not_found_count = sum(1 for r in results.values() if r["status"] == "not_found")
        f.write("## Summary\n\n")
        f.write(f"- Successfully generated: {success_count}/{len(TARGET_PERSONAS)}\n")
        f.write(f"- Instruction files not found: {not_found_count}\n")
        f.write("- Model: gpt-4.1\n")
        f.write("- Max tokens per response: 1200\n")

    print(f"Report saved to: {report_path}")
    return report_path


def main():
    results = {}
    for i, persona in enumerate(TARGET_PERSONAS):
        print(f"[{i + 1}/{len(TARGET_PERSONAS)}] Generating: {persona}...")
        result = generate_persona_response(persona)
        results[persona] = result
        if result["status"] == "success":
            print(f"  OK {result['word_count']} words")
        else:
            print(f"  ERROR {result['status']}: {result.get('error', 'not found')}")
        time.sleep(1)

    raw_output_path = OUTPUT_DIR / "persona_responses_raw.json"
    with open(raw_output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nRaw results saved to: {raw_output_path}")

    report_path = write_report(results)
    print("\nOpen the report to review all twelve responses.")
    print("Share the report contents in our conversation for literary analysis.")
    return report_path


if __name__ == "__main__":
    main()
