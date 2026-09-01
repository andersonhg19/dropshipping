<?php
/**
 * Busqueda, ordenacion y filtros de talla/color en la tienda.
 *
 * El mu-plugin habia OCULTADO la ordenacion sin poner nada en su lugar, y no
 * existia ni busqueda ni filtros. En moda eso es fatal: nadie recorre 154
 * productos a mano buscando su talla.
 *
 * Los filtros funcionan sobre los atributos nativos de WooCommerce
 * (pa_talla / pa_color), asi que no requieren ningun plugin externo.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/** Atributos que se ofrecen como filtro, en orden. */
const VISNEX_FILTER_ATTRS = ['pa_talla', 'pa_color'];

/** Mapa de nombre de color a valor CSS, para pintar las muestras. */
const VISNEX_COLOR_MAP = [
    'negro' => '#0A0A0A', 'blanco' => '#FFFFFF', 'gris' => '#9AA0A6',
    'azul' => '#1F4E9C', 'azul-claro' => '#7FB2E5', 'rojo' => '#C4342B',
    'verde' => '#2E7D50', 'amarillo' => '#E8C33D', 'rosa' => '#E39BB4',
    'beige' => '#D8C7AC', 'cafe' => '#6B4A32', 'marron' => '#6B4A32',
    'morado' => '#6B4E9C', 'naranja' => '#E07B39', 'vinotinto' => '#6E1F2E',
];

/* -----------------------------------------------------------------------------
   Cabecera de la tienda
   -------------------------------------------------------------------------- */

remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);

add_action('woocommerce_before_main_content', function () {
    if (!is_shop() && !is_product_taxonomy()) {
        return;
    }

    $title = is_shop() ? 'Tienda' : single_term_title('', false);
    $desc = is_product_taxonomy() ? term_description() : '';
    ?>
    <header class="vn-shop-head">
        <h1 class="vn-shop-head__title"><?php echo esc_html($title); ?></h1>
        <?php if ($desc) : ?>
            <div class="vn-shop-head__desc"><?php echo wp_kses_post($desc); ?></div>
        <?php endif; ?>
    </header>
    <?php
}, 25);

/* -----------------------------------------------------------------------------
   Barra de herramientas: buscar + ordenar + contador
   -------------------------------------------------------------------------- */

// Storefront saca estos elementos por su cuenta; se reubican dentro de la barra.
remove_action('woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30);
remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
// Storefront anade ADEMAS una paginacion ANTES de la rejilla
// (storefront-woocommerce-template-hooks.php:54). Con la de abajo ya presente,
// arriba solo compite con los filtros y descuadra la barra.
//
// Va dentro de 'init' a proposito: el functions.php del tema HIJO se carga
// ANTES que el del padre, asi que una llamada suelta aqui se ejecutaria antes
// de que Storefront haya anadido el hook, y no quitaria nada.
add_action('init', function () {
    remove_action('woocommerce_before_shop_loop', 'storefront_woocommerce_pagination', 30);
}, 20);

add_action('woocommerce_before_shop_loop', function () {
    if (!is_shop() && !is_product_taxonomy() && !is_search()) {
        return;
    }
    $term = get_search_query();
    ?>
    <div class="vn-shop-tools">
        <form class="vn-shop-search" role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/>
            </svg>
            <label class="vn-sr-only" for="vn-shop-q">Buscar productos</label>
            <input id="vn-shop-q" type="search" name="s" value="<?php echo esc_attr($term); ?>"
                   placeholder="Buscar por nombre, color, talla..." autocomplete="off">
            <input type="hidden" name="post_type" value="product">
        </form>

        <div style="display:flex;gap:var(--vn-space-4);align-items:center;flex-wrap:wrap">
            <?php woocommerce_result_count(); ?>
            <?php woocommerce_catalog_ordering(); ?>
        </div>
    </div>
    <?php
    visnex_render_filters();
}, 20);

/* -----------------------------------------------------------------------------
   Filtros de talla y color
   -------------------------------------------------------------------------- */

/**
 * Pinta los filtros disponibles a partir de los atributos reales que existan
 * en el catalogo. Si no hay atributos configurados, no pinta nada: mejor
 * ausencia que un filtro vacio que no hace nada.
 */
function visnex_render_filters(): void
{
    $rendered = false;
    ob_start();
    echo '<div class="vn-filters">';

    foreach (VISNEX_FILTER_ATTRS as $taxonomy) {
        if (!taxonomy_exists($taxonomy)) {
            continue;
        }
        $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => true]);

        // El orden por escala lo aplica inc/tallas.php con un filtro global de
        // get_terms, asi que aqui llegan ya ordenados. No se duplica.
        if (is_wp_error($terms) || empty($terms)) {
            continue;
        }

        $rendered = true;
        $label = wc_attribute_label($taxonomy);
        $active = isset($_GET['filter_' . str_replace('pa_', '', $taxonomy)])
            ? explode(',', sanitize_text_field(wp_unslash($_GET['filter_' . str_replace('pa_', '', $taxonomy)])))
            : [];

        $is_color = $taxonomy === 'pa_color';

        echo '<div class="vn-filter-group" role="group" aria-label="' . esc_attr('Filtrar por ' . $label) . '">';
        echo '<span class="vn-filter-group__label">' . esc_html($label) . '</span>';

        foreach ($terms as $term) {
            $on = in_array($term->slug, $active, true);
            $url = visnex_toggle_filter_url($taxonomy, $term->slug, $active);
            $class = $is_color ? 'vn-swatch' : 'vn-chip';
            $style = '';

            if ($is_color) {
                $hex = VISNEX_COLOR_MAP[$term->slug] ?? '#CCCCCC';
                $style = ' style="background:' . esc_attr($hex) . '"';
            }

            printf(
                '<a href="%s" class="%s" aria-pressed="%s" title="%s"%s>%s</a>',
                esc_url($url),
                esc_attr($class),
                $on ? 'true' : 'false',
                esc_attr($term->name),
                $style,
                $is_color ? '<span class="vn-sr-only">' . esc_html($term->name) . '</span>' : esc_html($term->name)
            );
        }
        echo '</div>';
    }

    // Boton de limpiar, solo si hay algo activo.
    if (visnex_has_active_filters()) {
        echo '<div class="vn-active-filters">';
        echo '<a class="vn-active-filters__clear" href="' . esc_url(visnex_clear_filters_url()) . '">Quitar filtros</a>';
        echo '</div>';
    }

    echo '</div>';
    $html = ob_get_clean();

    if ($rendered) {
        echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- construido con escapes arriba.
    }
}

/** Construye la URL que activa o desactiva un valor de filtro. */
function visnex_toggle_filter_url(string $taxonomy, string $slug, array $active): string
{
    $key = 'filter_' . str_replace('pa_', '', $taxonomy);
    $values = $active;

    if (in_array($slug, $values, true)) {
        $values = array_values(array_diff($values, [$slug]));
    } else {
        $values[] = $slug;
    }

    $args = $_GET; // phpcs:ignore WordPress.Security.NonceVerification -- navegacion, no mutacion.
    unset($args['paged']);

    if ($values) {
        $args[$key] = implode(',', $values);
        $args['query_type_' . str_replace('pa_', '', $taxonomy)] = 'or';
    } else {
        unset($args[$key], $args['query_type_' . str_replace('pa_', '', $taxonomy)]);
    }

    $base = is_product_taxonomy() ? get_term_link(get_queried_object()) : wc_get_page_permalink('shop');
    if (is_wp_error($base)) {
        $base = wc_get_page_permalink('shop');
    }

    return $args ? add_query_arg($args, $base) : $base;
}

function visnex_has_active_filters(): bool
{
    foreach (VISNEX_FILTER_ATTRS as $taxonomy) {
        if (!empty($_GET['filter_' . str_replace('pa_', '', $taxonomy)])) { // phpcs:ignore WordPress.Security.NonceVerification
            return true;
        }
    }
    return false;
}

function visnex_clear_filters_url(): string
{
    $base = is_product_taxonomy() ? get_term_link(get_queried_object()) : wc_get_page_permalink('shop');
    return is_wp_error($base) ? wc_get_page_permalink('shop') : $base;
}

/**
 * Aplica los filtros a la consulta principal.
 *
 * WooCommerce trae este comportamiento en el widget de navegacion por capas,
 * pero solo si el widget esta colocado en un sidebar — y aquí no hay sidebar.
 * Por eso se aplica a mano.
 */
add_action('woocommerce_product_query', function ($q) {
    if (is_admin() || !$q->is_main_query()) {
        return;
    }

    $tax_query = (array) $q->get('tax_query');

    foreach (VISNEX_FILTER_ATTRS as $taxonomy) {
        $key = 'filter_' . str_replace('pa_', '', $taxonomy);
        if (empty($_GET[$key])) { // phpcs:ignore WordPress.Security.NonceVerification
            continue;
        }
        $slugs = array_filter(array_map('sanitize_title', explode(',', wp_unslash($_GET[$key])))); // phpcs:ignore
        if (!$slugs) {
            continue;
        }
        $tax_query[] = [
            'taxonomy' => $taxonomy,
            'field'    => 'slug',
            'terms'    => $slugs,
            'operator' => 'IN',
        ];
    }

    if (count($tax_query) > 1) {
        $tax_query['relation'] = 'AND';
    }

    $q->set('tax_query', $tax_query);
});

/* -----------------------------------------------------------------------------
   Estado vacio
   -------------------------------------------------------------------------- */

add_action('woocommerce_no_products_found', function () {
    remove_action('woocommerce_no_products_found', 'wc_no_products_found', 10);
    ?>
    <div class="vn-empty">
        <h2 class="vn-empty__title">No encontramos productos con esos filtros</h2>
        <p class="vn-empty__text">Prueba quitando algun filtro o buscando con otras palabras.</p>
        <a class="vn-btn" href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">Ver todo el catalogo</a>
    </div>
    <?php
}, 5);
