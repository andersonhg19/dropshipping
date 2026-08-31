from raster import render
from PIL import Image

D = "M40,30 H118 C160,30 182,70 182,120 C182,170 160,210 118,210 H40 Z M74,42 V198 H114 C142,198 152,170 152,120 C152,70 142,42 114,42 Z"
M = "M96,190 V60 H116 L151,138 L186,60 H206 V190 H192 V86 L158,162 H144 L110,86 V190 Z"

NEGRO = (0x17,0x17,0x17); ORO = (0xB9,0x9A,0x5E); MARFIL = (0xF4,0xEF,0xE7)

# Sobre marfil
render([(D, NEGRO, None, 0), (M, None, MARFIL, 11), (M, ORO, None, 0)],
       246, 240, 2.0, MARFIL, 'v1-marfil.png')
# Sobre negro
render([(D, MARFIL, None, 0), (M, None, NEGRO, 11), (M, ORO, None, 0)],
       246, 240, 2.0, NEGRO, 'v1-negro.png')

# Contacto: tamanos reales
sheet = Image.new('RGB', (760, 300), MARFIL)
big = Image.open('v1-marfil.png')
for i, px in enumerate([220, 96, 56, 32, 20]):
    s = big.resize((px, int(px*240/246)), Image.LANCZOS)
    sheet.paste(s, (24 + sum([220,96,56,32,20][:i]) + i*28, 40))
sheet.save('v1-tamanos.png')
print('ok')
