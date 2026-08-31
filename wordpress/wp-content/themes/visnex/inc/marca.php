<?php
/**
 * Marca D'MIKA: monograma vectorial y bloqueos de logotipo.
 *
 * El monograma va como SVG inline y no como <img> a proposito: hereda el color
 * del contexto, no dispara una peticion mas y no parpadea al cargar la pagina.
 *
 * Reglas que impone este archivo, todas medidas:
 *   - Por debajo de 40 px se usa la version COMPACTA (M mas robusta, filete mas
 *     ancho). Por debajo de 24 px el monograma completo se empasta.
 *   - El Dorado Champagne (#B99A5E) da 2,34:1 sobre marfil: NO puede llevar
 *     texto sobre fondo claro. Sobre negro da 6,70:1 y ahi si.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/** Trazados del monograma. Retícula 206 x 240. */
const DM_PATH_D  = 'M28,30 H112 C156,30 178,68 178,120 C178,172 156,210 112,210 H28 V202 L40,196 V44 L28,38 Z M68,41 V199 H108 C138,199 148,168 148,120 C148,72 138,41 108,41 Z';
const DM_PATH_M  = 'M78,174 V66 H93 L108,120 L123,66 H138 V174 H126 V104 L114,152 H102 L90,104 V174 Z';
const DM_PATH_MC = 'M74,178 V62 H92 L108,124 L124,62 H142 V178 H128 V100 L115,148 H101 L88,100 V178 Z';

/**
 * Devuelve el monograma como SVG inline.
 *
 * @param int    $px    Ancho en pixeles. Por debajo de 40 conmuta a compacto.
 * @param string $sobre 'claro' | 'oscuro'  — de que fondo se recorta el filete.
 * @param bool   $mono  true para una sola tinta (bordado, sello seco).
 */
function dm_monograma(int $px = 32, string $sobre = 'claro', bool $mono = false): string
{
    $compacto = $px < 40;
    $m        = $compacto ? DM_PATH_MC : DM_PATH_M;
    $filete   = $compacto ? 16 : 14;

    $oscuro   = $sobre === 'oscuro';
    $tinta    = $oscuro ? '#F4EFE7' : '#171717';
    $fondo    = $oscuro ? '#171717' : '#F4EFE7';
    $acento   = $mono ? $tinta : '#B99A5E';

    return sprintf(
        '<svg class="dm-mono" viewBox="0 0 206 240" width="%1$d" height="%2$d" role="img" aria-label="D\'MIKA" focusable="false">'
        . '<path fill="%3$s" fill-rule="evenodd" d="%4$s"/>'
        . '<path fill="none" stroke="%5$s" stroke-width="%6$d" stroke-linejoin="round" d="%7$s"/>'
        . '<path fill="%8$s" d="%7$s"/>'
        . '</svg>',
        $px,
        (int) round($px * 240 / 206),
        esc_attr($tinta),
        esc_attr(DM_PATH_D),
        esc_attr($fondo),
        $filete,
        esc_attr($m),
        esc_attr($acento)
    );
}

/**
 * Bloqueo de logotipo horizontal: monograma + palabra.
 * Es el de la cabecera y el pie.
 */
function dm_logotipo(int $px = 30, string $sobre = 'claro', bool $con_lema = false): string
{
    $oscuro = $sobre === 'oscuro';
    $tinta  = $oscuro ? 'var(--dm-marfil)' : 'var(--dm-negro)';

    $html  = '<span class="dm-logo" style="display:inline-flex;align-items:center;gap:.42em">';
    $html .= dm_monograma($px, $sobre);
    $html .= '<span class="dm-logo__texto" style="display:flex;flex-direction:column;gap:.12em">';
    $html .= '<span class="dm-logo__palabra" style="font-family:var(--vn-font-serif);'
           . 'font-size:' . round($px * 0.92) . 'px;letter-spacing:.13em;line-height:1;color:' . $tinta . '">D&#8217;MIKA</span>';

    if ($con_lema) {
        // El lema en script solo sobre oscuro: en oro sobre claro no se lee.
        $color = $oscuro ? 'var(--dm-oro)' : 'var(--dm-oro-tinta)';
        $html .= '<span class="dm-logo__lema" style="font-family:var(--vn-font-script);'
               . 'font-size:' . round($px * 0.56) . 'px;line-height:1;color:' . $color . '">Clothing for every you</span>';
    }

    $html .= '</span></span>';
    return $html;
}

/** Divisor de marca: filete, rombo, filete. */
function dm_divisor(string $sobre = 'claro'): string
{
    $color = $sobre === 'oscuro' ? 'var(--dm-oro)' : 'var(--dm-oro)';
    return '<span class="dm-divisor" aria-hidden="true" style="display:flex;align-items:center;gap:.75em;width:100%;max-width:260px">'
        . '<span style="flex:1;height:1px;background:' . $color . '"></span>'
        . '<svg viewBox="0 0 24 24" width="11" height="11" style="fill:' . $color . '" focusable="false">'
        . '<path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/></svg>'
        . '<span style="flex:1;height:1px;background:' . $color . '"></span>'
        . '</span>';
}

/* -----------------------------------------------------------------------------
   La cabecera vive en inc/cabecera.php, que desmonta la de Storefront entera.
   Aqui solo quedan las piezas de marca reutilizables y el favicon.
   -------------------------------------------------------------------------- */

/** Favicon y icono de pantalla: la version compacta, que es la que aguanta. */
add_action('wp_head', function () {
    $svg = dm_monograma(64, 'claro');
    $uri = 'data:image/svg+xml;base64,' . base64_encode($svg);
    echo '<link rel="icon" type="image/svg+xml" href="' . esc_attr($uri) . '">' . "\n";
}, 2);
