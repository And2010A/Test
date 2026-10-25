#!/usr/bin/env python3
"""Rebuild a usable skin PNG from a lossy copy (JPEG screenshot, no transparency).

Usage:
    python3 tools/clean_skin.py in.jpg skins/out.png [--colors 20] [--bg 255,255,255] [--bg-tol 40]

- snaps every pixel to a small palette, undoing JPEG colour bleeding between skin pixels;
- outer-layer pixels close to the background colour become transparent (the JPEG lost alpha);
- parts of the 64x64 layout that no model face uses become transparent; the base layer stays opaque.
"""
import argparse
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_bbmodel import box_faces  # noqa: E402

# (base uv, overlay uv, size w,h,d) for classic arms; slim arms only change the arm width.
PARTS = [
    ((0, 0), (32, 0), (8, 8, 8)),       # head / hat
    ((16, 16), (16, 32), (8, 12, 4)),   # body / jacket
    ((40, 16), (40, 32), (4, 12, 4)),   # right arm / sleeve
    ((32, 48), (48, 48), (4, 12, 4)),   # left arm / sleeve
    ((0, 16), (0, 32), (4, 12, 4)),     # right leg / pants
    ((16, 48), (0, 48), (4, 12, 4)),    # left leg / pants
]


def rect_pixels(r):
    x1, y1, x2, y2 = r
    for y in range(min(y1, y2), max(y1, y2)):
        for x in range(min(x1, x2), max(x1, x2)):
            yield x, y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--colors", type=int, default=20)
    ap.add_argument("--bg", default="255,255,255")
    ap.add_argument("--bg-tol", type=float, default=40)
    args = ap.parse_args()
    bg = tuple(int(v) for v in args.bg.split(","))

    src = Image.open(args.src).convert("RGB")
    if src.size != (64, 64):
        src = src.resize((64, 64), Image.NEAREST)

    base, over = set(), set()
    for buv, ouv, (w, h, d) in PARTS:
        for r in box_faces(*buv, w, h, d).values():
            base.update(rect_pixels(r))
        for r in box_faces(*ouv, w, h, d).values():
            over.update(rect_pixels(r))

    near_bg = lambda c: sum((a - b) ** 2 for a, b in zip(c, bg)) ** 0.5 < args.bg_tol
    # Palette from the pixels that will actually be visible.
    visible = [p for p in base] + [p for p in over if not near_bg(src.getpixel(p))]
    sample = Image.new("RGB", (len(visible), 1))
    sample.putdata([src.getpixel(p) for p in visible])
    pal = sample.quantize(colors=args.colors, method=Image.Quantize.MEDIANCUT)
    snapped = src.quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")

    out = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    for p in base:
        out.putpixel(p, snapped.getpixel(p) + (255,))
    for p in over:
        if not near_bg(src.getpixel(p)):
            out.putpixel(p, snapped.getpixel(p) + (255,))
    out.save(args.out)
    print(f"{args.out}: {len(base)} base px, {sum(1 for p in over if out.getpixel(p)[3])} outer-layer px kept")


if __name__ == "__main__":
    main()
