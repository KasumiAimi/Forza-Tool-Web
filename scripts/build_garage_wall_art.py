"""Render aligned, weathered tier paint overlays for the garage backdrop.

Run from the repository root: python scripts/build_garage_wall_art.py
Every transparent PNG has the same dimensions as garage-level-v3.png so the
wall art stays on the rear wall when the backdrop scales with a garage row.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "tuning"
BASE = Image.open(ASSETS / "garage-level-v3.png").convert("RGB")
WIDTH, HEIGHT = BASE.size
TIER_ART = {
    "Overpower": ("OVERPOWER", (228, 185, 87)),
    "META": ("META", (207, 79, 89)),
    "T1": ("T1", (160, 115, 209)),
    "T2": ("T2", (93, 158, 223)),
    "T3": ("T3", (104, 183, 124)),
    "玩具": ("玩具", (238, 242, 240)),
    "常规": ("常规", (139, 168, 168)),
}


def paint_mask(label: str, minimum_width: int, center_y: int, font_size: int | None = None) -> Image.Image:
    mask = Image.new("L", BASE.size)
    draw = ImageDraw.Draw(mask)
    font_path = "C:/Windows/Fonts/msyhbd.ttc" if any(ord(c) > 127 for c in label) else "C:/Windows/Fonts/impact.ttf"
    size = font_size or (166 if label == "OVERPOWER" else 178)
    font = ImageFont.truetype(font_path, size)
    box = draw.textbbox((0, 0), label, font=font)
    text_width, text_height = box[2] - box[0], box[3] - box[1]
    if font_size is None and text_width > 850:
        size = int(size * 850 / text_width)
        font = ImageFont.truetype(font_path, size)
        box = draw.textbbox((0, 0), label, font=font)
        text_width, text_height = box[2] - box[0], box[3] - box[1]

    target_width = min(max(text_width, minimum_width), 1180)
    glyph = Image.new("L", (text_width, text_height))
    ImageDraw.Draw(glyph).text((-box[0], -box[1]), label, font=font, fill=255)
    if target_width != text_width:
        glyph = glyph.resize((target_width, text_height), Image.Resampling.BICUBIC)
    center_x = WIDTH // 2
    mask.paste(glyph, (round(center_x - target_width / 2), round(center_y - text_height / 2)))

    # The bars stop before the lettering, as in the garage wall sketch.
    gap = 44
    left_end = center_x - target_width / 2 - gap
    right_start = center_x + target_width / 2 + gap
    # Stay well inside the visible frontal wall; the side-wall seams converge inward.
    bar_y = center_y - 4
    draw.rectangle((360, bar_y - 10, left_end, bar_y + 9), fill=245)
    draw.rectangle((right_start, bar_y - 10, WIDTH - 360, bar_y + 9), fill=245)
    return mask.filter(ImageFilter.GaussianBlur(0.55))


def render(label: str, color: tuple[int, int, int], slug: str, variant: str, minimum_width: int, center_y: int, font_size: int | None = None) -> None:
    paint = paint_mask(label, minimum_width, center_y, font_size)
    left, top, right, bottom = paint.getbbox()
    assert left >= 350 and right <= 1820 and top >= 185 and bottom <= 425, (slug, variant, paint.getbbox())
    mask = np.asarray(paint, dtype=np.float32) / 255
    wall = np.asarray(BASE.convert("L"), dtype=np.float32)
    soft_wall = np.asarray(BASE.convert("L").filter(ImageFilter.GaussianBlur(11)), dtype=np.float32)
    rng = np.random.default_rng(62401)
    grain = rng.normal(0, 10, BASE.size[::-1])
    chips = rng.random(BASE.size[::-1]) < 0.026
    cracks = wall < soft_wall - 8

    # Existing concrete pits erase pigment; the same wall lighting modulates it.
    alpha = (155 + np.clip((wall - soft_wall) * 4, -75, 32) + grain) * mask
    alpha *= np.where(cracks, 0.62, 1)
    alpha *= np.where(chips, 0.42, 1)
    alpha = np.uint8(np.clip(alpha, 0, 205))
    light = np.clip(0.76 + wall / 220, 0.78, 1.13)
    rgb = np.empty((HEIGHT, WIDTH, 3), dtype=np.uint8)
    for channel, value in enumerate(color):
        rgb[:, :, channel] = np.uint8(np.clip(value * light, 0, 255))
    rgb[alpha == 0] = 0
    result = Image.fromarray(np.dstack((rgb, alpha)), "RGBA")
    suffix = "" if variant == "desktop" else f"-{variant}"
    result.save(ASSETS / f"garage-wall-{slug}{suffix}.png", optimize=True)


if __name__ == "__main__":
    for slug, (label, color) in TIER_ART.items():
        slug = slug.lower() if label.isascii() else slug
        font_size = 225 if any(ord(c) > 127 for c in label) else 265
        for variant, minimum_width in (("desktop", 520), ("mid", 650), ("mobile", 950)):
            render(label, color, slug, variant, minimum_width, 307, font_size=font_size)
    render("META", TIER_ART["META"][1], "meta", "tall-preview", 0, 307, font_size=285)
