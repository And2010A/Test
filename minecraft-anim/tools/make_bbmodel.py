#!/usr/bin/env python3
"""Build a Blockbench (.bbmodel) player model from a Minecraft skin PNG.

Usage:
    python3 tools/make_bbmodel.py skins/hero.png models/hero.bbmodel [--layers flat|3d] [--arms auto|classic|slim]

Coordinates follow Blockbench: the character faces north (-Z), its right side is +X,
1 unit = 1 skin pixel, feet at Y=0.

--layers flat  outer skin layer as slightly inflated boxes (like vanilla Minecraft)
--layers 3d    outer skin layer as one small voxel per pixel (like the "3D Skin Layers" mod)
"""
import argparse
import base64
import io
import json
import uuid

from PIL import Image


def uid():
    return str(uuid.uuid4())


def box_faces(u, v, w, h, d):
    """Minecraft box-UV layout -> Blockbench face UV rects [x1, y1, x2, y2]."""
    return {
        "east": [u, v + d, u + d, v + d + h],
        "north": [u + d, v + d, u + d + w, v + d + h],
        "west": [u + d + w, v + d, u + 2 * d + w, v + d + h],
        "south": [u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h],
        "up": [u + d + w, v + d, u + d, v],
        "down": [u + d + w, v, u + d + 2 * w, v + d],
    }


def cube(name, frm, to, origin, faces, inflate=0.0, box_uv=True, uv_offset=None):
    c = {
        "name": name,
        "box_uv": box_uv,
        "rescale": False,
        "locked": False,
        "light_emission": 0,
        "render_order": "default",
        "allow_mirror_modeling": True,
        "from": [round(x, 4) for x in frm],
        "to": [round(x, 4) for x in to],
        "autouv": 0,
        "color": 0,
        "inflate": inflate,
        "origin": origin,
        "faces": {k: {"uv": r, "texture": 0} for k, r in faces.items()},
        "type": "cube",
        "uuid": uid(),
    }
    if uv_offset is not None:
        c["uv_offset"] = uv_offset
    return c


def group(name, origin, children):
    return {
        "name": name,
        "origin": origin,
        "color": 0,
        "uuid": uid(),
        "export": True,
        "mirror_uv": False,
        "isOpen": True,
        "locked": False,
        "visibility": True,
        "autouv": 0,
        "children": children,
    }


def detect_slim(img):
    # Classic arms are 4 px wide; slim arms leave the last 2 columns of the right-arm
    # back face transparent.
    return all(img.getpixel((54 + dx, 20 + dy))[3] == 0 for dx in range(2) for dy in range(12))


# Face -> (axis normal, sign, in-plane axis for texture x, sign, in-plane axis for texture y, sign).
# Texture x/y run from the UV rect's (x1, y1) corner, matching the orientation of box_faces().
FACE_AXES = {
    "north": (2, -1, 0, -1, 1, -1),
    "south": (2, +1, 0, +1, 1, -1),
    "east": (0, +1, 2, -1, 1, -1),
    "west": (0, -1, 2, +1, 1, -1),
    "up": (1, +1, 0, +1, 2, +1),
    "down": (1, -1, 0, +1, 2, -1),
}


def voxel_layer(img, name, frm, to, origin, u, v, w, h, d, thickness):
    """One small cube per opaque pixel of the outer layer, sitting just outside the base box."""
    cubes = []
    lo, hi = list(frm), list(to)
    gap = 0.02
    for face, rect in box_faces(u, v, w, h, d).items():
        n_ax, n_sign, x_ax, x_sign, y_ax, y_sign = FACE_AXES[face]
        x1, y1, x2, y2 = rect
        tw, th = abs(x2 - x1), abs(y2 - y1)
        step_tx = 1 if x2 > x1 else -1
        step_ty = 1 if y2 > y1 else -1
        # Expand the shell so neighbouring faces meet at the edges.
        grow = gap + thickness
        x_len = hi[x_ax] - lo[x_ax]
        y_len = hi[y_ax] - lo[y_ax]
        px = (x_len + 2 * grow) / tw
        py = (y_len + 2 * grow) / th
        x_start = (lo[x_ax] - grow) if x_sign > 0 else (hi[x_ax] + grow)
        y_start = (lo[y_ax] - grow) if y_sign > 0 else (hi[y_ax] + grow)
        for j in range(th):
            for i in range(tw):
                tx = x1 + i * step_tx + (0 if step_tx > 0 else -1)
                ty = y1 + j * step_ty + (0 if step_ty > 0 else -1)
                if img.getpixel((tx, ty))[3] < 128:
                    continue
                a = [0.0, 0.0, 0.0]
                b = [0.0, 0.0, 0.0]
                xa = x_start + x_sign * i * px
                xb = xa + x_sign * px
                ya = y_start + y_sign * j * py
                yb = ya + y_sign * py
                a[x_ax], b[x_ax] = min(xa, xb), max(xa, xb)
                a[y_ax], b[y_ax] = min(ya, yb), max(ya, yb)
                if n_sign > 0:
                    a[n_ax], b[n_ax] = hi[n_ax] + gap, hi[n_ax] + gap + thickness
                else:
                    a[n_ax], b[n_ax] = lo[n_ax] - gap - thickness, lo[n_ax] - gap
                uvr = [tx, ty, tx + 1, ty + 1]
                faces = {f: uvr for f in FACE_AXES}
                cubes.append(cube(f"{name}_{face}_{i}_{j}", a, b, origin, faces, box_uv=False))
    return cubes


def build(img, slim, layers):
    aw = 3 if slim else 4
    # name, from, to, pivot, base uv, overlay uv, overlay inflate, voxel thickness
    parts = {
        "head": ([-4, 24, -4], [4, 32, 4], [0, 24, 0], (0, 0), (32, 0), 0.5, 1.0),
        "body": ([-4, 12, -2], [4, 24, 2], [0, 12, 0], (16, 16), (16, 32), 0.25, 0.5),
        "right_arm": ([4, 12, -2], [4 + aw, 24, 2], [5, 22, 0], (40, 16), (40, 32), 0.25, 0.5),
        "left_arm": ([-4 - aw, 12, -2], [-4, 24, 2], [-5, 22, 0], (32, 48), (48, 48), 0.25, 0.5),
        "right_leg": ([-0.1, 0, -2], [3.9, 12, 2], [1.9, 12, 0], (0, 16), (0, 32), 0.25, 0.5),
        "left_leg": ([-3.9, 0, -2], [0.1, 12, 2], [-1.9, 12, 0], (16, 48), (0, 48), 0.25, 0.5),
    }
    elements = []
    groups = {}
    for name, (frm, to, pivot, base_uv, over_uv, infl, thick) in parts.items():
        w, h, d = (to[0] - frm[0]), (to[1] - frm[1]), (to[2] - frm[2])
        w, h, d = round(w), round(h), round(d)
        base = cube(name, frm, to, pivot, box_faces(*base_uv, w, h, d), uv_offset=list(base_uv))
        elements.append(base)
        kids = [base["uuid"]]
        if layers == "flat":
            over = cube(name + "_layer", frm, to, pivot, box_faces(*over_uv, w, h, d),
                        inflate=infl, uv_offset=list(over_uv))
            elements.append(over)
            kids.append(over["uuid"])
        else:
            vox = voxel_layer(img, name + "_layer", frm, to, pivot, *over_uv, w, h, d, thick)
            elements.extend(vox)
            if vox:
                kids.append(group(name + "_layer", pivot, [c["uuid"] for c in vox]))
        groups[name] = group(name, pivot, kids)

    body = groups["body"]
    body["children"] += [groups["head"], groups["right_arm"], groups["left_arm"]]
    root = group("root", [0, 0, 0], [body, groups["right_leg"], groups["left_leg"]])
    return elements, [root]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("skin")
    ap.add_argument("out")
    ap.add_argument("--layers", choices=["flat", "3d"], default="flat")
    ap.add_argument("--arms", choices=["auto", "classic", "slim"], default="auto")
    args = ap.parse_args()

    img = Image.open(args.skin).convert("RGBA")
    if img.size != (64, 64):
        raise SystemExit(f"expected a 64x64 skin, got {img.size}")
    slim = detect_slim(img) if args.arms == "auto" else args.arms == "slim"

    elements, outliner = build(img, slim, args.layers)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    name = args.out.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    model = {
        "meta": {"format_version": "4.10", "model_format": "free", "box_uv": args.layers == "flat"},
        "name": name,
        "model_identifier": "",
        "visible_box": [1, 1, 0],
        "variable_placeholders": "",
        "variable_placeholder_buttons": [],
        "timeline_setups": [],
        "unhandled_root_fields": {},
        "resolution": {"width": 64, "height": 64},
        "elements": elements,
        "outliner": outliner,
        "textures": [{
            "path": "",
            "name": "skin.png",
            "folder": "",
            "namespace": "",
            "id": "0",
            "width": 64,
            "height": 64,
            "uv_width": 64,
            "uv_height": 64,
            "particle": False,
            "layers_enabled": False,
            "sync_to_project": "",
            "render_mode": "default",
            "render_sides": "auto",
            "frame_time": 1,
            "frame_order_type": "loop",
            "frame_order": "",
            "frame_interpolate": False,
            "visible": True,
            "internal": True,
            "saved": True,
            "uuid": uid(),
            "relative_path": "",
            "source": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode(),
        }],
        "animations": [],
    }
    with open(args.out, "w") as f:
        json.dump(model, f, indent=1)
    print(f"{args.out}: {len(elements)} cubes, arms={'slim' if slim else 'classic'}, layers={args.layers}")


if __name__ == "__main__":
    main()
