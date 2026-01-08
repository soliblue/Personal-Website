#!/usr/bin/env python3
"""
Remove backgrounds from newspaper illustrations using remove.bg API
"""

import os
import requests
from pathlib import Path

# Directories
INPUT_DIR = Path(__file__).parent.parent / "static" / "newspaper"
OUTPUT_DIR = INPUT_DIR  # Overwrite originals

# API Key
API_KEY = os.environ.get("REMOVEBG_API_KEY")
if not API_KEY:
    print("Error: REMOVEBG_API_KEY not set")
    print("Run: source /Users/soli/Desktop/CODING/habibi/playground/.env")
    exit(1)

def remove_background(input_path, output_path):
    """Remove background from a single image."""
    print(f"Processing: {input_path.name}...")

    with open(input_path, 'rb') as f:
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': f},
            data={'size': 'auto'},
            headers={'X-Api-Key': API_KEY},
        )

    if response.status_code == requests.codes.ok:
        with open(output_path, 'wb') as out:
            out.write(response.content)
        print(f"  ✓ Saved: {output_path}")
        return True
    else:
        print(f"  ✗ Error: {response.status_code} - {response.text}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║     BACKGROUND REMOVER FOR NEWSPAPER ILLUSTRATIONS           ║
╚══════════════════════════════════════════════════════════════╝
    """)

    # Get all PNG files
    images = list(INPUT_DIR.glob("*.png"))
    print(f"Found {len(images)} images to process")

    success = 0
    for img in images:
        if remove_background(img, img):
            success += 1

    print(f"\n{'='*60}")
    print(f"COMPLETE: Processed {success}/{len(images)} images")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
