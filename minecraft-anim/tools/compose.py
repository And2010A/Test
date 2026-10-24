#!/usr/bin/env python3
"""Assemble rendered band frames into the final 9:16 edit with audio.

Usage:
    python3 tools/compose.py edit/intro.json <frames_dir> out/intro.mp4

Layout follows the reference edit: the render sits in a band across the middle, the same image
zoomed, blurred and colour-split fills the top and bottom; Minecraft-style pixel subtitles are typed
out at the bottom of the band; a white flash marks cuts.
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, "assets", "fonts", "Tiny5.ttf")
FONT_SIZE = 40          # Tiny5 pixels are 1/8 em -> 5 screen px per font pixel, stays crisp
PX = FONT_SIZE // 8
TEXT = (255, 255, 255)
SHADOW = (62, 62, 72)   # Minecraft draws text with a darker copy one font pixel down-right
OUTLINE = (40, 40, 52, 120)


def band_background(band, size):
    """Zoomed, blurred, slightly dimmed copy of the band with an RGB split, filling the frame."""
    W, H = size
    split = 9
    Wp = W + 4 * split  # work wider so the channel shift never wraps around the frame edge
    scale = H / band.height
    bg = band.resize((int(band.width * scale), H), Image.BILINEAR)
    x0 = (bg.width - Wp) // 2
    bg = bg.crop((x0, 0, x0 + Wp, H))
    small = bg.resize((Wp // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(7))
    bg = small.resize((Wp, H), Image.BILINEAR)
    bg = ImageEnhance.Color(bg).enhance(0.75)
    bg = ImageEnhance.Brightness(bg).enhance(0.9)
    r, g, b = bg.split()
    r = ImageChops.offset(r, -split, 0)
    b = ImageChops.offset(b, split, 0)
    return Image.merge("RGB", (r, g, b)).crop((2 * split, 0, 2 * split + W, H))


LEAD = 0.06  # show each word a hair before it is sung, never after


def typed(line, t):
    """The line as typed so far: every word appears letter by letter while it is being sung."""
    text, pos = line["text"], 0
    shown = 0
    for wd in line["words"]:
        at = text.find(wd["w"], pos)
        if at < 0:
            continue
        pos = at + len(wd["w"])
        st = wd["start"] - LEAD
        if t < st:
            break
        k = min(1.0, (t - st) / max(0.05, min(0.3, wd["end"] - wd["start"])))
        shown = at + max(1, round(len(wd["w"]) * k))
        if k >= 1:  # include trailing punctuation once the word is complete
            while shown < len(text) and not text[shown].isspace() and not text[shown].isalnum():
                shown += 1
    return text[:shown]


def draw_subtitle(frame, text, center_x, baseline_y, font):
    if not text:
        return
    layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = d.textlength(text, font=font)
    x = int(center_x - w / 2) // PX * PX
    y = baseline_y // PX * PX
    # Soft dark outline so white text still reads over the white backdrop.
    for dx in (-PX, 0, PX):
        for dy in (-PX, 0, PX):
            d.text((x + dx, y + dy), text, font=font, fill=OUTLINE)
    layer = layer.filter(ImageFilter.GaussianBlur(PX * 0.8))
    d = ImageDraw.Draw(layer)
    d.text((x + PX, y + PX), text, font=font, fill=SHADOW + (255,))
    d.text((x, y), text, font=font, fill=TEXT + (255,))
    frame.alpha_composite(layer)


def main():
    edit_path, frames_dir, out_path = sys.argv[1:4]
    edit = json.load(open(edit_path, encoding="utf-8"))
    W, H = edit["size"]
    bw, bh = edit["band"]
    fps = edit["fps"]
    start, end = edit["start"], edit["end"]
    band_y = (H - bh) // 2
    font = ImageFont.truetype(FONT, FONT_SIZE)
    frames = sorted(f for f in os.listdir(frames_dir) if f.endswith(".png"))

    enc = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
        "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", os.path.join(ROOT, edit["audio"]),
        "-map", "0:v", "-map", "1:a",
        "-af", f"afade=t=in:d=0.05,afade=t=out:st={end - start - 0.25:.3f}:d=0.25",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out_path,
    ], stdin=subprocess.PIPE)

    for i, name in enumerate(frames):
        T = start + i / fps
        band = Image.open(os.path.join(frames_dir, name)).convert("RGB").resize((bw, bh))
        frame = band_background(band, (W, H)).convert("RGBA")
        frame.paste(band, (0, band_y))

        lines = edit["lines"]
        for k, line in enumerate(lines):
            shown_from = line["words"][0]["start"] - LEAD
            shown_to = lines[k + 1]["words"][0]["start"] - LEAD if k + 1 < len(lines) else end
            if shown_from <= T < shown_to:
                draw_subtitle(frame, typed(line, T), W // 2, band_y + bh - 92, font)

        flash = 0.0
        for ft in edit.get("flashes", []):
            dt = T - ft
            if -0.07 <= dt < 0:
                flash = max(flash, 0.5 * (1 + dt / 0.07))
            elif 0 <= dt < 0.4:
                flash = max(flash, 0.75 * (1 - dt / 0.4) ** 2)
        if flash > 0:
            frame = Image.blend(frame, Image.new("RGBA", frame.size, (255, 255, 255, 255)), flash)

        enc.stdin.write(frame.convert("RGB").tobytes())
        if i % 30 == 0:
            print(f"compose {i}/{len(frames)}", end="\r", flush=True)
    enc.stdin.close()
    enc.wait()
    print(f"wrote {out_path} ({len(frames)} frames)")


if __name__ == "__main__":
    main()
