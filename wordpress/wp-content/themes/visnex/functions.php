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

    $jspath = get_stylesheet_directory() . '/assets/js/';
    $verjs = function ($file) use ($jspath) {
        $full = $jspath . $file;
        return file_exists($full) ? (string) filemtime($full) : VISNEX_VERSION;
    };

    wp_enqueue_style('storefront-style', get_template_directory_uri() . '/style.css', [], VISNEX_VERSION);

    wp_enqueue_style('visnex-tokens',     $dir . 'tokens.css',     ['storefront-style'], $ver('tokens.css'));
    wp_enqueue_style('visnex-base',       $dir . 'base.css',       ['visnex-tokens'],    $ver('base.css'));
    wp_enqueue_style('visnex-components', $dir . 'components.css', ['visnex-base'],      $ver('components.css'));

    // home.css lleva la cabecera, el pie, la barra de confianza y el boletin:
    // hace falta en TODAS las paginas, no solo en la portada. Antes se encolaba
    // en tres bloques condicionales distintos, y el orden final de la cola
    // cambiaba segun la plantilla — por eso la cabecera se veia de un color en
    // la portada y de otro en la tienda.
    wp_enqueue_style('visnex-home', $dir . 'home.css', ['visnex-components'], $ver('home.css'));

    // Las secciones editoriales y los dos arreglos de cabecera. Va en TODAS las
    // paginas porque ahi viven las correcciones de .col-full y del menu, que
    // antes cortaban el logotipo y la primera opcion en cada pantalla del sitio.
    wp_enqueue_style('visnex-editorial', $dir . 'editorial.css', ['visnex-components'], $ver('editorial.css'));


    // Tienda, ficha de producto y resenas.
    if (function_exists('is_woocommerce') && (is_woocommerce() || is_shop() || is_product_category() || is_product() || is_search())) {
        wp_enqueue_style('visnex-shop', $dir . 'shop.css', ['visnex-components'], $ver('shop.css'));
    }

    // El embudo: carrito, checkout, mi cuenta.
    if (function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page() || is_wc_endpoint_url())) {
        wp_enqueue_style('visnex-funnel', $dir . 'funnel.css', ['visnex-components'], $ver('funnel.css'));
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

    // Movimiento. Va aparte de visnex.js a proposito: si algo de aqui falla, la
    // tienda pierde la ceremonia pero conserva el carrito, el buscador y el
    // aviso descartable, que viven en el otro archivo.
    wp_enqueue_script(
        'visnex-motion',
        get_stylesheet_directory_uri() . '/assets/js/motion.js',
        [],
        $verjs('motion.js'),
        true
    );

    wp_localize_script('visnex-js', 'VISNEX', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('visnex_cod'),
    ]);
}, 20);

/**
 * motion.css cierra la cascada, en un hook aparte con prioridad 99.
 *
 * No basta con declararlo el ultimo dentro del mismo hook: WordPress ordena la
 * cola por dependencias, y con tres hojas encoladas de forma condicional el
 * orden final cambiaba de una plantilla a otra. Un hook posterior es lo unico
 * que garantiza que motion.css sea la ultima hoja del tema en TODAS las
 * paginas — que es lo que permite que no necesite un solo !important.
 */
add_action('wp_enqueue_scripts', function () {
    $dir  = get_stylesheet_directory_uri() . '/assets/css/';
    $path = get_stylesheet_directory() . '/assets/css/';
    $ver  = file_exists($path . 'motion.css') ? (string) filemtime($path . 'motion.css') : VISNEX_VERSION;

    wp_enqueue_style('visnex-motion', $dir . 'motion.css', ['visnex-components'], $ver);
}, 99);

/**
 * Tipografias: preconnect + una sola peticion.
 * display=swap para que el texto sea legible antes de que llegue la fuente.
 */
add_action('wp_head', function () {
    ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=Archivo:wght@400;500&display=swap">
    <?php /* Inter baja de 6 pesos a 3: el peso semantico lo lleva ahora la
             serifa, no un Inter 800. Son 3 ficheros menos que descargar. */ ?>
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

require_once get_stylesheet_directory() . '/inc/customizer.php';
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

/* =============================================================================
   6. PETICIONES QUE NO HACEN FALTA
   =============================================================================
   Medido en el navegador: 39 peticiones para pintar la portada. Varias son de
   WooCommerce y no sirven de nada fuera del embudo de compra.

   `cart-fragments` es la peor: hace una llamada AJAX en CADA carga de CADA
   pagina solo para refrescar el contador del carrito. Con el carrito vacio -que
   es el 100 % de las primeras visitas- esa llamada devuelve un carrito vacio.
   Se queda donde hace falta: carrito, pago, mi cuenta y ficha de producto.
   ============================================================================= */

add_action('wp_enqueue_scripts', function () {
    if (!function_exists('is_woocommerce')) {
        return;
    }

    $en_el_embudo = is_cart() || is_checkout() || is_account_page() || is_product();

    if (!$en_el_embudo) {
        wp_dequeue_script('wc-cart-fragments');
    }

    // Los bloques de WooCommerce solo se usan si la pagina lleva bloques suyos.
    // En una portada montada con el tema, son CSS que nadie aplica.
    if (is_front_page()) {
        wp_dequeue_style('wc-blocks-style');
        wp_dequeue_style('wc-blocks-integration');
    }
}, 99);

/**
 * Precarga la tipografia y las dos fotos de la portada.
 *
 * Sin esto el navegador no descubre el hero hasta haber leido y aplicado todo
 * el CSS. `preload` se lo dice desde la primera linea de la respuesta, que es
 * lo que adelanta el momento en que aparece la imagen grande.
 */
add_action('wp_head', function () {
    if (!is_front_page()) {
        return;
    }

    foreach (['hero_ella', 'hero_el'] as $slot) {
        $img = visnex_image($slot);
        if ($img['webp'] !== '') {
            printf(
                '<link rel="preload" as="image" href="%s" type="image/webp" fetchpriority="high">' . "\n",
                esc_url($img['webp'])
            );
        } elseif ($img['jpg'] !== '') {
            printf(
                '<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
                esc_url($img['jpg'])
            );
        }
    }
}, 2);
