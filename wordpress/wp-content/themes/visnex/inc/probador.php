<?php
/**
 * D'MIKA — El Probador.
 *
 * QUE RESUELVE
 * "¿Me va a quedar?" es la pregunta que mata la venta de ropa por internet. Si
 * no se contesta, pasa una de dos cosas: la persona no compra, o compra dos
 * tallas y devuelve una. Las dos cuestan dinero, y la segunda cuesta mas.
 *
 * COMO LA CONTESTA
 * Pregunta dos cosas -altura y talla habitual en otras marcas- y recomienda.
 * Y despues NO VUELVE A PREGUNTAR: la respuesta se guarda en el navegador, asi
 * que en la siguiente prenda ya dice "para ti, la M".
 *
 * Ese detalle es el que convierte una tienda en una tienda de barrio: la
 * dependienta que se acuerda de tu talla.
 *
 * DE DONDE SALE EL CRITERIO, QUE ES LO IMPORTANTE
 * NO se inventa. Cada prenda lleva un campo -la HORMA- que dice si talla justa,
 * estandar o holgada, y lo rellena quien sube el producto. Si no esta relleno,
 * se dice que se asume estandar en vez de dar una cifra a ciegas: una talla
 * inventada es una devolucion garantizada y una promesa rota.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* =============================================================================
   1. LA HORMA: UN CAMPO EN LA FICHA DEL PRODUCTO
   ============================================================================= */

/** Las hormas posibles y como se le explican al cliente. */
function dm_hormas(): array
{
    return [
        'justa' => [
            'admin'  => 'Talla justa (pedir una más)',
            'ajuste' => 1,
            'aviso'  => 'Esta prenda talla justa.',
        ],
        'estandar' => [
            'admin'  => 'Talla estándar',
            'ajuste' => 0,
            'aviso'  => 'Talla como la mayoría de marcas.',
        ],
        'holgada' => [
            'admin'  => 'Talla holgada (pedir una menos)',
            'ajuste' => -1,
            'aviso'  => 'Esta prenda talla holgada.',
        ],
    ];
}

/** El desplegable en la pestana de Inventario del producto. */
add_action('woocommerce_product_options_inventory_product_data', function () {
    $opciones = ['' => '— Sin definir (se asume estándar) —'];
    foreach (dm_hormas() as $k => $h) {
        $opciones[$k] = $h['admin'];
    }

    woocommerce_wp_select([
        'id'          => '_dm_horma',
        'label'       => 'Cómo talla',
        'description' => 'Lo usa el probador para recomendar. Si se deja sin definir, '
                       . 'el probador lo dice en vez de inventarse una talla.',
        'desc_tip'    => true,
        'options'     => $opciones,
    ]);
});

add_action('woocommerce_process_product_meta', function ($id) {
    $valor = isset($_POST['_dm_horma']) ? sanitize_key($_POST['_dm_horma']) : '';
    if ($valor !== '' && !isset(dm_hormas()[$valor])) {
        $valor = '';
    }
    update_post_meta($id, '_dm_horma', $valor);
});

/* =============================================================================
   2. LA RECOMENDACION
   ============================================================================= */

/**
 * Las tallas que ofrece ESTA prenda, en orden.
 *
 * Se leen del atributo del producto y no de una lista fija: si una prenda solo
 * viene en S y M, recomendar la L seria mandar a alguien a un callejon.
 */
function dm_tallas_de(WC_Product $p): array
{
    $orden = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    $tallas = [];

    foreach ($p->get_attributes() as $attr) {
        $nombre = strtolower($attr->get_name());
        if (strpos($nombre, 'talla') === false) {
            continue;
        }
        foreach ($attr->get_terms() ?: [] as $t) {
            $tallas[] = strtoupper($t->name);
        }
        if (!$attr->get_terms()) {
            foreach ($attr->get_options() as $o) {
                $tallas[] = strtoupper(is_string($o) ? $o : '');
            }
        }
    }

    $tallas = array_values(array_unique(array_filter($tallas)));
    if (!$tallas) {
        return [];
    }

    /*
     * DOS SISTEMAS DE TALLA, LOS DOS VALIDOS.
     *
     * La primera version se quedaba solo con las de letra y descartaba las
     * numericas "porque el numero ya es la talla". Consecuencia: en los
     * pantalones -que son justo donde mas se falla la talla- el probador no
     * aparecia. La duda de si coger la 30 o la 32 es igual de real que la de S
     * o M, y la horma la resuelve igual: una arriba o una abajo.
     *
     * Se ordenan por su sistema: las de letra por la escala de siempre, las
     * numericas por su valor. Mezcladas no se ordenan, se separan — una prenda
     * no viene en S y en 32 a la vez.
     */
    $son_numeros = count(array_filter($tallas, 'is_numeric')) === count($tallas);

    if ($son_numeros) {
        $tallas = array_map('intval', $tallas);
        sort($tallas, SORT_NUMERIC);
        return array_map('strval', $tallas);
    }

    $tallas = array_values(array_intersect($orden, $tallas));
    usort($tallas, function ($a, $b) use ($orden) {
        return array_search($a, $orden, true) <=> array_search($b, $orden, true);
    });
    return $tallas;
}

/**
 * El endpoint del probador.
 */
function dm_probador_responder(): void
{
    check_ajax_referer('dm_probador', 'nonce');

    $id       = absint($_POST['producto'] ?? 0);
    $habitual = strtoupper(sanitize_text_field($_POST['habitual'] ?? ''));
    $altura   = sanitize_key($_POST['altura'] ?? 'media');

    $p = $id ? wc_get_product($id) : null;
    if (!$p) {
        wp_send_json_error(['mensaje' => 'No encuentro esa prenda.'], 404);
    }

    $tallas = dm_tallas_de($p);
    if (!$tallas) {
        wp_send_json_error(['mensaje' => 'Esta prenda es de talla única.'], 200);
    }

    $i = array_search($habitual, $tallas, true);
    if ($i === false) {
        // La talla habitual no existe en esta prenda: se dice, no se aproxima.
        wp_send_json_success([
            'talla'  => '',
            'titulo' => 'Esta prenda no viene en tu talla',
            'texto'  => 'Va de ' . $tallas[0] . ' a ' . end($tallas) . ', y tú usas ' . $habitual . '.',
            'aviso'  => '',
        ]);
    }

    $hormas = dm_hormas();
    $clave  = get_post_meta($p->get_id(), '_dm_horma', true);
    $horma  = $hormas[$clave] ?? null;

    $ajuste = $horma ? $horma['ajuste'] : 0;

    // La altura solo mueve la recomendacion en los extremos, y solo una talla.
    // Encadenar dos ajustes -horma y altura- puede saltarse dos tallas de golpe
    // y eso ya no es un consejo, es una loteria.
    if ($ajuste === 0) {
        if ($altura === 'alta')  { $ajuste = 1; }
        if ($altura === 'baja')  { $ajuste = 0; }
    }

    $j = max(0, min(count($tallas) - 1, $i + $ajuste));
    $recomendada = $tallas[$j];

    $texto = $recomendada === $habitual
        ? 'Tu talla de siempre te va a quedar bien.'
        : 'Aunque uses ' . $habitual . ', en esta prenda te va mejor la ' . $recomendada . '.';

    if ($j !== $i + $ajuste) {
        $texto = 'Lo más cercano que tenemos es la ' . $recomendada . '.';
    }

    wp_send_json_success([
        'talla'    => $recomendada,
        'titulo'   => 'Para ti, la ' . $recomendada,
        'texto'    => $texto,
        // Si nadie relleno la horma, se DICE. Es la diferencia entre un consejo
        // y una adivinanza con cara de consejo.
        'aviso'    => $horma
            ? $horma['aviso']
            : 'Todavía no tenemos medido cómo talla esta prenda: la recomendación asume que talla estándar.',
        'devolver' => 'Si no acierta, el cambio de talla es gratis durante 30 días.',
    ]);
}
add_action('wp_ajax_dm_probador', 'dm_probador_responder');
add_action('wp_ajax_nopriv_dm_probador', 'dm_probador_responder');

/* =============================================================================
   3. EL MARCADO, EN LA FICHA
   ============================================================================= */

/**
 * El bloque va justo ANTES del selector de talla.
 *
 * Ahi es donde aparece la duda: la persona esta mirando el desplegable sin
 * saber que elegir. Ponerlo despues del boton de comprar seria llegar tarde.
 */
add_action('woocommerce_before_variations_form', 'dm_probador_bloque', 6);

function dm_probador_bloque(): void
{
    global $product;
    if (!$product instanceof WC_Product || !dm_tallas_de($product)) {
        return;
    }

    static $pintado = false;
    if ($pintado) {
        return;
    }
    $pintado = true;
    ?>
    <div class="dm-probador" data-dm-producto="<?php echo (int) $product->get_id(); ?>">
        <button class="dm-probador__abrir" type="button" data-dm-probador-abrir>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16M8 4v3M16 14v3"/>
            </svg>
            <span data-dm-probador-etiqueta>¿Me va a quedar?</span>
        </button>

        <div class="dm-probador__panel" hidden data-dm-probador-panel>
            <?php /* Dos preguntas y ya. Cada campo de mas es gente que lo cierra. */ ?>
            <div class="dm-probador__pregunta">
                <span class="dm-probador__q">¿Qué talla usas normalmente?</span>
                <div class="dm-probador__ops" data-dm-campo="habitual">
                    <?php foreach (dm_tallas_de($product) as $t) : ?>
                        <button class="dm-probador__op" type="button" data-dm-valor="<?php echo esc_attr($t); ?>"><?php echo esc_html($t); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="dm-probador__pregunta">
                <span class="dm-probador__q">¿Y de altura?</span>
                <div class="dm-probador__ops" data-dm-campo="altura">
                    <button class="dm-probador__op" type="button" data-dm-valor="baja">Menos de 1,60</button>
                    <button class="dm-probador__op" type="button" data-dm-valor="media">1,60 – 1,75</button>
                    <button class="dm-probador__op" type="button" data-dm-valor="alta">Más de 1,75</button>
                </div>
            </div>

            <div class="dm-probador__respuesta" hidden data-dm-probador-respuesta></div>
        </div>
    </div>
    <?php
}

add_action('wp_enqueue_scripts', function () {
    if (!wp_script_is('visnex-probador', 'enqueued')) {
        return;
    }
    wp_localize_script('visnex-probador', 'DM_PROBADOR', [
        'url'   => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('dm_probador'),
    ]);
}, 100);
