<?php
/**
 * Crea un pedido real de WooCommerce desde el formulario de la landing COD.
 *
 * El formulario tiene cuatro campos y ningun registro: nombre, celular, ciudad
 * y direccion. Cada campo adicional es gente que se cae, y en trafico frio
 * pagado eso se traduce directamente en CPA.
 *
 * Aun asi el pedido que se crea es un pedido de WooCommerce de verdad — con su
 * stock, su estado y su historial — no un registro paralelo. Eso mantiene una
 * sola fuente de verdad para el modulo de ordenes.
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

class VN_Landing_Order
{
    public static function init(): void
    {
        add_action('admin_post_nopriv_vn_cod_order', [self::class, 'handle']);
        add_action('admin_post_vn_cod_order', [self::class, 'handle']);
    }

    /** Valida un movil colombiano: 10 digitos empezando por 3. */
    private static function valid_phone(string $raw): bool
    {
        $d = preg_replace('/\D/', '', $raw);
        if (strlen($d) === 12 && str_starts_with($d, '57')) {
            $d = substr($d, 2);
        }
        return strlen($d) === 10 && $d[0] === '3';
    }

    private static function normalize_phone(string $raw): string
    {
        $d = preg_replace('/\D/', '', $raw);
        if (strlen($d) === 12 && str_starts_with($d, '57')) {
            $d = substr($d, 2);
        }
        return $d;
    }

    private static function fail(int $page_id, string $message): void
    {
        $url = $page_id ? get_permalink($page_id) : home_url('/');
        wp_safe_redirect(add_query_arg('vn_error', rawurlencode($message), $url) . '#vn-name');
        exit;
    }

    public static function handle(): void
    {
        $page_id = isset($_POST['vn_page_id']) ? absint($_POST['vn_page_id']) : 0;

        // Nonce: sin esto cualquiera puede inyectar pedidos desde fuera.
        if (!isset($_POST['vn_cod_nonce']) || !wp_verify_nonce(sanitize_key($_POST['vn_cod_nonce']), 'vn_cod_order')) {
            self::fail($page_id, 'La sesion expiro. Vuelve a intentarlo.');
        }

        $product_id = isset($_POST['vn_product_id']) ? absint($_POST['vn_product_id']) : 0;
        $product    = $product_id ? wc_get_product($product_id) : null;

        if (!$product || !$product->is_purchasable()) {
            self::fail($page_id, 'Este producto no esta disponible en este momento.');
        }

        $name    = sanitize_text_field(wp_unslash($_POST['vn_name'] ?? ''));
        $phone   = sanitize_text_field(wp_unslash($_POST['vn_phone'] ?? ''));
        $city    = sanitize_text_field(wp_unslash($_POST['vn_city'] ?? ''));
        $address = sanitize_text_field(wp_unslash($_POST['vn_address'] ?? ''));
        $qty     = max(1, min(10, absint($_POST['vn_qty'] ?? 1)));

        if ($name === '' || $city === '' || $address === '') {
            self::fail($page_id, 'Faltan datos para completar el pedido.');
        }

        if (!self::valid_phone($phone)) {
            self::fail($page_id, 'El celular debe tener 10 digitos y empezar por 3.');
        }

        $phone = self::normalize_phone($phone);

        // ---- Anti-duplicado -------------------------------------------------
        // Sin esto, un doble clic en el boton crea dos pedidos y se despachan
        // dos productos. Se bloquea el mismo telefono + producto durante 2 min.
        $lock_key = 'vn_cod_' . md5($phone . '|' . $product_id);
        if (get_transient($lock_key)) {
            self::fail($page_id, 'Ya recibimos tu pedido. Te contactaremos en breve.');
        }
        set_transient($lock_key, 1, 2 * MINUTE_IN_SECONDS);

        // ---- Crear el pedido ------------------------------------------------
        try {
            $order = wc_create_order(['status' => 'pending']);

            $order->add_product($product, $qty);

            // Se parte el nombre en nombre y apellido de forma sensata: mucha
            // gente escribe solo el nombre de pila.
            $parts = preg_split('/\s+/', trim($name), 2);
            $first = $parts[0] ?? $name;
            $last  = $parts[1] ?? '';

            $address_fields = [
                'first_name' => $first,
                'last_name'  => $last,
                'address_1'  => $address,
                'city'       => $city,
                'country'    => 'CO',
                'phone'      => $phone,
            ];

            $order->set_address($address_fields, 'billing');
            $order->set_address($address_fields, 'shipping');

            // ---- Envio ------------------------------------------------------
            $shipping_cost = 0.0;
            $page_shipping = $page_id ? (int) get_post_meta($page_id, 'vn_shipping', true) : 0;
            $free_from     = $page_id ? (int) get_post_meta($page_id, 'vn_free_from', true) : 150000;
            $subtotal      = (float) $product->get_price() * $qty;

            if ($page_shipping > 0 && !($free_from > 0 && $subtotal >= $free_from)) {
                $shipping_cost = (float) $page_shipping;
            }

            $item = new WC_Order_Item_Shipping();
            $item->set_method_title($shipping_cost > 0 ? 'Envio a domicilio' : 'Envio gratis');
            $item->set_method_id('vn_colombia');
            $item->set_total($shipping_cost);
            $order->add_item($item);

            $order->set_payment_method('vn_cod');
            $order->set_payment_method_title('Pago contra entrega');
            $order->calculate_totals();

            // Trazabilidad de origen: sin esto no se puede saber que landing
            // ni que anuncio produjo la venta, y sin eso no se puede optimizar
            // la pauta.
            $order->add_meta_data('_vn_source', 'landing_cod', true);
            $order->add_meta_data('_vn_landing_page', $page_id, true);
            $order->add_meta_data('_vn_cod_confirmed', 'no', true);

            foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as $utm) {
                if (!empty($_POST[$utm])) {
                    $order->add_meta_data('_vn_' . $utm, sanitize_text_field(wp_unslash($_POST[$utm])), true);
                }
            }

            // on-hold: NO se despacha hasta confirmar con el cliente.
            $order->update_status(
                'on-hold',
                'Pedido creado desde landing contraentrega. Pendiente de confirmacion por WhatsApp.'
            );

            $order->save();
            wc_reduce_stock_levels($order->get_id());

            do_action('vn_landing_order_created', $order);

            // ---- Redirigir a la pagina de gracias ---------------------------
            wp_safe_redirect($order->get_checkout_order_received_url());
            exit;

        } catch (Exception $e) {
            delete_transient($lock_key);
            error_log('[VISNEX] Error creando pedido desde landing: ' . $e->getMessage());
            self::fail($page_id, 'No pudimos crear tu pedido. Intentalo de nuevo o escribenos por WhatsApp.');
        }
    }
}
