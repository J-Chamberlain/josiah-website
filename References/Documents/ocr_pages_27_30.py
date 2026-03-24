from pathlib import Path

import pytesseract
from pdf2image import convert_from_path

pdf_path = Path("Special Report on the preservation of Niagara Falls.pdf")
out_path = Path("olmsted_notes.txt")

# PDF page numbers are 1-based and inclusive in pdf2image.
images = convert_from_path(
    str(pdf_path),
    first_page=47,
    last_page=52,
    dpi=300,
)

chunks = []
for i, image in enumerate(images, start=47):
    text = pytesseract.image_to_string(image, lang="eng")
    chunks.append(f"\n\n===== PAGE {i} =====\n\n{text.strip()}\n")

out_path.write_text("".join(chunks), encoding="utf-8")
print(f"Wrote OCR output to {out_path.resolve()}")
