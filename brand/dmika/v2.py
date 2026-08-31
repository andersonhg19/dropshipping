from raster import render
from PIL import Image

NEGRO=(0x17,0x17,0x17); ORO=(0xB9,0x9A,0x5E); MARFIL=(0xF4,0xEF,0xE7)

# --- D: didone, astas gruesas, remates finos arriba y abajo ---
D = ("M40,30 H116 C158,30 184,68 184,120 C184,172 158,210 116,210 H40 Z "
     "M72,44 V196 H112 C142,196 152,168 152,120 C152,72 142,44 112,44 Z")

# A: entrelazado refinado — la M cruza el bol, contenida en el ancho de la D
MA = "M88,176 V78 H105 L135,142 L165,78 H182 V176 H169 V102 L141,164 H129 L101,102 V176 Z"

# B: contenida — la M vive dentro del contraforma de la D, sin cruzar
MB = "M84,168 V86 H99 L118,132 L137,86 H152 V168 H140 V110 L124,150 H112 L96,110 V168 Z"

# C: sello — monograma dentro de un ovalo (para sticker de empaque)
MC = "M92,172 V82 H108 L138,146 L168,82 H184 V172 H171 V106 L144,166 H132 L105,106 V172 Z"

for nombre, m, esc in [("A", MA, 2.0), ("B", MB, 2.0), ("C", MC, 2.0)]:
    render([(D, NEGRO, None, 0), (m, None, MARFIL, 13), (m, ORO, None, 0)],
           246, 240, esc, MARFIL, f'v2-{nombre}.png')

# hoja comparativa
hoja = Image.new('RGB', (1560, 620), MARFIL)
for i, n in enumerate("ABC"):
    g = Image.open(f'v2-{n}.png')
    hoja.paste(g, (40 + i*500, 30))
    # tamanos pequenos debajo
    for j, px in enumerate([64, 36, 22]):
        s = g.resize((px, int(px*240/246)), Image.LANCZOS)
        hoja.paste(s, (60 + i*500 + j*100, 530))
hoja.save('v2-comparativa.png')
print('ok')
