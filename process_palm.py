from PIL import Image, ImageOps
import os

def process_image():
    input_path = 'img/palm trees.jpg'
    output_path = 'public/palm-overlay.png'

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    print("Loading image...")
    # Open and ensure we are working with correct orientation
    img = Image.open(input_path)

    # 1. Resize to reasonable max dimension to simulate lower res/pixelated look slightly if super high res, 
    # but mostly to ensure stippling looks good at screen size.
    # User asked for "pixelated/stippled".
    # Let's keep resolution somewhat high so it covers screen, relying on dither for the "pixelated" feel.
    if img.width > 2000:
        ratio = 2000 / img.width
        new_height = int(img.height * ratio)
        img = img.resize((2000, new_height), Image.Resampling.LANCZOS)

    # 2. Convert to Grayscale
    print("Converting to grayscale...")
    gray = img.convert('L')

    # 3. Dither to 1-bit (Stippled/Pixelated effect)
    print("Dithering...")
    bw = gray.convert('1')

    # 4. Create transparency
    # We want Black pixels to remain (as Black), and White pixels to become Transparent.
    # In '1' mode: 0 is Black, 255 is White (mostly). 
    # Let's verify by converting to L.
    mask = bw.convert('L')
    
    # We want the Black parts of the original to be Opaque.
    # So we need a mask where the 'Black' parts are 255 (Opaque) and 'White' parts are 0 (Transparent).
    # Since 'Black' is 0 in L, we need to Invert.
    print("Generating transparency mask...")
    alpha = ImageOps.invert(mask)

    # Create a solid black image
    final_img = Image.new('RGBA', bw.size, (0, 0, 0, 0))
    
    # To make it just "Black paint":
    # Paste black only where alpha is high.
    black_fill = Image.new('RGBA', bw.size, (0, 0, 0, 255))
    
    # Composite: Use black_fill and apply our alpha mask
    final_img = black_fill.copy()
    final_img.putalpha(alpha)

    # Save
    print(f"Saving to {output_path}...")
    final_img.save(output_path, 'PNG')
    print("Done.")

if __name__ == '__main__':
    process_image()
