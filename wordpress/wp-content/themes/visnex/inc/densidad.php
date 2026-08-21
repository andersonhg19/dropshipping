<?php
/**
 * VISNEX — Control de densidad del catálogo.
 *
 * POR QUÉ EXISTE
 * --------------
 * Diez especialistas auditaron la tienda y el veredicto fue que no se siente
 * viva porque el visitante no puede hacer nada en ella. Esto es lo contrario:
 * la única decisión que el cliente puede tomar sobre la tienda.
 *
 * Y no es un capricho de diseño. Con 100 prendas, una rejilla fija te obliga a
 * elegir un solo negocio:
 *   · a 1 o 2 columnas la foto es grande y vende DESEO;
 *   · a 6 columnas se comparan siluetas y precios de un vistazo, que es como se
 *     repone un fondo de armario.
 * Un control resuelve los dos.
 *
 * Lo que hace que se perciba como lujo no es el tamaño de la foto: es que el
 * sistema OBEDEZCA AL INSTANTE.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Las cuatro densidades. El número es el dato, no un icono de rejilla: un
 * icono obliga a descifrarlo, un número se lee.
 */
function visnex_densidades(): array
{
    return [1, 2, 4, 6];
}

/**
 * Pinta el control en la barra de la tienda.
 *
 * Va dentro de un <fieldset> con radios reales, no de <button>: así funciona
 * con teclado y con lector de pantalla sin escribir una sola línea de ARIA, y
 * el estado activo lo lleva el propio navegador.
 */
add_action('woocommerce_before_shop_loop', function () {
    if (!is_shop() && !is_product_category() && !is_product_taxonomy()) {
        return;
    }
    ?>
    <fieldset class="vn-densidad" data-vn-densidad>
        <legend class="vn-sr-only">Prendas por fila</legend>
        <?php foreach (visnex_densidades() as $n) : ?>
            <label class="vn-densidad__op">
                <input type="radio" name="vn-densidad" value="<?php echo (int) $n; ?>"
                       <?php checked($n, 4); ?>>
                <span><?php echo (int) $n; ?></span>
            </label>
        <?php endforeach; ?>
    </fieldset>
    <?php
}, 25);   // dentro del contenedor de Storefront, que abre en 9 y cierra en 31

/**
 * Restaura la elección ANTES del primer pintado.
 *
 * Va como script en línea y sin diferir a propósito: si se leyera desde
 * `motion.js` (que va al final y con `defer`), la página se pintaría a 4
 * columnas y saltaría a la elegida a la vista del usuario. Ese salto es
 * exactamente lo que separa una web de una aplicación.
 *
 * Son seis líneas y se ejecutan en menos de un milisegundo.
 */
add_action('wp_head', function () {
    if (!is_shop() && !is_product_category() && !is_product_taxonomy()) {
        return;
    }
    ?>
    <script>
    (function(){try{
        var n = localStorage.getItem('visnex-cols');
        if (n) document.documentElement.style.setProperty('--cols', n);
    }catch(e){}})();
    </script>
    <?php
}, 4);
