import os
from pathlib import Path
from PIL import Image

public_dir = Path(r"c:\Users\Avinash Goud\Downloads\frontend and backend for database kaveri\frontend\public")

for file in public_dir.glob("*.jpg"):
    print(f"Processing {file.name}...")
    with Image.open(file) as img:
        # Convert to RGB if needed
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if width > 1600
        if img.width > 1600:
            ratio = 1600.0 / img.width
            new_height = int(img.height * ratio)
            img = img.resize((1600, new_height), Image.Resampling.LANCZOS)

        # Save WebP version (highest compression and quality)
        webp_path = file.with_suffix(".webp")
        img.save(webp_path, "WEBP", quality=80, method=6)
        webp_size = os.path.getsize(webp_path) / 1024

        # Save optimized JPG version
        img.save(file, "JPEG", quality=75, optimize=True)
        jpg_size = os.path.getsize(file) / 1024

        print(f"  => WebP: {webp_size:.1f} KB | JPG: {jpg_size:.1f} KB")

print("All images compressed successfully!")
