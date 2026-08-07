<?php
/**
 * Template Name: VISNEX — Landing Contraentrega
 *
 * Landing de conversion para trafico PAGADO.
 *
 * Se diferencia de la home a proposito: aqui no hay hero editorial ni menu de
 * navegacion. Quien llega viene de un anuncio, en movil, con intencion tibia y
 * unos pocos segundos de atencion. Todo lo que decide la venta (foto, precio,
 * prueba social y formulario) va arriba del pliegue.
 *
 * Se configura por campos personalizados de la pagina:
 *   vn_product_id     ID del producto de WooCommerce que se vende
 *   vn_headline       Titular (si se omite, usa el nombre del producto)
 *   vn_price_old      Precio tachado, para mostrar el descuento
 *   vn_shipping       Costo de envio en COP (0 = gratis)
 *   vn_free_from      Monto desde el que el envio es gratis
 *   vn_stock_note     Texto de escasez (solo si es CIERTO)
 *   vn_whatsapp       Celular de contacto
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

// get_queried_object_id() y no get_the_ID(): este ultimo depende de que el
// loop este iniciado, y aqui se leen los metadatos antes de empezarlo.
$page_id     = get_queried_object_id();
// OJO: las variables van con prefijo vn_ a proposito. `$product` es el nombre
// que WooCommerce usa como global en el ambito de plantilla, y se pierde al
// pasar por get_header(). Costo una hora de depuracion.
$vn_product_id  = (int) get_post_meta($page_id, 'vn_product_id', true);
$vn_product     = $vn_product_id ? wc_get_product($vn_product_id) : null;

$headline    = get_post_meta($page_id, 'vn_headline', true) ?: ($vn_product ? $vn_product->get_name() : get_the_title());
$price       = $vn_product ? (float) $vn_product->get_price() : 0;
$price_old   = (float) get_post_meta($page_id, 'vn_price_old', true);
$shipping    = (int) get_post_meta($page_id, 'vn_shipping', true);
$free_from   = (int) (get_post_meta($page_id, 'vn_free_from', true) ?: 150000);
$stock_note  = get_post_meta($page_id, 'vn_stock_note', true);
$whatsapp    = preg_replace('/\D/', '', get_post_meta($page_id, 'vn_whatsapp', true));

$discount = ($price_old > 0 && $price > 0 && $price_old > $price)
    ? (int) round((1 - $price / $price_old) * 100)
    : 0;

$images = [];
if ($vn_product) {
    $main_id = $vn_product->get_image_id();
    if ($main_id) {
        $images[] = $main_id;
    }
    foreach ($vn_product->get_gallery_image_ids() as $gid) {
        $images[] = $gid;
    }
}

$fmt = fn($n) => '$' . number_format((float) $n, 0, ',', '.');

get_header();
?>

<main class="vn-lp" id="content">

    <div class="vn-lp__bar"><?php echo esc_html(get_bloginfo('name')); ?></div>

    <?php if (!$vn_product) : ?>
        <div class="vn-lp__section">
            <div class="vn-empty">
                <h2 class="vn-empty__title">Falta configurar el producto</h2>
                <p class="vn-empty__text">
                    Edita esta pagina y anade el campo personalizado <code>vn_product_id</code>
                    con el ID del producto de WooCommerce que quieres vender aqui.
                </p>
            </div>
        </div>
    <?php else : ?>

    <!-- ================= BLOQUE PRINCIPAL ================= -->
    <section class="vn-lp__hero">

        <div class="vn-lp__gallery">
            <?php if (!empty($images)) : ?>
                <img class="vn-lp__main-img"
                     data-vn-main-img
                     src="<?php echo esc_url(wp_get_attachment_image_url($images[0], 'large')); ?>"
                     alt="<?php echo esc_attr($headline); ?>"
                     fetchpriority="high" decoding="async">

                <?php if (count($images) > 1) : ?>
                    <div class="vn-lp__thumbs">
                        <?php foreach ($images as $i => $img_id) : ?>
                            <img class="vn-lp__thumb"
                                 data-vn-thumb
                                 data-full="<?php echo esc_url(wp_get_attachment_image_url($img_id, 'large')); ?>"
                                 src="<?php echo esc_url(wp_get_attachment_image_url($img_id, 'thumbnail')); ?>"
                                 alt="<?php echo esc_attr($headline . ' - vista ' . ($i + 1)); ?>"
                                 aria-current="<?php echo $i === 0 ? 'true' : 'false'; ?>"
                                 loading="lazy" decoding="async">
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>

        <div class="vn-lp__info">
            <h1 class="vn-lp__title"><?php echo esc_html($headline); ?></h1>

            <?php
            $rating = $vn_product->get_average_rating();
            $count  = $vn_product->get_review_count();
            if ($count > 0) : ?>
                <div class="vn-lp__social">
                    <span class="vn-lp__stars" aria-hidden="true"><?php echo str_repeat('&#9733;', (int) round($rating)); ?></span>
                    <span><?php echo esc_html(number_format($rating, 1)); ?> &middot; <?php echo esc_html($count); ?> resenas</span>
                </div>
            <?php endif; ?>

            <div class="vn-lp__price-row">
                <span class="vn-lp__price"><?php echo esc_html($fmt($price)); ?></span>
                <?php if ($discount > 0) : ?>
                    <span class="vn-lp__price-old"><?php echo esc_html($fmt($price_old)); ?></span>
                    <span class="vn-lp__discount">-<?php echo esc_html($discount); ?>%</span>
                <?php endif; ?>
            </div>
            <p class="vn-lp__price-note">Pagas cuando lo recibes en tu casa</p>

            <ul class="vn-lp__benefits">
                <?php
                $benefits = [
                    'Pago contra entrega: no pagas nada por adelantado',
                    'Envio a todo Colombia en 24 a 72 horas',
                    'Te confirmamos por WhatsApp antes de despachar',
                    'Devolucion garantizada en 5 dias habiles',
                ];
                foreach ($benefits as $b) : ?>
                    <li class="vn-lp__benefit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span><?php echo esc_html($b); ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>

            <?php if ($stock_note) : ?>
                <div class="vn-lp__scarcity">
                    <span class="vn-lp__scarcity-dot" aria-hidden="true"></span>
                    <span><?php echo esc_html($stock_note); ?></span>
                </div>
            <?php endif; ?>

            <!-- ===== FORMULARIO CONTRAENTREGA ===== -->
            <div data-vn-sticky-anchor>
                <form class="vn-cod-form"
                      data-vn-cod-form
                      data-unit-price="<?php echo esc_attr((int) $price); ?>"
                      data-shipping="<?php echo esc_attr($shipping); ?>"
                      data-free-from="<?php echo esc_attr($free_from); ?>"
                      method="post"
                      action="<?php echo esc_url(admin_url('admin-post.php')); ?>">

                    <?php wp_nonce_field('vn_cod_order', 'vn_cod_nonce'); ?>
                    <input type="hidden" name="action" value="vn_cod_order">
                    <input type="hidden" name="vn_product_id" value="<?php echo esc_attr($vn_product_id); ?>">
                    <input type="hidden" name="vn_page_id" value="<?php echo esc_attr($page_id); ?>">

                    <h2 class="vn-cod-form__title">Pidelo ahora, paga al recibir</h2>
                    <p class="vn-cod-form__sub">Solo necesitamos estos datos. Sin registro ni tarjeta.</p>

                    <div class="vn-cod-form__fields">

                        <div class="vn-cod-form__field">
                            <label for="vn-name">Nombre completo</label>
                            <input id="vn-name" name="vn_name" type="text" required
                                   autocomplete="name" placeholder="Como apareces en tu cedula">
                            <span class="vn-cod-form__error" aria-live="polite"></span>
                        </div>

                        <div class="vn-cod-form__field">
                            <label for="vn-phone">Celular (WhatsApp)</label>
                            <input id="vn-phone" name="vn_phone" type="tel" required
                                   inputmode="tel" autocomplete="tel" placeholder="300 123 4567">
                            <span class="vn-cod-form__error" aria-live="polite"></span>
                        </div>

                        <div class="vn-cod-form__field">
                            <label for="vn-city">Ciudad</label>
                            <input id="vn-city" name="vn_city" type="text" required
                                   autocomplete="address-level2" placeholder="Bogota, Medellin, Cali...">
                            <span class="vn-cod-form__error" aria-live="polite"></span>
                        </div>

                        <div class="vn-cod-form__field">
                            <label for="vn-address">Direccion de entrega</label>
                            <input id="vn-address" name="vn_address" type="text" required
                                   autocomplete="street-address" placeholder="Calle 123 # 45-67, apto 501">
                            <span class="vn-cod-form__error" aria-live="polite"></span>
                        </div>

                        <div class="vn-cod-form__field">
                            <label for="vn-qty">Cantidad</label>
                            <div class="vn-cod-form__qty" data-vn-qty>
                                <button type="button" data-step="-1" aria-label="Quitar uno">&minus;</button>
                                <input id="vn-qty" name="vn_qty" type="number" value="1" min="1" max="10" readonly>
                                <button type="button" data-step="1" aria-label="Anadir uno">+</button>
                            </div>
                        </div>

                    </div>

                    <div class="vn-cod-form__summary">
                        <div class="vn-cod-form__line">
                            <span>Producto</span><span data-vn-sub><?php echo esc_html($fmt($price)); ?></span>
                        </div>
                        <div class="vn-cod-form__line">
                            <span>Envio</span>
                            <span data-vn-ship><?php echo $shipping === 0 ? 'Gratis' : esc_html($fmt($shipping)); ?></span>
                        </div>
                        <div class="vn-cod-form__line vn-cod-form__line--total">
                            <span>Total a pagar</span>
                            <span data-vn-total><?php echo esc_html($fmt($price + $shipping)); ?></span>
                        </div>
                    </div>

                    <button type="submit" class="vn-btn vn-cod-form__submit">Ordenar ahora — pago contra entrega</button>

                    <p class="vn-cod-form__legal">
                        Al ordenar aceptas nuestros
                        <a href="<?php echo esc_url(home_url('/terminos-y-condiciones/')); ?>">terminos</a> y
                        <a href="<?php echo esc_url(home_url('/politica-de-privacidad/')); ?>">politica de privacidad</a>.
                    </p>

                    <div class="vn-lp__trust">
                        <div class="vn-lp__trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>
                            <strong>Compra segura</strong>Sin pagos por adelantado
                        </div>
                        <div class="vn-lp__trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1" y="6" width="15" height="12" rx="1"/><polyline points="16,10 21,8 21,18 16,16" stroke-linejoin="round"/></svg>
                            <strong>Envio nacional</strong>24 a 72 horas
                        </div>
                        <div class="vn-lp__trust-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><polyline points="1,4 1,10 7,10" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <strong>Devolucion</strong>5 dias habiles
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- ================= DESCRIPCION ================= -->
    <?php if ($vn_product->get_description()) : ?>
        <section class="vn-lp__section">
            <h2 class="vn-lp__section-title">Sobre este producto</h2>
            <div class="vn-legal"><?php echo wp_kses_post(wpautop($vn_product->get_description())); ?></div>
        </section>
    <?php endif; ?>

    <!-- ================= RESENAS ================= -->
    <?php
    $comments = get_comments([
        'post_id' => $vn_product_id,
        'status'  => 'approve',
        'type'    => 'review',
        'number'  => 3,
    ]);
    if ($comments) : ?>
        <section class="vn-lp__section vn-lp__section--alt">
            <h2 class="vn-lp__section-title">Lo que dicen quienes ya lo compraron</h2>
            <div class="vn-lp__reviews">
                <?php foreach ($comments as $c) :
                    $r = (int) get_comment_meta($c->comment_ID, 'rating', true); ?>
                    <article class="vn-lp__review">
                        <div class="vn-lp__review-stars" aria-label="<?php echo esc_attr($r . ' de 5 estrellas'); ?>">
                            <?php echo str_repeat('&#9733;', max(1, $r)); ?>
                        </div>
                        <p class="vn-lp__review-text"><?php echo esc_html(wp_trim_words($c->comment_content, 40)); ?></p>
                        <div class="vn-lp__review-author"><?php echo esc_html($c->comment_author); ?></div>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>

    <!-- ================= PREGUNTAS FRECUENTES ================= -->
    <section class="vn-lp__section">
        <h2 class="vn-lp__section-title">Preguntas frecuentes</h2>
        <div class="vn-lp__faq">
            <?php
            // Estas son las objeciones reales que hacen abandonar un pedido
            // contra entrega en Colombia. Responderlas aqui evita que la
            // persona se vaya a buscar la respuesta y no vuelva.
            $faqs = [
                ['Tengo que pagar algo ahora?', 'No. No pagas absolutamente nada por adelantado. Pagas en efectivo al transportador cuando el pedido llegue a tu direccion.'],
                ['Cuanto tarda en llegar?', 'Entre 24 y 72 horas habiles segun tu ciudad. En Bogota y area metropolitana suele ser 1 o 2 dias; en ciudades intermedias, de 3 a 5.'],
                ['Y si no me queda bien o no me gusta?', 'Tienes 5 dias habiles desde la entrega para retractarte sin dar explicaciones, como establece el articulo 47 de la Ley 1480 de 2011. Escribenos y coordinamos la devolucion.'],
                ['Como se que es confiable?', 'Somos una tienda registrada en Colombia con politicas publicas de envios, devoluciones y privacidad. Ademas, en pago contra entrega el riesgo es minimo: no entregas dinero hasta tener el producto en la mano.'],
                ['Me van a llamar?', 'Si. Te escribimos por WhatsApp o te llamamos para confirmar la direccion antes de despachar. Es el paso que evita que el pedido se pierda en el camino.'],
            ];
            foreach ($faqs as $faq) : ?>
                <details>
                    <summary><?php echo esc_html($faq[0]); ?></summary>
                    <div><?php echo esc_html($faq[1]); ?></div>
                </details>
            <?php endforeach; ?>
        </div>
    </section>

    <?php if ($whatsapp) : ?>
        <section class="vn-lp__section" style="text-align:center">
            <p style="color:var(--vn-text-muted);margin-bottom:var(--vn-space-4)">Tienes otra pregunta?</p>
            <a class="vn-btn vn-btn--whatsapp"
               href="https://wa.me/<?php echo esc_attr($whatsapp); ?>?text=<?php echo rawurlencode('Hola, tengo una pregunta sobre ' . $headline); ?>"
               target="_blank" rel="noopener">
                Escribenos por WhatsApp
            </a>
        </section>
    <?php endif; ?>

    <!-- ================= BARRA FIJA EN MOVIL ================= -->
    <div class="vn-lp__sticky" data-vn-sticky>
        <span class="vn-lp__sticky-price" data-vn-sticky-price><?php echo esc_html($fmt($price + $shipping)); ?></span>
        <a class="vn-btn" href="#vn-name">Ordenar ahora</a>
    </div>

    <?php endif; ?>
</main>

<?php get_footer();
