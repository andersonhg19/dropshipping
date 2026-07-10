<?php
/**
 * Plugin Name: VISNEX Premium Store
 * Description: World-class fashion ecommerce - Gucci/Apple/Nike/Stella Guan inspired design
 * Version: 3.0
 * Author: VISNEX
 *
 * Sections (homepage order):
 *   1. Announcement Bar
 *   2. Header (sticky, blur glass - Apple style)
 *   3. Hero (100vh, Playfair Display, Ken Burns)
 *   4. Categories (3 cards, 3:4 ratio)
 *   5. Seleccion Premium (4 latest products)
 *   6. Editorial Split (image + text, brand story)
 *   7. Trust Bar (4 icons)
 *   8. Tendencia (4 popular products)
 *   9. Newsletter (dark section)
 *  10. Footer (4 columns)
 */

/* =============================================
   1. WORDPRESS CLEANUP
   ============================================= */

// Remove sidebar globally
add_action('get_header', function () {
    remove_action('storefront_sidebar', 'storefront_get_sidebar', 10);
});

// Add body class
add_filter('body_class', function ($classes) {
    $classes[] = 'visnex-store';
    return $classes;
});

// Remove breadcrumbs, WP clutter, default homepage sections
add_action('init', function () {
    remove_action('storefront_before_content', 'woocommerce_breadcrumb', 10);
    remove_action('storefront_content_top', 'storefront_breadcrumb', 10);
    remove_action('storefront_homepage', 'storefront_homepage_content', 10);
    remove_action('storefront_homepage', 'storefront_product_categories', 20);
    remove_action('storefront_homepage', 'storefront_recent_products', 30);
    remove_action('storefront_homepage', 'storefront_featured_products', 40);
    remove_action('storefront_homepage', 'storefront_popular_products', 50);
    remove_action('storefront_homepage', 'storefront_on_sale_products', 60);
    remove_action('storefront_homepage', 'storefront_best_selling_products', 70);
});

// Full width content
add_filter('storefront_content_width', function () {
    return 1440;
});

// Allow unfiltered uploads for WooCommerce product images (Unsplash URLs)
add_filter('upload_mimes', function ($mimes) {
    $mimes['jpg|jpeg|jpe'] = 'image/jpeg';
    $mimes['png'] = 'image/png';
    $mimes['webp'] = 'image/webp';
    return $mimes;
});

// Fix WooCommerce image sideload: allow URLs without file extension
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {
    if (empty($data['type'])) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $real_mime = finfo_file($finfo, $file);
        finfo_close($finfo);
        if (in_array($real_mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
            $ext_map = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif',
            ];
            $ext = $ext_map[$real_mime];
            $data['ext']  = $ext;
            $data['type'] = $real_mime;
            // Ensure filename has proper extension
            if (!preg_match('/\.' . $ext . '$/i', $filename)) {
                $data['proper_filename'] = $filename . '.' . $ext;
            }
        }
    }
    return $data;
}, 10, 4);

// Fix download URL for sideloading: ensure downloaded temp files get proper extension
add_filter('wp_handle_sideload_prefilter', function ($file) {
    if (empty(pathinfo($file['name'], PATHINFO_EXTENSION))) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        $ext_map = [
            'image/jpeg' => '.jpg',
            'image/png'  => '.png',
            'image/webp' => '.webp',
            'image/gif'  => '.gif',
        ];
        if (isset($ext_map[$mime])) {
            $file['name'] .= $ext_map[$mime];
        }
    }
    return $file;
});


/* =============================================
   2. ANNOUNCEMENT BAR (above header)
   ============================================= */

add_action('storefront_before_header', function () { ?>
<div class="vn-announcement" id="vn-announcement">
    <span>Envio gratis en pedidos mayores a $150.000 COP &nbsp;|&nbsp; Devoluciones en 30 dias</span>
    <button class="vn-announcement__close" onclick="document.getElementById('vn-announcement').style.display='none'" aria-label="Cerrar">&times;</button>
</div>
<?php }, 5);


/* =============================================
   3. CSS - All styles in wp_head
   ============================================= */

add_action('wp_head', function () { ?>

<!-- Google Fonts: Inter + Playfair Display -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

<style>
/* ===========================================
   VISNEX PREMIUM v3.0
   Inspired by: Gucci, Apple, Nike, Stella Guan
   =========================================== */

/* --- CSS Custom Properties (Design Tokens) --- */
:root {
    /* Primarios */
    --vn-black:         #0A0A0A;
    --vn-white:         #FFFFFF;
    --vn-off-white:     #FAFAFA;

    /* Neutros */
    --vn-gray-100:      #F5F5F7;
    --vn-gray-200:      #E8E8ED;
    --vn-gray-300:      #D2D2D7;
    --vn-gray-500:      #86868B;
    --vn-gray-700:      #424245;
    --vn-gray-900:      #1D1D1F;

    /* Acento - Azul premium (Apple) */
    --vn-accent:        #2997FF;
    --vn-accent-hover:  #0077ED;

    /* Acento moda - Dorado (Gucci luxury) */
    --vn-fashion:       #C8A97E;
    --vn-fashion-light: #E8D5B7;

    /* Funcionales */
    --vn-success:       #2D8A39;
    --vn-error:         #DE3B40;

    /* Fonts */
    --vn-font-primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --vn-font-editorial:  'Playfair Display', Georgia, 'Times New Roman', serif;

    /* Type scale */
    --vn-text-xs:    0.6875rem;   /* 11px */
    --vn-text-sm:    0.8125rem;   /* 13px */
    --vn-text-base:  0.875rem;    /* 14px */
    --vn-text-md:    1rem;        /* 16px */
    --vn-text-lg:    1.125rem;    /* 18px */
    --vn-text-xl:    1.25rem;     /* 20px */
    --vn-text-2xl:   1.5rem;      /* 24px */
    --vn-text-3xl:   1.75rem;     /* 28px */
    --vn-text-4xl:   2.25rem;     /* 36px */
    --vn-text-5xl:   2.625rem;    /* 42px */
    --vn-text-7xl:   4.5rem;      /* 72px */

    /* Spacing */
    --vn-container-pad: clamp(1rem, 5vw, 3rem);
    --vn-container-max: 1280px;

    /* Radius */
    --vn-radius-sm:   4px;
    --vn-radius-md:   8px;
    --vn-radius-lg:   12px;
    --vn-radius-xl:   16px;
    --vn-radius-pill:  9999px;

    /* Shadows */
    --vn-shadow-sm:    0 1px 2px rgba(0,0,0,0.05);
    --vn-shadow-md:    0 4px 12px rgba(0,0,0,0.08);
    --vn-shadow-lg:    0 8px 30px rgba(0,0,0,0.12);
    --vn-shadow-xl:    0 20px 60px rgba(0,0,0,0.15);

    /* Transitions */
    --vn-ease:         cubic-bezier(0.25, 0.1, 0.25, 1);
    --vn-ease-out:     cubic-bezier(0.4, 0, 0.2, 1);
    --vn-transition:   all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* --- Reset & Base --- */
*, *::before, *::after { box-sizing: border-box; }

body.visnex-store {
    font-family: var(--vn-font-primary) !important;
    color: var(--vn-gray-900) !important;
    background: var(--vn-white) !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    overflow-x: hidden;
    line-height: 1.6;
}

html { scroll-behavior: smooth; }


/* ===================================================
   ANNOUNCEMENT BAR
   =================================================== */
.vn-announcement {
    height: 36px;
    background: var(--vn-black);
    color: var(--vn-white);
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-xs);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10001;
}

.vn-announcement__close {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 0.5rem;
    line-height: 1;
    transition: color 0.3s;
}

.vn-announcement__close:hover {
    color: var(--vn-white);
}


/* ===================================================
   HEADER / NAVIGATION (Apple-style blur glass)
   =================================================== */
.site-header,
#masthead {
    background: rgba(255,255,255,0.72) !important;
    backdrop-filter: saturate(180%) blur(20px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(20px) !important;
    border-bottom: 1px solid rgba(0,0,0,0.08) !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 9999 !important;
    padding: 0 !important;
    box-shadow: none !important;
    transition: box-shadow 0.3s ease !important;
}

/* Shadow on scroll (added via JS) */
.site-header.vn-scrolled {
    box-shadow: 0 1px 12px rgba(0,0,0,0.08) !important;
}

.site-branding {
    padding: 10px 0 !important;
}

/* Logo: VISNEX uppercase with wide tracking */
.site-title a,
.beta .site-title a {
    font-family: var(--vn-font-primary) !important;
    font-weight: 700 !important;
    font-size: 1.1rem !important;
    letter-spacing: 0.2em !important;
    text-transform: uppercase !important;
    color: var(--vn-black) !important;
    text-decoration: none !important;
}

.site-description {
    display: none !important;
}

/* Nav items: 11px uppercase with wide spacing */
.main-navigation ul li a,
.storefront-primary-navigation ul li a {
    font-family: var(--vn-font-primary) !important;
    font-size: var(--vn-text-xs) !important;
    font-weight: 500 !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    color: var(--vn-gray-900) !important;
    padding: 12px 14px !important;
    transition: color 0.3s ease !important;
    text-decoration: none !important;
}

.main-navigation ul li a:hover,
.storefront-primary-navigation ul li a:hover {
    color: var(--vn-accent) !important;
}


/* ===================================================
   HIDE ALL WP CLUTTER
   =================================================== */
.storefront-breadcrumb,
.woocommerce-breadcrumb,
.woocommerce-result-count,
.woocommerce-ordering,
.storefront-sorting,
#secondary,
.widget-area,
aside,
.sidebar,
.entry-title,
.page-title,
.page .entry-header,
.hentry .entry-header {
    display: none !important;
}


/* ===================================================
   FULL WIDTH LAYOUT
   =================================================== */
.col-full,
.site-main,
.content-area {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
}

.site-content {
    margin-top: 0 !important;
}

.hentry {
    margin: 0 !important;
    padding: 0 !important;
}


/* ===================================================
   HERO SECTION (100vh, Ken Burns, Playfair Display)
   =================================================== */
.vn-hero {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-align: center;
    overflow: hidden;
}

.vn-hero__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: vnKenBurns 20s ease-in-out infinite alternate;
    will-change: transform;
}

@keyframes vnKenBurns {
    0%   { transform: scale(1); }
    100% { transform: scale(1.1); }
}

.vn-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to top,
        rgba(0,0,0,0.55) 0%,
        rgba(0,0,0,0.2) 40%,
        transparent 70%
    );
    z-index: 1;
}

.vn-hero__content {
    position: relative;
    z-index: 2;
    color: var(--vn-white);
    padding: 0 var(--vn-container-pad) 8vh;
    max-width: 900px;
}

.vn-hero__title {
    font-family: var(--vn-font-editorial) !important;
    font-size: var(--vn-text-7xl) !important;
    font-weight: 400 !important;
    font-style: italic !important;
    line-height: 1.1 !important;
    letter-spacing: -0.022em !important;
    color: var(--vn-white) !important;
    margin: 0 0 1.25rem !important;
}

.vn-hero__subtitle {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-lg);
    font-weight: 300;
    letter-spacing: 0.05em;
    color: rgba(255,255,255,0.7);
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.vn-hero__ctas {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

/* Primary CTA: white pill */
.vn-btn--white {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--vn-white);
    color: var(--vn-black) !important;
    padding: 14px 36px;
    border-radius: var(--vn-radius-pill);
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-base);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-decoration: none !important;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: var(--vn-transition);
}

.vn-btn--white:hover {
    background: var(--vn-gray-200);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255,255,255,0.2);
    color: var(--vn-black) !important;
}

/* Ghost text link CTA */
.vn-btn--ghost {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: none;
    border: none;
    color: rgba(255,255,255,0.8) !important;
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-base);
    font-weight: 400;
    letter-spacing: 0.03em;
    text-decoration: none !important;
    cursor: pointer;
    transition: color 0.3s ease;
    padding: 14px 8px;
}

.vn-btn--ghost:hover {
    color: var(--vn-white) !important;
}


/* ===================================================
   SECTIONS - Shared layout
   =================================================== */
.vn-section {
    padding: clamp(3.5rem, 8vw, 6rem) var(--vn-container-pad);
    max-width: var(--vn-container-max);
    margin: 0 auto;
}

.vn-section--full {
    max-width: 100%;
}

.vn-section--offwhite {
    background: var(--vn-off-white);
}

.vn-section__header {
    text-align: center;
    margin-bottom: 3rem;
}

.vn-section__title {
    font-family: var(--vn-font-primary) !important;
    font-size: clamp(1.5rem, 3vw, var(--vn-text-4xl)) !important;
    font-weight: 600 !important;
    letter-spacing: -0.022em !important;
    color: var(--vn-gray-900) !important;
    margin: 0 0 0.5rem !important;
    line-height: 1.2 !important;
}

.vn-section__subtitle {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-md);
    font-weight: 300;
    color: var(--vn-gray-500);
    margin: 0;
    letter-spacing: 0.02em;
}


/* ===================================================
   CATEGORIES SECTION (3 cards, 3:4 ratio)
   =================================================== */
.vn-categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
}

.vn-category-card {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: var(--vn-radius-lg);
    cursor: pointer;
    text-decoration: none !important;
    display: block;
    transition: transform 0.5s var(--vn-ease), box-shadow 0.5s var(--vn-ease);
}

.vn-category-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--vn-shadow-xl);
}

.vn-category-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s var(--vn-ease-out);
}

.vn-category-card:hover .vn-category-card__img {
    transform: scale(1.05);
}

.vn-category-card__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    padding: 3rem 1.75rem 1.75rem;
    z-index: 2;
}

.vn-category-card__name {
    color: var(--vn-white) !important;
    font-family: var(--vn-font-primary) !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    margin: 0 0 0.25rem !important;
}

.vn-category-card__cta {
    color: rgba(255,255,255,0.6);
    font-size: var(--vn-text-xs);
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}


/* ===================================================
   PRODUCT GRID (WooCommerce overrides)
   =================================================== */
.woocommerce ul.products {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 1.5rem !important;
    padding: 0 !important;
    margin: 0 !important;
    list-style: none !important;
}

.woocommerce ul.products li.product {
    text-align: left !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    float: none !important;
    position: relative;
}

/* Product image: 3:4 portrait ratio */
.woocommerce ul.products li.product a img,
.woocommerce ul.products li.product img {
    border-radius: var(--vn-radius-lg) !important;
    aspect-ratio: 3 / 4 !important;
    object-fit: cover !important;
    width: 100% !important;
    transition: transform 0.5s var(--vn-ease-out) !important;
}

.woocommerce ul.products li.product:hover img {
    transform: scale(1.03) !important;
}

/* Product image wrapper for overflow hidden */
.woocommerce ul.products li.product a.woocommerce-LoopProduct-link {
    display: block;
    overflow: hidden;
    border-radius: var(--vn-radius-lg);
    position: relative;
}

/* "Vista Rapida" overlay on hover */
.woocommerce ul.products li.product a.woocommerce-LoopProduct-link::after {
    content: 'Vista Rapida';
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    background: rgba(255,255,255,0.95);
    color: var(--vn-black);
    font-size: var(--vn-text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.6rem 1.5rem;
    border-radius: var(--vn-radius-pill);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 3;
    pointer-events: none;
}

.woocommerce ul.products li.product:hover a.woocommerce-LoopProduct-link::after {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

/* Product title */
.woocommerce ul.products li.product .woocommerce-loop-product__title,
.woocommerce ul.products li.product h2 {
    font-family: var(--vn-font-primary) !important;
    font-size: var(--vn-text-sm) !important;
    font-weight: 400 !important;
    color: var(--vn-gray-900) !important;
    margin-top: 0.85rem !important;
    padding: 0 !important;
    letter-spacing: 0 !important;
    line-height: 1.4 !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Product price */
.woocommerce ul.products li.product .price {
    color: var(--vn-gray-500) !important;
    font-size: var(--vn-text-sm) !important;
    font-weight: 400 !important;
    font-family: var(--vn-font-primary) !important;
}

/* Hide add-to-cart by default (clean like Gucci) */
.woocommerce ul.products li.product .button,
.woocommerce ul.products li.product a.add_to_cart_button,
.woocommerce ul.products li.product a.added_to_cart {
    position: absolute !important;
    bottom: 3.5rem !important;
    right: 0.75rem !important;
    background: var(--vn-black) !important;
    color: var(--vn-white) !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: var(--vn-radius-pill) !important;
    padding: 0 !important;
    font-size: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    opacity: 0 !important;
    transition: all 0.3s ease !important;
    border: none !important;
    z-index: 4;
    overflow: hidden;
}

.woocommerce ul.products li.product .button::before,
.woocommerce ul.products li.product a.add_to_cart_button::before {
    content: '+';
    font-size: 1.2rem;
    font-weight: 300;
    color: var(--vn-white);
    line-height: 1;
}

.woocommerce ul.products li.product:hover .button,
.woocommerce ul.products li.product:hover a.add_to_cart_button,
.woocommerce ul.products li.product:hover a.added_to_cart {
    opacity: 1 !important;
}

.woocommerce ul.products li.product .button:hover,
.woocommerce ul.products li.product a.add_to_cart_button:hover {
    background: var(--vn-gray-700) !important;
    transform: scale(1.1) !important;
}

/* Sale badge */
.woocommerce span.onsale {
    background: var(--vn-error) !important;
    border-radius: var(--vn-radius-sm) !important;
    font-size: var(--vn-text-xs) !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: 3px 10px !important;
    min-height: auto !important;
    min-width: auto !important;
    line-height: 1.5 !important;
}


/* ===================================================
   EDITORIAL SPLIT (Brand Story)
   =================================================== */
.vn-editorial {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    min-height: 70vh;
    overflow: hidden;
}

.vn-editorial__image {
    overflow: hidden;
}

.vn-editorial__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    aspect-ratio: 4 / 5;
    border-radius: 0;
    transition: transform 0.8s ease;
}

.vn-editorial:hover .vn-editorial__image img {
    transform: scale(1.03);
}

.vn-editorial__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(2.5rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem);
    background: var(--vn-gray-100);
}

.vn-editorial__label {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-xs);
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--vn-fashion);
    margin-bottom: 1rem;
}

.vn-editorial__title {
    font-family: var(--vn-font-editorial) !important;
    font-size: clamp(1.75rem, 3vw, 2.5rem) !important;
    font-weight: 400 !important;
    font-style: italic !important;
    line-height: 1.2 !important;
    color: var(--vn-gray-900) !important;
    margin: 0 0 1.25rem !important;
}

.vn-editorial__text {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-base);
    color: var(--vn-gray-700);
    line-height: 1.75;
    margin-bottom: 2rem;
}

.vn-editorial__link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-base);
    font-weight: 500;
    color: var(--vn-gray-900) !important;
    text-decoration: none !important;
    letter-spacing: 0.02em;
    transition: gap 0.3s ease, color 0.3s ease;
}

.vn-editorial__link:hover {
    gap: 0.8rem;
    color: var(--vn-accent) !important;
}


/* ===================================================
   TRUST BAR (4 icons)
   =================================================== */
.vn-trust {
    padding: 2.5rem var(--vn-container-pad);
    background: var(--vn-off-white);
    border-top: 1px solid var(--vn-gray-200);
    border-bottom: 1px solid var(--vn-gray-200);
}

.vn-trust__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: var(--vn-container-max);
    margin: 0 auto;
    text-align: center;
}

.vn-trust__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.vn-trust__icon {
    width: 28px;
    height: 28px;
    stroke: var(--vn-gray-900);
    stroke-width: 1.5;
    fill: none;
}

.vn-trust__title {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--vn-gray-900);
}

.vn-trust__desc {
    font-size: 0.625rem;
    color: var(--vn-gray-500);
    letter-spacing: 0.05em;
}


/* ===================================================
   NEWSLETTER (Dark section)
   =================================================== */
.vn-newsletter {
    padding: clamp(4rem, 8vw, 6rem) var(--vn-container-pad);
    background: var(--vn-black);
    text-align: center;
}

.vn-newsletter__title {
    font-family: var(--vn-font-editorial) !important;
    font-size: clamp(1.75rem, 3vw, 2.5rem) !important;
    font-weight: 400 !important;
    font-style: italic !important;
    color: var(--vn-white) !important;
    margin: 0 0 0.75rem !important;
    line-height: 1.2 !important;
}

.vn-newsletter__subtitle {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-md);
    color: rgba(255,255,255,0.5);
    margin-bottom: 2.5rem;
    font-weight: 300;
}

.vn-newsletter__form {
    display: flex;
    gap: 0.75rem;
    max-width: 460px;
    margin: 0 auto;
    align-items: stretch;
}

.vn-newsletter__input {
    flex: 1;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: var(--vn-radius-pill);
    color: var(--vn-white);
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-base);
    padding: 12px 20px;
    outline: none;
    transition: border-color 0.3s ease;
}

.vn-newsletter__input:focus {
    border-color: var(--vn-white);
}

.vn-newsletter__input::placeholder {
    color: rgba(255,255,255,0.4);
}

.vn-newsletter__btn {
    background: var(--vn-white);
    color: var(--vn-black);
    border: none;
    border-radius: var(--vn-radius-pill);
    padding: 12px 28px;
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-sm);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.3s ease;
    white-space: nowrap;
}

.vn-newsletter__btn:hover {
    opacity: 0.85;
}


/* ===================================================
   WooCommerce BUTTONS (global overrides)
   =================================================== */
.woocommerce a.button.alt,
.woocommerce button.button.alt,
.woocommerce input.button,
.button,
.wp-block-button__link {
    background: var(--vn-black) !important;
    color: var(--vn-white) !important;
    border: none !important;
    border-radius: var(--vn-radius-pill) !important;
    font-family: var(--vn-font-primary) !important;
    font-size: var(--vn-text-sm) !important;
    font-weight: 600 !important;
    padding: 12px 28px !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    transition: var(--vn-transition) !important;
    line-height: 1.5 !important;
}

.woocommerce a.button.alt:hover,
.woocommerce button.button.alt:hover,
.woocommerce input.button:hover,
.button:hover,
.wp-block-button__link:hover {
    background: var(--vn-gray-700) !important;
    color: var(--vn-white) !important;
}


/* ===================================================
   SINGLE PRODUCT PAGE
   =================================================== */
.woocommerce div.product {
    max-width: var(--vn-container-max) !important;
    margin: 0 auto !important;
    padding: 2rem var(--vn-container-pad) 4rem !important;
}

.woocommerce div.product div.images img {
    border-radius: var(--vn-radius-lg) !important;
}

.woocommerce div.product .product_title {
    font-family: var(--vn-font-editorial) !important;
    font-size: var(--vn-text-3xl) !important;
    font-weight: 400 !important;
    font-style: italic !important;
    letter-spacing: -0.01em !important;
    color: var(--vn-gray-900) !important;
    margin-bottom: 0.75rem !important;
}

.woocommerce div.product p.price {
    font-family: var(--vn-font-primary) !important;
    font-size: var(--vn-text-xl) !important;
    color: var(--vn-gray-500) !important;
    font-weight: 400 !important;
}

.woocommerce div.product .woocommerce-product-details__short-description,
.woocommerce div.product .product_meta {
    font-size: var(--vn-text-base) !important;
    line-height: 1.7 !important;
    color: var(--vn-gray-700) !important;
}

/* Single product Add to Cart */
.woocommerce div.product form.cart .button {
    background: var(--vn-black) !important;
    color: var(--vn-white) !important;
    border-radius: var(--vn-radius-pill) !important;
    font-size: var(--vn-text-base) !important;
    font-weight: 600 !important;
    padding: 14px 36px !important;
    letter-spacing: 0.05em !important;
    width: auto !important;
    height: auto !important;
    opacity: 1 !important;
    position: relative !important;
    bottom: auto !important;
    right: auto !important;
}

.woocommerce div.product form.cart .button::before {
    display: none !important;
}

.woocommerce div.product form.cart .button:hover {
    background: var(--vn-gray-700) !important;
}

/* Quantity input on single product */
.woocommerce .quantity .qty {
    border-radius: var(--vn-radius-md) !important;
    border: 1px solid var(--vn-gray-200) !important;
    padding: 10px 12px !important;
    font-family: var(--vn-font-primary) !important;
    width: 70px !important;
}

/* Tabs on single product */
.woocommerce div.product .woocommerce-tabs ul.tabs {
    border-bottom: 1px solid var(--vn-gray-200) !important;
}

.woocommerce div.product .woocommerce-tabs ul.tabs li a {
    font-family: var(--vn-font-primary) !important;
    font-size: var(--vn-text-sm) !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: var(--vn-gray-500) !important;
}

.woocommerce div.product .woocommerce-tabs ul.tabs li.active a {
    color: var(--vn-gray-900) !important;
}


/* ===================================================
   FOOTER (4 columns, dark)
   =================================================== */
.site-footer,
.storefront-footer {
    background: var(--vn-black) !important;
    color: rgba(255,255,255,0.5) !important;
    padding: 0 !important;
}

.vn-footer {
    padding: 4rem var(--vn-container-pad) 1.5rem;
    max-width: var(--vn-container-max);
    margin: 0 auto;
}

.vn-footer__grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 2.5rem;
    margin-bottom: 3rem;
}

.vn-footer__brand-desc {
    font-size: var(--vn-text-sm);
    color: rgba(255,255,255,0.4);
    line-height: 1.7;
    margin-top: 0.75rem;
}

.vn-footer__brand-name {
    font-family: var(--vn-font-primary);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--vn-white);
}

.vn-footer__col-title {
    font-family: var(--vn-font-primary);
    font-size: var(--vn-text-xs);
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--vn-white);
    margin-bottom: 1.25rem;
}

.vn-footer__link {
    display: block;
    font-size: var(--vn-text-sm);
    color: rgba(255,255,255,0.5) !important;
    text-decoration: none !important;
    padding: 0.3rem 0;
    transition: color 0.3s ease;
}

.vn-footer__link:hover {
    color: var(--vn-white) !important;
}

.vn-footer__bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 1.5rem;
    text-align: center;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.05em;
}

/* Hide default Storefront footer info */
.site-info,
.site-footer .site-info {
    display: none !important;
}

.site-footer a {
    color: rgba(255,255,255,0.5) !important;
}


/* ===================================================
   ANIMATIONS (Intersection Observer)
   =================================================== */
.vn-animate-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s var(--vn-ease-out);
}

.vn-animate-in.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* Stagger children */
.vn-stagger > .vn-animate-in:nth-child(1) { transition-delay: 0ms; }
.vn-stagger > .vn-animate-in:nth-child(2) { transition-delay: 80ms; }
.vn-stagger > .vn-animate-in:nth-child(3) { transition-delay: 160ms; }
.vn-stagger > .vn-animate-in:nth-child(4) { transition-delay: 240ms; }

/* Hero entrance */
@keyframes vnFadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
}

.vn-hero__content > * {
    animation: vnFadeUp 0.8s ease forwards;
}

.vn-hero__title  { animation-delay: 0.2s; opacity: 0; }
.vn-hero__subtitle { animation-delay: 0.5s; opacity: 0; }
.vn-hero__ctas   { animation-delay: 0.8s; opacity: 0; }


/* ===================================================
   REDUCED MOTION
   =================================================== */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .vn-animate-in { opacity: 1; transform: none; }
    .vn-hero__content > * { opacity: 1; }
    .vn-hero__bg { animation: none; }
}


/* ===================================================
   RESPONSIVE
   =================================================== */

/* Tablet */
@media (max-width: 1024px) {
    .woocommerce ul.products {
        grid-template-columns: repeat(3, 1fr) !important;
    }
}

/* Mobile landscape / Tablet small */
@media (max-width: 768px) {
    .vn-hero {
        height: 85vh;
        min-height: 500px;
    }

    .vn-hero__title {
        font-size: var(--vn-text-5xl) !important;
    }

    .vn-categories {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .vn-categories .vn-category-card {
        aspect-ratio: 16 / 9;
    }

    .woocommerce ul.products {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 1rem !important;
    }

    .vn-editorial {
        grid-template-columns: 1fr;
        min-height: auto;
    }

    .vn-editorial__image img {
        aspect-ratio: 16 / 9;
    }

    .vn-trust__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .vn-footer__grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .vn-newsletter__form {
        flex-direction: column;
    }
}

/* Mobile portrait */
@media (max-width: 480px) {
    .vn-hero__title {
        font-size: 2.5rem !important;
    }

    .vn-hero__ctas {
        flex-direction: column;
        gap: 0.75rem;
    }

    .woocommerce ul.products {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.75rem !important;
    }

    .vn-footer__grid {
        grid-template-columns: 1fr;
    }

    .vn-announcement {
        font-size: 0.55rem;
        letter-spacing: 0.05em;
    }
}


/* ===================================================
   SHOP/ARCHIVE PAGE OVERRIDES
   =================================================== */
.woocommerce .products .star-rating {
    display: none !important;
}

.woocommerce-page .site-main {
    padding: 2rem var(--vn-container-pad) !important;
    max-width: var(--vn-container-max) !important;
    margin: 0 auto !important;
}
</style>

<?php });


/* =============================================
   4. HOMEPAGE CONTENT (the_content filter)
   ============================================= */

add_filter('the_content', function ($content) {
    if (!is_front_page()) return $content;

    ob_start(); ?>

<!-- ========== HERO (100vh, Ken Burns, Playfair) ========== -->
<section class="vn-hero">
    <img class="vn-hero__bg"
         src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80"
         alt="VISNEX Fashion Editorial"
         fetchpriority="high">
    <div class="vn-hero__overlay"></div>
    <div class="vn-hero__content">
        <h1 class="vn-hero__title">El Arte de<br>Vestir Bien</h1>
        <p class="vn-hero__subtitle">Coleccion curada de moda premium. Diseno, calidad y tendencia<br>en cada prenda que elegimos para ti.</p>
        <div class="vn-hero__ctas">
            <a href="/shop/" class="vn-btn--white">Explorar Coleccion</a>
            <a href="/product-category/mujer/" class="vn-btn--ghost">Ver Novedades &rarr;</a>
        </div>
    </div>
</section>

<!-- ========== CATEGORIES (3 cards, 3:4 ratio) ========== -->
<section class="vn-section">
    <div class="vn-section__header vn-animate-in">
        <h2 class="vn-section__title">Compra por Categoria</h2>
        <p class="vn-section__subtitle">Encuentra exactamente lo que buscas</p>
    </div>
    <div class="vn-categories vn-stagger">
        <a href="/product-category/mujer/" class="vn-category-card vn-animate-in">
            <img class="vn-category-card__img" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" alt="Moda Mujer VISNEX" loading="lazy">
            <div class="vn-category-card__overlay">
                <h3 class="vn-category-card__name">Mujer</h3>
                <span class="vn-category-card__cta">Explorar coleccion</span>
            </div>
        </a>
        <a href="/product-category/hombre/" class="vn-category-card vn-animate-in">
            <img class="vn-category-card__img" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" alt="Moda Hombre VISNEX" loading="lazy">
            <div class="vn-category-card__overlay">
                <h3 class="vn-category-card__name">Hombre</h3>
                <span class="vn-category-card__cta">Explorar coleccion</span>
            </div>
        </a>
        <a href="/shop/" class="vn-category-card vn-animate-in">
            <img class="vn-category-card__img" src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80" alt="Accesorios VISNEX" loading="lazy">
            <div class="vn-category-card__overlay">
                <h3 class="vn-category-card__name">Accesorios</h3>
                <span class="vn-category-card__cta">Lo mas reciente</span>
            </div>
        </a>
    </div>
</section>

<!-- ========== SELECCION PREMIUM (4 latest products) ========== -->
<section class="vn-section vn-section--full vn-section--offwhite">
    <div style="max-width:var(--vn-container-max);margin:0 auto;">
        <div class="vn-section__header vn-animate-in">
            <h2 class="vn-section__title">Seleccion Premium</h2>
            <p class="vn-section__subtitle">Prendas cuidadosamente seleccionadas para ti</p>
        </div>
        <?php echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); ?>
    </div>
</section>

<!-- ========== EDITORIAL SPLIT (Brand Story) ========== -->
<section class="vn-editorial vn-animate-in">
    <div class="vn-editorial__image">
        <img src="https://images.unsplash.com/photo-1558171813-01a0f0e5599b?w=800&q=80" alt="La historia de VISNEX" loading="lazy">
    </div>
    <div class="vn-editorial__content">
        <span class="vn-editorial__label">Nuestra Historia</span>
        <h2 class="vn-editorial__title">Moda con Proposito,<br>Estilo sin Limites</h2>
        <p class="vn-editorial__text">VISNEX nace de la conviccion de que la moda debe ser accesible, de calidad y con proposito. Cada prenda en nuestra tienda es seleccionada pensando en ti, trabajando con los mejores proveedores para traerte las ultimas tendencias a precios justos.</p>
        <a href="/shop/" class="vn-editorial__link">Descubrir mas &rarr;</a>
    </div>
</section>

<!-- ========== TRUST BAR (4 icons) ========== -->
<section class="vn-trust">
    <div class="vn-trust__grid">
        <div class="vn-trust__item vn-animate-in">
            <svg class="vn-trust__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="6" width="15" height="12" rx="1" stroke="currentColor" fill="none" stroke-width="1.5"/>
                <polyline points="16,10 21,8 21,18 16,16" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/>
                <line x1="1" y1="10" x2="6" y2="10" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="4" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/>
                <circle cx="13" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/>
            </svg>
            <span class="vn-trust__title">Envio Gratis</span>
            <span class="vn-trust__desc">En pedidos +$150.000</span>
        </div>
        <div class="vn-trust__item vn-animate-in">
            <svg class="vn-trust__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polyline points="1,4 1,10 7,10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="vn-trust__title">30 Dias</span>
            <span class="vn-trust__desc">Devoluciones faciles</span>
        </div>
        <div class="vn-trust__item vn-animate-in">
            <svg class="vn-trust__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/>
                <polyline points="9,12 11,14 15,10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="vn-trust__title">Pago Seguro</span>
            <span class="vn-trust__desc">Encriptacion SSL</span>
        </div>
        <div class="vn-trust__item vn-animate-in">
            <svg class="vn-trust__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="vn-trust__title">Soporte 24/7</span>
            <span class="vn-trust__desc">Siempre disponibles</span>
        </div>
    </div>
</section>

<!-- ========== TENDENCIA (4 popular products) ========== -->
<section class="vn-section">
    <div class="vn-section__header vn-animate-in">
        <h2 class="vn-section__title">Tendencia</h2>
        <p class="vn-section__subtitle">Lo que mas esta gustando esta temporada</p>
    </div>
    <?php echo do_shortcode('[products limit="4" columns="4" orderby="popularity"]'); ?>
</section>

<!-- ========== NEWSLETTER (Dark) ========== -->
<section class="vn-newsletter">
    <h2 class="vn-newsletter__title vn-animate-in">Unete al Mundo VISNEX</h2>
    <p class="vn-newsletter__subtitle vn-animate-in">Se el primero en conocer nuevas colecciones, lanzamientos exclusivos y ofertas especiales.</p>
    <div class="vn-newsletter__form vn-animate-in">
        <input type="email" class="vn-newsletter__input" placeholder="Tu correo electronico" aria-label="Email">
        <button class="vn-newsletter__btn" type="button">Suscribirse</button>
    </div>
</section>

<?php return ob_get_clean();
}, 10);


/* =============================================
   5. CUSTOM FOOTER (4 columns, dark)
   ============================================= */

add_action('storefront_footer', function () { ?>
<div class="vn-footer">
    <div class="vn-footer__grid">
        <!-- Brand -->
        <div>
            <div class="vn-footer__brand-name">VISNEX</div>
            <p class="vn-footer__brand-desc">Moda premium con proposito. Estilo que te define, calidad que te acompana. Curado con pasion para quienes buscan lo mejor.</p>
        </div>
        <!-- Tienda -->
        <div>
            <div class="vn-footer__col-title">Tienda</div>
            <a href="/product-category/mujer/" class="vn-footer__link">Mujer</a>
            <a href="/product-category/hombre/" class="vn-footer__link">Hombre</a>
            <a href="/shop/" class="vn-footer__link">Nuevos Llegados</a>
            <a href="/shop/" class="vn-footer__link">Accesorios</a>
        </div>
        <!-- Ayuda -->
        <div>
            <div class="vn-footer__col-title">Ayuda</div>
            <a href="#" class="vn-footer__link">Envios</a>
            <a href="#" class="vn-footer__link">Devoluciones</a>
            <a href="#" class="vn-footer__link">Guia de Tallas</a>
            <a href="#" class="vn-footer__link">Contacto</a>
        </div>
        <!-- Siguenos -->
        <div>
            <div class="vn-footer__col-title">Siguenos</div>
            <a href="#" class="vn-footer__link">Instagram</a>
            <a href="#" class="vn-footer__link">Facebook</a>
            <a href="#" class="vn-footer__link">TikTok</a>
            <a href="#" class="vn-footer__link">Pinterest</a>
        </div>
    </div>
    <div class="vn-footer__bottom">
        &copy; <?php echo date('Y'); ?> VISNEX. Todos los derechos reservados. &nbsp;&middot;&nbsp; Politica de Privacidad &nbsp;&middot;&nbsp; Terminos y Condiciones
    </div>
</div>
<?php }, 5);


/* =============================================
   6. JAVASCRIPT (Intersection Observer + Header scroll)
   ============================================= */

add_action('wp_footer', function () { ?>
<script>
(function() {
    'use strict';

    /* --- Intersection Observer: fade-in-up animations --- */
    var observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.vn-animate-in').forEach(function(el) {
        observer.observe(el);
    });

    /* --- Header: add shadow on scroll --- */
    var header = document.querySelector('.site-header, #masthead');
    if (header) {
        var lastScroll = 0;
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY || window.pageYOffset;
            if (scrollY > 50) {
                header.classList.add('vn-scrolled');
            } else {
                header.classList.remove('vn-scrolled');
            }
            lastScroll = scrollY;
        }, { passive: true });
    }
})();
</script>
<?php }, 99);
