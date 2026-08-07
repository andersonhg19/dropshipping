<?php
/**
 * Confirmacion de pedidos contra entrega.
 *
 * ESTA ES LA PALANCA ECONOMICA MAS GRANDE DE TODO EL PROYECTO.
 *
 * En dropshipping COD colombiano, entre el 20% y el 25% de los pedidos se caen
 * DESPUES de que ya pagaste pauta, producto y flete de ida. El CPA real no es
 * el que reporta Meta: es CPA dividido por la tasa de entrega.
 *
 *     CPA reportado $30.000 con 75% de entrega  ->  CPA real $40.000
 *     CPA reportado $30.000 con 85% de entrega  ->  CPA real $35.294
 *
 * Recuperar 10 puntos de entrega equivale a bajar el CPA un 13% sin tocar la
 * pauta. Confirmar cada pedido antes de despacharlo sube la entrega urbana al
 * 70-85%.
 *
 * Este modulo no automatiza el envio del mensaje todavia (eso exige la API de
 * WhatsApp Business, Fase 3). Lo que hace es quitar toda la friccion del
 * proceso manual: un boton por pedido que abre WhatsApp con el mensaje ya
 * escrito, y el estado de confirmacion visible en la lista de pedidos.
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

class VN_Order_Confirmation
{
    public static function init(): void
    {
        // Columna de confirmacion en la lista de pedidos (ambos almacenamientos).
        add_filter('manage_edit-shop_order_columns', [self::class, 'add_column'], 20);
        add_filter('manage_woocommerce_page_wc-orders_columns', [self::class, 'add_column'], 20);
        add_action('manage_shop_order_posts_custom_column', [self::class, 'render_column'], 20, 2);
        add_action('manage_woocommerce_page_wc-orders_custom_column', [self::class, 'render_column'], 20, 2);

        // Caja lateral en el detalle del pedido.
        add_action('add_meta_boxes', [self::class, 'add_meta_box']);

        // Accion de marcar confirmado.
        add_action('admin_post_vn_confirm_order', [self::class, 'handle_confirm']);

        add_action('admin_head', [self::class, 'column_styles']);
    }

    /* ---------------------------------------------------------------------
       Mensaje de confirmacion
       ------------------------------------------------------------------ */

    /**
     * Construye el mensaje de WhatsApp.
     *
     * Esta redactado para que la respuesta sea un SI o un NO claro. Preguntar
     * "confirmas?" a secas produce silencios; dar los datos y pedir una
     * confirmacion explicita produce respuesta.
     */
    /** Precio en texto plano, apto para WhatsApp o SMS. */
    public static function plain_price(float $amount): string
    {
        $html = wc_price($amount, ['decimals' => 0]);
        $text = html_entity_decode(wp_strip_all_tags($html), ENT_QUOTES, 'UTF-8');
        // Reemplaza el espacio duro (U+00A0) por uno normal y colapsa espacios.
        $text = str_replace("\xc2\xa0", ' ', $text);
        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    public static function build_message(WC_Order $order): string
    {
        $items = [];
        foreach ($order->get_items() as $item) {
            $items[] = $item->get_quantity() . ' x ' . $item->get_name();
        }

        // strip_tags() a secas deja las entidades HTML: el cliente recibiria
        // "&#36;&nbsp;199.800" en vez de "$ 199.800". Hay que decodificarlas y
        // normalizar el espacio duro, que en WhatsApp se ve como un simbolo raro.
        $total = self::plain_price($order->get_total());
        $name  = $order->get_billing_first_name();
        $shop  = get_bloginfo('name');

        $lines = [
            "Hola {$name}! Te escribimos de {$shop}.",
            '',
            "Recibimos tu pedido #{$order->get_order_number()}:",
            '- ' . implode("\n- ", $items),
            '',
            "Direccion: {$order->get_billing_address_1()}, {$order->get_billing_city()}",
            "Total a pagar al recibir: {$total}",
            '',
            'Confirmas que la direccion esta correcta y que lo recibes?',
            'Respondenos SI y lo despachamos hoy mismo.',
        ];

        return implode("\n", $lines);
    }

    public static function whatsapp_url(WC_Order $order): string
    {
        $phone = preg_replace('/\D/', '', $order->get_billing_phone());

        // wa.me exige indicativo de pais. Colombia es 57.
        if (strlen($phone) === 10) {
            $phone = '57' . $phone;
        }

        return 'https://wa.me/' . $phone . '?text=' . rawurlencode(self::build_message($order));
    }

    public static function is_cod(WC_Order $order): bool
    {
        return in_array($order->get_payment_method(), ['cod', 'vn_cod'], true);
    }

    public static function is_confirmed(WC_Order $order): bool
    {
        return $order->get_meta('_vn_cod_confirmed') === 'yes';
    }

    /* ---------------------------------------------------------------------
       Columna en la lista de pedidos
       ------------------------------------------------------------------ */

    public static function add_column(array $columns): array
    {
        $new = [];
        foreach ($columns as $key => $label) {
            $new[$key] = $label;
            if ($key === 'order_status') {
                $new['vn_confirm'] = 'Confirmacion';
            }
        }
        // Si no existe order_status, se anade al final.
        if (!isset($new['vn_confirm'])) {
            $new['vn_confirm'] = 'Confirmacion';
        }
        return $new;
    }

    public static function render_column($column, $order_or_id): void
    {
        if ($column !== 'vn_confirm') {
            return;
        }

        $order = $order_or_id instanceof WC_Order ? $order_or_id : wc_get_order($order_or_id);
        if (!$order) {
            return;
        }

        if (!self::is_cod($order)) {
            echo '<span class="vn-pill vn-pill--muted">Pagado</span>';
            return;
        }

        if (self::is_confirmed($order)) {
            echo '<span class="vn-pill vn-pill--ok">Confirmado</span>';
            return;
        }

        printf(
            '<a class="vn-pill vn-pill--todo" href="%s" target="_blank" rel="noopener" title="Abre WhatsApp con el mensaje ya escrito">Confirmar</a>',
            esc_url(self::whatsapp_url($order))
        );
    }

    public static function column_styles(): void
    {
        $screen = get_current_screen();
        if (!$screen || !str_contains((string) $screen->id, 'order')) {
            return;
        }
        ?>
        <style>
            .vn-pill { display:inline-block; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; text-decoration:none; line-height:1.8; }
            .vn-pill--ok    { background:#E8F5EE; color:#1B7F4F; }
            .vn-pill--todo  { background:#FFF6E5; color:#8A5A00; border:1px solid #E8C88A; }
            .vn-pill--todo:hover { background:#8A5A00; color:#fff; }
            .vn-pill--muted { background:#F0F0F2; color:#6E6E73; }
            .column-vn_confirm { width: 110px; }
        </style>
        <?php
    }

    /* ---------------------------------------------------------------------
       Caja en el detalle del pedido
       ------------------------------------------------------------------ */

    public static function add_meta_box(): void
    {
        $screens = ['shop_order', 'woocommerce_page_wc-orders'];
        foreach ($screens as $screen) {
            add_meta_box(
                'vn_cod_confirmation',
                'Confirmacion contra entrega',
                [self::class, 'render_meta_box'],
                $screen,
                'side',
                'high'
            );
        }
    }

    public static function render_meta_box($post_or_order): void
    {
        $order = $post_or_order instanceof WC_Order
            ? $post_or_order
            : wc_get_order($post_or_order->ID ?? 0);

        if (!$order) {
            return;
        }

        if (!self::is_cod($order)) {
            echo '<p>Este pedido no es contra entrega.</p>';
            return;
        }

        if (self::is_confirmed($order)) {
            $when = $order->get_meta('_vn_cod_confirmed_at');
            echo '<p style="color:#1B7F4F;font-weight:600">Confirmado con el cliente</p>';
            if ($when) {
                echo '<p style="color:#6E6E73;font-size:12px">' . esc_html($when) . '</p>';
            }
            echo '<p style="font-size:12px;color:#6E6E73">Ya se puede despachar.</p>';
            return;
        }

        $confirm_url = wp_nonce_url(
            admin_url('admin-post.php?action=vn_confirm_order&order_id=' . $order->get_id()),
            'vn_confirm_' . $order->get_id()
        );
        ?>
        <p style="font-size:12px;color:#6E6E73;margin-top:0">
            Entre el 20% y el 25% de los pedidos contra entrega se caen si no se
            confirman antes de despachar. Confirmar sube la entrega al 70-85%.
        </p>

        <p>
            <a class="button button-primary" style="width:100%;text-align:center"
               href="<?php echo esc_url(self::whatsapp_url($order)); ?>"
               target="_blank" rel="noopener">
                1. Escribir por WhatsApp
            </a>
        </p>

        <p>
            <a class="button" style="width:100%;text-align:center"
               href="<?php echo esc_url($confirm_url); ?>">
                2. Marcar como confirmado
            </a>
        </p>

        <p style="font-size:12px;color:#6E6E73;margin-bottom:0">
            Celular: <strong><?php echo esc_html($order->get_billing_phone() ?: 'sin registrar'); ?></strong>
        </p>
        <?php
    }

    /* ---------------------------------------------------------------------
       Marcar confirmado
       ------------------------------------------------------------------ */

    public static function handle_confirm(): void
    {
        $order_id = isset($_GET['order_id']) ? absint($_GET['order_id']) : 0;

        if (!$order_id || !current_user_can('edit_shop_orders')) {
            wp_die('No autorizado.');
        }

        check_admin_referer('vn_confirm_' . $order_id);

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_die('Pedido no encontrado.');
        }

        $order->update_meta_data('_vn_cod_confirmed', 'yes');
        $order->update_meta_data('_vn_cod_confirmed_at', current_time('mysql'));
        $order->add_order_note('Pedido CONFIRMADO con el cliente. Listo para despachar.', false, true);

        // Pasa a 'processing': ya se puede despachar.
        $order->update_status('processing');
        $order->save();

        do_action('vn_cod_order_confirmed', $order);

        wp_safe_redirect($order->get_edit_order_url());
        exit;
    }
}
