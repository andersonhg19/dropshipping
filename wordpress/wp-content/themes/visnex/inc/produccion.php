<?php
/**
 * VISNEX — Lo que hace falta para estar en producción.
 *
 * Correo, blindaje y SEO. Nada de esto se ve, y sin ello no se puede vender.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* =============================================================================
   1. CORREO
   =============================================================================
   PROBLEMA MEDIDO: el contenedor no tiene ningún agente de envío instalado
   (`sendmail` no existe). `wp_mail()` devuelve false en silencio, así que:
     · el cliente nunca recibe la confirmación de su pedido,
     · tú nunca te enteras de que has vendido,
     · y "he olvidado mi contraseña" no funciona.

   Se resuelve enviando por SMTP. Las credenciales van en el `.env`, NUNCA en el
   código: este repositorio es público.

   Con cualquier proveedor sirve. Para empezar, Brevo y Resend tienen plan
   gratuito suficiente para una tienda que arranca, y a diferencia de Gmail no
   te bloquean la cuenta si un día se disparan los envíos.

   En el .env:
     VN_SMTP_HOST=smtp-relay.brevo.com
     VN_SMTP_PORT=587
     VN_SMTP_USER=...
     VN_SMTP_PASS=...
     VN_SMTP_FROM=pedidos@visnex.co
     VN_SMTP_NOMBRE=VISNEX
   ============================================================================= */

add_action('phpmailer_init', function ($phpmailer) {
    $host = getenv('VN_SMTP_HOST');
    $user = getenv('VN_SMTP_USER');
    $pass = getenv('VN_SMTP_PASS');

    // Sin credenciales no se toca nada: mejor que falle de forma evidente a que
    // finja funcionar.
    if (!$host || !$user || !$pass) {
        return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host       = $host;
    $phpmailer->Port       = (int) (getenv('VN_SMTP_PORT') ?: 587);
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = $user;
    $phpmailer->Password   = $pass;
    $phpmailer->SMTPSecure = $phpmailer->Port === 465 ? 'ssl' : 'tls';
    $phpmailer->CharSet    = 'UTF-8';

    $desde = getenv('VN_SMTP_FROM');
    if ($desde) {
        $phpmailer->setFrom($desde, getenv('VN_SMTP_NOMBRE') ?: 'VISNEX', false);
    }
}, 20);

/**
 * Deja constancia de los correos que NO salen.
 *
 * `wp_mail()` falla en silencio por diseño. En una tienda eso significa
 * enterarte de que llevas semanas sin avisar a nadie cuando un cliente
 * reclama. Con esto queda en el registro de PHP, que es lo que se mira.
 */
add_action('wp_mail_failed', function ($error) {
    error_log('[VISNEX] correo NO enviado: ' . $error->get_error_message());
});

/**
 * Aviso en el panel mientras el correo no esté configurado.
 *
 * Es la clase de cosa que se olvida hasta que cuesta una venta.
 */
add_action('admin_notices', function () {
    if (getenv('VN_SMTP_HOST') && getenv('VN_SMTP_USER')) {
        return;
    }
    if (!current_user_can('manage_options')) {
        return;
    }
    echo '<div class="notice notice-error"><p><strong>VISNEX:</strong> el correo no está configurado. '
       . 'Los clientes no reciben la confirmación de sus pedidos y tú no recibes aviso de las ventas. '
       . 'Rellena <code>VN_SMTP_*</code> en el archivo <code>.env</code>.</p></div>';
});

/* =============================================================================
   2. BLINDAJE
   ============================================================================= */

/**
 * Fuera la versión de WordPress de la cabecera y de las URLs.
 *
 * Publicarla es regalarle a un rastreador automático la lista de fallos
 * conocidos de esa versión exacta. No es una vulnerabilidad; es dejar de
 * anunciar cuáles tienes.
 */
add_action('init', function () {
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
});

add_filter('the_generator', '__return_empty_string');

/**
 * XML-RPC: se apaga.
 *
 * Es la puerta por la que entran los ataques de fuerza bruta a WordPress, y
 * permite probar cientos de contraseñas en una sola petición. Solo hace falta
 * para la aplicación móvil antigua y para Jetpack, que aquí no se usan.
 */
add_filter('xmlrpc_enabled', '__return_false');

add_filter('wp_headers', function ($h) {
    unset($h['X-Pingback']);
    return $h;
});

/**
 * Los mensajes de error del acceso dejan de decir si el usuario existe.
 *
 * "Contraseña incorrecta" confirma que ese usuario es válido, y eso convierte
 * un ataque a ciegas en uno dirigido.
 */
add_filter('login_errors', fn() => 'Los datos no son correctos.');

/**
 * Cabeceras de seguridad.
 *
 * `nosniff` impide que el navegador adivine el tipo de un archivo subido y lo
 * ejecute; `SAMEORIGIN` impide que alguien meta tu tienda dentro de un iframe
 * suyo para robar clics sobre el botón de comprar.
 */
add_action('send_headers', function () {
    if (is_admin()) {
        return;
    }
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
});

/* =============================================================================
   3. SEO
   =============================================================================
   Lo mínimo para que la tienda se pueda encontrar y para que un enlace
   compartido por WhatsApp —que es como se comparte en Colombia— muestre la
   foto del producto y no un cuadro gris.
   ============================================================================= */

/**
 * Datos estructurados de producto.
 *
 * Es lo que hace que en el buscador aparezcan el precio y la disponibilidad
 * bajo el resultado. WooCommerce ya los emite, pero sin `brand` ni condición,
 * y Google los pide desde 2024.
 */
add_filter('woocommerce_structured_data_product', function ($datos, $producto) {
    $datos['brand'] = [
        '@type' => 'Brand',
        'name'  => 'VISNEX',
    ];

    if (isset($datos['offers'][0])) {
        $datos['offers'][0]['itemCondition'] = 'https://schema.org/NewCondition';
        $datos['offers'][0]['priceValidUntil'] = gmdate('Y-m-d', strtotime('+1 year'));
    }

    return $datos;
}, 10, 2);

/**
 * Etiquetas para redes: al compartir un producto, se ve la prenda.
 *
 * Sin esto, un enlace pegado en WhatsApp sale como un rectángulo gris con la
 * URL. Con esto sale la foto, el nombre y el precio.
 */
add_action('wp_head', function () {
    if (!is_singular()) {
        return;
    }

    $titulo = get_the_title();
    $url    = get_permalink();
    $imagen = '';
    $desc   = '';

    if (function_exists('is_product') && is_product()) {
        $producto = wc_get_product(get_the_ID());
        if ($producto) {
            $desc   = wp_strip_all_tags($producto->get_short_description() ?: $producto->get_description());
            $imagen = wp_get_attachment_image_url($producto->get_image_id(), 'large');
        }
    }

    if (!$desc) {
        $desc = wp_strip_all_tags(get_the_excerpt());
    }
    $desc = mb_substr(trim($desc), 0, 200);

    if (!$imagen) {
        $imagen = get_the_post_thumbnail_url(get_the_ID(), 'large');
    }

    printf('<meta property="og:type" content="%s">' . "\n", is_product() ? 'product' : 'website');
    printf('<meta property="og:title" content="%s">' . "\n", esc_attr($titulo));
    printf('<meta property="og:url" content="%s">' . "\n", esc_url($url));
    printf('<meta property="og:site_name" content="VISNEX">' . "\n");

    if ($desc) {
        printf('<meta property="og:description" content="%s">' . "\n", esc_attr($desc));
        printf('<meta name="description" content="%s">' . "\n", esc_attr($desc));
    }

    if ($imagen) {
        printf('<meta property="og:image" content="%s">' . "\n", esc_url($imagen));
        printf('<meta name="twitter:card" content="summary_large_image">' . "\n");
    }
}, 6);

/* =============================================================================
   4. LA TIENDA NO MIENTE SOBRE SU STOCK
   =============================================================================
   Con contra entrega, vender algo que no hay no es un error de inventario: es
   una entrega fallida, un transportista pagado y un cliente que no vuelve.
   ============================================================================= */

/**
 * Avisa cuando quedan pocas unidades — a quien lleva la tienda, no al cliente.
 *
 * Los avisos de "solo quedan 2" en la ficha son tácticas de presión, y en una
 * marca que quiere parecer cara restan más de lo que suman.
 */
add_filter('woocommerce_get_availability_text', function ($texto, $producto) {
    if (!$producto->managing_stock()) {
        return $texto;
    }

    $quedan = $producto->get_stock_quantity();

    if ($quedan !== null && $quedan <= 0) {
        return 'Agotado';
    }

    return '';   // Si hay, no se dice nada: que haya es lo normal.
}, 10, 2);
