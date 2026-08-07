<?php
/**
 * VISNEX — tema hijo de Storefront.
 *
 * Sustituye al mu-plugin visnex-style.php, que inyectaba 1.512 lineas de CSS
 * inline en wp_head. Aqui el CSS esta versionado, es cacheable y se carga de
 * forma condicional segun la pagina.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

define('VISNEX_VERSION', '1.0.0');

/* =============================================================================
   1. ESTILOS Y SCRIPTS
   ============================================================================= */

/**
 * Encola la cascada en orden explicito.
 *
 * El CSS del embudo no se descarga en la home y el de la landing COD no se
 * descarga en la tienda: cada kilobyte cuenta cuando el trafico llega por
 * datos moviles desde un anuncio.
 */
add_action('wp_enqueue_scripts', function () {
    $dir = get_stylesheet_directory_uri() . '/assets/css/';
    $path = get_stylesheet_directory() . '/assets/css/';

    // Versionado por mtime: el navegador recibe el CSS nuevo sin purgar cache
    // a mano en cada despliegue.
    $ver = function ($file) use ($path) {
        $full = $path . $file;
        return file_exists($full) ? (string) filemtime($full) : VISNEX_VERSION;
    };

    wp_enqueue_style('storefront-style', get_template_directory_uri() . '/style.css', [], VISNEX_VERSION);

    wp_enqueue_style('visnex-tokens',     $dir . 'tokens.css',     ['storefront-style'], $ver('tokens.css'));
    wp_enqueue_style('visnex-base',       $dir . 'base.css',       ['visnex-tokens'],    $ver('base.css'));
    wp_enqueue_style('visnex-components', $dir . 'components.css', ['visnex-base'],      $ver('components.css'));

    // La home premium solo donde hace falta.
    if (is_front_page() || is_home()) {
        wp_enqueue_style('visnex-home', $dir . 'home.css', ['visnex-components'], $ver('home.css'));
    }

    // Tienda, ficha de producto y resenas.
    if (function_exists('is_woocommerce') && (is_woocommerce() || is_shop() || is_product_category() || is_product() || is_search())) {
        wp_enqueue_style('visnex-shop', $dir . 'shop.css', ['visnex-components'], $ver('shop.css'));
        // La cabecera/footer premium viven en home.css; se necesitan fuera de la home.
        wp_enqueue_style('visnex-home', $dir . 'home.css', ['visnex-components'], $ver('home.css'));
    }

    // El embudo: carrito, checkout, mi cuenta.
    if (function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page() || is_wc_endpoint_url())) {
        wp_enqueue_style('visnex-funnel', $dir . 'funnel.css', ['visnex-components'], $ver('funnel.css'));
        wp_enqueue_style('visnex-home',   $dir . 'home.css',   ['visnex-components'], $ver('home.css'));
    }

    // Landing de conversion contraentrega.
    if (is_page_template('page-landing-cod.php')) {
        wp_enqueue_style('visnex-landing', $dir . 'landing-cod.css', ['visnex-components'], $ver('landing-cod.css'));
    }

    // Paginas legales e informativas: solo base + componentes (ya cargados).
    wp_enqueue_script(
        'visnex-js',
        get_stylesheet_directory_uri() . '/assets/js/visnex.js',
        [],
        VISNEX_VERSION,
        true
    );

    wp_localize_script('visnex-js', 'VISNEX', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('visnex_cod'),
    ]);
}, 20);

/**
 * Tipografias: preconnect + una sola peticion.
 * display=swap para que el texto sea legible antes de que llegue la fuente.
 */
add_action('wp_head', function () {
    ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
    <meta name="theme-color" content="#0A0A0A">
    <?php
}, 1);

/* =============================================================================
   2. LIMPIEZA DE STOREFRONT
   ============================================================================= */

add_action('get_header', function () {
    remove_action('storefront_sidebar', 'storefront_get_sidebar', 10);
});

add_filter('body_class', function ($classes) {
    $classes[] = 'visnex-store';
    return $classes;
});

add_action('init', function () {
    remove_action('storefront_before_content', 'woocommerce_breadcrumb', 10);
    remove_action('storefront_content_top', 'storefront_breadcrumb', 10);
    // Las secciones por defecto de la home de Storefront se sustituyen por las
    // nuestras (ver seccion 4).
    remove_action('storefront_homepage', 'storefront_homepage_content', 10);
    remove_action('storefront_homepage', 'storefront_product_categories', 20);
    remove_action('storefront_homepage', 'storefront_recent_products', 30);
    remove_action('storefront_homepage', 'storefront_featured_products', 40);
    remove_action('storefront_homepage', 'storefront_popular_products', 50);
    remove_action('storefront_homepage', 'storefront_on_sale_products', 60);
    remove_action('storefront_homepage', 'storefront_best_selling_products', 70);
});

add_filter('storefront_content_width', fn() => 1440);

// Enlace de salto para navegacion por teclado.
add_action('wp_body_open', function () {
    echo '<a class="vn-skip-link" href="#content">Saltar al contenido</a>';
});

/* =============================================================================
   3. SOPORTE DE WOOCOMMERCE
   ============================================================================= */

add_action('after_setup_theme', function () {
    add_theme_support('woocommerce');
    // Zoom, lightbox y carrusel de la galeria de producto.
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    add_theme_support('title-tag');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
});

/** 4 productos por fila, 24 por pagina. */
add_filter('loop_shop_columns', fn() => 4, 20);
add_filter('loop_shop_per_page', fn() => 24, 20);

/**
 * Precio en formato colombiano.
 *
 * En COP no se usan decimales y el separador de miles es el punto. Mostrar
 * "$59900.00" — como se hacia — parece un precio en dolares y confunde.
 */
add_filter('wc_get_price_decimals', fn() => 0, 20);
add_filter('wc_get_price_thousand_separator', fn() => '.', 20);
add_filter('wc_get_price_decimal_separator', fn() => ',', 20);

/**
 * Segunda imagen al pasar el raton sobre la tarjeta de producto.
 * En moda, ver la prenda por detras o puesta sube el clic de forma medible.
 */
add_filter('woocommerce_loop_product_link_close', function ($html) {
    return $html;
});

remove_action('woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10);
add_action('woocommerce_before_shop_loop_item_title', function () {
    global $product;
    if (!$product) {
        return;
    }

    $main = $product->get_image('woocommerce_thumbnail', ['class' => 'vn-card__media']);
    $gallery = $product->get_gallery_image_ids();
    $hover = '';

    if (!empty($gallery[0])) {
        $hover = wp_get_attachment_image(
            $gallery[0],
            'woocommerce_thumbnail',
            false,
            ['class' => 'vn-card__media vn-card__media--hover', 'aria-hidden' => 'true', 'loading' => 'lazy']
        );
    }

    echo '<span class="vn-card__media-wrap">' . $main . $hover . '</span>';
}, 10);

/* =============================================================================
   4. CONTENIDO DE LA HOME
   ============================================================================= */

require_once get_stylesheet_directory() . '/inc/home-sections.php';
require_once get_stylesheet_directory() . '/inc/shop-filters.php';
require_once get_stylesheet_directory() . '/inc/checkout-trust.php';
require_once get_stylesheet_directory() . '/inc/legal-pages.php';

/* =============================================================================
   5. PLANTILLA DE PAGINA: LANDING COD
   ============================================================================= */

/**
 * Registra la plantilla aunque el archivo viva en la raiz del tema.
 * WordPress la detecta sola por el encabezado "Template Name", pero se declara
 * aqui tambien para que quede documentado que existe.
 */
add_filter('theme_page_templates', function ($templates) {
    $templates['page-landing-cod.php'] = 'VISNEX — Landing Contraentrega';
    return $templates;
});
