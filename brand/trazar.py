"""
D'MIKA — Vectorizador del logo original.

QUE HACE Y POR QUE ASI
----------------------
Toma el logo tal cual lo aprobo el cliente (un JPEG) y lo convierte en curvas.
NO redibuja nada: traza el contorno real de los pixeles que hay en la imagen.

Esa distincion es justo la que se fallo antes. Redibujar "a ojo" un monograma
produce algo que se le parece pero no es; y un logo aprobado no se interpreta,
se calca.

COMO
  1. La imagen se amplia x3 con Lanczos antes de separar colores. El borde de
     una letra en un JPEG no es un escalon: es un degradado de 2-3 pixeles con
     los artefactos del propio JPEG. Al ampliar primero, el umbral cae dentro
     de ese degradado con precision de un tercio de pixel, y el contorno sale
     bastante mas fiel.
  2. Se separan dos mascaras por color -negro y dorado- porque son dos piezas
     que se dibujan por separado y se superponen.
  3. Se limpian con morfologia: el JPEG deja motas sueltas alrededor del texto.
  4. Se sacan los contornos CON JERARQUIA, para conservar los huecos (el ojo de
     la D, los contraformas de la A y la O del logotipo).
  5. Cada contorno se parte en esquinas y cada tramo se ajusta con curvas de
     Bezier cubicas por el algoritmo de Schneider (Graphics Gems, 1990). Es lo
     que usan los vectorizadores serios: ajusta, mide el error mayor y si se
     pasa parte por ahi y repite.

El resultado es un SVG de unos pocos kilobytes que se ve nitido a cualquier
tamano, en vez de un JPEG de 89 KB con fondo crema pegado.
"""
import cv2
import numpy as np

# ---------------------------------------------------------------------------
# Ajuste de curvas de Bezier (Schneider)
# ---------------------------------------------------------------------------

def q(ctrl, t):
    """Punto de una Bezier cubica en t."""
    mt = 1 - t
    return (mt**3 * ctrl[0] + 3 * mt**2 * t * ctrl[1]
            + 3 * mt * t**2 * ctrl[2] + t**3 * ctrl[3])


def normaliza(v):
    n = np.hypot(*v)
    return v / n if n > 1e-12 else v


def parametriza(pts):
    """Parametrizacion por longitud de cuerda: reparte t segun la distancia
    recorrida, no segun el indice. Sin esto, un tramo con puntos apretados en
    una curva y sueltos en una recta sale deformado."""
    d = np.concatenate([[0.0], np.cumsum(np.hypot(*np.diff(pts, axis=0).T))])
    return d / d[-1] if d[-1] > 0 else d


def genera_bezier(pts, u, t1, t2):
    """Ajuste por minimos cuadrados con las tangentes de los extremos fijas."""
    n = len(pts)
    A = np.zeros((n, 2, 2))
    mt = 1 - u
    A[:, 0] = np.outer(3 * mt**2 * u, t1)
    A[:, 1] = np.outer(3 * mt * u**2, t2)

    C = np.zeros((2, 2))
    X = np.zeros(2)
    base = (np.outer(mt**3 + 3 * mt**2 * u, pts[0])
            + np.outer(3 * mt * u**2 + u**3, pts[-1]))
    tmp = pts - base

    C[0, 0] = np.sum(A[:, 0] * A[:, 0])
    C[0, 1] = C[1, 0] = np.sum(A[:, 0] * A[:, 1])
    C[1, 1] = np.sum(A[:, 1] * A[:, 1])
    X[0] = np.sum(A[:, 0] * tmp)
    X[1] = np.sum(A[:, 1] * tmp)

    det = C[0, 0] * C[1, 1] - C[1, 0] * C[0, 1]
    if abs(det) < 1e-12:
        # Degenerado: se reparte en tercios, que es el mejor apano razonable.
        d = np.hypot(*(pts[-1] - pts[0])) / 3.0
        return [pts[0], pts[0] + t1 * d, pts[-1] + t2 * d, pts[-1]]

    a1 = (X[0] * C[1, 1] - X[1] * C[0, 1]) / det
    a2 = (C[0, 0] * X[1] - C[1, 0] * X[0]) / det
    seg = np.hypot(*(pts[-1] - pts[0]))
    if a1 < 1e-6 or a2 < 1e-6:
        a1 = a2 = seg / 3.0
    return [pts[0], pts[0] + t1 * a1, pts[-1] + t2 * a2, pts[-1]]


def error_maximo(pts, ctrl, u):
    d = np.array([q(ctrl, t) for t in u]) - pts
    e = np.sum(d * d, axis=1)
    i = int(np.argmax(e))
    return e[i], i


def reparametriza(pts, ctrl, u):
    """Newton-Raphson: acerca cada t al punto mas proximo de la curva."""
    out = []
    for p, t in zip(pts, u):
        d1 = 3 * ((1 - t)**2 * (ctrl[1] - ctrl[0])
                  + 2 * (1 - t) * t * (ctrl[2] - ctrl[1])
                  + t**2 * (ctrl[3] - ctrl[2]))
        d2 = 6 * ((1 - t) * (ctrl[2] - 2 * ctrl[1] + ctrl[0])
                  + t * (ctrl[3] - 2 * ctrl[2] + ctrl[1]))
        dif = q(ctrl, t) - p
        num = np.dot(dif, d1)
        den = np.dot(d1, d1) + np.dot(dif, d2)
        out.append(t if abs(den) < 1e-12 else np.clip(t - num / den, 0, 1))
    return np.array(out)


def ajusta_cubicas(pts, t1, t2, tolerancia, prof=0):
    """Devuelve una lista de Bezier cubicas que aproximan `pts`."""
    if len(pts) < 2:
        return []
    if len(pts) == 2:
        d = np.hypot(*(pts[1] - pts[0])) / 3.0
        return [[pts[0], pts[0] + t1 * d, pts[1] + t2 * d, pts[1]]]

    u = parametriza(pts)
    ctrl = genera_bezier(pts, u, t1, t2)
    err, split = error_maximo(pts, ctrl, u)

    if err < tolerancia:
        return [ctrl]

    # Cuatro pasadas de reparametrizacion antes de rendirse y partir: casi
    # siempre bastan y ahorran nodos, que es lo que hace pesado un trazado.
    if err < tolerancia * 4 and prof < 12:
        for _ in range(4):
            u = reparametriza(pts, ctrl, u)
            ctrl = genera_bezier(pts, u, t1, t2)
            err, split = error_maximo(pts, ctrl, u)
            if err < tolerancia:
                return [ctrl]

    if prof > 14 or split <= 0 or split >= len(pts) - 1:
        return [ctrl]

    # Tangente en el punto de corte, suavizada con los vecinos.
    centro = normaliza(pts[split - 1] - pts[split + 1])
    izq = ajusta_cubicas(pts[:split + 1], t1, centro, tolerancia, prof + 1)
    der = ajusta_cubicas(pts[split:], -centro, t2, tolerancia, prof + 1)
    return izq + der


# ---------------------------------------------------------------------------
# Contornos -> trazado
# ---------------------------------------------------------------------------

def suaviza(pts, vueltas=2):
    """Media movil circular. Quita el dentado de escalera que deja el pixel
    sin llegar a redondear las esquinas de verdad (para eso esta el detector
    de esquinas, que corre despues sobre el original sin suavizar)."""
    p = pts.astype(float)
    for _ in range(vueltas):
        p = (np.roll(p, 1, axis=0) + 2 * p + np.roll(p, -1, axis=0)) / 4.0
    return p


def esquinas(pts, umbral_grados=48, salto=7):
    """Un vertice es esquina si el giro entre el tramo que entra y el que sale
    supera el umbral. `salto` mira algo lejos a proposito: mirando solo al
    vecino inmediato, el ruido de un pixel se confunde con una esquina."""
    n = len(pts)
    if n < salto * 3:
        return []
    a = pts - np.roll(pts, salto, axis=0)
    b = np.roll(pts, -salto, axis=0) - pts
    na = np.hypot(a[:, 0], a[:, 1])
    nb = np.hypot(b[:, 0], b[:, 1])
    ok = (na > 1e-9) & (nb > 1e-9)
    cos = np.ones(n)
    cos[ok] = np.clip(np.sum(a[ok] * b[ok], axis=1) / (na[ok] * nb[ok]), -1, 1)
    ang = np.degrees(np.arccos(cos))

    cand = np.where(ang > umbral_grados)[0]
    # De cada racha de candidatos se queda el mas anguloso.
    fin = []
    for c in cand:
        if fin and c - fin[-1] < salto:
            if ang[c] > ang[fin[-1]]:
                fin[-1] = c
        else:
            fin.append(c)
    return fin


def contorno_a_trazado(cnt, tolerancia, escala, desplaza):
    pts = cnt.reshape(-1, 2).astype(float)
    if len(pts) < 8:
        return ''

    esq = esquinas(pts)
    sv = suaviza(pts)

    # Se parte en tramos por las esquinas; sin esquinas, el contorno entero.
    if len(esq) >= 2:
        tramos = [sv[esq[i]:esq[i + 1] + 1] for i in range(len(esq) - 1)]
        tramos.append(np.vstack([sv[esq[-1]:], sv[:esq[0] + 1]]))
    else:
        tramos = [np.vstack([sv, sv[:1]])]

    curvas = []
    for tr in tramos:
        if len(tr) < 2:
            continue
        t1 = normaliza(tr[1] - tr[0])
        t2 = normaliza(tr[-2] - tr[-1])
        curvas += ajusta_cubicas(tr, t1, t2, tolerancia)

    if not curvas:
        return ''

    def xy(p):
        return ((p[0] - desplaza[0]) * escala, (p[1] - desplaza[1]) * escala)

    def f(v):
        s = f'{v:.2f}'.rstrip('0').rstrip('.')
        return s if s not in ('-0', '') else '0'

    d = 'M' + ','.join(f(v) for v in xy(curvas[0][0]))
    for c in curvas:
        d += 'C' + ' '.join(','.join(f(v) for v in xy(p)) for p in c[1:])
    return d + 'Z'


def trazar(mascara, tolerancia=2.2, escala=1.0, desplaza=(0, 0), min_area=40):
    """Mascara booleana -> lista de trazados (los huecos ya salen con el
    sentido de giro contrario, que es lo que hace que `fill-rule: evenodd`
    los perfore sin tener que marcarlos)."""
    m = (mascara.astype(np.uint8)) * 255
    cnts, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cnts:
        if cv2.contourArea(c) < min_area:
            continue
        d = contorno_a_trazado(c, tolerancia, escala, desplaza)
        if d:
            out.append(d)
    return out
