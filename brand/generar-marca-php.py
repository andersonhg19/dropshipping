"""
Genera wordpress/.../inc/marca.php a partir de los SVG trazados.

Se genera en vez de escribirse a mano porque los trazados son cadenas de varios
kilobytes: copiarlas a mano es como se acaba con una version del logo en el
tema y otra distinta en la carpeta de marca. Si el logo cambia, se vuelve a
correr extraer-logo.py y luego este.
"""
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
VEC = os.path.join(AQUI, 'vector')
DESTINO = os.path.abspath(os.path.join(
    AQUI, '..', 'wordpress', 'wp-content', 'themes', 'visnex', 'inc', 'marca.php'))


def lee(nombre):
    """Devuelve (viewBox_w, viewBox_h, [(color, d), ...])."""
    s = open(os.path.join(VEC, nombre), encoding='utf-8').read()
    vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', s)
    w, h = float(vb.group(1)), float(vb.group(2))
    piezas = re.findall(r'<path fill="([^"]+)"[^>]*d="([^"]+)"', s)
    return w, h, piezas


mw, mh, mono = lee('monograma.svg')
_, _, solido = lee('monograma-solido.svg')
lw, lh, logo = lee('logotipo.svg')
fw, fh, filete = lee('filete.svg')
bw, bh, bajada = lee('bajada.svg')

d_negra = next(d for c, d in mono if c == '#171717')
m_oro = next(d for c, d in mono if c == '#B99A5E')
d_solido = solido[0][1]
d_logo = logo[0][1]
d_filete = filete[0][1]
d_bajada = bajada[0][1]

php = f'''<?php
/**
 * Marca D'MIKA — piezas vectoriales.
 *
 * DE DONDE SALEN ESTOS TRAZADOS
 * Del logo aprobado, calcado. No estan dibujados a mano ni son una fuente
 * parecida: se obtienen trazando el contorno real de los pixeles del original
 * (brand/fuente/logo-principal.jpeg) con brand/trazar.py, que ajusta curvas de
 * Bezier cubicas por el algoritmo de Schneider.
 *
 * Aqui hubo un error que conviene no repetir: antes este archivo llevaba un
 * monograma REDIBUJADO a ojo, con la M metida dentro del hueco de la D. En el
 * logo de verdad la M va SUPERPUESTA y su serif izquierdo sobresale del asta.
 * Se parecia, pero no era el logo. Un logo aprobado no se interpreta: se calca.
 *
 * Este archivo SE GENERA. No editarlo a mano:
 *     python brand/extraer-logo.py && python brand/generar-marca-php.py
 *
 * Va como SVG en linea y no como <img> a proposito: hereda el color del
 * contexto, no anade una peticion y no parpadea al cargar.
 *
 * Contraste medido: el Dorado Champagne (#B99A5E) da 2,34:1 sobre marfil, asi
 * que NO puede llevar texto sobre claro; sobre negro da 6,70:1 y ahi si.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* Monograma. Retícula {mw:.0f} x {mh:.0f}. */
const DM_D       = '{d_negra}';
const DM_M       = '{m_oro}';
/* Una sola pieza: es la UNION de las dos, no las dos superpuestas. Con
   fill-rule evenodd, dos trazados del mismo color perforarian justo la zona
   donde se cruzan y saldria un agujero en medio del monograma. */
const DM_SOLIDO  = '{d_solido}';
const DM_VB      = '0 0 {mw:.0f} {mh:.0f}';
const DM_RATIO   = {mw / mh:.4f};

/* Logotipo. Retícula {lw:.0f} x {lh:.0f}. */
const DM_PALABRA    = '{d_logo}';
const DM_PALABRA_VB = '0 0 {lw:.0f} {lh:.0f}';
const DM_PALABRA_R  = {lw / lh:.4f};

/* Filete con el rombo. */
const DM_FILETE    = '{d_filete}';
const DM_FILETE_VB = '0 0 {fw:.0f} {fh:.0f}';
const DM_FILETE_R  = {fw / fh:.4f};

/* Bajada: CLOTHING FOR EVERY YOU. */
const DM_BAJADA    = '{d_bajada}';
const DM_BAJADA_VB = '0 0 {bw:.0f} {bh:.0f}';
const DM_BAJADA_R  = {bw / bh:.4f};

/**
 * Monograma.
 *
 * @param int    $px    Alto en pixeles.
 * @param string $sobre 'claro' | 'oscuro'.
 * @param bool   $mono  true para una sola tinta (favicon, bordado, sello).
 */
function dm_monograma(int $px = 32, string $sobre = 'claro', bool $mono = false): string
{{
    $w = (int) round($px * DM_RATIO);

    if ($mono) {{
        $cuerpo = '<path fill="currentColor" fill-rule="evenodd" d="' . DM_SOLIDO . '"/>';
    }} elseif ($sobre === 'oscuro') {{
        // Sobre negro las DOS piezas van en oro. Comprobado muestreando la
        // etiqueta colgante real: no hay un solo pixel marfil, solo tonos
        // dorados. Lo que separa la D de la M ahi es el brillo del foil, y en
        // plano se reproduce con dos tonos del mismo oro.
        $cuerpo = '<path fill="#B99A5E" fill-rule="evenodd" d="' . DM_D . '"/>'
                . '<path fill="#D8C090" fill-rule="evenodd" d="' . DM_M . '"/>';
    }} else {{
        // El orden importa: la D primero y la M encima. Esa superposicion ES
        // el logo — el oro tapa el asta de la D donde se cruzan.
        $cuerpo = '<path fill="#171717" fill-rule="evenodd" d="' . DM_D . '"/>'
                . '<path fill="#B99A5E" fill-rule="evenodd" d="' . DM_M . '"/>';
    }}

    return sprintf(
        '<svg class="dm-mono" viewBox="%s" width="%d" height="%d" role="img" aria-label="D\\'MIKA" focusable="false">%s</svg>',
        DM_VB, $w, $px, $cuerpo
    );
}}

/** La palabra D'MIKA, con sus letras reales (no una fuente parecida). */
function dm_palabra(int $px = 22, string $color = 'currentColor'): string
{{
    return sprintf(
        '<svg class="dm-palabra" viewBox="%s" width="%d" height="%d" role="img" aria-label="D\\'MIKA" focusable="false" style="color:%s">'
        . '<path fill="currentColor" fill-rule="evenodd" d="%s"/></svg>',
        DM_PALABRA_VB, (int) round($px * DM_PALABRA_R), $px, esc_attr($color), DM_PALABRA
    );
}}

/** Bloqueo horizontal: monograma + palabra. El de la cabecera y el pie. */
function dm_logotipo(int $px = 30, string $sobre = 'claro', bool $con_lema = false): string
{{
    $tinta = $sobre === 'oscuro' ? 'var(--dm-marfil)' : 'var(--dm-negro)';

    $html  = '<span class="dm-logo" style="display:inline-flex;align-items:center;gap:.5em">';
    $html .= dm_monograma($px, $sobre);
    $html .= '<span class="dm-logo__texto" style="display:flex;flex-direction:column;align-items:center;gap:.3em">';
    $html .= dm_palabra((int) round($px * 0.72), $tinta);

    if ($con_lema) {{
        $html .= dm_bajada((int) round($px * 0.2), $sobre === 'oscuro' ? 'var(--dm-oro)' : 'var(--dm-oro-tinta)');
    }}

    $html .= '</span></span>';
    return $html;
}}

/** Bajada: CLOTHING FOR EVERY YOU, tambien calcada. */
function dm_bajada(int $px = 8, string $color = 'currentColor'): string
{{
    return sprintf(
        '<svg class="dm-bajada" viewBox="%s" width="%d" height="%d" aria-hidden="true" focusable="false" style="color:%s">'
        . '<path fill="currentColor" fill-rule="evenodd" d="%s"/></svg>',
        DM_BAJADA_VB, (int) round($px * DM_BAJADA_R), $px, esc_attr($color), DM_BAJADA
    );
}}

/** Divisor de marca: el filete con el rombo, calcado del original. */
function dm_divisor(string $sobre = 'claro', int $px = 12): string
{{
    return sprintf(
        '<span class="dm-divisor" aria-hidden="true" style="display:block;color:var(--dm-oro)">'
        . '<svg viewBox="%s" width="%d" height="%d" focusable="false">'
        . '<path fill="currentColor" fill-rule="evenodd" d="%s"/></svg></span>',
        DM_FILETE_VB, (int) round($px * DM_FILETE_R), $px, DM_FILETE
    );
}}

/* -----------------------------------------------------------------------------
   La cabecera vive en inc/cabecera.php, que desmonta la de Storefront entera.
   Aqui solo quedan las piezas de marca reutilizables y el favicon.
   -------------------------------------------------------------------------- */

/** Favicon: la version de una tinta, que es la que aguanta a 16 px. */
add_action('wp_head', function () {{
    $svg = str_replace(
        'currentColor', '#171717',
        dm_monograma(64, 'claro', true)
    );
    echo '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,'
        . base64_encode($svg) . '">' . "\\n";
}}, 2);
'''

open(DESTINO, 'w', encoding='utf-8').write(php)
print(f'generado {DESTINO}')
print(f'  {len(php) / 1024:.1f} KB')
print(f'  monograma {mw:.0f}x{mh:.0f}  palabra {lw:.0f}x{lh:.0f}  '
      f'filete {fw:.0f}x{fh:.0f}  bajada {bw:.0f}x{bh:.0f}')
