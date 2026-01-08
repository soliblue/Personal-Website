#!/usr/bin/env python3
"""
Newspaper Image Generator for soli.blue

Uses Google's Gemini image generation model to create vintage newspaper-style
illustrations for the newspaper homepage.

Usage:
    cd /Users/soli/Desktop/CODING/Personal-Website
    source /Users/soli/Desktop/CODING/habibi/playground/.env
    python scripts/generate_newspaper_images.py

Requirements:
    pip install google-genai
"""

import os
import sys
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai not installed")
    print("Run: pip install google-genai")
    sys.exit(1)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "static" / "newspaper"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# API Key
API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    print("Error: GOOGLE_API_KEY not set")
    print("Run: source /Users/soli/Desktop/CODING/habibi/playground/.env")
    sys.exit(1)

# Model - use the image generation model
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp")

# Image prompts for newspaper illustrations
PROMPTS = [
    {
        "name": "masthead_ornament",
        "prompt": """Create a vintage newspaper masthead ornament/decoration in black and white.
        Style: 1920s newspaper illustration, woodcut/engraving style.
        Should include: decorative flourishes, scrollwork, maybe quill pens or printing press elements.
        Format: horizontal banner shape, clean white background.
        No text, just decorative elements."""
    },
    {
        "name": "portrait_illustration",
        "prompt": """Create a vintage newspaper portrait illustration of a young professional man.
        Style: 1920s-1930s newspaper portrait engraving, crosshatch shading.
        Features: clean-shaven, wearing glasses, professional attire, thoughtful expression.
        Format: oval or rectangular frame with decorative border.
        Black and white only, high contrast, woodcut/engraving aesthetic."""
    },
    {
        "name": "tech_vignette",
        "prompt": """Create a vintage newspaper illustration depicting technology and innovation.
        Style: 1920s-1930s woodcut/engraving illustration.
        Elements: combination of vintage (typewriter, gears, lightbulb) and subtly futuristic.
        Should feel like a newspaper vignette about the future of technology.
        Black and white, crosshatch shading, clean lines."""
    },
    {
        "name": "ai_illustration",
        "prompt": """Create a vintage newspaper-style illustration representing artificial intelligence.
        Style: 1920s scientific illustration, engraving/woodcut aesthetic.
        Elements: brain, circuits, thinking machine, mechanical mind - but in vintage style.
        Should look like it belongs in a 1920s newspaper article about "thinking machines".
        Black and white, detailed crosshatching."""
    },
    {
        "name": "startup_illustration",
        "prompt": """Create a vintage newspaper illustration about entrepreneurship and startups.
        Style: 1920s-1930s editorial illustration, woodcut/engraving.
        Elements: factory smokestacks, rising graph, handshake, building blocks.
        Should evoke "industry and innovation" in vintage style.
        Black and white, detailed shading."""
    },
    {
        "name": "berlin_skyline",
        "prompt": """Create a vintage newspaper illustration of Berlin city skyline.
        Style: 1920s travel illustration, woodcut/engraving aesthetic.
        Elements: Brandenburg Gate, TV Tower (stylized to look vintage), city buildings.
        Format: horizontal vignette suitable for newspaper.
        Black and white, art deco influenced."""
    },
    {
        "name": "education_vignette",
        "prompt": """Create a vintage newspaper illustration about education and academia.
        Style: 1920s-1930s scholarly illustration, engraving aesthetic.
        Elements: books, diploma scroll, graduation cap, university building silhouette.
        Should evoke "higher learning" in vintage newspaper style.
        Black and white, detailed crosshatching."""
    },
    {
        "name": "code_illustration",
        "prompt": """Create a vintage newspaper illustration representing computer programming/coding.
        Style: 1920s scientific/technical illustration, woodcut aesthetic.
        Reimagine: punch cards, early computers, or abstract representation of logic/mathematics.
        Should look like a 1920s newspaper's imagination of "computing machines".
        Black and white, detailed engraving style."""
    },
    {
        "name": "divider_ornament",
        "prompt": """Create a simple vintage newspaper divider ornament.
        Style: 1920s newspaper typography ornament.
        Should be: horizontal line with decorative center element (flourish, small vignette).
        Very simple, elegant, suitable for separating newspaper sections.
        Black and white, clean design."""
    },
    {
        "name": "corner_ornament",
        "prompt": """Create a vintage newspaper corner ornament decoration.
        Style: 1920s art nouveau/art deco corner piece.
        Should be: L-shaped corner decoration with flowing lines and flourishes.
        Suitable for framing sections or headlines.
        Black and white, clean elegant design."""
    },
    {
        "name": "classified_border",
        "prompt": """Create a vintage newspaper classified ad border frame.
        Style: 1920s-1930s newspaper advertisement border.
        Should be: rectangular frame with decorative corners and edges.
        Ornate but readable, suitable for containing text.
        Black and white, print-ready aesthetic."""
    },
    {
        "name": "book_review_header",
        "prompt": """Create a vintage newspaper illustration for a book review section header.
        Style: 1920s literary magazine illustration, woodcut aesthetic.
        Elements: open book, reading lamp, stack of books, maybe quill pen.
        Horizontal banner format suitable for section header.
        Black and white, detailed engraving style."""
    },
]


def generate_image(client, prompt_data):
    """Generate a single newspaper illustration."""
    name = prompt_data["name"]
    prompt = prompt_data["prompt"]

    print(f"\n{'='*60}")
    print(f"Generating: {name}")
    print(f"{'='*60}")

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Content(
                    parts=[
                        types.Part(text=prompt),
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_modalities=["image", "text"]
            ),
        )

        # Save any generated images
        for i, part in enumerate(response.candidates[0].content.parts):
            if part.inline_data:
                suffix = f"_{i}" if i > 0 else ""
                output_path = OUTPUT_DIR / f"{name}{suffix}.png"
                output_path.write_bytes(part.inline_data.data)
                print(f"  ✓ Saved: {output_path}")
            elif part.text:
                print(f"  Response text: {part.text[:100]}...")

        return True

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║     NEWSPAPER IMAGE GENERATOR FOR SOLI.BLUE                  ║
║     Generating vintage newspaper-style illustrations          ║
╚══════════════════════════════════════════════════════════════╝
    """)

    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Model: {MODEL}")
    print(f"Number of images to generate: {len(PROMPTS)}")

    # Initialize client
    client = genai.Client(api_key=API_KEY)

    # Generate each image
    success_count = 0
    for prompt_data in PROMPTS:
        if generate_image(client, prompt_data):
            success_count += 1

    print(f"\n{'='*60}")
    print(f"COMPLETE: Generated {success_count}/{len(PROMPTS)} images")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
