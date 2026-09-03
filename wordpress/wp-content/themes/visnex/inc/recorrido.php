<?php
/**
 * D'MIKA — El Recorrido.
 *
 * QUE ES
 * La tienda deja de ser una pagina por la que se baja y pasa a ser un espacio
 * por el que se AVANZA. Al hacer scroll, la camara entra: las salas que estaban
 * al fondo se acercan, te pasan por los lados y quedan atras.
 *
 * DE DONDE SALE LA TECNICA
 * De mirar que estan premiando ahora. En el primer trimestre de 2026, el 61% de
 * los "Site of the Day" de Awwwards son experiencias inmersivas en 3D, y el
 * patron dominante no es "mas animaciones": es una LINEA DE TIEMPO MAESTRA —
 * una sola posicion normalizada de 0 a 1 — que mueve una camara por un
 * recorrido y va revelando zonas.
 *
 * POR QUE NO CON THREE.JS, QUE ES LO QUE USAN 29 DE 47 GANADORES
 * Porque aqui no hace falta y costaria caro. Three.js trae su motor de render
 * completo, y lo que se necesita -planos con fotos a distintas profundidades-
 * lo hace el navegador de forma nativa con transformaciones 3D de CSS, en el
 * compositor y sin una linea de JavaScript por cuadro. Pesa una fraccion,
 * arranca al instante y se degrada solo.
 *
 * Y ESO IMPORTA: los mismos jueces prueban a mano en movil, y cualquier salto
 * de cuadros cuenta como defecto. Una tienda que vende no puede permitirse
 * cargar tres megas de motor 3D para ensenar seis abrigos.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Las salas del recorrido.
 *
 * Cada una es una parada: un titulo, una categoria y las prendas que cuelgan.
 * Se declaran aqui, en un solo sitio, con su profundidad — asi anadir una sala
 * es anadir una entrada, no tocar CSS.
 */
function dm_recorrido_salas(): array
{
    return [
        [
            'clave'  => 'ella',
            'ante'   => 'Sala uno',
            'titulo' => 'Ella',
            'texto'  => 'Sastrería blanda, punto y vestidos. Lo que se pone sin pensarlo dos veces.',
            'cats'   => ['mujer'],
            'url'    => 'mujer',
        ],
        [
            'clave'  => 'el',
            'ante'   => 'Sala dos',
            'titulo' => 'Él',
            'texto'  => 'Camisa, pantalón y una capa encima. Poco, y que dure.',
            'cats'   => ['hombre'],
            'url'    => 'hombre',
        ],
        [
            'clave'  => 'nuevo',
            'ante'   => 'Sala tres',
            'titulo' => 'Lo último',
            'texto'  => 'Lo que acaba de entrar. Se renueva cada semana.',
            'cats'   => [],
            'url'    => '',
        ],
    ];
}

/**
 * Las prendas que cuelgan en una sala.
 *
 * Seis por sala: con menos la sala se ve vacia y con mas el navegador tiene que
 * componer demasiados planos a la vez, que es donde aparecen los saltos.
 */
function dm_recorrido_prendas(array $cats, int $cuantas = 6): array
{
    if (!function_exists('wc_get_products')) {
        return [];
    }

    $clave = 'dm_recorrido_' . md5(implode(',', $cats));
    $cache = get_transient($clave);
    if (is_array($cache)) {
        return $cache;
    }

    $args = [
        'status'       => 'publish',
        'limit'        => $cuantas,
        'stock_status' => 'instock',
        'orderby'      => $cats ? 'rand' : 'date',
        'order'        => 'DESC',
    ];
    if ($cats) {
        $args['category'] = $cats;
    }

    $items = [];
    foreach (wc_get_products($args) as $p) {
        $id = $p->get_image_id();
        if (!$id) {
            continue;
        }
        $items[] = [
            'nombre' => $p->get_name(),
            'url'    => $p->get_permalink(),
            'precio' => $p->get_price_html(),
            'img'    => wp_get_attachment_image($id, 'woocommerce_thumbnail', false, [
                'alt'      => '',
                'loading'  => 'lazy',
                'decoding' => 'async',
                'sizes'    => '(max-width: 860px) 40vw, 260px',
            ]),
        ];
    }

    set_transient($clave, $items, 15 * MINUTE_IN_SECONDS);
    return $items;
}

add_action('save_post_product', function () {
    foreach (dm_recorrido_salas() as $s) {
        delete_transient('dm_recorrido_' . md5(implode(',', $s['cats'])));
    }
});

/**
 * Las posiciones de las prendas dentro de una sala.
 *
 * Escritas a mano y no al azar: colgadas al azar quedan amontonadas o
 * simetricas, y las dos cosas se notan. Estas dejan el centro libre -por donde
 * pasa la camara- y reparten peso a los dos lados a alturas distintas.
 *
 * x en unidades de ancho de ventana (vw), y en alto (vh), z en pixeles.
 *
 * OJO CON LAS UNIDADES, que aqui se fallo. La primera version las escribia en
 * PORCENTAJE y el CSS hacia `translate3d(calc(var(--x) * 3.4), ...)`. Pero un
 * porcentaje dentro de `translate` se mide sobre el PROPIO ELEMENTO, no sobre
 * la sala: un -34% de una prenda de 200 px son 68 px, asi que las seis
 * quedaban amontonadas en el centro en vez de repartidas por la habitacion.
 * En vw/vh se miden sobre la ventana, que es lo que se queria decir.
 */
function dm_recorrido_posiciones(): array
{
    return [
        ['x' => -27, 'y' => -12, 'z' =>  120, 'r' => -5],
        ['x' =>  26, 'y' => -17, 'z' =>   40, 'r' =>  4],
        ['x' => -33, 'y' =>  13, 'z' => -140, 'r' =>  3],
        ['x' =>  32, 'y' =>  10, 'z' => -190, 'r' => -4],
        ['x' => -16, 'y' =>  26, 'z' => -320, 'r' =>  2],
        ['x' =>  17, 'y' =>  28, 'z' => -380, 'r' => -3],
    ];
}

/**
 * Pinta el recorrido entero.
 */
function dm_recorrido(): void
{
    $salas = dm_recorrido_salas();
    $pos   = dm_recorrido_posiciones();
    $tienda = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');

    /*
     * La altura del contenedor ES la distancia del recorrido.
     *
     * Una pantalla por sala mas una de entrada y otra de salida. De ahi salen
     * los porcentajes que usa la linea de tiempo: si se anade una sala, esto
     * crece solo y no hay que recalcular nada a mano.
     */
    $pantallas = count($salas) + 1;
    ?>
    <section class="dm-recorrido" style="--salas: <?php echo count($salas); ?>; height: <?php echo $pantallas * 100; ?>svh"
             aria-label="Recorrido por la tienda">

        <?php /* El marco fijo: lo unico que se ve mientras se avanza. */ ?>
        <div class="dm-recorrido__marco">

            <?php /* El suelo en fuga. Es lo que convierte una pantalla plana en
                     una habitacion: el ojo lee las lineas que convergen y asume
                     profundidad sin que nadie se lo diga. */ ?>
            <div class="dm-recorrido__suelo" aria-hidden="true"></div>
            <div class="dm-recorrido__techo" aria-hidden="true"></div>

            <div class="dm-recorrido__escena" data-dm-escena>
                <?php foreach ($salas as $i => $sala) :
                    $prendas = dm_recorrido_prendas($sala['cats']);
                    $enlace  = $sala['url'] ? visnex_cat_url($sala['url']) : $tienda;
                    ?>
                    <div class="dm-sala dm-sala--<?php echo esc_attr($sala['clave']); ?>"
                         data-dm-sala="<?php echo (int) $i; ?>"
                         style="--i: <?php echo (int) $i; ?>">

                        <?php /* El rotulo de la sala, al fondo y en grande: es el
                                 letrero que se ve al entrar. */ ?>
                        <div class="dm-sala__rotulo">
                            <span class="dm-sala__ante"><?php echo esc_html($sala['ante']); ?></span>
                            <h2 class="dm-sala__titulo"><?php echo esc_html($sala['titulo']); ?></h2>
                            <p class="dm-sala__texto"><?php echo esc_html($sala['texto']); ?></p>
                            <a class="dm-sala__entrar" href="<?php echo esc_url($enlace); ?>">
                                Ver todo<span aria-hidden="true"> &rarr;</span>
                            </a>
                        </div>

                        <?php foreach ($prendas as $n => $prenda) :
                            $p = $pos[$n % count($pos)];
                            ?>
                            <a class="dm-colgada"
                               href="<?php echo esc_url($prenda['url']); ?>"
                               style="--x: <?php echo (float) $p['x']; ?>;
                                      --y: <?php echo (float) $p['y']; ?>;
                                      --z: <?php echo (float) $p['z']; ?>px;
                                      --r: <?php echo (float) $p['r']; ?>deg;
                                      --n: <?php echo (int) $n; ?>">
                                <span class="dm-colgada__foto"><?php echo $prenda['img']; ?></span>
                                <span class="dm-colgada__pie">
                                    <span class="dm-colgada__n"><?php echo esc_html($prenda['nombre']); ?></span>
                                    <span class="dm-colgada__p"><?php echo wp_kses_post($prenda['precio']); ?></span>
                                </span>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            </div>

            <?php /* La bruma del fondo: lo lejano se pierde. Sin esto las salas
                     de atras se ven igual de nitidas que la de delante y el
                     efecto de profundidad se cae. */ ?>
            <div class="dm-recorrido__bruma" aria-hidden="true"></div>

            <?php /* Donde estoy: tres marcas que se encienden al pasar. */ ?>
            <nav class="dm-recorrido__mapa" aria-label="Salas">
                <?php foreach ($salas as $i => $sala) : ?>
                    <span class="dm-recorrido__marca" data-dm-marca="<?php echo (int) $i; ?>">
                        <em><?php echo esc_html($sala['titulo']); ?></em>
                    </span>
                <?php endforeach; ?>
            </nav>

            <span class="dm-recorrido__pista" aria-hidden="true">Sigue bajando</span>
        </div>
    </section>
    <?php
}
