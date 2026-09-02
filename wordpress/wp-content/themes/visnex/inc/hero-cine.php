<?php
/**
 * D'MIKA — El hero, en clave de cine.
 *
 * QUE SUSTITUYE Y POR QUE
 * Aqui habia dos paneles con una tarjeta blanca centrada. Funcionaba y vendia,
 * pero se veia como cualquier tienda: una foto, una caja de texto encima, un
 * boton. El cliente lo dijo cuatro veces con la misma palabra, "sosa", y tenia
 * razon.
 *
 * LO QUE SE CONSERVA (no es decoracion, es negocio)
 * El catalogo tiene 94 prendas de mujer y 60 de hombre. La portada TIENE que
 * contestar "esto es para mi" en la primera pantalla y dar la entrada en un
 * clic, o quien busca ropa de hombre no encuentra la senal hasta el menu. Por
 * eso las dos puertas siguen aqui, solo que ya no parten la imagen en dos.
 *
 * LO QUE CAMBIA
 *  - Una sola imagen a sangre, en negro, que se alterna con la otra cada ocho
 *    segundos. La pantalla completa es la foto.
 *  - El titular NO va encima de la foto: se recorta CONTRA ella con
 *    `mix-blend-mode: difference`. Donde la foto es clara el tipo sale oscuro
 *    y al reves. Es lo que hace que letra e imagen sean una sola cosa.
 *  - Debajo desfila una tira de prendas que no para.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Parte un texto en palabras y cada palabra en su propio <span>, para poder
 * escalonar la entrada.
 *
 * Se hace en PHP y no en JavaScript a proposito: asi el titular ya llega
 * partido en el HTML. Si el JS falla o tarda, el texto esta y se lee — solo se
 * pierde el escalonado.
 */
function dm_titular_partido(string $texto, float $retardo_base = 0.0): string
{
    $palabras = preg_split('/\s+/u', trim($texto));
    $out = '';
    foreach ($palabras as $i => $p) {
        $d = $retardo_base + $i * 0.085;
        $out .= '<span class="dm-hero__pal" style="--d:' . number_format($d, 3, '.', '') . 's">'
              . esc_html($p) . '</span> ';
    }
    return trim($out);
}

/**
 * Las prendas que desfilan en la tira de abajo.
 *
 * Salen del catalogo real, no de una lista escrita a mano: si se publica una
 * prenda nueva, entra sola. Se piden las mas recientes con foto.
 */
function dm_pasarela_items(int $cuantos = 10): array
{
    if (!function_exists('wc_get_products')) {
        return [];
    }

    $cache = get_transient('dm_pasarela');
    if (is_array($cache)) {
        return $cache;
    }

    $productos = wc_get_products([
        'status'  => 'publish',
        'limit'   => $cuantos,
        'orderby' => 'date',
        'order'   => 'DESC',
    ]);

    $items = [];
    foreach ($productos as $p) {
        $id = $p->get_image_id();
        if (!$id) {
            continue;
        }

        /*
         * Se guarda el MARCADO que genera WordPress, no una URL pedida a mano.
         *
         * Con wp_get_attachment_image_url($id, 'woocommerce_thumbnail') se
         * obtiene la direccion que dicen los metadatos, y si el archivo de ese
         * tamano no existe -pasa: basta con que alguien cambie el recorte y no
         * regenere- la peticion sale 404 y queda un hueco. Ocurrio: la portada
         * salio con una foto rota.
         *
         * wp_get_attachment_image() consulta los tamanos que existen DE VERDAD,
         * escribe el srcset y, si falta el pedido, cae al mayor disponible. Se
         * ve la foto igual y encima el navegador elige la resolucion.
         */
        $marcado = wp_get_attachment_image($id, 'woocommerce_thumbnail', false, [
            'alt'      => '',
            'loading'  => 'lazy',
            'decoding' => 'async',
            'sizes'    => '(max-width: 860px) 40vw, 208px',
        ]);
        if ($marcado === '') {
            continue;
        }

        $items[] = [
            'nombre'  => $p->get_name(),
            'url'     => $p->get_permalink(),
            'marcado' => $marcado,
            'precio'  => $p->get_price_html(),
        ];
    }

    // Diez minutos: la portada es la pagina mas visitada y esta consulta no
    // tiene por que repetirse en cada visita.
    set_transient('dm_pasarela', $items, 10 * MINUTE_IN_SECONDS);
    return $items;
}

/** Se vacia la cache al publicar o editar un producto. */
add_action('save_post_product', function () {
    delete_transient('dm_pasarela');
});

/**
 * Pinta el hero.
 */
function dm_hero_cine(): void
{
    $mujer  = visnex_cat_url('mujer');
    $hombre = visnex_cat_url('hombre');
    $tienda = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
    $looks  = dm_pasarela_items();
    ?>
    <section class="dm-hero" aria-label="<?php esc_attr_e('Portada', 'visnex'); ?>">

        <?php /* Las dos fotos se turnan. La segunda va encima y se desvanece,
                 asi que la primera no necesita nada: siempre hay imagen. */ ?>
        <div class="dm-hero__fondo" aria-hidden="true">
            <div class="dm-hero__capa dm-hero__capa--a">
                <?php visnex_picture('hero_ella', 'dm-hero__img', true, '100vw'); ?>
            </div>
            <div class="dm-hero__capa dm-hero__capa--b">
                <?php visnex_picture('hero_el', 'dm-hero__img', true, '100vw'); ?>
            </div>
        </div>

        <div class="dm-hero__velo" aria-hidden="true"></div>

        <?php /* En el canto: el dato que situa la marca sin robar sitio. */ ?>
        <div class="dm-hero__canto" aria-hidden="true">
            Temporada 01 &nbsp;—&nbsp; Bogotá / Madrid
        </div>

        <div class="dm-hero__centro">
            <h1 class="dm-hero__titular">
                <span class="dm-hero__linea"><?php echo dm_titular_partido(visnex_text('hero_titulo_1') ?: 'La ropa'); ?></span>
                <em class="dm-hero__linea dm-hero__linea--it"><?php echo dm_titular_partido(visnex_text('hero_titulo_2') ?: 'se siente tuya', 0.34); ?></em>
            </h1>

            <p class="dm-hero__bajada"><?php echo esc_html(visnex_text('hero_texto')); ?></p>

            <?php /* Las dos puertas. Grandes, y con la etiqueta de cuantas
                     prendas hay detras: es la senal de que el catalogo existe. */ ?>
            <div class="dm-hero__puertas">
                <a class="dm-puerta" href="<?php echo esc_url($mujer); ?>">
                    <span class="dm-puerta__n"><?php echo esc_html(visnex_text('hero_ella_label')); ?></span>
                    <span class="dm-puerta__c"><?php echo (int) visnex_cat_count('mujer'); ?> prendas</span>
                </a>
                <a class="dm-puerta" href="<?php echo esc_url($hombre); ?>">
                    <span class="dm-puerta__n"><?php echo esc_html(visnex_text('hero_el_label')); ?></span>
                    <span class="dm-puerta__c"><?php echo (int) visnex_cat_count('hombre'); ?> prendas</span>
                </a>
                <a class="dm-puerta dm-puerta--todo" href="<?php echo esc_url($tienda); ?>">
                    <span class="dm-puerta__n">Todo</span>
                    <span class="dm-puerta__c">Ver la tienda</span>
                </a>
            </div>
        </div>

        <?php if ($looks) : ?>
        <?php /* La tira. Se duplica la lista para que el bucle no tenga
                 costura: cuando la primera copia sale por la izquierda, la
                 segunda ya esta en su sitio. */ ?>
        <div class="dm-hero__pasarela" aria-label="Novedades">
            <div class="dm-tira">
                <?php for ($v = 0; $v < 2; $v++) : ?>
                    <?php foreach ($looks as $i => $l) : ?>
                        <a class="dm-look" href="<?php echo esc_url($l['url']); ?>"
                           <?php echo $v ? 'aria-hidden="true" tabindex="-1"' : ''; ?>>
                            <?php echo $l['marcado']; // marcado de WordPress, ya escapado ?>
                            <span class="dm-look__n"><?php printf('%02d', $i + 1); ?></span>
                            <span class="dm-look__t"><?php echo esc_html($l['nombre']); ?></span>
                        </a>
                    <?php endforeach; ?>
                <?php endfor; ?>
            </div>
        </div>
        <?php endif; ?>

        <span class="dm-hero__grano" aria-hidden="true"></span>
    </section>
    <?php
}
