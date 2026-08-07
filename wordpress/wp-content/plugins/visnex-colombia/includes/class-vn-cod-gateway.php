<?php
/**
 * Pasarela: Pago contra entrega (COD) para Colombia.
 *
 * WooCommerce ya trae una COD basica, pero le faltan justo las cosas que
 * deciden si el modelo es rentable:
 *
 *   - Restringir por ciudad/departamento (hay destinos donde el recaudo
 *     contra entrega no existe o sale carisimo).
 *   - Limitar el monto maximo: un pedido de $800.000 contra entrega es un
 *     riesgo enorme si el cliente no lo recibe.
 *   - Cobrar el recargo de recaudo de la transportadora.
 *   - Dejar clarisimo al cliente que le vamos a confirmar antes de despachar.
 *
 * EL DATO QUE JUSTIFICA TODO ESTO: entre el 20% y el 25% de los pedidos contra
 * entrega se caen DESPUES de haber pagado pauta, producto y flete de ida. El
 * CPA real no es el que reporta Meta: es CPA / tasa de entrega. Confirmar cada
 * pedido sube la entrega urbana al 70-85%.
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

if (!class_exists('WC_Payment_Gateway')) {
    return;
}

class VN_COD_Gateway extends WC_Payment_Gateway
{
    public function __construct()
    {
        $this->id                 = 'vn_cod';
        $this->method_title       = 'Pago contra entrega (VISNEX)';
        $this->method_description = 'Contraentrega con confirmacion previa, limites por monto y restriccion por ciudad. Pensado para dropshipping COD en Colombia.';
        $this->has_fields         = false;
        $this->icon               = '';

        $this->init_form_fields();
        $this->init_settings();

        $this->title       = $this->get_option('title', 'Pago contra entrega');
        $this->description = $this->get_option('description');
        $this->enabled     = $this->get_option('enabled', 'yes');

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
        add_action('woocommerce_cart_calculate_fees', [$this, 'maybe_add_surcharge'], 20);
        add_action('woocommerce_thankyou_' . $this->id, [$this, 'thankyou_note']);
    }

    public function init_form_fields(): void
    {
        $this->form_fields = [
            'enabled' => [
                'title'   => 'Activar',
                'type'    => 'checkbox',
                'label'   => 'Activar pago contra entrega',
                'default' => 'yes',
            ],
            'title' => [
                'title'    => 'Titulo',
                'type'     => 'text',
                'default'  => 'Pago contra entrega',
                'desc_tip' => true,
                'description' => 'Lo que ve el cliente en el checkout.',
            ],
            'description' => [
                'title'    => 'Descripcion',
                'type'     => 'textarea',
                'default'  => 'Paga en efectivo al recibir tu pedido. Te confirmamos por WhatsApp antes de despacharlo.',
                'desc_tip' => true,
            ],
            'max_amount' => [
                'title'       => 'Monto maximo permitido (COP)',
                'type'        => 'number',
                'default'     => '600000',
                'description' => 'Por encima de este total no se ofrece contraentrega. 0 para sin limite. Un pedido grande que no se recibe es una perdida grande.',
            ],
            'min_amount' => [
                'title'       => 'Monto minimo (COP)',
                'type'        => 'number',
                'default'     => '0',
                'description' => 'Por debajo de este total no se ofrece contraentrega. 0 para sin minimo.',
            ],
            'surcharge_type' => [
                'title'   => 'Tipo de recargo por recaudo',
                'type'    => 'select',
                'default' => 'none',
                'options' => [
                    'none'    => 'Sin recargo (lo absorbe la tienda)',
                    'fixed'   => 'Monto fijo',
                    'percent' => 'Porcentaje del pedido',
                ],
                'description' => 'Las transportadoras cobran entre 3% y 5% por recaudar el efectivo.',
            ],
            'surcharge_value' => [
                'title'    => 'Valor del recargo',
                'type'     => 'number',
                'default'  => '0',
                'desc_tip' => true,
                'description' => 'En pesos si el tipo es fijo; en porcentaje (ej: 4) si es porcentual.',
            ],
            'excluded_cities' => [
                'title'       => 'Ciudades SIN contraentrega',
                'type'        => 'textarea',
                'default'     => 'Leticia, Mitu, Puerto Carreno, Inirida, San Andres, Providencia',
                'description' => 'Separadas por coma. Se comparan sin tildes ni mayusculas.',
            ],
            'excluded_states' => [
                'title'       => 'Departamentos SIN contraentrega (codigos ISO)',
                'type'        => 'text',
                'default'     => 'AMA, GUA, GUV, VAU, VID, SAP',
                'description' => 'Codigos de WooCommerce sin el prefijo CO-. Ej: AMA para Amazonas.',
            ],
            'instructions' => [
                'title'    => 'Instrucciones en el correo del pedido',
                'type'     => 'textarea',
                'default'  => 'Recuerda tener el monto exacto a la mano. Te contactaremos por WhatsApp para confirmar la entrega.',
                'desc_tip' => true,
            ],
        ];
    }

    /* ---------------------------------------------------------------------
       Disponibilidad
       ------------------------------------------------------------------ */

    private function normalize(string $text): string
    {
        $text = trim(mb_strtolower($text, 'UTF-8'));
        $text = str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'],
            ['a', 'e', 'i', 'o', 'u', 'u', 'n'],
            $text
        );
        return preg_replace('/[^a-z0-9]/', '', $text) ?? $text;
    }

    /**
     * Decide si la contraentrega esta disponible para este pedido.
     * Se comprueba ciudad, departamento y rango de monto.
     */
    public function is_available(): bool
    {
        if ($this->enabled !== 'yes') {
            return false;
        }

        // En el admin (pedidos manuales) no se aplica la restriccion.
        if (is_admin() || !WC()->cart) {
            return parent::is_available();
        }

        $total = (float) WC()->cart->get_displayed_subtotal();

        $max = (float) $this->get_option('max_amount', 0);
        if ($max > 0 && $total > $max) {
            return false;
        }

        $min = (float) $this->get_option('min_amount', 0);
        if ($min > 0 && $total < $min) {
            return false;
        }

        $customer = WC()->customer;
        if ($customer) {
            $city  = $this->normalize($customer->get_shipping_city() ?: $customer->get_billing_city());
            $state = strtoupper(trim($customer->get_shipping_state() ?: $customer->get_billing_state()));

            if ($city !== '') {
                $excluded = array_filter(array_map(
                    fn($c) => $this->normalize($c),
                    explode(',', (string) $this->get_option('excluded_cities', ''))
                ));
                if (in_array($city, $excluded, true)) {
                    return false;
                }
            }

            if ($state !== '') {
                $excluded_states = array_filter(array_map(
                    fn($s) => strtoupper(trim($s)),
                    explode(',', (string) $this->get_option('excluded_states', ''))
                ));
                if (in_array($state, $excluded_states, true)) {
                    return false;
                }
            }
        }

        return parent::is_available();
    }

    /* ---------------------------------------------------------------------
       Recargo por recaudo
       ------------------------------------------------------------------ */

    public function maybe_add_surcharge(): void
    {
        if (is_admin() && !wp_doing_ajax()) {
            return;
        }
        if (WC()->session === null || WC()->session->get('chosen_payment_method') !== $this->id) {
            return;
        }

        $type = $this->get_option('surcharge_type', 'none');
        $value = (float) $this->get_option('surcharge_value', 0);

        if ($type === 'none' || $value <= 0) {
            return;
        }

        $amount = $type === 'percent'
            ? WC()->cart->get_subtotal() * ($value / 100)
            : $value;

        WC()->cart->add_fee('Recargo por pago contra entrega', round($amount), false);
    }

    /* ---------------------------------------------------------------------
       Procesar el pedido
       ------------------------------------------------------------------ */

    public function process_payment($order_id): array
    {
        $order = wc_get_order($order_id);

        // 'on-hold' y no 'processing': el pedido NO debe despacharse hasta que
        // se haya confirmado con el cliente. Ese es todo el punto.
        $order->update_status(
            'on-hold',
            'Pedido contra entrega recibido. Pendiente de confirmacion con el cliente antes de despachar.'
        );

        $order->add_meta_data('_vn_cod_confirmed', 'no', true);
        $order->save();

        wc_reduce_stock_levels($order_id);
        WC()->cart->empty_cart();

        return [
            'result'   => 'success',
            'redirect' => $this->get_return_url($order),
        ];
    }

    public function thankyou_note(): void
    {
        $instructions = $this->get_option('instructions');
        if ($instructions) {
            echo wp_kses_post(wpautop(wptexturize($instructions)));
        }
    }
}
