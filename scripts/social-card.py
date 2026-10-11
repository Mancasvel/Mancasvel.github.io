"""Reproduce the sharing image from the existing portrait (Pillow required)."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT_ROOT = Path('C:/Windows/Fonts')
image = Image.new('RGB', (1200, 630), '#f7f8f4')
portrait = ImageOps.fit(Image.open(ROOT / 'assets/manuel-castillejo.webp'), (414, 552))
image.paste(portrait, (710, 39))
draw = ImageDraw.Draw(image)

def font(size, bold=False):
    return ImageFont.truetype(str(FONT_ROOT / ('arialbd.ttf' if bold else 'arial.ttf')), size)

draw.text((50, 57), 'MANUEL CASTILLEJO', font=font(19, True), fill='#4f625d')
for y, text in [(148, 'Building software.'), (217, 'Understanding'), (286, 'people.')]:
    draw.text((48, y), text, font=font(48, True), fill='#172b2a')
draw.text((50, 412), 'Product builder & technology lead', font=font(23), fill='#4f625d')
draw.text((50, 466), 'Creator of FlowSight', font=font(24, True), fill='#145d51')
draw.text((50, 565), 'mancasvel.github.io', font=font(19), fill='#4f625d')
image.save(ROOT / 'assets/social-card.jpg', quality=90)
