#!/usr/bin/env python3
"""Regenerate pipeline.worker.js and plates.js from the h-figures build.
Register's preview must be the same instrument as h-specimens, not a lookalike;
these two files are copied verbatim and never hand-edited."""
import re, sys, pathlib
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1
    else '/Users/juliacompton/Downloads/about-lab/about-lab/archive/h-figures-01-one-object-at-a-time.html')
out = pathlib.Path(__file__).parent
s = SRC.read_text()
hdr = (f"/* Extracted VERBATIM from {SRC.name}.\n"
       "   Do not hand-edit: the point of the preview is that it is the same instrument.\n"
       "   Regenerate with extract-pipeline.py. */\n")
(out/'pipeline.worker.js').write_text(hdr + re.search(r'<script id="wk" type="text/plain">(.*?)</script>', s, re.S).group(1).strip() + "\n")
(out/'plates.js').write_text(hdr + re.findall(r'<script>(.*?)</script>', s, re.S)[0].strip() + "\n")
print('wrote pipeline.worker.js + plates.js')
