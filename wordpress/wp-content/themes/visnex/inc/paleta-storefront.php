<?php
/**
 * Alinea la paleta del Personalizador de Storefront con la marca D'MIKA.
 *
 * POR QUE HACE FALTA
 * ------------------
 * Storefront GENERA su propia hoja de estilos a partir de los colores del
 * Personalizador y la inyecta en línea en el <head>, es decir DESPUÉS de
 * nuestras hojas encoladas. Con la misma especificidad, gana la suya.
 *
 * Por eso el botón "Añadir al carrito" seguía saliendo gris (#eeeeee) por más
 * que lo pintáramos de negro en shop.css, y el acento de toda la tienda era el
 * morado de WooCommerce (#7f54b3), que no tiene nada que ver con la marca.
 *
 * Pelearse a golpe de !important con una hoja generada es una batalla perdida:
 * se le cambia el origen y se acabó.
 *
 * POR QUE POR FILTRO Y NO ESCRIBIENDO EN LA BASE DE DATOS
 * ------------------------------------------------------
 * Un `set_theme_mod` se queda en la base de datos de ESTA instalación. Con
 * filtros, la paleta viaja en el repositorio y una instalación nueva nace ya
 * con los colores correctos, sin que nadie tenga que acordarse.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Paleta oficial D'MIKA mapeada a las opciones de Storefront.
 *
 * Los valores salen de la carta de color de la marca. El único añadido es el
 * Dorado Tinta (#836838): el Dorado Champagne da 2,34:1 sobre marfil y no pasa
 * accesibilidad para texto, así que como acento de enlaces va el oscurecido.
 */
function visnex_paleta_storefront(): array
{
    $negro   = '#171717';   // Negro Carbón
    $marfil  = '#F4EFE7';   // Marfil Cálido
    $arena   = '#D8C7B0';   // Beige Arena
    $oro     = '#836838';   // Dorado Tinta (legible sobre claro)
    $moka    = '#6F5A4A';   // Marrón Moka

    return [
        // Generales
        'storefront_heading_color'            => $negro,
        'storefront_text_color'               => $moka,
        'storefront_accent_color'             => $oro,

        // Cabecera (la pintamos nosotros, pero Storefront la usa de base)
        'storefront_header_background_color'  => $marfil,
        'storefront_header_link_color'        => $negro,
        'storefront_header_text_color'        => $moka,

        // Pie
        'storefront_footer_background_color'  => $negro,
        'storefront_footer_heading_color'     => $marfil,
        'storefront_footer_link_color'        => $arena,
        'storefront_footer_text_color'        => $arena,

        // Botones: el principal es el negro de la marca, no el gris de fábrica
        'storefront_button_background_color'      => $negro,
        'storefront_button_text_color'            => $marfil,
        'storefront_button_alt_background_color'  => $negro,
        'storefront_button_alt_text_color'        => $marfil,
    ];
}

/**
 * Fuerza cada valor pase lo que pase en la base de datos.
 *
 * `theme_mod_{$name}` filtra lo que devuelve get_theme_mod(), así que da igual
 * lo que haya guardado: la marca manda. Si algún día se quiere volver a editar
 * desde el Personalizador, basta con quitar este archivo del require.
 */
add_action('after_setup_theme', function () {
    foreach (visnex_paleta_storefront() as $mod => $color) {
        add_filter("theme_mod_{$mod}", static fn() => $color, 99);
    }
});

/** El fondo de página de WordPress, que Storefront también consume. */
add_filter('theme_mod_background_color', static fn() => 'F4EFE7', 99);

/**
 * Storefront cachea la hoja generada en un transient. Si no se limpia, los
 * colores nuevos no aparecen hasta que algo más la invalide.
 */
add_action('after_switch_theme', function () {
    delete_transient('storefront_customizer_css');
});
