from raster import render
from PIL import Image, ImageDraw

NEGRO=(0x17,0x17,0x17); ORO=(0xB9,0x9A,0x5E); MARFIL=(0xF4,0xEF,0xE7); BLANCO=(255,255,255)

D  = ("M28,30 H112 C156,30 178,68 178,120 C178,172 156,210 112,210 H28 V202 "
      "L40,196 V44 L28,38 Z "
      "M68,41 V199 H108 C138,199 148,168 148,120 C148,72 138,41 108,41 Z")
M  = "M78,174 V66 H93 L108,120 L123,66 H138 V174 H126 V104 L114,152 H102 L90,104 V174 Z"

# Compacto para <=32px: M mas robusta, sin filete
Mc = "M74,178 V62 H92 L108,124 L124,62 H142 V178 H128 V100 L115,148 H101 L88,100 V178 Z"

variantes = [
    ("principal", MARFIL, [(D,NEGRO,None,0),(M,None,MARFIL,14),(M,ORO,None,0)]),
    ("negativo",  NEGRO,  [(D,MARFIL,None,0),(M,None,NEGRO,14),(M,ORO,None,0)]),
    ("oro",       NEGRO,  [(D,ORO,None,0),(M,None,NEGRO,14),(M,MARFIL,None,0)]),
    ("mono-neg",  MARFIL, [(D,NEGRO,None,0),(M,None,MARFIL,14),(M,NEGRO,None,0)]),
    ("compacto",  MARFIL, [(D,NEGRO,None,0),(Mc,None,MARFIL,16),(Mc,ORO,None,0)]),
]
for n, bg, shapes in variantes:
    render(shapes, 206, 240, 2.6, bg, f'final-{n}.png')

hoja = Image.new('RGB', (1660, 760), (250,248,244))
dr = ImageDraw.Draw(hoja)
etq = ["Principal","Negativo","Oro sobre negro","Monocromo","Compacto (<=32px)"]
for i, (n, _, _) in enumerate(variantes):
    g = Image.open(f'final-{n}.png')
    hoja.paste(g, (40 + i*325, 40))
    dr.text((40 + i*325, 690), etq[i], fill=(0x6F,0x5A,0x4A))
# prueba de reduccion con el compacto
comp = Image.open('final-compacto.png'); prin = Image.open('final-principal.png')
for j, px in enumerate([48, 32, 24, 16]):
    hoja.paste(prin.resize((px,int(px*240/206)), Image.LANCZOS), (40 + j*90, 710))
    hoja.paste(comp.resize((px,int(px*240/206)), Image.LANCZOS), (440 + j*90, 710))
dr.text((40, 700), "principal reducido", fill=(0x6F,0x5A,0x4A))
dr.text((440, 700), "compacto reducido", fill=(0x6F,0x5A,0x4A))
hoja.save('final-sistema.png')
print('ok')
