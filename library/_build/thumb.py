#!/usr/bin/env python3
"""library/_build/thumb.py: access copies of a picture, for collate.mjs and snap.mjs.

Reads a JSON list of jobs on stdin, [{"key", "src", "dst", "large"}], and for each writes
  <dst>.jpg       long edge 480 px at most
  <dst>-960.jpg   long edge 960 px at most, when "large" is true and the source is larger than the first copy
Nothing is enlarged. JPEG quality 90 with full chroma (4:4:4), so flat color edges stay sharp.

Prints one JSON object: key -> {"w", "h", "mw", "mh", "w2", "h2", "sig", "flat"}.
  mw, mh  the size of the source
  sig   a 24 x 24 contrast-normalized gray signature (base64), used to tell when two records show the same picture
  flat  true when the picture is a single flat field (a stage photographed before it drew)
Needs Pillow. Without it collate.mjs falls back to sips on macOS.
"""
import base64
import json
import sys

from PIL import Image, ImageFile, ImageOps, ImageStat

SMALL, LARGE = 480, 960


def fit(im, edge):
    w, h = im.size
    s = min(1.0, edge / max(w, h))
    if s == 1.0:
        return im
    # box-reduce first (reducing_gap): fine rulings and grain average out instead of folding into moiré
    return im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS, reducing_gap=2.0)


def save(im, path):
    # an optimized JPEG is encoded in one pass; give the encoder room for a noisy picture
    ImageFile.MAXBLOCK = max(ImageFile.MAXBLOCK, im.size[0] * im.size[1] * 4)
    im.save(path, "JPEG", quality=90, subsampling=0, optimize=True)


def one(src, dst, large):
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        ground = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(ground, im)
    im = im.convert("RGB")
    out = {}
    small = fit(im, SMALL)
    save(small, dst + ".jpg")
    out["w"], out["h"] = small.size
    out["mw"], out["mh"] = im.size
    if large and max(im.size) > max(small.size):
        large = fit(im, LARGE)
        save(large, dst + "-960.jpg")
        out["w2"], out["h2"] = large.size
    gray = im.convert("L")
    norm = ImageOps.autocontrast(gray.resize((96, 96), Image.LANCZOS)).resize((24, 24), Image.BOX)
    out["sig"] = base64.b64encode(norm.tobytes()).decode("ascii")
    out["flat"] = max(ImageStat.Stat(gray).stddev) < 1.5
    return out


def main():
    jobs = json.load(sys.stdin)
    res = {}
    for j in jobs:
        try:
            res[j["key"]] = one(j["src"], j["dst"], j.get("large", False))
        except Exception as err:  # one bad picture does not stop the build
            res[j["key"]] = {"error": str(err)}
    json.dump(res, sys.stdout)


if __name__ == "__main__":
    main()
