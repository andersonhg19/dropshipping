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
    wp_enqueue_style('visnex-cabecera',   $dir . 'cabecera.css',   ['visnex-components'], $ver('cabecera.css'));

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

    // marca-visible.css va DESPUES de motion.css a proposito: es la capa que
    // mete el ritmo de superficies y el dorado estructural, y tiene que ganar
    // a todo lo anterior sin recurrir a !important.
    // En ESTE hook $ver es una cadena, no el ayudante que hay arriba: se
    // calcula aparte para que la version siga saliendo del mtime del archivo.
    $verMarca = file_exists($path . 'marca-visible.css')
        ? (string) filemtime($path . 'marca-visible.css')
        : VISNEX_VERSION;
    wp_enqueue_style('visnex-marca', $dir . 'marca-visible.css', ['visnex-motion'], $verMarca);

    // La capa inmersiva va la ULTIMA de todas: paralaje, revelados, grano,
    // cursor y carril. Es la que hace que la tienda responda al scroll y al
    // raton en vez de quedarse quieta.
    $verInm = file_exists($path . 'inmersivo.css')
        ? (string) filemtime($path . 'inmersivo.css')
        : VISNEX_VERSION;
    wp_enqueue_style('visnex-inmersivo', $dir . 'inmersivo.css', ['visnex-marca'], $verInm);

    wp_enqueue_script(
        'visnex-inmersivo',
        get_stylesheet_directory_uri() . '/assets/js/inmersivo.js',
        [],
        $verInm,
        true
    );

    // EL HERO EN WEBGL, RETIRADO.
    //
    // Habia aqui una capa que convertia las dos fotos del hero en una
    // superficie deformable: el raton pintaba un campo de velocidad en una
    // textura y cada pixel se desplazaba siguiendolo. Tecnicamente funcionaba
    // -medido: 13% de los pixeles desplazados- pero al cliente no le gustaba,
    // y en un logo o en un hero eso es el unico dato que decide.
    //
    // El codigo no se borra (assets/js/tejido.js y assets/css/tejido.css
    // siguen en el repo) por si alguna pieza se recupera mas adelante, pero no
    // se carga. Un archivo que no se encola no cuesta nada.
}, 99);

/**
 * Tipografias: preconnect + una sola peticion.
 * display=swap para que el texto sea legible antes de que llegue la fuente.
 */
add_action('wp_head', function () {
    ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500;600&family=Parisienne&display=swap">
    <?php /* Inter baja de 6 pesos a 3: el peso semantico lo lleva ahora la
             serifa, no un Inter 800. Son 3 ficheros menos que descargar. */ ?>
    <meta name="theme-color" content="#171717">
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

    /*
     * TAMANOS PROPIOS, EN LA PROPORCION REAL DE LA TARJETA
     *
     * `woocommerce_thumbnail` mide 324x454 y la tarjeta mide 462x647: la foto
     * se estaba estirando un 143 %, y un 285 % en un portatil retina. La
     * nitidez es la senal de calidad mas primitiva que procesa el ojo —antes
     * que la composicion y mucho antes que la tipografia—, asi que una foto
     * interpolada dice "esto se monto con prisa" en 200 ms sin que el visitante
     * sepa por que.
     *
     * 5:7 exacto, el mismo que la tarjeta, para que no haya recorte doble.
     */
    add_image_size('visnex_card',   1000, 1400, true);
    add_image_size('visnex_card_s',  500,  700, true);   // movil y densidad alta
    add_image_size('visnex_single', 1400, 1960, true);
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

/**
 * Formato de precio: "$289.900", no "$ 289.900".
 *
 * WooCommerce mete un espacio duro entre el simbolo y la cifra. En pesos
 * colombianos no se escribe asi, y ese hueco hace que el precio se lea como
 * dos cosas en vez de una.
 */
add_filter('woocommerce_price_format', fn() => '%1$s%2$s', 20);
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

    /*
     * Se usa wp_get_attachment_image() y no $product->get_image() porque la
     * primera emite `srcset` de verdad: el navegador elige el ancho que le
     * conviene segun la pantalla y la densidad. Con get_image() se servia
     * siempre el mismo fichero de 324 px.
     *
     * El `sizes` se calcula con la variable --cols del control de densidad, de
     * modo que al pasar de 4 columnas a 1 el navegador pide una foto mayor sin
     * que haya que tocar nada.
     */
    static $posicion = 0;
    $posicion++;

    /*
     * OJO: `sizes` NO admite var(). El navegador no puede leer --cols desde
     * aqui, asi que se declara el caso mas exigente que puede darse (2
     * columnas = 50vw) y `motion.js` lo reescribe con el valor exacto cada vez
     * que cambia la densidad.
     *
     * Se peca por exceso a proposito: si el `sizes` se queda corto, el
     * navegador pide una foto pequena y la estira, que es el defecto que
     * estamos arreglando. Si se pasa, solo descarga algunos KB de mas.
     */
    $sizes = '(max-width: 700px) 50vw, 50vw';

    // Las cuatro primeras entran en pantalla: se piden con prioridad y sin
    // diferir. Las demas, diferidas. Cargar las 24 a la vez es lo que hunde
    // el primer pintado.
    $arriba = $posicion <= 4;

    $attr = [
        'class'  => 'vn-card__media',
        'sizes'  => $sizes,
        'alt'    => $product->get_name(),
    ];

    if ($arriba) {
        $attr['loading']       = 'eager';
        $attr['fetchpriority'] = 'high';
    } else {
        $attr['loading']  = 'lazy';
        $attr['decoding'] = 'async';
    }

    $id = $product->get_image_id();

    $main = $id
        ? wp_get_attachment_image($id, 'visnex_card', false, $attr)
        : $product->get_image('visnex_card', ['class' => 'vn-card__media']);

    // La segunda foto, para el cambio al pasar el raton. Solo si existe: en un
    // catalogo donde casi ningun producto tiene galeria, pintarla vacia solo
    // anadiria peticiones.
    $gallery = $product->get_gallery_image_ids();
    $hover = '';

    if (!empty($gallery[0])) {
        $hover = wp_get_attachment_image(
            $gallery[0],
            'visnex_card',
            false,
            [
                'class'       => 'vn-card__media vn-card__media--hover',
                'aria-hidden' => 'true',
                'loading'     => 'lazy',
                'decoding'    => 'async',
                'sizes'       => $sizes,
                'alt'         => '',
            ]
        );
    }

    /*
     * `view-transition-name` unico por producto: es lo que permite que, al
     * abrir la ficha, la foto CREZCA desde la tarjeta en vez de aparecer de
     * cero. El navegador empareja los dos elementos por el nombre.
     * Ver la seccion 26 de motion.css.
     */
    $vt = 'vn-foto-' . $product->get_id();

    printf(
        '<span class="vn-card__media-wrap" style="view-transition-name:%s">%s%s</span>',
        esc_attr($vt),
        $main,
        $hover
    );
}, 10);

/**
 * El mismo nombre de transicion en la ficha, para que el navegador empareje.
 */
add_filter('woocommerce_single_product_image_thumbnail_html', function ($html, $attachment_id) {
    global $product;
    if (!$product || !is_product()) {
        return $html;
    }

    // Solo la principal: si se nombran todas las de la galeria, el navegador
    // encuentra varios candidatos con el mismo nombre y no anima ninguno.
    if ((int) $attachment_id !== (int) $product->get_image_id()) {
        return $html;
    }

    $vt = 'vn-foto-' . $product->get_id();

    return str_replace(
        'class="woocommerce-product-gallery__image"',
        'class="woocommerce-product-gallery__image" style="view-transition-name:' . esc_attr($vt) . '"',
        $html
    );
}, 10, 2);

/**
 * La ficha pide su imagen grande, no la de 416 px de Storefront.
 */
add_filter('woocommerce_gallery_image_size', fn() => 'visnex_single', 20);

/* =============================================================================
   4. CONTENIDO DE LA HOME
   ============================================================================= */

require_once get_stylesheet_directory() . '/inc/customizer.php';
require_once get_stylesheet_directory() . '/inc/paleta-storefront.php';
require_once get_stylesheet_directory() . '/inc/marca.php';
require_once get_stylesheet_directory() . '/inc/cabecera.php';
require_once get_stylesheet_directory() . '/inc/ficha-producto.php';
require_once get_stylesheet_directory() . '/inc/home-sections.php';
require_once get_stylesheet_directory() . '/inc/shop-filters.php';
require_once get_stylesheet_directory() . '/inc/densidad.php';
require_once get_stylesheet_directory() . '/inc/produccion.php';
require_once get_stylesheet_directory() . '/inc/tallas.php';
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

/* =============================================================================
   7. NAVEGACION INSTANTANEA
   =============================================================================
   Reglas de especulacion: el navegador PRECARGA Y PREPINTA la pagina que el
   visitante esta a punto de abrir, en cuanto el raton se acerca al enlace. Al
   soltar el clic, la pagina ya esta lista.

   Es lo que mas se nota de todo lo hecho hoy y no se ve: la diferencia entre
   "web" y "aplicacion". Y cuesta CERO kilobytes de JavaScript, porque lo hace
   el propio navegador — solo hay que decirle que puede.

   `moderate` significa que espera a que el raton lleve ~200 ms sobre el enlace,
   asi no se precarga media tienda por pasar el cursor por encima.

   Se excluye todo lo que tenga estado o efectos: carrito, pago, mi cuenta y
   cualquier cosa con parametros. Prepintar un "anadir al carrito" lo ejecutaria
   sin que nadie lo pida.
   ============================================================================= */

add_action('wp_head', function () {
    if (is_cart() || is_checkout() || is_account_page()) {
        return;
    }

    $reglas = [
        'prerender' => [[
            'where' => [
                'and' => [
                    ['href_matches' => '/*'],
                    ['not' => ['href_matches' => '/wp-admin/*']],
                    ['not' => ['href_matches' => '/wp-login.php*']],
                    ['not' => ['href_matches' => '/cart/*']],
                    ['not' => ['href_matches' => '/checkout/*']],
                    ['not' => ['href_matches' => '/my-account/*']],
                    ['not' => ['href_matches' => '/*\?*']],
                    ['not' => ['selector_matches' => '.add_to_cart_button']],
                    ['not' => ['selector_matches' => '[rel~="nofollow"]']],
                ],
            ],
            'eagerness' => 'moderate',
        ]],
    ];

    printf(
        '<script type="speculationrules">%s</script>' . "\n",
        wp_json_encode($reglas)
    );
}, 5);

/* =============================================================================
   8. UN SOLO H1 POR PAGINA
   =============================================================================
   Se estaban imprimiendo DOS <h1> en portada, tienda y categorias. En la
   portada el primero decia "Inicio"; en la tienda decia "Shop", sin traducir.

   Estaban ocultos por CSS, que es peor que no arreglarlo: siguen en el
   documento, asi que un lector de pantalla los anuncia y un buscador los indexa.
   El primer H1 de tu portada le decia a Google que la pagina se llama "Inicio".

   Se quitan del MARCADO, no de la vista.
   ============================================================================= */

add_action('init', function () {
    // El titulo de WooCommerce en tienda y categorias: ya lo pinta
    // `inc/shop-filters.php` con `.vn-shop-head__title`.
    add_filter('woocommerce_show_page_title', '__return_false');

    remove_action('storefront_single_post', 'storefront_post_header', 10);
}, 20);

/**
 * La cabecera de entrada (que contiene el <h1>) se quita SOLO donde el tema ya
 * pone uno propio.
 *
 * Antes se quitaba globalmente en 'init'. Resultado: el carrito, mi cuenta y
 * las cinco paginas legales se quedaban SIN NINGUN <h1> — malo para
 * accesibilidad (un lector de pantalla no sabe donde esta) y para SEO.
 * Verificado con la auditoria: "h1: hay 0" en esas tres.
 */
add_action('wp', function () {
    $tiene_h1_propio =
        is_front_page()                       // el <h1> del hero partido
        || (function_exists('is_shop') && (is_shop() || is_product_taxonomy()))  // .vn-shop-head__title
        || (function_exists('is_product') && is_product());                      // .product_title

    if ($tiene_h1_propio) {
        remove_action('storefront_page', 'storefront_page_header', 10);
    }
}, 5);

/**
 * La portada no necesita cabecera de entrada: su H1 es el de la portada partida.
 */
add_action('wp', function () {
    if (!is_front_page()) {
        return;
    }

    remove_action('storefront_page', 'storefront_page_header', 10);

    add_filter('the_title', function ($titulo, $id = 0) {
        // Solo el <h1> de la cabecera, no el <title> ni los menus.
        if (in_the_loop() && is_front_page() && (int) $id === (int) get_queried_object_id()) {
            return '';
        }
        return $titulo;
    }, 10, 2);
});
