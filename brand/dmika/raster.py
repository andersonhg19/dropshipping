"""Rasterizador minimo para revisar el monograma: solo lo que uso (M/H/V/L/C/Z)."""
import re, sys
from PIL import Image, ImageDraw

def bez(p0, p1, p2, p3, n=48):
    out = []
    for i in range(1, n + 1):
        t = i / n
        u = 1 - t
        out.append((
            u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
            u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1],
        ))
    return out

def parse(d):
    """Devuelve lista de subpaths (listas de puntos)."""
    toks = re.findall(r'[MmHhVvLlCcZz]|-?\d*\.?\d+', d)
    subs, cur, pt, i = [], [], (0.0, 0.0), 0
    cmd = None
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t; i += 1
            if cmd in 'Zz':
                if cur: subs.append(cur); cur = []
                continue
        n = lambda k: float(toks[i + k])
        if cmd == 'M':
            pt = (n(0), n(1)); i += 2
            if cur: subs.append(cur)
            cur = [pt]
        elif cmd == 'L':
            pt = (n(0), n(1)); i += 2; cur.append(pt)
        elif cmd == 'H':
            pt = (n(0), pt[1]); i += 1; cur.append(pt)
        elif cmd == 'V':
            pt = (pt[0], n(0)); i += 1; cur.append(pt)
        elif cmd == 'C':
            c1, c2, e = (n(0), n(1)), (n(2), n(3)), (n(4), n(5)); i += 6
            cur.extend(bez(pt, c1, c2, e)); pt = e
        else:
            i += 1
    if cur: subs.append(cur)
    return subs

def render(shapes, w, h, scale, bg, out):
    """shapes: [(pathdata, fill_rgb_or_None, stroke_rgb_or_None, stroke_w)]"""
    S = 4  # supersampling
    img = Image.new('RGB', (int(w*scale*S), int(h*scale*S)), bg)
    dr = ImageDraw.Draw(img)
    for d, fill, stroke, sw in shapes:
        subs = parse(d)
        pts = [[(x*scale*S, y*scale*S) for x, y in s] for s in subs]
        if fill is not None:
            # evenodd con dos subpaths: dibuja exterior, luego contra-forma en bg
            dr.polygon(pts[0], fill=fill)
            for extra in pts[1:]:
                dr.polygon(extra, fill=bg)
        if stroke is not None:
            for s in pts:
                dr.line(s + [s[0]], fill=stroke, width=int(sw*scale*S), joint='curve')
    return img.resize((int(w*scale), int(h*scale)), Image.LANCZOS).save(out)
