"""
D'MIKA — Extrae y vectoriza las piezas del logo aprobado.

Salidas (en brand/vector/):
    monograma.svg        D negra + M dorada, tal cual se aprobo
    monograma-oro.svg     las dos piezas en oro, para fondo oscuro
    monograma-solido.svg  una sola pieza (union), para favicon y sellos
    logotipo.svg          la palabra D'MIKA
    filete.svg            el divisor con el rombo
    bajada.svg            CLOTHING FOR EVERY YOU
"""
import os
import cv2
import numpy as np
from trazar import trazar

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(AQUI, 'fuente', 'logo-principal.jpeg')
SALIDA = os.path.join(AQUI, 'vector')
os.makedirs(SALIDA, exist_ok=True)

# Ampliar ANTES de umbralizar: el borde de una letra en JPEG es un degradado
# de 2-3 px, y al ampliar el umbral cae dentro de el con precision de un
# tercio de pixel.
ESC = 3
im = cv2.imread(FUENTE)
im = cv2.resize(im, None, fx=ESC, fy=ESC, interpolation=cv2.INTER_LANCZOS4)
b, g, r = [im[:, :, i].astype(int) for i in range(3)]

NEGRO = (r < 110) & (g < 110) & (b < 110)
ORO = (r > 130) & (r < 240) & (g > 95) & (g < 200) & (b < 145) & ((r - b) > 45)


def limpia(m, cerrar=3, abrir=2):
    """El JPEG deja motas y mordiscos en los bordes: se cierran los agujeros
    de un par de pixeles y se borran las islas sueltas."""
    m = m.astype(np.uint8)
    if cerrar:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (cerrar, cerrar))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
    if abrir:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (abrir, abrir))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
    return m.astype(bool)


def recorte(m, caja):
    """caja en coordenadas del ORIGINAL (x0,y0,x1,y1)."""
    x0, y0, x1, y1 = [v * ESC for v in caja]
    out = np.zeros_like(m)
    out[y0:y1, x0:x1] = m[y0:y1, x0:x1]
    return out


def caja_de(*mascaras):
    u = np.zeros_like(mascaras[0])
    for m in mascaras:
        u |= m
    ys, xs = np.where(u)
    return xs.min(), ys.min(), xs.max(), ys.max()


def svg(trazados_por_color, ancho, alto, extra=''):
    cuerpo = ''
    for color, lista in trazados_por_color:
        if not lista:
            continue
        d = ' '.join(lista)
        cuerpo += f'<path fill="{color}" fill-rule="evenodd" d="{d}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {ancho:.0f} {alto:.0f}" {extra}>{cuerpo}</svg>')


def normaliza(mascaras, alto_destino=1000.0, tol=2.2):
    """Escala el conjunto para que su alto sea `alto_destino`, conservando la
    posicion relativa de las piezas entre si."""
    x0, y0, x1, y1 = caja_de(*mascaras)
    escala = alto_destino / (y1 - y0 + 1)
    ancho = (x1 - x0 + 1) * escala
    return escala, (x0, y0), ancho, alto_destino


# ===========================================================================
# 1. MONOGRAMA
# ===========================================================================
CAJA_MONO = (455, 255, 800, 595)
d_negra = limpia(recorte(NEGRO, CAJA_MONO))
m_oro = limpia(recorte(ORO, CAJA_MONO))

esc, desp, W, H = normaliza([d_negra, m_oro])
tz_d = trazar(d_negra, tolerancia=2.4, escala=esc, desplaza=desp, min_area=120)
tz_m = trazar(m_oro, tolerancia=2.4, escala=esc, desplaza=desp, min_area=120)

# Orden: la D primero, la M encima. Es como esta en el original — el oro tapa
# el asta de la D donde se cruzan, y esa superposicion ES el logo.
open(os.path.join(SALIDA, 'monograma.svg'), 'w', encoding='utf-8').write(
    svg([('#171717', tz_d), ('#B99A5E', tz_m)], W, H))

# Sobre negro las DOS piezas van en oro, no una en oro y otra en marfil.
# Comprobado muestreando la etiqueta colgante real: ahi no hay un solo pixel
# marfil, solo tonos dorados (#C0A878, #D8C090, #F0D8A8...). La diferencia
# entre la D y la M la hace el brillo del foil, no un cambio de tinta. En
# plano se reproduce con dos tonos del mismo oro: el champagne de la paleta
# para la D y un champagne mas claro -tomado de la propia etiqueta- para la M.
open(os.path.join(SALIDA, 'monograma-oro.svg'), 'w', encoding='utf-8').write(
    svg([('#B99A5E', tz_d), ('#D8C090', tz_m)], W, H))

# Version de una sola tinta: se traza la UNION, no las dos piezas juntas. Si
# se superpusieran dos trazados del mismo color con evenodd, la zona comun se
# perforaria y saldria un agujero justo donde se cruzan.
union = limpia(d_negra | m_oro, cerrar=5)
tz_u = trazar(union, tolerancia=2.4, escala=esc, desplaza=desp, min_area=120)
open(os.path.join(SALIDA, 'monograma-solido.svg'), 'w', encoding='utf-8').write(
    svg([('currentColor', tz_u)], W, H))

print(f'monograma: D {len(tz_d)} trazados, M {len(tz_m)}, union {len(tz_u)}')

# ===========================================================================
# 2. LOGOTIPO  D'MIKA
# ===========================================================================
CAJA_LOGO = (180, 650, 1080, 830)
palabra = limpia(recorte(NEGRO, CAJA_LOGO), cerrar=3, abrir=2)
esc, desp, W, H = normaliza([palabra], alto_destino=200.0)
tz = trazar(palabra, tolerancia=1.6, escala=esc, desplaza=desp, min_area=25)
open(os.path.join(SALIDA, 'logotipo.svg'), 'w', encoding='utf-8').write(
    svg([('currentColor', tz)], W, H))
print(f'logotipo: {len(tz)} trazados, ancho {W:.0f}')

# ===========================================================================
# 3. FILETE con el rombo
# ===========================================================================
CAJA_FILETE = (400, 855, 850, 900)
filete = limpia(recorte(ORO, CAJA_FILETE), cerrar=3, abrir=1)
esc, desp, W, H = normaliza([filete], alto_destino=40.0)
tz = trazar(filete, tolerancia=0.8, escala=esc, desplaza=desp, min_area=6)
open(os.path.join(SALIDA, 'filete.svg'), 'w', encoding='utf-8').write(
    svg([('currentColor', tz)], W, H))
print(f'filete: {len(tz)} trazados, ancho {W:.0f}')

# ===========================================================================
# 4. BAJADA
# ===========================================================================
CAJA_BAJADA = (330, 925, 920, 960)
bajada = limpia(recorte(NEGRO, CAJA_BAJADA), cerrar=2, abrir=1)
esc, desp, W, H = normaliza([bajada], alto_destino=60.0)
tz = trazar(bajada, tolerancia=0.7, escala=esc, desplaza=desp, min_area=4)
open(os.path.join(SALIDA, 'bajada.svg'), 'w', encoding='utf-8').write(
    svg([('currentColor', tz)], W, H))
print(f'bajada: {len(tz)} trazados, ancho {W:.0f}')

print('\ntamanos:')
for f in sorted(os.listdir(SALIDA)):
    if f.endswith('.svg'):
        print(f'  {f:26} {os.path.getsize(os.path.join(SALIDA, f)) / 1024:6.1f} KB')
