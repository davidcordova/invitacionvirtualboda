import os
from PIL import Image, ImageEnhance, ImageOps

def apply_earth_sepia_warm_grey_grade(img):
    """
    Transforms the image into a vintage sophisticated watercolor with:
    - Warm earth tones (ochre, sienna, terracotta)
    - Sepia washes
    - Very soft warm greys (taupe, warm charcoal)
    Preserves alpha channel transparency.
    """
    has_alpha = img.mode == 'RGBA'
    if has_alpha:
        alpha = img.split()[-1]
        rgb = img.convert('RGB')
    else:
        alpha = None
        rgb = img.convert('RGB')

    # Work in HSV to re-tune hues and saturation
    hsv = rgb.convert('HSV')
    h, s, v = hsv.split()

    h_data = list(h.getdata())
    s_data = list(s.getdata())
    v_data = list(v.getdata())

    new_h = []
    new_s = []
    new_v = []

    # Target Warm Palette:
    # Earth / Sepia Hue: ~20-35 (in 0-255 scale, 255 = 360 deg, so 15-28 deg is ~11 to 20)
    # Warm Ochre / Sienna: 20 to 28
    # Desaturate blues/cyans (h between 120 and 180) to very low saturation -> turns into warm greys!
    # Greens (h between 50 and 110) shift to warm olive/earth ochre -> h ~ 25 to 35, saturation muted to 30-50%
    # Purples/Magentas (h > 180) shift to warm terracotta/sepia -> h ~ 12 to 18

    for i in range(len(h_data)):
        hue = h_data[i]
        sat = s_data[i]
        val = v_data[i]

        # In PIL HSV: Hue is 0..255 (0 = Red, 42 = Yellow, 85 = Green, 128 = Cyan, 170 = Blue, 213 = Magenta)
        
        # 1. Blues & Cyans (sky, shirts, water): H between 115 and 185
        if 115 <= hue <= 185:
            # Shift to delicate warm grey / soft taupe
            target_hue = 22 # Warm sepia/taupe
            target_sat = int(sat * 0.12) # Very soft muted grey
            target_val = int(val * 0.98)
        # 2. Greens (vegetation, trees): H between 50 and 114
        elif 50 <= hue < 115:
            # Shift to warm olive / earthy ochre
            target_hue = 24 # Warm earth ochre
            target_sat = int(sat * 0.45)
            target_val = int(val * 0.94)
        # 3. Purples, Violets & Magentas: H > 185
        elif hue > 185:
            # Shift to warm terracotta / deep sepia
            target_hue = 14 # Warm sienna / terracotta
            target_sat = int(sat * 0.40)
            target_val = int(val * 0.95)
        # 4. Reds, Oranges & Yellows (Skin tones, hair, warm highlights): H < 50
        else:
            # Harmonize to sophisticated warm sepia & earth tones
            # Keep natural warmth but soften harsh saturation
            target_hue = int(hue * 0.7 + 16 * 0.3)
            target_sat = int(sat * 0.65)
            target_val = val

        new_h.append(target_hue)
        new_s.append(target_sat)
        new_v.append(target_val)

    h.putdata(new_h)
    s.putdata(new_s)
    v.putdata(new_v)

    graded_hsv = Image.merge('HSV', (h, s, v))
    graded_rgb = graded_hsv.convert('RGB')

    # Now apply a delicate warm sepia wash curve over the shadows and midtones
    # to unify the entire painting into a cohesive vintage aesthetic
    # Create warm sepia tint layer
    # Tint color: warm raw sienna (#a6835d)
    tint_layer = Image.new('RGB', rgb.size, (166, 131, 93))
    
    # Blend with 22% warm tint for unified vintage feeling
    warm_graded = Image.blend(graded_rgb, tint_layer, 0.18)

    # Enhance contrast slightly to keep crisp pencil/brush lines
    contrast = ImageEnhance.Contrast(warm_graded)
    final_rgb = contrast.enhance(1.08)

    if has_alpha:
        final_rgba = Image.new('RGBA', rgb.size)
        final_rgba.paste(final_rgb, (0, 0))
        final_rgba.putalpha(alpha)
        return final_rgba
    else:
        return final_rgb

if __name__ == '__main__':
    base_dir = r'c:\Users\David\Documents\alphastudio\invitacionbodavirtual\public\assets'
    test_files = [
        'carlos_jackie_1.jpg',
        'carlos_jackie_2_feathered.png',
        'carlos_jackie_3_feathered.png',
        'carlos_jackie_4_feathered.png'
    ]

    for filename in test_files:
        path = os.path.join(base_dir, filename)
        if os.path.exists(path):
            img = Image.open(path)
            res = apply_earth_sepia_warm_grey_grade(img)
            out_name = filename.replace('.png', '_sophisticated_earth.png').replace('.jpg', '_sophisticated_earth.jpg')
            res.save(os.path.join(base_dir, out_name))
            print(f"Generated: {out_name}")
