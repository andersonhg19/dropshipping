<?php
/**
 * Ficha de producto.
 *
 * La ficha es la pagina donde se decide la compra y estaba casi vacia: titulo,
 * precio pequeño, una linea de descripcion, tallas y un boton. Sin migas, sin
 * contraentrega, sin composicion, sin guia de tallas y sin nada que responda a
 * las dudas que hacen abandonar.
 *
 * Lo que se añade aqui responde a una duda concreta cada cosa:
 *   - "¿tengo que pagar ya?"        -> aviso de contraentrega bajo el boton
 *   - "¿cuando llega?"              -> plazos por zona, con el envio gratis
 *   - "¿y si no me queda?"          -> cambios y retracto, en el acordeon
 *   - "¿de que esta hecho?"         -> composicion y cuidados de la marquilla
 *   - "¿que talla soy?"             -> guia de tallas junto al selector
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* -----------------------------------------------------------------------------
   Migas de pan
   -------------------------------------------------------------------------- */

add_action('woocommerce_before_single_product_summary', function () {
    if (!is_product()) {
        return;
    }
    global $product;
    $tienda = wc_get_page_permalink('shop');
    $terminos = get_the_terms(get_the_ID(), 'product_cat');
    $cat = (!is_wp_error($terminos) && !empty($terminos)) ? $terminos[0] : null;
    ?>
    <nav class="vn-migas" aria-label="Migas de pan">
        <a href="<?php echo esc_url(home_url('/')); ?>">Inicio</a>
        <span aria-hidden="true">/</span>
        <a href="<?php echo esc_url($tienda); ?>">Tienda</a>
        <?php if ($cat) : ?>
            <span aria-hidden="true">/</span>
            <a href="<?php echo esc_url(get_term_link($cat)); ?>"><?php echo esc_html($cat->name); ?></a>
        <?php endif; ?>
        <span aria-hidden="true">/</span>
        <span class="vn-migas__actual"><?php echo esc_html(get_the_title()); ?></span>
    </nav>
    <?php
}, 4);

/* -----------------------------------------------------------------------------
   Guia de tallas junto al selector
   -------------------------------------------------------------------------- */

// Un SOLO enganche. Antes estaba en 'before_variations_form' y en
// 'before_add_to_cart_form': en un producto variable disparan LOS DOS, asi que
// la cabecera salia dos veces y, con la etiqueta nativa de WooCommerce debajo,
// "Talla" aparecia TRES veces seguidas.
add_action('woocommerce_before_add_to_cart_form', 'visnex_enlace_guia_tallas', 5);

function visnex_enlace_guia_tallas(): void
{
    static $pintada = false;

    global $product;
    if ($pintada || !$product || !$product->get_attribute('pa_talla')) {
        return;
    }
    $pintada = true;   // red de seguridad por si el hook se dispara dos veces
    ?>
    <div class="vn-ficha__tallas-cab">
        <span class="vn-ficha__tallas-etq">Talla</span>
        <button type="button" class="vn-ficha__guia" data-vn-guia-tallas
                aria-expanded="false" aria-controls="vn-guia-tallas">
            Guía de tallas
        </button>
    </div>
    <?php
}

/* -----------------------------------------------------------------------------
   Contraentrega y plazos, justo bajo el boton
   -------------------------------------------------------------------------- */

add_action('woocommerce_after_add_to_cart_form', function () {
    ?>
    <div class="vn-ficha__promesas">
        <div class="vn-ficha__promesa vn-ficha__promesa--destacada">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span><strong>Pago contra entrega en Colombia.</strong> Pagas en efectivo cuando lo recibas; no adelantas nada.</span>
        </div>
        <div class="vn-ficha__promesa">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="1.5" y="6" width="14" height="11" rx="1"/><path d="M15.5 9.5H19l3 3v4.5h-6.5" stroke-linejoin="round"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
            <span><strong>Envío gratis desde $150.000.</strong> Bogotá 1&ndash;2 días, ciudades principales 2&ndash;3, resto del país 3&ndash;5.</span>
        </div>
        <div class="vn-ficha__promesa">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><polyline points="1,4 1,10 7,10" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span><strong>Cambios en 30 días</strong> y derecho de retracto de 5 días hábiles.</span>
        </div>
    </div>
    <?php
}, 15);

/* -----------------------------------------------------------------------------
   Acordeones de detalle
   -------------------------------------------------------------------------- */

add_action('woocommerce_after_add_to_cart_form', function () {
    global $product;
    if (!$product) {
        return;
    }

    // Composicion: la de la marquilla de D'MIKA, salvo que el producto traiga
    // un atributo propio.
    $composicion = $product->get_attribute('pa_composicion') ?: '95% algodón · 5% elastano';
    $sku = $product->get_sku();

    $bloques = [
        [
            'titulo' => 'Descripción',
            'abierto' => true,
            'html' => wpautop(wp_kses_post($product->get_description() ?: $product->get_short_description())),
        ],
        [
            'titulo' => 'Composición y cuidados',
            'html' => '<ul class="vn-ficha__lista">'
                . '<li><strong>Composición:</strong> ' . esc_html($composicion) . '</li>'
                . '<li><strong>Origen:</strong> Hecho en Colombia</li>'
                . '<li>Lavar en ciclo suave con colores similares</li>'
                . '<li>No usar blanqueador</li>'
                . '<li>Secar a la sombra</li>'
                . '<li>Planchar a baja temperatura</li>'
                . ($sku ? '<li><strong>Referencia:</strong> ' . esc_html($sku) . '</li>' : '')
                . '</ul>',
        ],
        [
            'titulo' => 'Envíos y entregas',
            'html' => '<table class="vn-ficha__tabla"><tbody>'
                . '<tr><th scope="row">Bogotá y alrededores</th><td>1 a 2 días hábiles</td></tr>'
                . '<tr><th scope="row">Ciudades principales</th><td>2 a 3 días hábiles</td></tr>'
                . '<tr><th scope="row">Resto del país</th><td>3 a 5 días hábiles</td></tr>'
                . '<tr><th scope="row">España</th><td>4 a 7 días hábiles</td></tr>'
                . '</tbody></table>'
                . '<p>Envío gratis en pedidos desde $150.000. Los plazos se cuentan desde que confirmamos el pedido.</p>',
        ],
        [
            'titulo' => 'Cambios y devoluciones',
            'html' => '<p>Tienes <strong>30 días</strong> para cambiar la prenda si no ha sido usada y conserva sus etiquetas. '
                . 'Además, la ley te da <strong>5 días hábiles de retracto</strong> desde la entrega, sin dar explicaciones.</p>'
                . '<p><a href="' . esc_url(home_url('/politica-de-devoluciones/')) . '">Leer la política completa</a></p>',
        ],
    ];
    ?>
    <div class="vn-ficha__detalle">
        <?php foreach ($bloques as $b) :
            if (trim(wp_strip_all_tags($b['html'])) === '') {
                continue;
            } ?>
            <details<?php echo !empty($b['abierto']) ? ' open' : ''; ?>>
                <summary><?php echo esc_html($b['titulo']); ?></summary>
                <div class="vn-ficha__detalle-cuerpo"><?php echo wp_kses_post($b['html']); ?></div>
            </details>
        <?php endforeach; ?>
    </div>

    <!-- Guía de tallas: se abre desde el enlace junto al selector -->
    <div class="vn-guia" id="vn-guia-tallas" hidden>
        <div class="vn-guia__velo" data-vn-cerrar-guia></div>
        <div class="vn-guia__caja" role="dialog" aria-modal="true" aria-labelledby="vn-guia-titulo">
            <div class="vn-guia__cab">
                <h2 id="vn-guia-titulo">Guía de tallas</h2>
                <button type="button" data-vn-cerrar-guia aria-label="Cerrar">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
                </button>
            </div>
            <div class="vn-guia__cuerpo">
                <p>Medidas de la prenda en centímetros. Si estás entre dos tallas, elige la mayor.</p>
                <table class="vn-ficha__tabla">
                    <thead><tr><th scope="col">Talla</th><th scope="col">Pecho</th><th scope="col">Cintura</th><th scope="col">Cadera</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">XS</th><td>82&ndash;86</td><td>62&ndash;66</td><td>88&ndash;92</td></tr>
                        <tr><th scope="row">S</th><td>86&ndash;90</td><td>66&ndash;70</td><td>92&ndash;96</td></tr>
                        <tr><th scope="row">M</th><td>90&ndash;95</td><td>70&ndash;75</td><td>96&ndash;101</td></tr>
                        <tr><th scope="row">L</th><td>95&ndash;100</td><td>75&ndash;81</td><td>101&ndash;106</td></tr>
                        <tr><th scope="row">XL</th><td>100&ndash;106</td><td>81&ndash;87</td><td>106&ndash;112</td></tr>
                    </tbody>
                </table>
                <p class="vn-guia__nota">
                    ¿Dudas con la talla? Escríbenos por WhatsApp antes de pedir: preferimos
                    resolverlo ahora que gestionarte un cambio después.
                </p>
            </div>
        </div>
    </div>
    <?php
}, 20);

/* -----------------------------------------------------------------------------
   El enlace "Limpiar" de las variaciones
   -------------------------------------------------------------------------- */

/**
 * WooCommerce lo pinta como <a href="#">, que es un enlace muerto: no lleva a
 * ninguna parte y solo funciona por JavaScript. Semanticamente es un BOTON.
 * Cambiarlo quita el aviso de la auditoria y mejora el teclado y el lector de
 * pantalla, sin tocar el comportamiento (la clase reset_variations es la que
 * escucha WooCommerce).
 */
add_filter('woocommerce_reset_variations_link', function () {
    return '<button type="button" class="reset_variations vn-reset-variaciones">Limpiar selección</button>';
});

/**
 * Pista bajo el botón mientras no hay talla elegida.
 *
 * El botón deshabilitado, por bien dibujado que esté, no dice POR QUÉ está
 * deshabilitado. Una línea lo resuelve, y desaparece sola al elegir.
 */
add_action('woocommerce_after_add_to_cart_button', function () {
    global $product;
    if (!$product || !$product->get_attribute('pa_talla')) {
        return;
    }
    echo '<span class="vn-ficha__pista-talla" data-vn-pista-talla>Elige una talla para continuar</span>';
});
