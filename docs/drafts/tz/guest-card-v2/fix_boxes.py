"""Crop Chrome PDF pages to an exact size (mm), anchored top-left; set Trim/Bleed = Media."""
import sys, pikepdf
MM = 72/25.4
src, dst, w, h = sys.argv[1], sys.argv[2], float(sys.argv[3])*MM, float(sys.argv[4])*MM
pdf = pikepdf.open(src)
for p in pdf.pages:
    x0, y0, x1, y1 = [float(v) for v in p.mediabox]
    assert x1-x0 >= w-0.01 and y1-y0 >= h-0.01, (x1-x0, y1-y0)
    box = pikepdf.Array([x0, y1-h, x0+w, y1])
    p.MediaBox = p.CropBox = p.BleedBox = p.TrimBox = box
pdf.docinfo['/Title'] = sys.argv[5] if len(sys.argv) > 5 else 'PLACE'
pdf.save(dst)
