#!/usr/bin/env python3
"""
Generate space game assets using Google's Gemini image model.

Usage:
    python generate_space_assets.py --ref path/to/reference_image.png

Requires:
    - GOOGLE_API_KEY environment variable set
    - google-genai package installed (pip install google-genai)
    - rembg package installed (pip install rembg)
    - PIL/Pillow installed (pip install Pillow)
"""

import argparse
import os
import sys
from pathlib import Path

from google import genai
from google.genai import types


def remove_background_local(image_path: Path):
    """Remove background from image using BiRefNet model."""
    from PIL import Image
    from rembg import remove, new_session

    session = new_session("birefnet-general")
    img = Image.open(image_path)
    result = remove(img, session=session)
    result.save(image_path)
    print(f"  Removed background (BiRefNet) -> {image_path.name}")


def autocrop(image_path: Path):
    """Auto-crop image to remove excess whitespace/transparency."""
    from PIL import Image

    img = Image.open(image_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        img.save(image_path)
        print(f"  Cropped -> {image_path.name}")


def load_reference_image(ref_path: str) -> bytes:
    """Load reference image and return as bytes."""
    path = Path(ref_path)
    if not path.exists():
        raise FileNotFoundError(f"Reference image not found: {ref_path}")

    with open(path, "rb") as f:
        return f.read()


def generate_asset(
    client: genai.Client,
    prompt: str,
    reference_bytes: bytes,
    output_path: Path,
) -> bool:
    """Generate a single asset using Gemini and save it."""
    try:
        response = client.models.generate_content(
            model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp"),
            contents=[
                types.Content(
                    parts=[
                        types.Part(text=prompt),
                        types.Part(
                            inline_data=types.Blob(
                                mime_type="image/png", data=reference_bytes
                            )
                        ),
                    ]
                )
            ],
            config=types.GenerateContentConfig(response_modalities=["image", "text"]),
        )

        # Extract image from response
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                # Save the image
                with open(output_path, "wb") as f:
                    f.write(part.inline_data.data)
                return True

        print(f"  Warning: No image data in response for {output_path.name}")
        return False

    except Exception as e:
        print(f"  Error generating {output_path.name}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Generate space game assets using Gemini image model"
    )
    parser.add_argument(
        "--ref",
        required=True,
        help="Path to reference image for style matching",
    )
    parser.add_argument(
        "--output-dir",
        default="src/assets/space",
        help="Output directory for generated assets (default: src/assets/space)",
    )
    args = parser.parse_args()

    # Check for API key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY environment variable not set")
        sys.exit(1)

    # Load reference image
    print(f"Loading reference image: {args.ref}")
    try:
        reference_bytes = load_reference_image(args.ref)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir.absolute()}")

    # Initialize Gemini client
    client = genai.Client(api_key=api_key)

    # Define assets to generate
    assets = [
        {
            "filename": "spaceship.png",
            "prompt": (
                "Generate a retro pixel art spaceship sprite for a 2D space game. "
                "Top-down view, pointing upward. The ship should have glowing cyan/blue "
                "colors with orange engine flames at the bottom, matching the style in "
                "the reference image. 64x64 pixels, solid WHITE background. "
                "Clean pixel art with defined edges, suitable for a game sprite."
            ),
        },
        {
            "filename": "asteroid1.png",
            "prompt": (
                "Generate a retro pixel art asteroid sprite for a 2D space game. "
                "The asteroid should be a ring/donut shape with purple/violet glowing "
                "edges, matching the asteroid style in the reference image. "
                "48x48 pixels, solid WHITE background. Dark center with glowing purple "
                "outline, suitable for a game sprite."
            ),
        },
        {
            "filename": "asteroid2.png",
            "prompt": (
                "Generate a retro pixel art asteroid sprite variation for a 2D space game. "
                "Ring/circular shape with purple/violet glowing edges, slightly different "
                "from a standard circle - more irregular. Match the dark space aesthetic "
                "in the reference image. 48x48 pixels, solid WHITE background. "
                "Glowing purple/magenta outline style, suitable for a game sprite."
            ),
        },
        {
            "filename": "asteroid3.png",
            "prompt": (
                "Generate a small retro pixel art asteroid sprite for a 2D space game. "
                "Smaller ring/circular shape with purple/violet glowing edges. "
                "Match the dark space aesthetic in the reference image. "
                "32x32 pixels, solid WHITE background. Subtle glowing purple outline, "
                "suitable for a game sprite."
            ),
        },
    ]

    # Generate each asset
    print(f"\nGenerating {len(assets)} assets...")
    print("-" * 50)

    success_count = 0
    for i, asset in enumerate(assets, 1):
        filename = asset["filename"]
        prompt = asset["prompt"]
        output_path = output_dir / filename

        print(f"\n[{i}/{len(assets)}] Generating {filename}...")

        if generate_asset(client, prompt, reference_bytes, output_path):
            print(f"  Saved: {output_path}")
            # Remove background and autocrop
            remove_background_local(output_path)
            autocrop(output_path)
            success_count += 1
        else:
            print(f"  Failed to generate {filename}")

    # Summary
    print("\n" + "-" * 50)
    print(f"Generation complete: {success_count}/{len(assets)} assets created")

    if success_count == len(assets):
        print(f"\nAll assets saved to: {output_dir.absolute()}")
    else:
        print(f"\nSome assets failed. Check the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
