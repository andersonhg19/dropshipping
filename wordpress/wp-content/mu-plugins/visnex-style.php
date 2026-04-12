<?php
/**
 * Plugin Name: VISNEX Premium Store
 * Description: Professional fashion ecommerce - Apple-inspired design
 * Version: 2.0
 */

// Remove sidebar
add_action('get_header', function() {
    remove_action('storefront_sidebar', 'storefront_get_sidebar', 10);
});
add_filter('body_class', function($classes) {
    $classes[] = 'visnex-store';
    return $classes;
});

// Remove breadcrumbs and clutter
add_action('init', function() {
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

add_filter('storefront_content_width', function() { return 1200; });

// ===== CSS =====
add_action('wp_head', function() { ?>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
:root{--vn:'Inter',system-ui,-apple-system,sans-serif;--vn-b:#1d1d1f;--vn-w:#fff;--vn-g1:#f5f5f7;--vn-g3:#86868b;--vn-g4:#6e6e73;--vn-a:#0071e3;--vn-t:all .3s cubic-bezier(.25,.1,.25,1)}
*{box-sizing:border-box}
body{font-family:var(--vn)!important;color:var(--vn-b)!important;background:var(--vn-w)!important;-webkit-font-smoothing:antialiased!important;overflow-x:hidden}

/* HEADER */
.site-header,#masthead{background:rgba(255,255,255,.85)!important;backdrop-filter:saturate(180%) blur(20px)!important;-webkit-backdrop-filter:saturate(180%) blur(20px)!important;border-bottom:1px solid rgba(0,0,0,.08)!important;position:sticky!important;top:0!important;z-index:9999!important;padding:0!important;box-shadow:none!important}
.site-branding{padding:12px 0!important}
.site-title a,.beta .site-title a{font-weight:700!important;font-size:1.4rem!important;letter-spacing:-.02em!important;color:var(--vn-b)!important}
.site-description{font-size:.7rem!important;color:var(--vn-g3)!important;letter-spacing:.1em!important;text-transform:uppercase!important}
.main-navigation ul li a,.storefront-primary-navigation ul li a{font-size:.8rem!important;font-weight:500!important;letter-spacing:.02em!important;text-transform:none!important;color:var(--vn-b)!important;padding:12px 16px!important;transition:var(--vn-t)!important}
.main-navigation ul li a:hover{color:var(--vn-a)!important}

/* HIDE CLUTTER */
.storefront-breadcrumb,.woocommerce-breadcrumb,.woocommerce-result-count,.woocommerce-ordering,.storefront-sorting,#secondary,.widget-area,aside,.sidebar,.entry-title,.page-title,.page .entry-header,.hentry .entry-header{display:none!important}

/* FULL WIDTH */
.col-full,.site-main,.content-area{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important}
.site-content{margin-top:0!important}
.hentry{margin:0!important;padding:0!important}

/* HERO */
.vn-hero{position:relative;width:100%;min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,#0a0a0a,#1a1a2e,#16213e);overflow:hidden}
.vn-hero::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80') center/cover;opacity:.25;filter:grayscale(30%)}
.vn-hero-c{position:relative;z-index:2;color:#fff;padding:2rem;max-width:800px}
.vn-hero h1{font-size:clamp(2.5rem,6vw,5rem)!important;font-weight:800!important;letter-spacing:-.04em!important;line-height:1.05!important;margin-bottom:1rem!important;color:#fff!important}
.vn-hero p{font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,.7);font-weight:300;margin-bottom:2rem;letter-spacing:.02em}
.vn-btn{display:inline-block;background:var(--vn-a);color:#fff!important;padding:14px 36px;border-radius:999px;font-size:.9rem;font-weight:600;text-decoration:none!important;transition:var(--vn-t);border:none;letter-spacing:.02em;cursor:pointer}
.vn-btn:hover{background:#0077ED;transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,113,227,.4);color:#fff!important}
.vn-btn-dark{background:var(--vn-b)!important}
.vn-btn-dark:hover{background:var(--vn-a)!important}
.vn-btn-ghost{background:transparent;color:rgba(255,255,255,.8)!important;padding:14px 24px;font-size:.85rem;font-weight:400}
.vn-btn-ghost:hover{color:#fff!important}

/* SECTIONS */
.vn-s{padding:clamp(3rem,8vw,6rem) clamp(1.5rem,4vw,4rem);max-width:1200px;margin:0 auto}
.vn-s-t{font-size:clamp(1.8rem,3vw,2.5rem)!important;font-weight:700!important;letter-spacing:-.03em!important;text-align:center!important;margin-bottom:.5rem!important;color:var(--vn-b)!important}
.vn-s-st{text-align:center;color:var(--vn-g3);font-size:1rem;margin-bottom:3rem;font-weight:300}

/* CATEGORY CARDS */
.vn-cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.vn-cat{position:relative;border-radius:20px;overflow:hidden;aspect-ratio:3/4;display:flex;align-items:flex-end;text-decoration:none!important;transition:var(--vn-t)}
.vn-cat:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,.15)}
.vn-cat img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.25,.1,.25,1)}
.vn-cat:hover img{transform:scale(1.05)}
.vn-cat-ov{position:relative;z-index:2;background:linear-gradient(transparent,rgba(0,0,0,.7));width:100%;padding:2rem 1.5rem}
.vn-cat-ov h3{color:#fff!important;font-size:1.3rem!important;font-weight:600!important;margin:0 0 .3rem!important;letter-spacing:-.01em!important}
.vn-cat-ov span{color:rgba(255,255,255,.7);font-size:.8rem;font-weight:400;letter-spacing:.05em;text-transform:uppercase}

/* PRODUCTS */
.woocommerce ul.products{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;gap:2rem!important;padding:0!important;max-width:1200px!important;margin:0 auto!important}
.woocommerce ul.products li.product{text-align:center!important;border:none!important;box-shadow:none!important;padding:0!important;margin:0!important;width:100%!important;float:none!important;transition:var(--vn-t)!important}
.woocommerce ul.products li.product:hover{transform:translateY(-6px)!important}
.woocommerce ul.products li.product a img,.woocommerce ul.products li.product img{border-radius:16px!important;aspect-ratio:3/4!important;object-fit:cover!important;width:100%!important;transition:transform .5s cubic-bezier(.25,.1,.25,1)!important}
.woocommerce ul.products li.product:hover img{transform:scale(1.03)!important}
.woocommerce ul.products li.product .woocommerce-loop-product__title,.woocommerce ul.products li.product h2{font-size:.95rem!important;font-weight:500!important;color:var(--vn-b)!important;margin-top:1rem!important;padding:0!important;letter-spacing:-.01em!important}
.woocommerce ul.products li.product .price{color:var(--vn-g4)!important;font-size:.85rem!important;font-weight:400!important}

/* BUTTONS */
.woocommerce a.button,.woocommerce button.button,.woocommerce input.button,.woocommerce a.button.alt,.woocommerce button.button.alt,.button,.wp-block-button__link,.woocommerce a.added_to_cart{background:var(--vn-b)!important;color:var(--vn-w)!important;border:none!important;border-radius:999px!important;font-family:var(--vn)!important;font-size:.8rem!important;font-weight:600!important;padding:10px 24px!important;text-transform:none!important;letter-spacing:.02em!important;transition:var(--vn-t)!important;line-height:1.5!important}
.woocommerce a.button:hover,.woocommerce button.button:hover,.button:hover{background:var(--vn-a)!important;transform:translateY(-1px)!important;box-shadow:0 4px 15px rgba(0,113,227,.3)!important;color:var(--vn-w)!important}
.woocommerce span.onsale{background:#ff3b30!important;border-radius:999px!important;font-size:.7rem!important;font-weight:600!important;padding:4px 12px!important;min-height:auto!important;min-width:auto!important;line-height:1.5!important}

/* SINGLE PRODUCT */
.woocommerce div.product{max-width:1200px!important;margin:0 auto!important;padding:3rem 2rem!important}
.woocommerce div.product div.images img{border-radius:20px!important}
.woocommerce div.product .product_title{font-size:2rem!important;font-weight:700!important;letter-spacing:-.02em!important}
.woocommerce div.product p.price{font-size:1.2rem!important;color:var(--vn-g4)!important;font-weight:400!important}

/* BANNER */
.vn-banner{background:var(--vn-g1);padding:clamp(3rem,6vw,5rem) 2rem;text-align:center}
.vn-banner h2{font-size:clamp(1.5rem,3vw,2rem)!important;font-weight:700!important;letter-spacing:-.02em!important;color:var(--vn-b)!important;margin-bottom:.5rem!important}
.vn-banner p{color:var(--vn-g4);font-size:1rem;margin-bottom:1.5rem}

/* STORY */
.vn-story{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;padding:clamp(3rem,8vw,6rem) clamp(1.5rem,4vw,4rem);max-width:1200px;margin:0 auto}
@media(max-width:768px){.vn-story{grid-template-columns:1fr}.vn-cats{grid-template-columns:1fr 1fr}.woocommerce ul.products{grid-template-columns:1fr 1fr!important;gap:1rem!important}.vn-hero{min-height:70vh}.vn-hero h1{font-size:2.2rem!important}}
@media(max-width:480px){.vn-cats{grid-template-columns:1fr}.woocommerce ul.products{grid-template-columns:1fr!important}}
.vn-story img{border-radius:20px;width:100%;aspect-ratio:4/5;object-fit:cover}
.vn-story-t h2{font-size:2rem!important;font-weight:700!important;letter-spacing:-.02em!important;margin-bottom:1rem!important}
.vn-story-t p{color:var(--vn-g4);line-height:1.8;font-size:1rem}

/* FOOTER */
.site-footer,.storefront-footer{background:var(--vn-b)!important;color:rgba(255,255,255,.6)!important;padding:0!important}
.site-info,.site-footer .site-info{background:transparent!important;color:rgba(255,255,255,.4)!important;font-size:.75rem!important;border-top:1px solid rgba(255,255,255,.1)!important;padding:1.5rem 0!important;text-align:center!important}
.site-footer a{color:var(--vn-a)!important}

html{scroll-behavior:smooth}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.vn-anim{animation:fadeUp .8s ease forwards}
.vn-d1{animation-delay:.2s;opacity:0}
.vn-d2{animation-delay:.4s;opacity:0}
</style>
<?php });

// ===== HOMEPAGE CONTENT =====
add_filter('the_content', function($content) {
    if (!is_front_page()) return $content;
    ob_start(); ?>

<div class="vn-hero">
<div class="vn-hero-c">
<h1 class="vn-anim">Estilo que<br>te define</h1>
<p class="vn-anim vn-d1">Descubre nuestra coleccion curada de moda premium.<br>Diseno, calidad y tendencia en cada prenda.</p>
<div class="vn-anim vn-d2">
<a href="/shop/" class="vn-btn">Explorar Coleccion</a>
<a href="/product-category/mujer/" class="vn-btn-ghost">Ver Mujer &rarr;</a>
</div>
</div>
</div>

<div class="vn-s">
<h2 class="vn-s-t">Compra por Categoria</h2>
<p class="vn-s-st">Encuentra exactamente lo que buscas</p>
<div class="vn-cats">
<a href="/product-category/mujer/" class="vn-cat"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" alt="Moda Mujer VISNEX" loading="lazy"><div class="vn-cat-ov"><h3>Mujer</h3><span>Explorar coleccion</span></div></a>
<a href="/product-category/hombre/" class="vn-cat"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" alt="Moda Hombre VISNEX" loading="lazy"><div class="vn-cat-ov"><h3>Hombre</h3><span>Explorar coleccion</span></div></a>
<a href="/shop/" class="vn-cat"><img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80" alt="Nuevos Llegados VISNEX" loading="lazy"><div class="vn-cat-ov"><h3>Nuevos Llegados</h3><span>Lo mas reciente</span></div></a>
</div>
</div>

<div class="vn-s">
<h2 class="vn-s-t">Seleccion Premium</h2>
<p class="vn-s-st">Prendas cuidadosamente seleccionadas para ti</p>
<?php echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); ?>
</div>

<div class="vn-banner">
<h2>Envio a todo Colombia</h2>
<p>Recibe tu pedido en la puerta de tu casa. Envios seguros y rastreables.</p>
<a href="/shop/" class="vn-btn vn-btn-dark">Comprar Ahora</a>
</div>

<div class="vn-story">
<img src="https://images.unsplash.com/photo-1558171813-01a0f0e5599b?w=600&q=80" alt="La historia de VISNEX" loading="lazy">
<div class="vn-story-t">
<h2>Nuestra Historia</h2>
<p>VISNEX nace de la conviccion de que la moda debe ser accesible, de calidad y con proposito. Cada prenda en nuestra tienda es seleccionada pensando en ti.</p>
<p>Trabajamos con los mejores proveedores para traerte las ultimas tendencias a precios justos, sin sacrificar calidad ni estilo.</p>
<p style="margin-top:1.5rem"><a href="/shop/" class="vn-btn vn-btn-dark">Descubrir Mas</a></p>
</div>
</div>

<div class="vn-s" style="background:var(--vn-g1);max-width:100%;padding-left:0;padding-right:0">
<div style="max-width:1200px;margin:0 auto;padding:0 2rem">
<h2 class="vn-s-t">Mas Populares</h2>
<p class="vn-s-st">Lo que mas esta gustando esta temporada</p>
<?php echo do_shortcode('[products limit="4" columns="4" orderby="popularity"]'); ?>
</div>
</div>

<div class="vn-s" style="text-align:center;max-width:600px">
<h2 class="vn-s-t" style="font-size:1.5rem!important">Unete al club VISNEX</h2>
<p class="vn-s-st">Se el primero en conocer nuevas colecciones y ofertas exclusivas.</p>
<div style="display:flex;gap:.5rem;max-width:400px;margin:0 auto">
<input type="email" placeholder="Tu correo electronico" style="flex:1;padding:12px 20px;border:1px solid #e8e8ed;border-radius:999px;font-family:var(--vn);font-size:.85rem;outline:none">
<button class="vn-btn" style="white-space:nowrap;cursor:pointer">Suscribirse</button>
</div>
</div>

<?php return ob_get_clean();
}, 10);

// ===== CUSTOM FOOTER =====
add_action('storefront_footer', function() { ?>
<div style="background:#1d1d1f;color:rgba(255,255,255,.6);padding:3rem 2rem 1rem">
<div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;font-size:.85rem">
<div><h4 style="color:#fff;font-size:1rem;margin-bottom:1rem;font-weight:600">VISNEX</h4><p style="line-height:1.8;font-size:.8rem">Moda premium con proposito. Estilo que te define, calidad que te acompana.</p></div>
<div><h4 style="color:#fff;font-size:.8rem;margin-bottom:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em">Tienda</h4><p style="line-height:2.2"><a href="/product-category/mujer/" style="color:rgba(255,255,255,.6);text-decoration:none">Mujer</a></p><p style="line-height:2.2"><a href="/product-category/hombre/" style="color:rgba(255,255,255,.6);text-decoration:none">Hombre</a></p><p style="line-height:2.2"><a href="/shop/" style="color:rgba(255,255,255,.6);text-decoration:none">Nuevos Llegados</a></p></div>
<div><h4 style="color:#fff;font-size:.8rem;margin-bottom:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em">Ayuda</h4><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">Envios</a></p><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">Devoluciones</a></p><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">Contacto</a></p></div>
<div><h4 style="color:#fff;font-size:.8rem;margin-bottom:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em">Siguenos</h4><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">Instagram</a></p><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">Facebook</a></p><p style="line-height:2.2"><a href="#" style="color:rgba(255,255,255,.6);text-decoration:none">TikTok</a></p></div>
</div>
<div style="max-width:1200px;margin:2rem auto 0;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.1);text-align:center;font-size:.75rem;color:rgba(255,255,255,.3)">&copy; <?php echo date('Y'); ?> VISNEX. Todos los derechos reservados.</div>
</div>
<?php }, 5);
