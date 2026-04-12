<?php
/**
 * Plugin Name: VISNEX Premium Style
 * Description: Apple-inspired premium fashion store styling
 */

// Premium CSS
add_action("wp_head", function() {
    echo '<style>
    /* VISNEX Premium Fashion Store - Apple-inspired */
    :root {
        --vn-primary: #1d1d1f;
        --vn-accent: #0071e3;
        --vn-bg: #ffffff;
        --vn-text: #1d1d1f;
        --vn-text-light: #6e6e73;
        --vn-border: #d2d2d7;
        --vn-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body {
        font-family: var(--vn-font) !important;
        color: var(--vn-text) !important;
        background: var(--vn-bg) !important;
        -webkit-font-smoothing: antialiased;
    }

    /* Clean typography */
    h1, h2, h3, h4, h5, h6 {
        font-weight: 600 !important;
        letter-spacing: -0.02em !important;
        color: var(--vn-primary) !important;
    }

    h1 { font-size: 2.5rem !important; }
    h2 { font-size: 2rem !important; }

    /* Header - minimal with blur */
    .site-header, header#masthead {
        background: rgba(255,255,255,0.9) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid var(--vn-border) !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 999 !important;
    }

    /* Site branding */
    .site-title a, .custom-logo-link, .beta {
        font-weight: 700 !important;
        font-size: 1.4rem !important;
        letter-spacing: -0.03em !important;
        color: var(--vn-primary) !important;
    }
    .site-description {
        font-size: 0.75rem !important;
        color: var(--vn-text-light) !important;
        letter-spacing: 0.05em !important;
        text-transform: uppercase !important;
    }

    /* Navigation - clean */
    .main-navigation a, .site-navigation a, .primary-navigation a, nav a,
    .storefront-primary-navigation a {
        font-size: 0.85rem !important;
        font-weight: 500 !important;
        letter-spacing: 0.02em !important;
        text-transform: none !important;
        color: var(--vn-text) !important;
        transition: color 0.2s !important;
    }
    .main-navigation a:hover, nav a:hover,
    .storefront-primary-navigation a:hover {
        color: var(--vn-accent) !important;
    }

    /* Storefront specific nav cleanup */
    .storefront-primary-navigation {
        background: transparent !important;
    }
    .storefront-primary-navigation .secondary-navigation {
        display: none !important;
    }

    /* Product cards - premium */
    .woocommerce ul.products li.product {
        text-align: center !important;
        border: none !important;
        box-shadow: none !important;
        transition: transform 0.3s ease !important;
        padding: 1rem !important;
    }
    .woocommerce ul.products li.product:hover {
        transform: translateY(-4px) !important;
    }
    .woocommerce ul.products li.product a img,
    .woocommerce ul.products li.product img {
        border-radius: 16px !important;
        transition: transform 0.3s ease !important;
    }
    .woocommerce ul.products li.product:hover img {
        transform: scale(1.02) !important;
    }
    .woocommerce ul.products li.product .woocommerce-loop-product__title {
        font-size: 0.95rem !important;
        font-weight: 500 !important;
        color: var(--vn-primary) !important;
        margin-top: 0.75rem !important;
    }
    .woocommerce ul.products li.product .price {
        color: var(--vn-text-light) !important;
        font-size: 0.9rem !important;
    }

    /* Buttons - pill style */
    .button, .wp-block-button__link, .woocommerce a.button,
    .woocommerce button.button, .woocommerce input.button,
    .woocommerce .cart .button, .woocommerce .checkout-button,
    .woocommerce a.button.alt, .woocommerce button.button.alt {
        background-color: var(--vn-accent) !important;
        color: #fff !important;
        border: none !important;
        border-radius: 999px !important;
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        padding: 0.75rem 1.5rem !important;
        text-transform: none !important;
        letter-spacing: 0 !important;
        transition: all 0.2s ease !important;
    }
    .button:hover, .woocommerce a.button:hover,
    .woocommerce button.button:hover,
    .woocommerce a.button.alt:hover,
    .woocommerce button.button.alt:hover {
        background-color: #0077ED !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(0,113,227,0.3) !important;
    }

    /* Product single page */
    .woocommerce div.product div.images img {
        border-radius: 16px !important;
    }
    .woocommerce div.product .product_title {
        font-size: 1.8rem !important;
        font-weight: 600 !important;
    }
    .woocommerce div.product p.price {
        font-size: 1.3rem !important;
        color: var(--vn-text-light) !important;
    }

    /* Footer - clean dark */
    .site-footer, footer.site-footer {
        background: var(--vn-primary) !important;
        color: #f5f5f7 !important;
        padding: 3rem 0 !important;
    }
    .site-footer a, footer a {
        color: var(--vn-accent) !important;
    }
    .site-footer .widget-area,
    .site-footer .footer-widgets {
        display: none !important;
    }
    .site-info {
        display: none !important;
    }

    /* Hide unnecessary clutter */
    .woocommerce-result-count,
    .woocommerce-ordering,
    .storefront-breadcrumb,
    .storefront-product-section:not(.storefront-recent-products),
    .storefront-handheld-footer-bar { display: none !important; }

    /* Spacing */
    .site-content, .content-area {
        max-width: 1200px !important;
        margin: 0 auto !important;
    }

    /* Sale badge */
    .woocommerce span.onsale {
        background: #ff3b30 !important;
        border-radius: 999px !important;
        font-size: 0.75rem !important;
        padding: 0.3rem 0.7rem !important;
        min-height: auto !important;
        min-width: auto !important;
        line-height: 1.4 !important;
    }

    /* Cart notification */
    .woocommerce-message {
        border-top-color: var(--vn-accent) !important;
        border-radius: 8px !important;
    }

    /* Storefront homepage clean */
    .page-template-template-homepage .site-main,
    .page-template-default .entry-content {
        padding: 2rem 1rem !important;
    }

    /* Admin bar offset fix */
    .admin-bar .site-header {
        top: 32px !important;
    }
    </style>';
});

// Custom homepage content
add_filter("the_content", function($content) {
    if (is_front_page() && in_the_loop() && is_main_query()) {
        $hero = '
        <div style="text-align:center; padding:4rem 1rem 3rem;">
            <h1 style="font-size:3.5rem !important; font-weight:700; letter-spacing:-0.04em; margin-bottom:0.5rem; color:#1d1d1f;">VISNEX</h1>
            <p style="font-size:1.3rem; color:#6e6e73; font-weight:300; margin-bottom:2rem;">Moda Premium | Estilo que te define</p>
            <a href="/shop" style="display:inline-block; background:#0071e3; color:#fff; padding:0.85rem 2rem; border-radius:999px; text-decoration:none; font-weight:600; font-size:0.95rem; transition:all 0.2s;">Explorar Coleccion</a>
        </div>
        <div style="text-align:center; padding:2rem 1rem; max-width:800px; margin:0 auto;">
            <h2 style="font-size:2rem; font-weight:600; letter-spacing:-0.02em; color:#1d1d1f; margin-bottom:1rem;">Donde la vision no tiene limites</h2>
            <p style="font-size:1.05rem; color:#6e6e73; line-height:1.7;">Descubre piezas seleccionadas con el mas alto estandar de calidad. Cada prenda cuenta una historia de elegancia y atencion al detalle.</p>
        </div>
        ' . do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]') . '
        <div style="text-align:center; padding:2rem 1rem 3rem;">
            <a href="/shop" style="display:inline-block; border:1.5px solid #0071e3; color:#0071e3; padding:0.75rem 2rem; border-radius:999px; text-decoration:none; font-weight:600; font-size:0.9rem;">Ver toda la coleccion</a>
        </div>
        ';
        return $hero;
    }
    return $content;
});

// Custom footer
add_action("wp_footer", function() {
    echo '<div style="text-align:center; padding:2rem 1rem; background:#1d1d1f; color:#86868b; font-size:0.8rem; font-family:system-ui,-apple-system,sans-serif;">
        <p style="margin:0 0 0.5rem;">&copy; ' . date("Y") . ' <strong style="color:#f5f5f7;">VISNEX</strong> &mdash; Moda Premium</p>
        <p style="margin:0;">Donde la mente no tiene limites y el futuro es el nexo.</p>
    </div>';
});
