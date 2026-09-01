<?php
/**
 * VISNEX — Las tallas, como se eligen en una tienda de ropa.
 *
 * DOS PROBLEMAS QUE RESUELVE
 *
 * 1. EL ORDEN. WooCommerce ordenaba las tallas alfabéticamente: L, M, S, XL,
 *    XS. Eso no significa nada para nadie. Una talla no es una palabra, es una
 *    posición en una escala, y leerla desordenada obliga a pensar.
 *
 * 2. LA FORMA. Un desplegable esconde las tallas hasta que lo abres, así que no
 *    se puede ver de un vistazo qué hay disponible ni qué está agotado — y son
 *    las dos únicas preguntas que se hacen en ese momento. Con botones se ve
 *    todo a la vez, se acierta con el pulgar y lo agotado se lee tachado en vez
 *    de desaparecer, que además evita la pregunta "¿tenéis la M?".
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * El orden correcto de cada escala.
 *
 * Se compara sin acentos ni mayúsculas para que "Única" case con "unica".
 */
function visnex_orden_tallas(): array
{
    // Las alfabeticas ocupan la decena 1-9 y las numericas la 20-29 A PROPOSITO:
    // antes 'xs' y '28' valian los dos 1, asi que al ordenar quedaban
    // intercaladas — "28, XS, 30, S, 32, M..." — que es ilegible.
    return [
        'xxs' => 1, 'xs' => 2, 's' => 3, 'm' => 4, 'l' => 5, 'xl' => 6, 'xxl' => 7, '3xl' => 8,
        '26' => 20, '28' => 21, '30' => 22, '32' => 23, '34' => 24, '36' => 25, '38' => 26, '40' => 27,
        'unica' => 0,
    ];
}

/**
 * Ordena los términos de talla en toda consulta.
 *
 * Aqui habia ademas un add_filter('woocommerce_get_product_attributes', ...)
 * que se limitaba a devolver lo que recibia: no hacia nada, y encima ese
 * gancho esta obsoleto desde WooCommerce 3.0, asi que imprimia un aviso de
 * "Deprecated" VISIBLE dentro de la descripcion del producto. Retirado.
 */
add_filter('get_terms', function ($terminos, $taxonomias) {
    if (!in_array('pa_talla', (array) $taxonomias, true) || empty($terminos)) {
        return $terminos;
    }

    $orden = visnex_orden_tallas();

    usort($terminos, function ($a, $b) use ($orden) {
        $ka = strtolower(remove_accents(is_object($a) ? $a->name : (string) $a));
        $kb = strtolower(remove_accents(is_object($b) ? $b->name : (string) $b));
        return ($orden[$ka] ?? 99) <=> ($orden[$kb] ?? 99);
    });

    return $terminos;
}, 10, 2);

/**
 * Sustituye el desplegable por botones.
 *
 * Se conserva el `<select>` real, oculto: es el que WooCommerce lee al añadir
 * al carrito y el que valida. Los botones solo lo manejan. Así, si el
 * JavaScript falla, el desplegable sigue ahí y se puede comprar igual — y
 * quien navega con teclado usa el control nativo, que ya funciona.
 */
add_filter('woocommerce_dropdown_variation_attribute_options_html', function ($html, $args) {
    if ($args['attribute'] !== 'pa_talla') {
        return $html;
    }

    $producto = $args['product'];
    $opciones = $args['options'];

    if (empty($opciones) || !$producto) {
        return $html;
    }

    // Qué tallas hay de verdad, y cuáles están agotadas.
    $disponibles = [];
    foreach ($producto->get_available_variations() as $v) {
        $slug = $v['attributes']['attribute_pa_talla'] ?? '';
        if ($slug !== '') {
            $disponibles[$slug] = !empty($v['is_in_stock']);
        }
    }

    $orden = visnex_orden_tallas();
    $terminos = wc_get_product_terms($producto->get_id(), 'pa_talla', ['fields' => 'all']);

    usort($terminos, function ($a, $b) use ($orden) {
        $ka = strtolower(remove_accents($a->name));
        $kb = strtolower(remove_accents($b->name));
        return ($orden[$ka] ?? 99) <=> ($orden[$kb] ?? 99);
    });

    ob_start();
    ?>
    <div class="vn-tallas" data-vn-tallas>
        <?php foreach ($terminos as $t) :
            if (!in_array($t->slug, $opciones, true)) {
                continue;
            }
            $hay = $disponibles[$t->slug] ?? false;
            ?>
            <button type="button"
                    class="vn-talla<?php echo $hay ? '' : ' vn-talla--agotada'; ?>"
                    data-valor="<?php echo esc_attr($t->slug); ?>"
                    <?php echo $hay ? '' : 'disabled aria-disabled="true"'; ?>
                    aria-pressed="false">
                <?php echo esc_html($t->name); ?>
                <?php if (!$hay) : ?>
                    <span class="vn-sr-only">agotada</span>
                <?php endif; ?>
            </button>
        <?php endforeach; ?>
    </div>
    <?php
    $botones = ob_get_clean();

    // El <select> original se queda, oculto pero funcional.
    return $botones . '<div class="vn-tallas__select">' . $html . '</div>';
}, 10, 2);

/**
 * La etiqueta "Talla" y el enlace de limpiar, en la voz del sitio.
 */
add_filter('woocommerce_attribute_label', function ($label, $nombre) {
    if ($nombre === 'pa_talla') {
        return 'Talla';
    }
    return $label;
}, 10, 2);
