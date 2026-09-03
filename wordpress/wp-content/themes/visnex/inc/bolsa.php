<?php
/**
 * D'MIKA — La Bolsa.
 *
 * QUE CAMBIA
 * Anadir al carrito deja de ser "la pagina se recarga y apareces en otro sitio"
 * y pasa a ser un gesto: la prenda vuela hasta la bolsa, la bolsa se mueve, y
 * se abre un cajon con lo que llevas dentro.
 *
 * POR QUE IMPORTA MAS DE LO QUE PARECE
 * En una tienda de verdad, meter algo en la bolsa NO te echa a la calle. Sigues
 * dentro, mirando. Mandar a alguien a la pagina del carrito en cuanto pulsa
 * "anadir" es justo lo contrario: corta el recorrido en el mejor momento, y la
 * mitad de la gente ya no vuelve a la tienda — paga o se va.
 *
 * Con el cajon, se ve lo que llevas, se cierra y se sigue donde se estaba.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* =============================================================================
   1. EL CAJON
   ============================================================================= */

/**
 * El contenido del cajon. Se pinta aparte porque se vuelve a pedir por AJAX
 * cada vez que cambia el carrito.
 */
function dm_bolsa_contenido(): void
{
    if (!function_exists('WC') || !WC()->cart) {
        return;
    }

    $carrito = WC()->cart;
    $items   = $carrito->get_cart();

    if (empty($items)) :
        /*
         * EL VACIO NO ES UN CALLEJON.
         *
         * "Tu carrito esta vacio" y un boton es lo que hace todo el mundo, y es
         * un final: quien llega ahi no tiene nada que hacer salvo irse. En una
         * tienda, si entras con la bolsa vacia, alguien te ensena cosas.
         */
        ?>
        <div class="dm-bolsa__vacia">
            <span class="dm-bolsa__vicono" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M6 7h12l-1 13H7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>
                </svg>
            </span>
            <p class="dm-bolsa__vtexto">Todavía no has metido nada.</p>
            <button class="dm-bolsa__vboton" type="button" data-dm-asesor-abrir>
                ¿Te ayudo a elegir?
            </button>
            <a class="dm-bolsa__vlink" href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">
                O mira la tienda entera
            </a>
        </div>
        <?php
        return;
    endif;
    ?>

    <ul class="dm-bolsa__lista">
        <?php foreach ($items as $clave => $item) :
            $p = $item['data'];
            if (!$p || !$p->exists() || $item['quantity'] <= 0) {
                continue;
            }
            ?>
            <li class="dm-bolsa__item">
                <a class="dm-bolsa__foto" href="<?php echo esc_url($p->get_permalink($item)); ?>">
                    <?php echo $p->get_image('woocommerce_thumbnail'); ?>
                </a>
                <div class="dm-bolsa__datos">
                    <span class="dm-bolsa__n"><?php echo esc_html($p->get_name()); ?></span>
                    <?php
                    // Talla, color y demas: lo que eligio, para que no tenga que
                    // abrir la ficha para comprobarlo.
                    $meta = wc_get_formatted_cart_item_data($item, true);
                    if ($meta) {
                        echo '<span class="dm-bolsa__meta">' . wp_kses_post($meta) . '</span>';
                    }
                    ?>
                    <span class="dm-bolsa__linea">
                        <span class="dm-bolsa__cant"><?php echo (int) $item['quantity']; ?> ×</span>
                        <?php echo wp_kses_post(WC()->cart->get_product_price($p)); ?>
                    </span>
                </div>
                <a class="dm-bolsa__quitar"
                   href="<?php echo esc_url(wc_get_cart_remove_url($clave)); ?>"
                   data-dm-quitar="<?php echo esc_attr($clave); ?>"
                   aria-label="Quitar <?php echo esc_attr($p->get_name()); ?>">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                        <path d="M5 5l14 14M19 5L5 19"/>
                    </svg>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>

    <div class="dm-bolsa__pie">
        <?php
        /*
         * El envio se dice AQUI y no solo en el pago.
         *
         * El coste de envio que aparece de golpe al final es la primera causa de
         * carritos abandonados. Si es gratis, se dice antes; si falta poco para
         * que lo sea, se dice cuanto.
         */
        $minimo = 150000;
        $suma   = (float) $carrito->get_subtotal();
        if ($suma >= $minimo) : ?>
            <p class="dm-bolsa__envio dm-bolsa__envio--ok">Envío gratis incluido.</p>
        <?php else :
            $falta = $minimo - $suma; ?>
            <p class="dm-bolsa__envio">
                Te faltan <strong><?php echo wp_kses_post(wc_price($falta)); ?></strong> para el envío gratis.
                <span class="dm-bolsa__barra" aria-hidden="true">
                    <span style="width: <?php echo (float) min(100, ($suma / $minimo) * 100); ?>%"></span>
                </span>
            </p>
        <?php endif; ?>

        <p class="dm-bolsa__total">
            <span>Total</span>
            <strong><?php echo wp_kses_post($carrito->get_cart_subtotal()); ?></strong>
        </p>

        <a class="dm-bolsa__pagar" href="<?php echo esc_url(wc_get_checkout_url()); ?>">
            Finalizar compra
        </a>
        <a class="dm-bolsa__ver" href="<?php echo esc_url(wc_get_cart_url()); ?>">Ver la bolsa completa</a>

        <p class="dm-bolsa__promesa">
            Pagas cuando llega. Cambio de talla gratis durante 30 días.
        </p>
    </div>
    <?php
}

/** El cajon, en todas las paginas. */
add_action('wp_footer', function () {
    if (is_admin() || !function_exists('WC') || !WC()->cart) {
        return;
    }
    ?>
    <div class="dm-bolsa" id="dm-bolsa" hidden>
        <div class="dm-bolsa__velo" data-dm-bolsa-cerrar></div>
        <aside class="dm-bolsa__caja" role="dialog" aria-modal="true" aria-label="Tu bolsa">
            <header class="dm-bolsa__cab">
                <h2 class="dm-bolsa__titulo">Tu bolsa</h2>
                <button class="dm-bolsa__x" type="button" data-dm-bolsa-cerrar aria-label="Cerrar la bolsa">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                        <path d="M5 5l14 14M19 5L5 19"/>
                    </svg>
                </button>
            </header>
            <div class="dm-bolsa__cuerpo" data-dm-bolsa-cuerpo>
                <?php dm_bolsa_contenido(); ?>
            </div>
        </aside>
    </div>
    <?php
}, 6);

/* =============================================================================
   2. EL CONTENIDO, POR AJAX
   ============================================================================= */

/**
 * Devuelve el cajon repintado y cuantas prendas hay.
 *
 * Se usa despues de anadir o quitar: asi el cajon se actualiza sin recargar y
 * sin que el navegador pierda el sitio donde estaba.
 */
function dm_bolsa_refrescar(): void
{
    check_ajax_referer('dm_bolsa', 'nonce');

    if (!function_exists('WC') || !WC()->cart) {
        wp_send_json_error(['mensaje' => 'El carrito no está disponible.'], 500);
    }

    // Sin esto los totales pueden venir de una peticion anterior.
    WC()->cart->calculate_totals();

    ob_start();
    dm_bolsa_contenido();

    wp_send_json_success([
        'html'  => ob_get_clean(),
        'total' => WC()->cart->get_cart_contents_count(),
    ]);
}
add_action('wp_ajax_dm_bolsa', 'dm_bolsa_refrescar');
add_action('wp_ajax_nopriv_dm_bolsa', 'dm_bolsa_refrescar');

/**
 * Quitar una prenda sin recargar.
 */
function dm_bolsa_quitar(): void
{
    check_ajax_referer('dm_bolsa', 'nonce');

    $clave = sanitize_text_field($_POST['clave'] ?? '');
    if ($clave === '' || !WC()->cart->get_cart_item($clave)) {
        wp_send_json_error(['mensaje' => 'Esa prenda ya no está en la bolsa.'], 404);
    }

    WC()->cart->remove_cart_item($clave);
    WC()->cart->calculate_totals();

    ob_start();
    dm_bolsa_contenido();

    wp_send_json_success([
        'html'  => ob_get_clean(),
        'total' => WC()->cart->get_cart_contents_count(),
    ]);
}
add_action('wp_ajax_dm_bolsa_quitar', 'dm_bolsa_quitar');
add_action('wp_ajax_nopriv_dm_bolsa_quitar', 'dm_bolsa_quitar');

add_action('wp_enqueue_scripts', function () {
    if (!wp_script_is('visnex-bolsa', 'enqueued')) {
        return;
    }
    wp_localize_script('visnex-bolsa', 'DM_BOLSA', [
        'url'      => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('dm_bolsa'),
        'anadirWc' => function_exists('WC') ? WC_AJAX::get_endpoint('add_to_cart') : '',
    ]);
}, 100);
