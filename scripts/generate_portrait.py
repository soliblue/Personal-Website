#!/usr/bin/env python3
"""
Generate a vintage newspaper portrait from reference photos
"""

import os
from pathlib import Path

from google import genai
from google.genai import types

OUTPUT_DIR = Path(__file__).parent.parent / "static" / "newspaper"
DOWNLOADS = Path.home() / "Downloads"

API_KEY = os.environ.get("GOOGLE_API_KEY")
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp")

# Reference images
REF_IMAGES = [
    Path("/Users/soli/Desktop/ba750c99-c554-469e-8a8e-02ec4383e0dc.jpg"),
    Path("/Users/soli/Desktop/IMG_0163 Copy.JPG"),
    Path("/Users/soli/Desktop/IMG_3545.jpeg"),
]

PROMPT = """Generate a vintage 1920s-1930s newspaper illustration portrait of this person.

IMPORTANT REQUIREMENTS:
- The person should look EXACTLY like the reference photos - same curly dark hair, same face shape, same features
- Style: Black and white woodcut/engraving illustration like old newspaper prints
- Scene: The person is in a workshop/lab full of old vintage hardware, vacuum tubes, early electronics, soldering equipment
- Pose: Working intently, perhaps soldering or examining circuits, hacker/inventor vibe
- Orientation: VERTICAL/PORTRAIT orientation
- Mood: Focused, intellectual, like a 1920s inventor or radio engineer
- Art style: Crosshatch shading, high contrast black and white, vintage newspaper print aesthetic
- NO color, pure black and white engraving style

The final image should look like it belongs in a 1920s newspaper article about a young inventor or engineer."""

def main():
    print("Generating vintage portrait...")

    client = genai.Client(api_key=API_KEY)

    # Build content with all reference images
    parts = [types.Part(text=PROMPT)]

    for img_path in REF_IMAGES:
        if img_path.exists():
            print(f"  Adding reference: {img_path.name}")
            mime = "image/jpeg"
            if img_path.suffix.lower() == ".png":
                mime = "image/png"
            parts.append(types.Part(inline_data=types.Blob(
                mime_type=mime,
                data=img_path.read_bytes()
            )))

    response = client.models.generate_content(
        model=MODEL,
        contents=[types.Content(parts=parts)],
        config=types.GenerateContentConfig(response_modalities=["image", "text"]),
    )

    # Save generated images
    for i, part in enumerate(response.candidates[0].content.parts):
        if part.inline_data:
            output_path = OUTPUT_DIR / "portrait_illustration.png"
            output_path.write_bytes(part.inline_data.data)
            print(f"  ✓ Saved: {output_path}")

            # Also save to Downloads for easy viewing
            dl_path = DOWNLOADS / "soli_portrait_vintage.png"
            dl_path.write_bytes(part.inline_data.data)
            print(f"  ✓ Also saved: {dl_path}")
        elif part.text:
            print(f"  Response: {part.text[:200]}...")

    print("\nDone! Now removing background...")

if __name__ == "__main__":
    main()
