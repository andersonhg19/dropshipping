<?php
/**
 * Secciones de la home premium.
 *
 * Markup trasladado tal cual desde el mu-plugin visnex-style.php v3.0: la home
 * ya estaba bien resuelta y se conserva a proposito. Lo unico que cambia es
 * donde vive.
 *
 * Cambios respecto al original:
 *   - Las imagenes ya no se enlazan en caliente a Unsplash. Se usa una imagen
 *     propia del tema si existe, y si no, un degradado. Depender de un tercero
 *     para el contenido de produccion es un riesgo innecesario.
 *   - Los enlaces del footer apuntan a paginas legales reales en vez de a
 *     href="#" (habia 8 enlaces muertos).
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Devuelve la URL de una imagen del tema, o cadena vacia si no existe.
 * Evita las 404 visibles mientras no se hayan subido las fotos propias.
 */
function visnex_img(string $file): string
{
    $path = get_stylesheet_directory() . '/assets/img/' . $file;
    return file_exists($path) ? get_stylesheet_directory_uri() . '/assets/img/' . $file : '';
}

/* -----------------------------------------------------------------------------
   Barra de anuncio
   -------------------------------------------------------------------------- */

add_action('storefront_before_header', function () {
    ?>
    <div class="vn-announcement" id="vn-announcement">
        <span>Envio gratis en pedidos mayores a $150.000 &nbsp;|&nbsp; Pago contra entrega disponible</span>
        <button class="vn-announcement__close" type="button" data-vn-dismiss="vn-announcement" aria-label="Cerrar aviso">&times;</button>
    </div>
    <?php
}, 5);

/* -----------------------------------------------------------------------------
   Contenido de la home
   -------------------------------------------------------------------------- */

add_filter('the_content', function ($content) {
    if (!is_front_page()) {
        return $content;
    }

    $hero = visnex_img('hero.jpg');
    $cat_mujer = visnex_img('cat-mujer.jpg');
    $cat_hombre = visnex_img('cat-hombre.jpg');
    $cat_acc = visnex_img('cat-accesorios.jpg');
    $editorial = visnex_img('editorial.jpg');

    ob_start();
    ?>

    <!-- ===== HERO ===== -->
    <section class="vn-hero<?php echo $hero ? '' : ' vn-hero--nobg'; ?>">
        <?php if ($hero) : ?>
            <img class="vn-hero__bg" src="<?php echo esc_url($hero); ?>" alt="" fetchpriority="high" decoding="async">
        <?php endif; ?>
        <div class="vn-hero__overlay"></div>
        <div class="vn-hero__content">
            <h1 class="vn-hero__title">El Arte de<br>Vestir Bien</h1>
            <p class="vn-hero__subtitle">Coleccion curada de moda premium. Diseno, calidad y tendencia<br>en cada prenda que elegimos para ti.</p>
            <div class="vn-hero__ctas">
                <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-btn vn-btn--white vn-btn--lg">Explorar Coleccion</a>
                <a href="<?php echo esc_url(home_url('/product-category/mujer/')); ?>" class="vn-btn vn-btn--ghost vn-btn--lg">Ver Novedades &rarr;</a>
            </div>
        </div>
    </section>

    <!-- ===== CATEGORIAS ===== -->
    <section class="vn-section">
        <div class="vn-section__header vn-animate-in">
            <h2 class="vn-section__title">Compra por Categoria</h2>
            <p class="vn-section__subtitle">Encuentra exactamente lo que buscas</p>
        </div>
        <div class="vn-categories vn-stagger">
            <?php
            $cats = [
                ['url' => '/product-category/mujer/',  'img' => $cat_mujer,  'name' => 'Mujer',       'cta' => 'Explorar coleccion'],
                ['url' => '/product-category/hombre/', 'img' => $cat_hombre, 'name' => 'Hombre',      'cta' => 'Explorar coleccion'],
                ['url' => '/shop/',                    'img' => $cat_acc,    'name' => 'Accesorios',  'cta' => 'Lo mas reciente'],
            ];
            foreach ($cats as $c) : ?>
                <a href="<?php echo esc_url(home_url($c['url'])); ?>" class="vn-category-card vn-animate-in">
                    <?php if ($c['img']) : ?>
                        <img class="vn-category-card__img" src="<?php echo esc_url($c['img']); ?>" alt="<?php echo esc_attr($c['name'] . ' VISNEX'); ?>" loading="lazy" decoding="async">
                    <?php endif; ?>
                    <div class="vn-category-card__overlay">
                        <h3 class="vn-category-card__name"><?php echo esc_html($c['name']); ?></h3>
                        <span class="vn-category-card__cta"><?php echo esc_html($c['cta']); ?></span>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- ===== SELECCION PREMIUM ===== -->
    <section class="vn-section vn-section--full vn-section--offwhite">
        <div style="max-width:var(--vn-container-max);margin:0 auto;">
            <div class="vn-section__header vn-animate-in">
                <h2 class="vn-section__title">Seleccion Premium</h2>
                <p class="vn-section__subtitle">Prendas cuidadosamente seleccionadas para ti</p>
            </div>
            <?php echo do_shortcode('[products limit="4" columns="4" orderby="date" order="DESC"]'); ?>
        </div>
    </section>

    <!-- ===== EDITORIAL ===== -->
    <section class="vn-editorial vn-animate-in">
        <?php if ($editorial) : ?>
            <div class="vn-editorial__image">
                <img src="<?php echo esc_url($editorial); ?>" alt="La historia de VISNEX" loading="lazy" decoding="async">
            </div>
        <?php endif; ?>
        <div class="vn-editorial__content">
            <span class="vn-editorial__label">Nuestra Historia</span>
            <h2 class="vn-editorial__title">Moda con Proposito,<br>Estilo sin Limites</h2>
            <p class="vn-editorial__text">VISNEX nace de la conviccion de que la moda debe ser accesible, de calidad y con proposito. Cada prenda en nuestra tienda es seleccionada pensando en ti, trabajando con los mejores proveedores para traerte las ultimas tendencias a precios justos.</p>
            <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-editorial__link">Descubrir mas &rarr;</a>
        </div>
    </section>

    <!-- ===== CONFIANZA ===== -->
    <section class="vn-trust">
        <div class="vn-trust__grid">
            <div class="vn-trust__item vn-animate-in">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="6" width="15" height="12" rx="1" stroke="currentColor" fill="none" stroke-width="1.5"/><polyline points="16,10 21,8 21,18 16,16" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/><circle cx="4" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="13" cy="15" r="2" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>
                <span class="vn-trust__title">Envio Gratis</span>
                <span class="vn-trust__desc">En pedidos +$150.000</span>
            </div>
            <div class="vn-trust__item vn-animate-in">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title">Contra Entrega</span>
                <span class="vn-trust__desc">Paga cuando lo recibas</span>
            </div>
            <div class="vn-trust__item vn-animate-in">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linejoin="round"/><polyline points="9,12 11,14 15,10" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title">Pago Seguro</span>
                <span class="vn-trust__desc">Nequi, PSE y tarjetas</span>
            </div>
            <div class="vn-trust__item vn-animate-in">
                <svg class="vn-trust__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="vn-trust__title">Soporte por WhatsApp</span>
                <span class="vn-trust__desc">Te respondemos rapido</span>
            </div>
        </div>
    </section>

    <!-- ===== TENDENCIA ===== -->
    <section class="vn-section">
        <div class="vn-section__header vn-animate-in">
            <h2 class="vn-section__title">Tendencia</h2>
            <p class="vn-section__subtitle">Lo que mas esta gustando esta temporada</p>
        </div>
        <?php echo do_shortcode('[products limit="4" columns="4" orderby="popularity"]'); ?>
    </section>

    <!-- ===== NEWSLETTER ===== -->
    <section class="vn-newsletter">
        <h2 class="vn-newsletter__title vn-animate-in">Unete al Mundo VISNEX</h2>
        <p class="vn-newsletter__subtitle vn-animate-in">Se el primero en conocer nuevas colecciones, lanzamientos exclusivos y ofertas especiales.</p>
        <form class="vn-newsletter__form vn-animate-in" data-vn-newsletter>
            <label class="vn-sr-only" for="vn-nl-email">Correo electronico</label>
            <input id="vn-nl-email" name="email" type="email" class="vn-newsletter__input" placeholder="Tu correo electronico" required>
            <button class="vn-newsletter__btn" type="submit">Suscribirse</button>
        </form>
        <p class="vn-newsletter__msg" role="status" aria-live="polite"></p>
    </section>

    <?php
    return ob_get_clean();
}, 10);

/* -----------------------------------------------------------------------------
   Footer
   -------------------------------------------------------------------------- */

add_action('storefront_footer', function () {
    // Los enlaces apuntan a paginas reales. Antes eran 8 href="#" muertos, que
    // ademas de ser un riesgo legal son una senal de desconfianza clara para
    // quien esta a punto de dejar sus datos.
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
                <div class="vn-footer__brand-name">VISNEX</div>
                <p class="vn-footer__brand-desc">Moda premium con proposito. Estilo que te define, calidad que te acompana. Curado con pasion para quienes buscan lo mejor.</p>
            </div>
            <div>
                <div class="vn-footer__col-title">Tienda</div>
                <a href="<?php echo esc_url(home_url('/product-category/mujer/')); ?>" class="vn-footer__link">Mujer</a>
                <a href="<?php echo esc_url(home_url('/product-category/hombre/')); ?>" class="vn-footer__link">Hombre</a>
                <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-footer__link">Nuevos Llegados</a>
                <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="vn-footer__link">Accesorios</a>
            </div>
            <div>
                <div class="vn-footer__col-title">Ayuda</div>
                <a href="<?php echo esc_url($legal['envios']); ?>" class="vn-footer__link">Envios</a>
                <a href="<?php echo esc_url($legal['devoluciones']); ?>" class="vn-footer__link">Devoluciones</a>
                <a href="<?php echo esc_url($legal['contacto']); ?>" class="vn-footer__link">Contacto</a>
                <a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>" class="vn-footer__link">Mi cuenta</a>
            </div>
            <div>
                <div class="vn-footer__col-title">Legal</div>
                <a href="<?php echo esc_url($legal['privacidad']); ?>" class="vn-footer__link">Politica de Privacidad</a>
                <a href="<?php echo esc_url($legal['terminos']); ?>" class="vn-footer__link">Terminos y Condiciones</a>
                <a href="<?php echo esc_url($legal['devoluciones']); ?>" class="vn-footer__link">Derecho de Retracto</a>
            </div>
        </div>
        <div class="vn-footer__bottom">
            &copy; <?php echo esc_html(date('Y')); ?> VISNEX. Todos los derechos reservados.
        </div>
    </div>
    <?php
}, 5);
