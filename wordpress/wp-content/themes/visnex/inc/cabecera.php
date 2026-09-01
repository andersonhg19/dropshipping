<?php
/**
 * Cabecera D'MIKA.
 *
 * Sustituye por completo a la de Storefront, que se repartia en tres filas
 * (aviso, marca + buscador flotante, navegacion + carrito) y ocupaba ~170 px
 * antes de que se viera nada. Ademas, en movil no salia ningun menu: la tienda
 * no se podia navegar desde el telefono.
 *
 * Ahora es UNA fila: navegacion a la izquierda, logotipo al centro, acciones a
 * la derecha. En movil, hamburguesa que abre un panel lateral de verdad.
 *
 * Decision sobre el logotipo: en la cabecera va SOLO la palabra. El monograma
 * a 30 px pierde la M y se lee como una D con una mancha; juntos y pequenos se
 * estorban, ademas de decir lo mismo dos veces. El monograma vive donde tiene
 * tamano para lucir: pie, favicon y panel movil.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* -----------------------------------------------------------------------------
   Desmontar la cabecera de Storefront
   -------------------------------------------------------------------------- */

add_action('init', function () {
    remove_action('storefront_header', 'storefront_social_icons', 10);
    remove_action('storefront_header', 'storefront_site_branding', 20);
    remove_action('storefront_header', 'storefront_secondary_navigation', 30);
    remove_action('storefront_header', 'storefront_product_search', 40);
    remove_action('storefront_header', 'storefront_primary_navigation_wrapper', 42);
    remove_action('storefront_header', 'storefront_primary_navigation', 50);
    remove_action('storefront_header', 'storefront_header_cart', 60);
    remove_action('storefront_header', 'storefront_primary_navigation_wrapper_close', 68);

    // La barra inferior movil de Storefront sobra: ya tenemos menu propio con
    // hamburguesa, y ademas trae un <a href=""> ("Buscar") que es un enlace
    // muerto — lo detecto la auditoria en TODAS las paginas.
    remove_action('storefront_footer', 'storefront_handheld_footer_bar', 999);
    // La de marca.php tambien sobra: aqui se pinta todo junto.
    remove_action('storefront_header', 'dm_branding_header', 20);
}, 20);

/** Iconos de linea, 24 px, un solo estilo. Nada de emoji. */
function dm_icono(string $nombre, int $px = 20): string
{
    $trazos = [
        'buscar'  => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6" stroke-linecap="round"/>',
        'cuenta'  => '<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0" stroke-linecap="round"/>',
        'bolsa'   => '<path d="M6.5 7.5h11l1 12h-13l1-12Z" stroke-linejoin="round"/><path d="M9.2 7.5a2.8 2.8 0 0 1 5.6 0" stroke-linecap="round"/>',
        'menu'    => '<path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/>',
        'cerrar'  => '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>',
    ];
    $d = $trazos[$nombre] ?? '';
    return '<svg viewBox="0 0 24 24" width="' . $px . '" height="' . $px . '" fill="none" stroke="currentColor"'
        . ' stroke-width="1.4" aria-hidden="true" focusable="false">' . $d . '</svg>';
}

/* -----------------------------------------------------------------------------
   Aviso superior
   -------------------------------------------------------------------------- */

add_action('storefront_before_header', function () {
    // Tres mensajes que rotan. Antes era una linea larga que en movil se
    // cortaba a media palabra.
    $mensajes = [
        'Envíos a España y Colombia',
        'Cambios y devoluciones en 30 días',
        'Pago contra entrega en Colombia',
    ];
    ?>
    <div class="dm-aviso" id="dm-aviso" role="status">
        <div class="dm-aviso__pista">
            <?php foreach ($mensajes as $i => $m) : ?>
                <span class="dm-aviso__msg<?php echo $i === 0 ? ' is-activo' : ''; ?>"><?php echo esc_html($m); ?></span>
            <?php endforeach; ?>
        </div>
        <button class="dm-aviso__cerrar" type="button" data-dm-cerrar-aviso aria-label="Cerrar aviso">
            <?php echo dm_icono('cerrar', 15); ?>
        </button>
    </div>
    <?php
}, 5);

/* -----------------------------------------------------------------------------
   Cabecera
   -------------------------------------------------------------------------- */

add_action('storefront_header', function () {
    $inicio = esc_url(home_url('/'));
    $carrito = function_exists('wc_get_cart_url') ? esc_url(wc_get_cart_url()) : $inicio;
    $cuenta  = function_exists('wc_get_page_permalink') ? esc_url(wc_get_page_permalink('myaccount')) : $inicio;
    $n = (function_exists('WC') && WC()->cart) ? WC()->cart->get_cart_contents_count() : 0;
    ?>
    <div class="dm-cab">

        <!-- Izquierda: hamburguesa en movil, navegacion en escritorio -->
        <div class="dm-cab__izq">
            <button class="dm-cab__accion dm-solo-movil" type="button"
                    data-dm-abrir-menu aria-label="Abrir menú" aria-expanded="false" aria-controls="dm-panel">
                <?php echo dm_icono('menu', 22); ?>
            </button>
            <nav class="dm-nav dm-solo-escritorio" aria-label="Navegación principal">
                <?php
                wp_nav_menu([
                    'theme_location' => 'primary',
                    'container'      => false,
                    'menu_class'     => 'dm-nav__lista',
                    'depth'          => 1,
                    'fallback_cb'    => 'dm_nav_fallback',
                ]);
                ?>
            </nav>
        </div>

        <!-- Centro: el logotipo -->
        <a class="dm-cab__marca" href="<?php echo $inicio; ?>" rel="home" aria-label="D&#8217;MIKA, inicio">
            <span class="dm-cab__palabra">D&#8217;MIKA</span>
        </a>

        <!-- Derecha: acciones -->
        <div class="dm-cab__der">
            <button class="dm-cab__accion" type="button" data-dm-abrir-busqueda
                    aria-label="Buscar productos" aria-expanded="false" aria-controls="dm-busqueda">
                <?php echo dm_icono('buscar'); ?>
            </button>
            <a class="dm-cab__accion dm-solo-escritorio" href="<?php echo $cuenta; ?>" aria-label="Mi cuenta">
                <?php echo dm_icono('cuenta'); ?>
            </a>
            <a class="dm-cab__accion dm-cab__bolsa" href="<?php echo $carrito; ?>"
               aria-label="<?php echo esc_attr(sprintf('Carrito, %d artículos', $n)); ?>">
                <?php echo dm_icono('bolsa'); ?>
                <?php if ($n > 0) : ?>
                    <span class="dm-cab__contador"><?php echo esc_html($n); ?></span>
                <?php endif; ?>
            </a>
        </div>
    </div>

    <!-- Buscador: se despliega, no flota suelto -->
    <div class="dm-busqueda" id="dm-busqueda" hidden>
        <form role="search" method="get" action="<?php echo $inicio; ?>">
            <label class="screen-reader-text" for="dm-q">Buscar productos</label>
            <?php echo dm_icono('buscar', 18); ?>
            <input id="dm-q" type="search" name="s" placeholder="Buscar por prenda, color o talla&hellip;" autocomplete="off">
            <input type="hidden" name="post_type" value="product">
            <button type="submit">Buscar</button>
        </form>
    </div>

    <!-- Panel movil -->
    <div class="dm-panel" id="dm-panel" hidden>
        <div class="dm-panel__velo" data-dm-cerrar-menu></div>
        <div class="dm-panel__caja" role="dialog" aria-modal="true" aria-label="Menú">
            <div class="dm-panel__cab">
                <?php echo dm_monograma(30, 'claro'); ?>
                <button class="dm-cab__accion" type="button" data-dm-cerrar-menu aria-label="Cerrar menú">
                    <?php echo dm_icono('cerrar', 22); ?>
                </button>
            </div>
            <?php
            wp_nav_menu([
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'dm-panel__lista',
                'depth'          => 1,
                'fallback_cb'    => 'dm_nav_fallback_panel',
            ]);
            ?>
            <div class="dm-panel__pie">
                <a href="<?php echo $cuenta; ?>"><?php echo dm_icono('cuenta', 18); ?> Mi cuenta</a>
                <span class="dm-panel__lema">Clothing for every you</span>
            </div>
        </div>
    </div>
    <?php
}, 20);

/** Menú por defecto si aún no hay uno asignado en el panel de WordPress. */
function dm_nav_fallback(): void
{
    echo '<ul class="dm-nav__lista">' . dm_nav_items() . '</ul>';
}

function dm_nav_fallback_panel(): void
{
    echo '<ul class="dm-panel__lista">' . dm_nav_items() . '</ul>';
}

function dm_nav_items(): string
{
    $tienda = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
    $items = [
        'Novedades' => $tienda,
        'Mujer'     => home_url('/product-category/mujer/'),
        'Hombre'    => home_url('/product-category/hombre/'),
        'Tienda'    => $tienda,
    ];
    $html = '';
    foreach ($items as $etq => $url) {
        $html .= '<li><a href="' . esc_url($url) . '">' . esc_html($etq) . '</a></li>';
    }
    return $html;
}
