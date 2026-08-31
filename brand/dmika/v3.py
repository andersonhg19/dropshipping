from raster import render
from PIL import Image, ImageDraw

NEGRO=(0x17,0x17,0x17); ORO=(0xB9,0x9A,0x5E); MARFIL=(0xF4,0xEF,0xE7)

# D didone con serifas: asta gruesa (28), remates finos (11), pies acampanados
D = ("M28,30 H112 C156,30 178,68 178,120 C178,172 156,210 112,210 H28 V202 "
     "L40,196 V44 L28,38 Z "
     "M68,41 V199 H108 C138,199 148,168 148,120 C148,72 138,41 108,41 Z")

# A2 — M cruza el bol, contenida en el ancho de la D
A2 = "M80,178 V72 H97 L127,140 L157,72 H174 V178 H161 V98 L133,160 H121 L93,98 V178 Z"
# B2 — M contenida en el contraforma, mas grande
B2 = "M76,180 V70 H92 L108,124 L124,70 H140 V180 H128 V108 L114,158 H102 L88,108 V180 Z"
# D2 — asta compartida: la M nace de la asta de la D
D2 = "M68,182 L104,182 L104,104 L130,166 H142 L168,104 V182 H182 V62 H165 L136,132 L107,62 H68 Z"

for n, m in [("A2", A2), ("B2", B2), ("D2", D2)]:
    render([(D, NEGRO, None, 0), (m, None, MARFIL, 14), (m, ORO, None, 0)],
           206, 240, 2.4, MARFIL, f'v3-{n}.png')

hoja = Image.new('RGB', (1500, 700), MARFIL)
dr = ImageDraw.Draw(hoja)
for i, (n, etq) in enumerate([("A2","A · cruzada"), ("B2","B · contenida"), ("D2","D · asta compartida")]):
    g = Image.open(f'v3-{n}.png')
    hoja.paste(g, (60 + i*480, 30))
    dr.text((60 + i*480, 620), etq, fill=(0x6F,0x5A,0x4A))
    for j, px in enumerate([72, 40, 24]):
        s = g.resize((px, int(px*240/206)), Image.LANCZOS)
        hoja.paste(s, (60 + i*480 + j*110, 640))
hoja.save('v3-comparativa.png')
print('ok')
