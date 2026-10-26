import os
from PIL import Image, ImageEnhance, ImageOps

def create_vintage_earth_palette(img, earth_mix=0.82, contrast_boost=1.06):
    """
    Applies a fine-art watercolor palette in warm earth tones, sepia, and soft warm greys.
    Maintains alpha channel (transparency feathering) untouched.
    """
    has_alpha = img.mode == 'RGBA'
    if has_alpha:
        alpha = img.split()[-1]
        rgb_img = img.convert('RGB')
    else:
        alpha = None
        rgb_img = img.convert('RGB')

    # Convert to high-fidelity grayscale (luminance)
    gray = ImageOps.grayscale(rgb_img)
    
    # Slight contrast enhancement to preserve watercolor brush detail
    gray_enhancer = ImageEnhance.Contrast(gray)
    gray_contrasted = gray_enhancer.enhance(contrast_boost)

    # 3-Stop / 4-Stop Warm Earth Sepia & Warm Grey Color Map
    # Shadow: Deep warm charcoal / roasted umber (38, 28, 20)
    # Mid-Dark: Rich raw umber / warm earth (112, 88, 68)
    # Mid-Light: Warm sepia / soft terracotta ochre (176, 150, 126)
    # Highlight: Soft warm ivory paper tone (248, 244, 236)
    
    # We can create a 256-color palette lookup
    palette_rgb = []
    for i in range(256):
        t = i / 255.0
        if t < 0.35:
            # Deep shadow to mid-dark
            sub_t = t / 0.35
            r = int(38 + (112 - 38) * sub_t)
            g = int(28 + (88 - 28) * sub_t)
            b = int(22 + (70 - 22) * sub_t)
        elif t < 0.75:
            # Mid-dark to warm sepia / earth
            sub_t = (t - 0.35) / 0.40
            r = int(112 + (192 - 112) * sub_t)
            g = int(88 + (162 - 88) * sub_t)
            b = int(70 + (136 - 70) * sub_t)
        else:
            # Warm sepia to soft warm ivory/grey highlight
            sub_t = (t - 0.75) / 0.25
            r = int(192 + (248 - 192) * sub_t)
            g = int(162 + (244 - 162) * sub_t)
            b = int(136 + (236 - 136) * sub_t)
        palette_rgb.append((r, g, b))

    # Apply palette to grayscale image
    sepia_img = Image.new('RGB', rgb_img.size)
    sepia_pixels = sepia_img.load()
    gray_pixels = gray_contrasted.load()
    w, h = rgb_img.size

    for y in range(h):
        for x in range(w):
            lum = gray_pixels[x, y]
            sepia_pixels[x, y] = palette_rgb[lum]

    # Blend with a subtle touch of the original color to maintain artistic skin & contour nuance
    if earth_mix < 1.0:
        # Subtle desaturation of original
        color_enhancer = ImageEnhance.Color(rgb_img)
        subtle_orig = color_enhancer.enhance(0.4) # desaturate original to avoid harsh blues
        final_rgb = Image.blend(subtle_orig, sepia_img, earth_mix)
    else:
        final_rgb = sepia_img

    if has_alpha:
        final_rgba = Image.new('RGBA', rgb_img.size)
        final_rgba.paste(final_rgb, (0, 0))
        final_rgba.putalpha(alpha)
        return final_rgba
    else:
        return final_rgb

if __name__ == '__main__':
    base_dir = r'c:\Users\David\Documents\alphastudio\invitacionbodavirtual\public\assets'
    test_files = [
        'carlos_jackie_3_feathered.png',
        'carlos_jackie_2_feathered.png',
        'carlos_jackie_4_feathered.png',
        'carlos_jackie_1.jpg'
    ]

    for filename in test_files:
        path = os.path.join(base_dir, filename)
        if os.path.exists(path):
            img = Image.open(path)
            # Generate test preview
            vintage_img = create_vintage_earth_palette(img, earth_mix=0.88, contrast_boost=1.05)
            out_name = filename.replace('.png', '_vintage_test.png').replace('.jpg', '_vintage_test.jpg')
            out_path = os.path.join(base_dir, out_name)
            vintage_img.save(out_path)
            print(f"Generated test: {out_name}")
