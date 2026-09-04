<?php
/**
 * D'MIKA — Soporte de la capa de experiencia.
 *
 * Tres cosas que necesitan marcado y no se pueden hacer solo con CSS:
 *   1. La cortina de entrada con el monograma trazable.
 *   2. La segunda foto de cada prenda en la rejilla.
 *   3. El tono de fondo que corresponde a cada seccion.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* =============================================================================
   1. LA CORTINA DE ENTRADA
   ============================================================================= */

/**
 * La cortina va lo PRIMERO del <body>.
 *
 * Si fuera despues, durante un instante se veria la tienda antes de que la
 * cortina la tapara — un parpadeo que es peor que no tener cortina.
 *
 * El monograma se pinta DOS veces superpuestas: una version en trazo, que es
 * la que se dibuja, y otra rellena, que aparece cuando el trazo termina. Es la
 * unica manera de que una forma que solo tiene relleno parezca escrita a mano.
 */
add_action('wp_body_open', function () {
    // Solo en la portada. En la ficha o el carrito, una cortina es un peaje.
    if (!is_front_page() && !is_home()) {
        return;
    }
    // Y solo en modo pleno: en una tienda, una cortina TAMBIEN es un peaje en
    // la portada. Retrasa el escaparate 1,65 s la primera vez.
    if (function_exists('dm_ceremonia_plena') && !dm_ceremonia_plena()) {
        return;
    }
    if (!function_exists('dm_monograma')) {
        return;
    }
    ?>
    <div class="dm-entrada" id="dm-entrada" aria-hidden="true">
        <svg class="dm-entrada__marca" viewBox="<?php echo esc_attr(DM_VB); ?>" focusable="false">
            <?php /* El trazo: se dibuja. */ ?>
            <path class="dm-entrada__trazo" d="<?php echo esc_attr(DM_D); ?>"/>
            <path class="dm-entrada__trazo dm-entrada__trazo--oro" d="<?php echo esc_attr(DM_M); ?>"/>
            <?php /* El relleno: aparece despues. */ ?>
            <g class="dm-entrada__relleno">
                <path fill="#171717" fill-rule="evenodd" d="<?php echo esc_attr(DM_D); ?>"/>
                <path fill="#B99A5E" fill-rule="evenodd" d="<?php echo esc_attr(DM_M); ?>"/>
            </g>
        </svg>
        <p class="dm-entrada__pie">Clothing for every you</p>
    </div>
    <?php
}, 1);

/* =============================================================================
   2. LA SEGUNDA FOTO — YA EXISTE, NO SE DUPLICA
   =============================================================================

   Aqui iba a montar la segunda foto al pasar el raton y los nombres de
   transicion por producto. Los dos YA ESTABAN, en functions.php: la tarjeta se
   genera a mano con `vn-card__media`, `vn-card__media--hover` y un
   `view-transition-name: vn-foto-{id}` unico.

   Se retira lo que habia escrito. Montar un segundo sistema encima del que ya
   funciona es como se acaba con dos cursores peleandose por la misma clase —
   ya paso en este mismo tema, y costo un rato entender por que se veia un "er"
   suelto flotando al lado del raton.

   La leccion practica: antes de anadir una capa, mirar el marcado que sirve el
   sitio. Media hora de curl habria ahorrado esto.
   ============================================================================= */

/* =============================================================================
   3. EL TONO DE CADA SECCION
   ============================================================================= */

/**
 * Marca las secciones de la portada con el tono de fondo que les toca.
 *
 * Se hace con un filtro sobre el HTML ya generado y no tocando cada plantilla
 * porque son cinco secciones en tres archivos distintos: un solo sitio que
 * decide la progresion de color es mas facil de ajustar que cinco.
 *
 * La progresion va de marfil a casi negro segun se baja. No se percibe como un
 * cambio de color -es demasiado lento- sino como que la pagina avanza.
 */
add_filter('the_content', function ($contenido) {
    if (!is_front_page()) {
        return $contenido;
    }

    $tonos = [
        'dm-hero'        => '#0B0B0B',
        'vn-trust'       => '#F4EFE7',
        'vn-section'     => '#F4EFE7',
        'vn-editorial'   => '#EFE7DA',
        'vn-duo'         => '#E9DFCF',
        'vn-strip'       => '#171717',
        'vn-newsletter'  => '#171717',
    ];

    foreach ($tonos as $clase => $tono) {
        // Solo la PRIMERA aparicion de cada clase lleva el atributo: si lo
        // llevaran todas, dos secciones seguidas del mismo tipo se pelearian
        // por el fondo al cruzar el centro de la pantalla.
        $contenido = preg_replace(
            '/(<(?:section|div)\b[^>]*class="[^"]*\b' . preg_quote($clase, '/') . '\b[^"]*")(?![^>]*data-dm-tono)/',
            '$1 data-dm-tono="' . $tono . '"',
            $contenido,
            1
        );
    }

    return $contenido;
}, 30);
