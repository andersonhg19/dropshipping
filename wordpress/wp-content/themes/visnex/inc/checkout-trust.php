<?php
/**
 * Confianza en el embudo de pago.
 *
 * En Colombia la desconfianza es la objecion numero uno de la compra online:
 * en 2025 se registraron 64.628 denuncias por estafas digitales y las compras
 * en linea fueron la modalidad mas frecuente. Estos bloques existen para
 * responder, en el momento exacto de pagar, a las tres preguntas que hacen
 * abandonar el pedido: "quien me responde", "y si no me gusta" y "cuando llega".
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/** Icono de check reutilizable. */
function visnex_icon_check(): string
{
    return '<svg class="vn-checkout-trust__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
}

/* -----------------------------------------------------------------------------
   Barra de confianza bajo el boton de pagar
   -------------------------------------------------------------------------- */

add_action('woocommerce_review_order_after_submit', function () {
    $items = [
        ['<strong>Pago contra entrega disponible.</strong> Pagas cuando recibes el pedido en tu casa.'],
        ['<strong>Devolucion en 5 dias habiles.</strong> Derecho de retracto garantizado por ley.'],
        ['<strong>Te confirmamos por WhatsApp</strong> antes de despachar. Sin sorpresas.'],
    ];
    echo '<div class="vn-checkout-trust">';
    foreach ($items as $item) {
        echo '<div class="vn-checkout-trust__item">' . visnex_icon_check()
            . '<span>' . wp_kses_post($item[0]) . '</span></div>';
    }
    echo '</div>';
}, 20);

/* -----------------------------------------------------------------------------
   Aviso de contraentrega arriba del checkout
   -------------------------------------------------------------------------- */

add_action('woocommerce_before_checkout_form', function () {
    if (!WC()->cart || WC()->cart->is_empty()) {
        return;
    }
    ?>
    <div class="vn-cod-notice">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" style="flex-shrink:0;color:var(--vn-success)">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>
            <strong>Puedes pagar contra entrega.</strong>
            Elige "Pago contra entrega" mas abajo y paga en efectivo al recibir tu pedido.
            Te llamamos o escribimos por WhatsApp para confirmar antes de despacharlo.
        </span>
    </div>
    <?php
}, 5);

/* -----------------------------------------------------------------------------
   Indicador de pasos en carrito y checkout
   -------------------------------------------------------------------------- */

function visnex_render_steps(int $active): void
{
    $steps = ['Carrito', 'Datos y pago', 'Confirmacion'];
    echo '<ol class="vn-steps">';
    foreach ($steps as $i => $label) {
        $n = $i + 1;
        $class = 'vn-steps__item';
        if ($n === $active) {
            $class .= ' vn-steps__item--active';
        } elseif ($n < $active) {
            $class .= ' vn-steps__item--done';
        }
        echo '<li class="' . esc_attr($class) . '"'
            . ($n === $active ? ' aria-current="step"' : '') . '>'
            . '<span class="vn-steps__num" aria-hidden="true">' . ($n < $active ? '&check;' : $n) . '</span>'
            . '<span class="vn-steps__label">' . esc_html($label) . '</span>'
            . '</li>';
        if ($n < count($steps)) {
            echo '<li class="vn-steps__sep" aria-hidden="true"></li>';
        }
    }
    echo '</ol>';
}

add_action('woocommerce_before_cart', fn() => visnex_render_steps(1), 5);
add_action('woocommerce_before_checkout_form', fn() => visnex_render_steps(2), 1);

/* -----------------------------------------------------------------------------
   Siguientes pasos en la pagina de pedido recibido
   -------------------------------------------------------------------------- */

add_action('woocommerce_thankyou', function ($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }
    $is_cod = $order->get_payment_method() === 'cod';
    ?>
    <div class="vn-order-next">
        <h2 class="vn-order-next__title">Que sigue ahora</h2>
        <ol class="vn-order-next__steps">
            <li class="vn-order-next__step">
                <span class="vn-order-next__num">1</span>
                <span>
                    <strong>Te confirmamos el pedido</strong>
                    Te escribimos por WhatsApp al <?php echo esc_html($order->get_billing_phone() ?: 'numero que registraste'); ?>
                    en las proximas horas para confirmar la direccion antes de despachar.
                </span>
            </li>
            <li class="vn-order-next__step">
                <span class="vn-order-next__num">2</span>
                <span>
                    <strong>Lo despachamos</strong>
                    Una vez confirmado, sale el mismo dia o el siguiente dia habil.
                    Te enviamos el numero de guia para que lo sigas.
                </span>
            </li>
            <li class="vn-order-next__step">
                <span class="vn-order-next__num">3</span>
                <span>
                    <strong><?php echo $is_cod ? 'Pagas al recibirlo' : 'Lo recibes'; ?></strong>
                    <?php if ($is_cod) : ?>
                        Entrega en 24 a 72 horas segun tu ciudad. Pagas en efectivo al domiciliario.
                        Ten el monto exacto a la mano si puedes.
                    <?php else : ?>
                        Entrega en 24 a 72 horas segun tu ciudad.
                    <?php endif; ?>
                </span>
            </li>
        </ol>
    </div>
    <?php
}, 5);

/* -----------------------------------------------------------------------------
   Campos del checkout adaptados a Colombia
   -------------------------------------------------------------------------- */

add_filter('woocommerce_checkout_fields', function ($fields) {
    // El telefono es OBLIGATORIO: sin el no se puede confirmar el pedido, y la
    // confirmacion es lo que evita que se caiga entre el 20 y el 25% de los
    // envios contra entrega.
    if (isset($fields['billing']['billing_phone'])) {
        $fields['billing']['billing_phone']['required'] = true;
        $fields['billing']['billing_phone']['label'] = 'Celular (WhatsApp)';
        $fields['billing']['billing_phone']['placeholder'] = '300 123 4567';
        $fields['billing']['billing_phone']['priority'] = 25;
        $fields['billing']['billing_phone']['custom_attributes'] = [
            'inputmode' => 'tel',
            'autocomplete' => 'tel',
        ];
    }

    // El correo deja de ser obligatorio en contraentrega: mucha gente no lo
    // tiene a mano en el movil y es un campo que hace abandonar sin aportar
    // nada al despacho.
    if (isset($fields['billing']['billing_email'])) {
        $fields['billing']['billing_email']['required'] = false;
        $fields['billing']['billing_email']['label'] = 'Correo electronico (opcional)';
        $fields['billing']['billing_email']['priority'] = 90;
    }

    // Campos que no aportan a un envio nacional.
    unset($fields['billing']['billing_company']);
    unset($fields['billing']['billing_address_2']);
    unset($fields['shipping']['shipping_company']);

    if (isset($fields['billing']['billing_address_1'])) {
        $fields['billing']['billing_address_1']['label'] = 'Direccion';
        $fields['billing']['billing_address_1']['placeholder'] = 'Calle 123 # 45-67, apto 501';
    }

    if (isset($fields['order']['order_comments'])) {
        $fields['order']['order_comments']['label'] = 'Indicaciones para la entrega (opcional)';
        $fields['order']['order_comments']['placeholder'] = 'Punto de referencia, horario preferido, torre/apartamento...';
    }

    return $fields;
}, 20);

/**
 * Valida que el celular parezca colombiano.
 *
 * Un telefono mal escrito equivale a un pedido perdido: no se puede confirmar,
 * y en contraentrega un pedido no confirmado es flete de ida pagado a cambio
 * de nada.
 */
add_action('woocommerce_after_checkout_validation', function ($data, $errors) {
    $phone = isset($data['billing_phone']) ? preg_replace('/\D/', '', $data['billing_phone']) : '';

    if ($phone === '') {
        return; // WooCommerce ya reporta el campo obligatorio vacio.
    }

    // Se acepta con o sin indicativo 57. Los moviles colombianos son 10 digitos
    // y empiezan por 3.
    $local = $phone;
    if (strlen($phone) === 12 && str_starts_with($phone, '57')) {
        $local = substr($phone, 2);
    }

    if (strlen($local) !== 10 || $local[0] !== '3') {
        $errors->add(
            'billing_phone',
            'Revisa el celular: debe tener 10 digitos y empezar por 3 (ejemplo: 300 123 4567). Lo necesitamos para confirmar tu pedido.'
        );
    }
}, 10, 2);
