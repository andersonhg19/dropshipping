<?php
/**
 * D'MIKA — La memoria: los datos que necesita.
 *
 * Dos piezas diminutas de marcado. Toda la logica vive en assets/js/memoria.js
 * porque lo recordado esta EN EL NAVEGADOR de cada persona: no hay cuenta, no
 * hay cookie de seguimiento y el servidor no se entera de nada.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * En la ficha: los datos de la prenda, para que el JS pueda apuntarla.
 *
 * Van en atributos de un elemento vacio y no en una variable de JavaScript
 * porque asi se escapan con las funciones de WordPress y no hay que montar un
 * JSON a mano en la pagina.
 */
add_action('woocommerce_after_single_product', function () {
    global $product;
    if (!$product instanceof WC_Product) {
        return;
    }

    $id = $product->get_image_id();

    printf(
        '<span data-dm-ficha="%1$s" data-dm-nombre="%2$s" data-dm-precio="%3$s" data-dm-img="%4$s" hidden></span>',
        esc_attr($product->get_id()),
        esc_attr($product->get_name()),
        // Texto plano, no el HTML de wc_price(): esto acaba en localStorage y
        // se vuelve a pintar con textContent. Guardar marcado ahi seria meter
        // HTML en un almacen del que luego hay que desconfiar.
        esc_attr(wp_strip_all_tags(wc_price($product->get_price()))),
        esc_url($id ? (string) wp_get_attachment_image_url($id, 'woocommerce_thumbnail') : '')
    );
});

/**
 * En la portada: el hueco donde va el saludo.
 *
 * Se pinta vacio y oculto. Si no hay nada recordado, el JS lo deja asi y no se
 * ve: mejor un hueco que no aparece que un bloque que dice "no has visto nada".
 */
function dm_memoria_hueco(): void
{
    echo '<section class="dm-memoria" data-dm-memoria hidden aria-label="Lo que estabas mirando"></section>';
}
