<?php
/**
 * D'MIKA — El Asesor.
 *
 * QUE ES
 * Cuatro preguntas y la tienda arma un look: tres prendas que combinan, con el
 * motivo de cada una y el total. Un boton lo mete todo al carrito.
 *
 * POR QUE, QUE ES LO QUE IMPORTA
 * Una tienda normal dice "aqui tienes 101 prendas, busca". Eso no es un
 * servicio, es un archivo. Lo que hace una tienda buena de verdad -y lo que la
 * gente recuerda- es que alguien te atienda: te pregunte para que es, mire lo
 * que hay y te ponga tres cosas encima del mostrador diciendo por que.
 *
 * Y ademas vende. Quien entra sin saber que quiere se va sin comprar; quien
 * sale con un look armado compra tres piezas en vez de media.
 *
 * COMO FUNCIONA
 * Las respuestas viajan a admin-ajax, se traducen a una consulta de WooCommerce
 * y vuelven tres prendas de categorias DISTINTAS -una de arriba, una de abajo y
 * una tercera- para que sea un conjunto y no tres camisetas.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* =============================================================================
   1. EL MAPA: DE UNA RESPUESTA A UNAS CATEGORIAS
   ============================================================================= */

/**
 * Que categorias sirven para cada ocasion, y en que orden se busca la pieza.
 *
 * Se declara aqui, en un solo sitio, y no repartido entre el formulario y la
 * consulta: si manana se anade una categoria, se toca una linea.
 *
 * Cada ocasion define TRES huecos -arriba, abajo y remate- porque un look son
 * tres piezas. Cada hueco lleva varias categorias por orden de preferencia: si
 * la primera no tiene nada en stock dentro del presupuesto, se prueba la
 * siguiente en vez de devolver un hueco vacio.
 */
function dm_asesor_mapa(): array
{
    return [
        'mujer' => [
            'diario'  => [
                'arriba' => ['camisetas', 'blusas-y-camisas'],
                'abajo'  => ['jeans', 'pantalones', 'faldas'],
                'remate' => ['chaquetas', 'accesorios'],
            ],
            'trabajo' => [
                'arriba' => ['blusas-y-camisas', 'camisetas'],
                'abajo'  => ['pantalones', 'faldas', 'jeans'],
                'remate' => ['chaquetas', 'accesorios'],
            ],
            'salir'   => [
                'arriba' => ['vestidos', 'blusas-y-camisas'],
                'abajo'  => ['faldas', 'pantalones', 'jeans'],
                'remate' => ['chaquetas', 'accesorios'],
            ],
            'moverse' => [
                'arriba' => ['ropa-deportiva', 'camisetas'],
                'abajo'  => ['ropa-deportiva', 'pantalones'],
                'remate' => ['accesorios', 'chaquetas'],
            ],
        ],
        'hombre' => [
            'diario'  => [
                'arriba' => ['camisetas', 'camisas'],
                'abajo'  => ['jeans-hombre', 'pantalones-hombre'],
                'remate' => ['chaquetas-hombre', 'accesorios-hombre'],
            ],
            'trabajo' => [
                'arriba' => ['camisas', 'camisetas'],
                'abajo'  => ['pantalones-hombre', 'jeans-hombre'],
                'remate' => ['chaquetas-hombre', 'accesorios-hombre'],
            ],
            'salir'   => [
                'arriba' => ['camisas', 'camisetas'],
                'abajo'  => ['pantalones-hombre', 'jeans-hombre'],
                'remate' => ['chaquetas-hombre', 'accesorios-hombre'],
            ],
            'moverse' => [
                'arriba' => ['ropa-deportiva-hombre', 'camisetas'],
                'abajo'  => ['ropa-deportiva-hombre', 'pantalones-hombre'],
                'remate' => ['accesorios-hombre', 'chaquetas-hombre'],
            ],
        ],
    ];
}

/** Los topes de precio de cada respuesta, en pesos. */
function dm_asesor_presupuestos(): array
{
    return [
        'ajustado' => [0, 100000],
        'medio'    => [80000, 200000],
        'libre'    => [0, PHP_INT_MAX],
    ];
}

/** El motivo que se escribe debajo de cada pieza. Es lo que convierte una lista en un consejo. */
function dm_asesor_motivos(): array
{
    return [
        'arriba' => [
            'diario'  => 'La base. Algodón peinado: aguanta lavados sin deformarse.',
            'trabajo' => 'Para arriba, algo con cuerpo. Se plancha rápido y no se arruga en la silla.',
            'salir'   => 'La pieza que decide el look. El resto acompaña.',
            'moverse' => 'Tejido que respira y seca rápido.',
        ],
        'abajo' => [
            'diario'  => 'Corte recto, que va con todo y no pasa de moda.',
            'trabajo' => 'Cae bien de pie y sentado, que es donde se nota un pantalón.',
            'salir'   => 'Sin exceso: si arriba llama la atención, abajo tiene que callarse.',
            'moverse' => 'Con elastano, para que acompañe el movimiento.',
        ],
        'remate' => [
            'diario'  => 'La capa de encima, por si refresca. Es lo que hace que el look esté terminado.',
            'trabajo' => 'El detalle que sube el conjunto sin disfrazarlo.',
            'salir'   => 'El remate. Nadie se fija en él y sin él falta algo.',
            'moverse' => 'Para antes y después, que también cuenta.',
        ],
    ];
}

/* =============================================================================
   2. LA BUSQUEDA
   ============================================================================= */

/**
 * Busca UNA prenda para un hueco, probando las categorias por orden.
 *
 * @param array $categorias Slugs, por orden de preferencia.
 * @param array $rango      [minimo, maximo] en pesos.
 * @param array $excluir    IDs ya elegidos, para no repetir prenda.
 */
function dm_asesor_pieza(array $categorias, array $rango, array $excluir): ?WC_Product
{
    foreach ($categorias as $cat) {
        $productos = wc_get_products([
            'status'       => 'publish',
            'limit'        => 12,
            'category'     => [$cat],
            'exclude'      => $excluir,
            'stock_status' => 'instock',
            'orderby'      => 'rand',
        ]);

        // El filtro de precio se hace AQUI y no en la consulta: wc_get_products
        // no admite rango de precio en variables sin meterse en una meta_query
        // fragil, y con doce candidatos filtrar en PHP cuesta nada.
        foreach ($productos as $p) {
            $precio = (float) $p->get_price();
            if ($precio >= $rango[0] && $precio <= $rango[1] && $p->get_image_id()) {
                return $p;
            }
        }

        // Si dentro del presupuesto no habia nada, se acepta la mas barata de
        // la categoria antes que devolver un hueco. Un look incompleto es peor
        // consejo que uno que se pasa de precio, y el precio se ve.
        if ($productos) {
            usort($productos, function ($a, $b) {
                return (float) $a->get_price() <=> (float) $b->get_price();
            });
            foreach ($productos as $p) {
                if ($p->get_image_id()) {
                    return $p;
                }
            }
        }
    }
    return null;
}

/**
 * El endpoint. Devuelve el look en JSON.
 */
function dm_asesor_responder(): void
{
    check_ajax_referer('dm_asesor', 'nonce');

    $genero  = sanitize_key($_POST['genero'] ?? 'mujer');
    $ocasion = sanitize_key($_POST['ocasion'] ?? 'diario');
    $bolsa   = sanitize_key($_POST['presupuesto'] ?? 'libre');

    $mapa = dm_asesor_mapa();
    if (!isset($mapa[$genero][$ocasion])) {
        wp_send_json_error(['mensaje' => 'No reconozco esa combinación.'], 400);
    }

    $presupuestos = dm_asesor_presupuestos();
    $rango = $presupuestos[$bolsa] ?? $presupuestos['libre'];
    $motivos = dm_asesor_motivos();

    $look = [];
    $vestir = [];
    $elegidos = [];
    $total = 0.0;
    $es_vestido = false;

    foreach ($mapa[$genero][$ocasion] as $hueco => $categorias) {
        /*
         * UN VESTIDO YA ES EL LOOK ENTERO.
         *
         * La primera version emparejaba "Vestido Plisado" (arriba) con "Falda
         * Maxi" (abajo) y lo presentaba como un conjunto. Eso lo nota
         * cualquiera que sepa vestirse, y basta para que el asesor pierda toda
         * su credibilidad: si se equivoca en algo tan obvio, por que creerle en
         * lo demas.
         *
         * Si la pieza de arriba salio de vestidos, el hueco de abajo se salta y
         * el look son dos piezas: el vestido y su remate. Es lo que haria una
         * persona.
         */
        if ($hueco === 'abajo' && $es_vestido) {
            continue;
        }

        $p = dm_asesor_pieza($categorias, $rango, $elegidos);
        if (!$p) {
            continue;
        }

        if ($hueco === 'arriba') {
            $cats = wp_get_post_terms($p->get_id(), 'product_cat', ['fields' => 'slugs']);
            $es_vestido = in_array('vestidos', (array) $cats, true);
        }

        $elegidos[] = $p->get_id();
        $total += (float) $p->get_price();

        // La foto para VESTIR a la figura se elige aparte: la del listado esta
        // recortada a 3:4 y sirve para la tarjeta, no para caer sobre un cuerpo.
        $vestir[$hueco] = dm_figura_mejor_foto($p);

        $look[] = [
            'id'      => $p->get_id(),
            'nombre'  => $p->get_name(),
            'precio'  => wc_price($p->get_price()),
            'url'     => $p->get_permalink(),
            'img'     => wp_get_attachment_image_url($p->get_image_id(), 'woocommerce_thumbnail'),
            'hueco'   => $hueco,
            'motivo'  => $motivos[$hueco][$ocasion] ?? '',
            // Solo los productos simples se pueden anadir de un clic: uno con
            // tallas necesita que se elija una, y meterlo al carrito a ciegas
            // es como se generan devoluciones.
            'directo' => $p->is_type('simple') && $p->is_purchasable(),
        ];
    }

    if (!$look) {
        wp_send_json_error(['mensaje' => 'No encontré piezas para eso. Prueba con otra combinación.'], 404);
    }

    wp_send_json_success([
        'look'   => $look,
        // La figura se pinta EN EL SERVIDOR y viaja ya montada. Es un SVG con
        // rutas de varios cientos de caracteres y tres recortes: armarlo en el
        // navegador seria repetir en JavaScript logica que aqui ya existe, y
        // tener dos versiones de la misma silueta es tener dos siluetas.
        'figura' => dm_figura($genero, $vestir, 'asesor'),
        'total'  => wc_price($total),
        'nota'  => $es_vestido
            ? 'Con un vestido no hace falta nada más abajo: va la pieza y su remate.'
            : (count($look) < 3
                ? 'Con lo que hay ahora en tienda te armo ' . count($look) . ' piezas de las tres.'
                : ''),
    ]);
}
add_action('wp_ajax_dm_asesor', 'dm_asesor_responder');
add_action('wp_ajax_nopriv_dm_asesor', 'dm_asesor_responder');

/* =============================================================================
   3. EL MARCADO
   ============================================================================= */

/**
 * El panel del asesor. Va al final del <body>, oculto, y lo abre el JS.
 *
 * Se pinta en TODAS las paginas de tienda porque la duda "¿y esto con que lo
 * pongo?" aparece sobre todo en la ficha, no en la portada.
 */
add_action('wp_footer', function () {
    if (is_admin() || !function_exists('wc_get_products')) {
        return;
    }

    $preguntas = [
        [
            'clave'  => 'genero',
            'titulo' => '¿Para quién?',
            'pie'    => 'Empecemos por lo básico.',
            'ops'    => [
                ['v' => 'mujer',  'e' => 'Ella'],
                ['v' => 'hombre', 'e' => 'Él'],
            ],
        ],
        [
            'clave'  => 'ocasion',
            'titulo' => '¿Para qué?',
            'pie'    => 'La ocasión manda más que el gusto.',
            'ops'    => [
                ['v' => 'diario',  'e' => 'El día a día', 'd' => 'Lo que te pones sin pensar'],
                ['v' => 'trabajo', 'e' => 'Trabajar',     'd' => 'Que aguante ocho horas sentado'],
                ['v' => 'salir',   'e' => 'Salir',        'd' => 'Cuando importa cómo llegas'],
                ['v' => 'moverse', 'e' => 'Moverte',      'd' => 'Entrenar, caminar, viajar'],
            ],
        ],
        [
            'clave'  => 'presupuesto',
            'titulo' => '¿Cuánto quieres gastar?',
            'pie'    => 'Sin vergüenza: es la pregunta más útil de las cuatro.',
            'ops'    => [
                ['v' => 'ajustado', 'e' => 'Ajustado',  'd' => 'Hasta $100.000'],
                ['v' => 'medio',    'e' => 'Con margen', 'd' => 'Entre $100.000 y $200.000'],
                ['v' => 'libre',    'e' => 'Lo que valga', 'd' => 'Enséñame lo mejor'],
            ],
        ],
    ];
    ?>
    <div class="dm-asesor" id="dm-asesor" hidden>
        <div class="dm-asesor__velo" data-dm-asesor-cerrar></div>

        <div class="dm-asesor__caja" role="dialog" aria-modal="true" aria-labelledby="dm-asesor-titulo">
            <button class="dm-asesor__x" type="button" data-dm-asesor-cerrar aria-label="Cerrar el asesor">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                    <path d="M5 5l14 14M19 5L5 19"/>
                </svg>
            </button>

            <div class="dm-asesor__barra" aria-hidden="true"><span class="dm-asesor__avance"></span></div>

            <?php foreach ($preguntas as $i => $q) : ?>
                <section class="dm-asesor__paso" data-dm-paso="<?php echo (int) $i; ?>" <?php echo $i ? 'hidden' : ''; ?>>
                    <span class="dm-asesor__n">0<?php echo $i + 1; ?> / 03</span>
                    <h2 class="dm-asesor__titulo" <?php echo $i === 0 ? 'id="dm-asesor-titulo"' : ''; ?>>
                        <?php echo esc_html($q['titulo']); ?>
                    </h2>
                    <p class="dm-asesor__pie"><?php echo esc_html($q['pie']); ?></p>

                    <div class="dm-asesor__ops">
                        <?php foreach ($q['ops'] as $op) : ?>
                            <button class="dm-op" type="button"
                                    data-dm-clave="<?php echo esc_attr($q['clave']); ?>"
                                    data-dm-valor="<?php echo esc_attr($op['v']); ?>">
                                <span class="dm-op__e"><?php echo esc_html($op['e']); ?></span>
                                <?php if (!empty($op['d'])) : ?>
                                    <span class="dm-op__d"><?php echo esc_html($op['d']); ?></span>
                                <?php endif; ?>
                            </button>
                        <?php endforeach; ?>
                    </div>

                    <?php if ($i > 0) : ?>
                        <button class="dm-asesor__atras" type="button" data-dm-asesor-atras>&larr; Atrás</button>
                    <?php endif; ?>
                </section>
            <?php endforeach; ?>

            <?php /* Mientras busca. Tres puntos y un mensaje: la espera tiene
                     que parecer que alguien esta mirando, no que se colgo. */ ?>
            <section class="dm-asesor__paso dm-asesor__buscando" data-dm-paso="buscando" hidden>
                <span class="dm-asesor__latido" aria-hidden="true"></span>
                <p class="dm-asesor__pie">Mirando lo que hay en tienda…</p>
            </section>

            <section class="dm-asesor__paso dm-asesor__resultado" data-dm-paso="resultado" hidden>
                <span class="dm-asesor__n">Tu look</span>
                <h2 class="dm-asesor__titulo">Esto te armé</h2>
                <p class="dm-asesor__pie" data-dm-nota></p>

                <div class="dm-escena">
                    <?php /* La figura con el look puesto: contesta "¿y esto
                             junto, como se ve?" de un vistazo. */ ?>
                    <div class="dm-escena__figura" data-dm-figura></div>
                    <?php /* Y al frente, las prendas de verdad. */ ?>
                    <div class="dm-escena__prendas" data-dm-look></div>
                </div>

                <div class="dm-asesor__cierre">
                    <p class="dm-asesor__total">Total <strong data-dm-total></strong></p>
                    <div class="dm-asesor__acciones">
                        <button class="dm-asesor__otra" type="button" data-dm-asesor-otra>Enséñame otro</button>
                        <a class="dm-asesor__ir" href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" data-dm-asesor-ir>Ver la tienda</a>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <?php /* El tirador. Fijo, discreto, siempre a mano. */ ?>
    <button class="dm-asesor-tirador" type="button" data-dm-asesor-abrir>
        <span class="dm-asesor-tirador__i" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                <path d="M12 3l2.1 4.9 5.4.5-4.1 3.5 1.2 5.2L12 14.4 7.4 17.1l1.2-5.2-4.1-3.5 5.4-.5z"/>
            </svg>
        </span>
        <span class="dm-asesor-tirador__t">¿Te ayudo a elegir?</span>
    </button>
    <?php
/*
 * PRIORIDAD 5, y no 30.
 *
 * WordPress imprime los scripts del pie en `wp_footer` con prioridad 20. Con
 * este marcado en la 30, el navegador ejecutaba asesor.js ANTES de que el panel
 * existiera en el documento: getElementById devolvia null, el guion salia por
 * la puerta y no se registraba ni un solo evento. El tirador se veia, el panel
 * se veia, y no pasaba nada al pulsar.
 *
 * En la 5 el marcado va antes que los scripts y todo esta en su sitio cuando
 * el guion arranca.
 */
}, 5);

/* =============================================================================
   4. LOS DATOS QUE NECESITA EL JS
   ============================================================================= */

add_action('wp_enqueue_scripts', function () {
    if (!wp_script_is('visnex-asesor', 'enqueued')) {
        return;
    }
    wp_localize_script('visnex-asesor', 'DM_ASESOR', [
        'url'   => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('dm_asesor'),
    ]);
}, 100);
