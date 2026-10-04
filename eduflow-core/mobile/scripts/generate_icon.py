import os
from PIL import Image, ImageDraw, ImageFont

def draw_graduation_cap(draw, cx, cy, scale, color=(255, 193, 7, 255)):
    # Diamond / cap top
    w = 260 * scale
    h = 100 * scale
    diamond = [
        (cx, cy - h),          # top
        (cx + w, cy),          # right
        (cx, cy + h),          # bottom
        (cx - w, cy)           # left
    ]
    draw.polygon(diamond, fill=color)

    # Skull cap underneath
    cap_w = 160 * scale
    cap_h = 70 * scale
    cap_top_y = cy + 20 * scale
    draw.chord(
        [cx - cap_w, cap_top_y, cx + cap_w, cap_top_y + cap_h * 2],
        start=0, end=180, fill=color
    )

    # Tassel button
    btn_r = 14 * scale
    draw.ellipse([cx - btn_r, cy - btn_r, cx + btn_r, cy + btn_r], fill=(255, 215, 0, 255))

    # Tassel string & fringe
    tassel_points = [
        (cx, cy),
        (cx + w - 30 * scale, cy + 60 * scale),
        (cx + w - 25 * scale, cy + 140 * scale)
    ]
    draw.line(tassel_points, fill=(255, 215, 0, 255), width=int(10 * scale))
    draw.ellipse(
        [cx + w - 40 * scale, cy + 130 * scale, cx + w - 10 * scale, cy + 170 * scale],
        fill=(255, 215, 0, 255)
    )

def generate_icons():
    size = 1024
    assets_dir = "/home/rgukt/Github/EduFLowAI/eduflow-core/mobile/assets/icon"
    os.makedirs(assets_dir, exist_ok=True)

    # 1. Full App Icon with deep blue background
    img = Image.new("RGBA", (size, size), (10, 37, 64, 255))
    draw = ImageDraw.Draw(img)

    # Subtle modern border glow
    draw.rounded_rectangle([20, 20, size - 20, size - 20], radius=180, outline=(255, 193, 7, 80), width=6)

    # Draw Graduation Cap
    draw_graduation_cap(draw, size // 2, 420, scale=1.4, color=(255, 193, 7, 255))

    # Text "EduFlow"
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 100)
    except Exception:
        font = ImageFont.load_default()

    text = "EduFlow"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    draw.text(((size - text_w) // 2, 720), text, fill=(255, 193, 7, 255), font=font)

    # Sub-text "AI OS"
    try:
        sub_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 46)
    except Exception:
        sub_font = ImageFont.load_default()

    sub_text = "A I   O S"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text(((size - sub_w) // 2, 840), sub_text, fill=(255, 255, 255, 200), font=sub_font)

    app_icon_path = os.path.join(assets_dir, "app_icon.png")
    img.save(app_icon_path, "PNG")
    print(f"Generated app_icon.png at {app_icon_path}")

    # 2. Foreground Icon (transparent background for adaptive icons)
    fg_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg_img)

    # Keep foreground inside safe zone (central ~66%)
    draw_graduation_cap(fg_draw, size // 2, 440, scale=1.2, color=(255, 193, 7, 255))
    draw.textbbox((0, 0), text, font=font)
    fg_draw.text(((size - text_w) // 2, 700), text, fill=(255, 193, 7, 255), font=font)

    fg_icon_path = os.path.join(assets_dir, "app_icon_foreground.png")
    fg_img.save(fg_icon_path, "PNG")
    print(f"Generated app_icon_foreground.png at {fg_icon_path}")

if __name__ == "__main__":
    generate_icons()
