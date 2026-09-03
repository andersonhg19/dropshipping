<?php
/**
 * VISNEX — Secciones de la portada.
 *
 * QUE CAMBIO Y POR QUE
 * --------------------
 * La versión anterior buscaba `assets/img/hero.jpg` y, si no lo encontraba,
 * pintaba un degradado gris. Esas fotos nunca se subieron, así que la portada
 * llevaba meses con el hero vacío, tres tarjetas de categoría grises y la
 * mitad de "Nuestra Historia" en blanco. El fallback silencioso convirtió un
 * "falta contenido" en algo que parecía una decisión de diseño.
 *
 * Ahora las imágenes vienen del Personalizador (ver inc/customizer.php), con
 * las fotos del tema como valor por defecto, y se sirven en WebP con respaldo
 * JPEG.
 *
 * La portada también cambió de forma. Antes era la plantilla de siempre: una
 * foto grande con el texto centrado encima. Ahora abre con dos paneles —Ella y
 * Él— porque esta tienda vende a los dos y la primera pantalla tenía que
 * decirlo sin que nadie tuviera que leerlo.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

require_once get_stylesheet_directory() . '/inc/customizer.php';

/* -----------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */

/**
 * Enlace a una categoría de producto por su slug.
 *
 * Devuelve la tienda si la categoría no existe, para que un cambio en la
 * taxonomía no deje enlaces rotos en la portada.
 */
function visnex_cat_url(string $slug): string
{
    $term = get_term_by('slug', $slug, 'product_cat');

    if ($term && !is_wp_error($term)) {
        $link = get_term_link($term);
        if (!is_wp_error($link)) {
            return $link;
        }
    }

    return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
}

/**
 * Número de productos publicados en una categoría, INCLUYENDO sus hijas.
 *
 * No sirve `$term->count`: ese campo cuenta sólo los productos asignados
 * directamente al término. "Mujer" tiene 2 productos propios y 92 repartidos
 * entre Vestidos, Faldas, Jeans y las demás subcategorías, así que la tarjeta
 * de la portada anunciaba "2 prendas" para una sección con 94. Un número que
 * miente por debajo es peor que no poner número: dice que la tienda está vacía.
 *
 * Se consulta con `include_children`, que es lo que hace la propia tienda al
 * listar la categoría — de modo que el número de la tarjeta y el de la página
 * de destino coinciden siempre.
 *
 * El resultado se guarda 12 horas: son seis consultas por carga de portada y
 * el catálogo no cambia entre una visita y la siguiente.
 */
function visnex_cat_count(string $slug): int
{
    $cache_key = 'visnex_cat_count_' . $slug;
    $cached = get_transient($cache_key);

    if ($cached !== false) {
        return (int) $cached;
    }

    $query = new WP_Query([
        'post_type'              => 'product',
        'post_status'            => 'publish',
        'posts_per_page'         => 1,
        'fields'                 => 'ids',
        'ignore_sticky_posts'    => true,
        'update_post_meta_cache' => false,
        'update_post_term_cache' => false,
        'tax_query'              => [[
            'taxonomy'         => 'product_cat',
            'field'            => 'slug',
            'terms'            => $slug,
            'include_children' => true,
        ]],
    ]);

    $count = (int) $query->found_posts;
    set_transient($cache_key, $count, 12 * HOUR_IN_SECONDS);

    return $count;
}

/**
 * Tira los recuentos cacheados cuando cambia el catálogo.
 *
 * Sin esto, publicar un producto nuevo tardaría hasta 12 horas en verse en la
 * portada — y el primer sitio donde se nota un número viejo es justo el que
 * dice cuántas prendas hay.
 */
add_action('save_post_product', function () {
    foreach (['mujer', 'hombre', 'vestidos', 'camisetas', 'chaquetas-hombre', 'accesorios'] as $slug) {
        delete_transient('visnex_cat_count_' . $slug);
    }
});

/* -----------------------------------------------------------------------------
   Barra de anuncio
   -------------------------------------------------------------------------- */

// El aviso vive ahora en inc/cabecera.php, con tres mensajes que rotan en el
// mismo sitio. El de aqui salia ADEMAS del nuevo: dos barras negras apiladas.
// Ademas era una sola linea larga que en movil se cortaba a media palabra.

/* -----------------------------------------------------------------------------
   Contenido de la portada
   -------------------------------------------------------------------------- */

add_filter('the_content', function ($content) {
    if (!is_front_page()) {
        return $content;
    }

    ob_start();
    ?>

    <!-- ================= PORTADA: HERO DE CINE ================= -->
    <?php
    /*
     * El hero vive en inc/hero-cine.php.
     *
     * Aqui habia dos paneles con una tarjeta blanca centrada encima de la
     * costura. Vendia, pero se veia como cualquier tienda, y el cliente lo
     * dijo cuatro veces con la misma palabra. Lo que se conserva del disenno
     * anterior es lo que era NEGOCIO y no estetica: la portada tiene que
     * contestar "esto es para mi" en la primera pantalla y dar la entrada en
     * un clic, porque hay 94 prendas de mujer y 60 de hombre y quien busca
     * hombre necesita la senal antes del menu. Eso son ahora las tres puertas.
     */
    dm_hero_cine();
    ?>

    <!-- ================= EL RECORRIDO ================= -->
    <?php
    /*
     * Va justo despues del hero, que es donde antes empezaba la parte
     * convencional: titulo centrado, rejilla, titulo centrado, rejilla.
     *
     * Aqui no se baja por bloques: se AVANZA. Vive en inc/recorrido.php.
     */
    dm_recorrido();
    ?>

    <!-- ================= BANDA DESLIZANTE ================= -->
    <?php
    /*
     * La banda repite las tres promesas que deciden una compra contra entrega
     * en Colombia. Va justo debajo del hero porque es donde se resuelve la
     * duda de "¿y si no me llega?" antes de mirar un solo precio.
     *
     * El texto se duplica en el marcado a propósito: la animación desplaza el
     * 50 % del ancho y la segunda copia entra en cuadro justo cuando la
     * primera sale, de modo que el bucle no tiene salto. La copia clonada va
     * con aria-hidden para que un lector de pantalla no lea todo dos veces.
     */
    $marquee = visnex_text('marquee');
    ?>
    <div class="vn-marquee" aria-label="<?php echo esc_attr(wp_strip_all_tags($marquee)); ?>">
        <div class="vn-marquee__track">
            <span class="vn-marquee__item"><?php echo esc_html($marquee); ?></span>
            <span class="vn-marquee__item" aria-hidden="true"><?php echo esc_html($marquee); ?></span>
        </div>
    </div>

    <!-- ================= CATEGORIAS ================= -->
    <section class="vn-section">
        <div class="vn-section__header">
            <h2 class="vn-section__title"><?php echo esc_html(visnex_text('cats_titulo')); ?></h2>
            <p class="vn-section__subtitle"><?php echo esc_html(visnex_text('cats_texto')); ?></p>
        </div>

        <?php
        /*
         * Seis tarjetas en rejilla asimétrica: las dos primeras ocupan el doble
         * de ancho. Antes eran tres tarjetas iguales, y "Accesorios" apuntaba a
         * /shop/ en vez de a su categoría — un enlace que mentía.
         *
         * El número de prendas sale del recuento real de la taxonomía. Es la
         * diferencia entre una tienda que parece un maniquí y una que parece
         * tener fondo.
         */
        $cards = [
            ['slot' => 'cat_mujer',      'slug' => 'mujer',      'name' => 'Mujer',      'span' => 'vn-card-cat--wide'],
            ['slot' => 'cat_hombre',     'slug' => 'hombre',     'name' => 'Hombre',     'span' => 'vn-card-cat--wide'],
            ['slot' => 'cat_vestidos',   'slug' => 'vestidos',   'name' => 'Vestidos',   'span' => ''],
            ['slot' => 'cat_camisetas',  'slug' => 'camisetas',  'name' => 'Camisetas',  'span' => ''],
            ['slot' => 'cat_chaquetas',  'slug' => 'chaquetas-hombre', 'name' => 'Chaquetas', 'span' => ''],
            ['slot' => 'cat_accesorios', 'slug' => 'accesorios', 'name' => 'Accesorios', 'span' => ''],
        ];
        ?>
        <div class="vn-grid-cats vn-stagger">
            <?php foreach ($cards as $c) :
                $count = visnex_cat_count($c['slug']); ?>
                <a class="vn-card-cat <?php echo esc_attr($c['span']); ?>" href="<?php echo esc_url(visnex_cat_url($c['slug'])); ?>">
                    <?php visnex_picture($c['slot'], 'vn-card-cat__img', false, '(max-width: 700px) 50vw, 33vw'); ?>
                    <span class="vn-card-cat__scrim" aria-hidden="true"></span>
                    <span class="vn-card-cat__body">
                        <span class="vn-card-cat__name"><?php echo esc_html($c['name']); ?></span>
                        <?php if ($count > 0) : ?>
                            <span class="vn-card-cat__count"><?php echo esc_html($count); ?> prendas</span>
                        <?php endif; ?>
                    </span>
                </a>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- ================= SELECCION PREMIUM ================= -->
    <section class="vn-section vn-section--full vn-section--offwhite">
        <div class="vn-section__inner">
            <div class="vn-section__header">
                <h2 class="vn-section__title"><?php echo esc_html(visnex_text('sel_titulo')); ?></h2>
                <p class="vn-section__subtitle"><?php echo esc_html(visnex_text('sel_texto')); ?></p>
            </div>
            <?php echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); ?>
            <p class="vn-section__more">
                <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-link-arrow">Ver todo el catálogo<span aria-hidden="true"> &rarr;</span></a>
            </p>
        </div>
    </section>

    <!-- ================= LOOKBOOK ================= -->
    <section class="vn-section">
        <div class="vn-section__header">
            <h2 class="vn-section__title"><?php echo esc_html(visnex_text('look_titulo')); ?></h2>
            <p class="vn-section__subtitle"><?php echo esc_html(visnex_text('look_texto')); ?></p>
        </div>
        <div class="vn-duo">
            <a class="vn-duo__item" href="<?php echo esc_url(visnex_cat_url('mujer')); ?>">
                <?php visnex_picture('lookbook_ella', 'vn-duo__img', false, '(max-width: 900px) 100vw, 50vw'); ?>
                <span class="vn-duo__caption">
                    <span class="vn-duo__eyebrow">Para ella</span>
                    <span class="vn-duo__title"><?php echo esc_html(visnex_text('look_ella_t')); ?></span>
                    <span class="vn-duo__cta">Ver el look<span aria-hidden="true"> &rarr;</span></span>
                </span>
            </a>
            <a class="vn-duo__item" href="<?php echo esc_url(visnex_cat_url('hombre')); ?>">
                <?php visnex_picture('lookbook_el', 'vn-duo__img', false, '(max-width: 900px) 100vw, 50vw'); ?>
                <span class="vn-duo__caption">
                    <span class="vn-duo__eyebrow">Para él</span>
                    <span class="vn-duo__title"><?php echo esc_html(visnex_text('look_el_t')); ?></span>
                    <span class="vn-duo__cta">Ver el look<span aria-hidden="true"> &rarr;</span></span>
                </span>
            </a>
        </div>
    </section>

    <!-- ================= BANDA DE BASICOS ================= -->
    <?php
    /*
     * Antes decia "Edicion de temporada". Se quito a proposito: cualquier cosa
     * atada a una temporada obliga a reescribir la portada cada pocos meses, y
     * en cuanto se queda vieja la tienda parece abandonada. El eje es el fondo
     * de armario, que no caduca.
     */
    ?>
    <section class="vn-strip">
        <?php visnex_picture('banner_color', 'vn-strip__img', true, '100vw'); ?>
        <div class="vn-strip__body">
            <span class="vn-strip__eyebrow"><?php echo esc_html(visnex_text('strip_eyebrow')); ?></span>
            <h2 class="vn-strip__title"><?php echo esc_html(visnex_text('strip_titulo')); ?></h2>
            <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-btn vn-btn--white">Ver la tienda</a>
        </div>
    </section>

    <!-- ================= NUESTRA HISTORIA ================= -->
    <section class="vn-editorial">
        <div class="vn-editorial__image">
            <?php visnex_picture('editorial', '', false, '(max-width: 900px) 100vw, 50vw'); ?>
        </div>
        <div class="vn-editorial__content">
            <span class="vn-editorial__label"><?php echo esc_html(visnex_text('edit_label')); ?></span>
            <h2 class="vn-editorial__title"><?php echo esc_html(visnex_text('edit_titulo')); ?></h2>
            <p class="vn-editorial__text"><?php echo esc_html(visnex_text('edit_texto')); ?></p>
            <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-editorial__link">Descubrir más<span aria-hidden="true"> &rarr;</span></a>
        </div>
    </section>

    <!-- ================= CONFIANZA ================= -->
    <?php
    /*
     * Los cuatro textos salen del Personalizador porque son justo lo que cambia
     * entre Espana y Colombia: el plazo de cambio, los metodos de pago y como
     * se atiende. Escribirlos en el codigo obligaria a tocar el tema cada vez
     * que se ajuste una condicion en uno de los dos mercados.
     */
    ?>
    <section class="vn-trust">
        <div class="vn-trust__grid">
            <div class="vn-trust__item">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="6" width="15" height="12" rx="1" stroke="currentColor" fill="none" stroke-width="1.5"/><polyline points="16,10 21,8 21,18 16,16" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/><circle cx="4" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="13" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>
                <span class="vn-trust__title"><?php echo esc_html(visnex_text('trust_1_t')); ?></span>
                <span class="vn-trust__desc"><?php echo esc_html(visnex_text('trust_1_d')); ?></span>
            </div>
            <div class="vn-trust__item">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><polyline points="3,4 3,9 8,9" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title"><?php echo esc_html(visnex_text('trust_2_t')); ?></span>
                <span class="vn-trust__desc"><?php echo esc_html(visnex_text('trust_2_d')); ?></span>
            </div>
            <div class="vn-trust__item">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/><polyline points="9,12 11,14 15,10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title"><?php echo esc_html(visnex_text('trust_3_t')); ?></span>
                <span class="vn-trust__desc"><?php echo esc_html(visnex_text('trust_3_d')); ?></span>
            </div>
            <div class="vn-trust__item">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title"><?php echo esc_html(visnex_text('trust_4_t')); ?></span>
                <span class="vn-trust__desc"><?php echo esc_html(visnex_text('trust_4_d')); ?></span>
            </div>
        </div>
    </section>

    <!-- ================= LO QUE MAS SE LLEVA ================= -->
    <section class="vn-section">
        <div class="vn-section__header">
            <h2 class="vn-section__title"><?php echo esc_html(visnex_text('mas_titulo')); ?></h2>
            <p class="vn-section__subtitle"><?php echo esc_html(visnex_text('mas_texto')); ?></p>
        </div>
        <?php
        // Carril horizontal en vez de rejilla: se recorre de lado con anclaje,
        // como en una aplicacion. Ademas caben 10 productos en el sitio en el
        // que antes solo cabian 4, sin alargar la pagina.
        ?>
        <div class="vn-carril-marco">
            <div class="vn-carril">
                <?php echo do_shortcode('[products limit="10" columns="10" orderby="popularity"]'); ?>
            </div>
        </div>
    </section>

    <!-- ================= NEWSLETTER ================= -->
    <section class="vn-newsletter">
        <h2 class="vn-newsletter__title"><?php echo esc_html(visnex_text('news_titulo')); ?></h2>
        <p class="vn-newsletter__subtitle"><?php echo esc_html(visnex_text('news_texto')); ?></p>
        <form class="vn-newsletter__form" data-vn-newsletter>
            <label class="vn-sr-only" for="vn-nl-email">Correo electrónico</label>
            <input id="vn-nl-email" name="email" type="email" class="vn-newsletter__input" placeholder="Tu correo electrónico" required>
            <button class="vn-newsletter__btn" type="submit">Suscribirse</button>
        </form>
        <p class="vn-newsletter__msg" role="status" aria-live="polite"></p>
    </section>

    <?php
    return ob_get_clean();
}, 10);

/* -----------------------------------------------------------------------------
   Pie de página
   -------------------------------------------------------------------------- */

add_action('storefront_footer', function () {
    // Los enlaces apuntan a páginas reales. Antes eran 8 href="#" muertos, que
    // además de ser un riesgo legal son una señal de desconfianza clara para
    // quien está a punto de dejar sus datos.
    $legal = [
        'privacidad'   => home_url('/politica-de-privacidad/'),
        'terminos'     => home_url('/terminos-y-condiciones/'),
        'devoluciones' => home_url('/politica-de-devoluciones/'),
        'envios'       => home_url('/politica-de-envios/'),
        'contacto'     => home_url('/contacto/'),
    ];
    ?>
    <div class="vn-footer">
        <div class="vn-footer__grid">
            <div>
                <div class="vn-footer__brand-name"><?php echo dm_logotipo(24, 'oscuro'); ?></div>
                <p class="vn-footer__brand-desc">Ropa de diario para España y Colombia. Pocas prendas, elegidas despacio, con las mismas condiciones de cambio en los dos países.</p>
            </div>
            <div>
                <div class="vn-footer__col-title">Tienda</div>
                <a href="<?php echo esc_url(visnex_cat_url('mujer')); ?>" class="vn-footer__link">Mujer</a>
                <a href="<?php echo esc_url(visnex_cat_url('hombre')); ?>" class="vn-footer__link">Hombre</a>
                <a href="<?php echo esc_url(visnex_cat_url('vestidos')); ?>" class="vn-footer__link">Vestidos</a>
                <a href="<?php echo esc_url(visnex_cat_url('accesorios')); ?>" class="vn-footer__link">Accesorios</a>
            </div>
            <div>
                <div class="vn-footer__col-title">Ayuda</div>
                <a href="<?php echo esc_url($legal['envios']); ?>" class="vn-footer__link">Envíos</a>
                <a href="<?php echo esc_url($legal['devoluciones']); ?>" class="vn-footer__link">Devoluciones</a>
                <a href="<?php echo esc_url($legal['contacto']); ?>" class="vn-footer__link">Contacto</a>
                <a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>" class="vn-footer__link">Mi cuenta</a>
            </div>
            <div>
                <div class="vn-footer__col-title">Legal</div>
                <a href="<?php echo esc_url($legal['privacidad']); ?>" class="vn-footer__link">Política de privacidad</a>
                <a href="<?php echo esc_url($legal['terminos']); ?>" class="vn-footer__link">Términos y condiciones</a>
                <a href="<?php echo esc_url($legal['devoluciones']); ?>" class="vn-footer__link">Derecho de retracto</a>
            </div>
        </div>
        <div class="vn-footer__bottom">
            &copy; <?php echo esc_html(date('Y')); ?> D&#8217;MIKA. Todos los derechos reservados. &nbsp;&middot;&nbsp; @dmika.co
        </div>
    </div>
    <?php
}, 5);
