"""
Generate static 1200x630 OpenGraph Image and Apple Touch Icon using Pillow.
"""
import os
from PIL import Image, ImageDraw, ImageFont

def generate_og():
    width = 1200
    height = 630
    
    # 1. Create Base Image with Deep Blue / Slate Gradient
    img = Image.new('RGB', (width, height), color=(15, 23, 42)) # #0f172a
    draw = ImageDraw.Draw(img)

    # Vertical gradient effect
    for y in range(height):
        r = int(9 + (y / height) * (20 - 9))
        g = int(13 + (y / height) * (25 - 13))
        b = int(22 + (y / height) * (45 - 22))
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Outer decorative glow border
    draw.rounded_rectangle([(20, 20), (width - 20, height - 20)], radius=32, outline=(59, 130, 246), width=3)
    draw.rounded_rectangle([(24, 24), (width - 24, height - 24)], radius=28, outline=(30, 58, 138), width=1)

    # Glowing Circle in Center Top
    center_x = width // 2
    circle_y = 175
    radius = 65
    draw.ellipse([(center_x - radius - 6, circle_y - radius - 6), (center_x + radius + 6, circle_y + radius + 6)], fill=(37, 99, 235))
    draw.ellipse([(center_x - radius, circle_y - radius), (center_x + radius, circle_y + radius)], fill=(30, 41, 59), outline=(96, 165, 250), width=3)

    # Draw Football pentagon pattern representation
    draw.polygon([
        (center_x, circle_y - 28),
        (center_x + 26, circle_y - 8),
        (center_x + 16, circle_y + 24),
        (center_x - 16, circle_y + 24),
        (center_x - 26, circle_y - 8)
    ], fill=(248, 250, 252))

    # Text rendering with default or basic fonts
    try:
        font_title = ImageFont.truetype("arial.ttf", 64)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_tag = ImageFont.truetype("arial.ttf", 20)
        font_foot = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        font_foot = ImageFont.load_default()

    # Title: FootballPredict
    title_text = "FootballPredict"
    bbox_title = draw.textbbox((0, 0), title_text, font=font_title)
    w_title = bbox_title[2] - bbox_title[0]
    draw.text((center_x - w_title // 2, 270), title_text, fill=(255, 255, 255), font=font_title)

    # Subtitle: MATCH INTELLIGENCE & STATISTICAL PREDICTIONS
    sub_text = "MATCH ANALYTICS & STATISTICAL PROBABILITY HUB"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    draw.text((center_x - w_sub // 2, 355), sub_text, fill=(96, 165, 250), font=font_sub)

    # Secondary Headline
    head_text = "1X2 Odds • Over/Under 2.5 Goals • BTTS Analytics • Global Leaderboard"
    bbox_head = draw.textbbox((0, 0), head_text, font=font_tag)
    w_head = bbox_head[2] - bbox_head[0]
    draw.text((center_x - w_head // 2, 415), head_text, fill=(203, 213, 225), font=font_tag)

    # 4 Feature Pills
    pills = ["1X2 Probabilities", "Over/Under 2.5", "BTTS Yes/No", "Head-to-Head Stats"]
    total_pill_width = 820
    start_x = (width - total_pill_width) // 2
    for i, pill in enumerate(pills):
        px = start_x + i * 210
        draw.rounded_rectangle([(px, 475), (px + 190, 520)], radius=22, fill=(30, 41, 59), outline=(59, 130, 246), width=1)
        pb = draw.textbbox((0, 0), pill, font=font_foot)
        pw = pb[2] - pb[0]
        draw.text((px + (190 - pw) // 2, 487), pill, fill=(241, 245, 249), font=font_foot)

    # Footer Domain
    domain_text = "footballprediction-lovat.vercel.app"
    bbox_dom = draw.textbbox((0, 0), domain_text, font=font_foot)
    w_dom = bbox_dom[2] - bbox_dom[0]
    draw.text((center_x - w_dom // 2, 575), domain_text, fill=(100, 116, 139), font=font_foot)

    # Output paths
    frontend_public = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "public")
    os.makedirs(frontend_public, exist_ok=True)
    
    og_path = os.path.join(frontend_public, "og-image.png")
    img.save(og_path, format="PNG", optimize=True)
    print(f"SUCCESS: Saved og-image.png at {og_path}")

    # Apple touch icon 180x180
    apple_icon = img.crop((center_x - 140, circle_y - 90, center_x + 140, circle_y + 190)).resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(frontend_public, "apple-touch-icon.png")
    apple_icon.save(apple_path, format="PNG", optimize=True)
    print(f"SUCCESS: Saved apple-touch-icon.png at {apple_path}")

if __name__ == "__main__":
    generate_og()
