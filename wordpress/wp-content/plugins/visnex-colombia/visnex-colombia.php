<?php
/**
 * Plugin Name:       VISNEX Colombia
 * Plugin URI:        https://visnex.co
 * Description:       Contraentrega con confirmacion, tarifas de envio por zona desde Bogota, y creacion de pedidos desde la landing COD. Todo lo que una tienda de dropshipping colombiana necesita el dia 1, sin depender de convenios con transportadoras ni de APIs externas.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            Anderson Herrera
 * License:           GPL-2.0-or-later
 * Text Domain:       visnex-colombia
 * WC requires at least: 8.0
 * WC tested up to:   9.9
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

define('VISNEX_CO_VERSION', '1.0.0');
define('VISNEX_CO_PATH', plugin_dir_path(__FILE__));
define('VISNEX_CO_URL', plugin_dir_url(__FILE__));

/**
 * Compatibilidad con el almacenamiento de pedidos en tablas propias (HPOS).
 * Sin esto, WooCommerce marca el plugin como incompatible y desactiva HPOS.
 */
add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
    }
});

/** Arranca solo si WooCommerce esta activo. */
add_action('plugins_loaded', function () {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p><strong>VISNEX Colombia</strong> necesita WooCommerce activo.</p></div>';
        });
        return;
    }

    require_once VISNEX_CO_PATH . 'includes/class-vn-shipping-colombia.php';
    require_once VISNEX_CO_PATH . 'includes/class-vn-cod-gateway.php';
    require_once VISNEX_CO_PATH . 'includes/class-vn-landing-order.php';
    require_once VISNEX_CO_PATH . 'includes/class-vn-order-confirmation.php';
    require_once VISNEX_CO_PATH . 'includes/admin-setup.php';

    VN_Landing_Order::init();
    VN_Order_Confirmation::init();
}, 11);

/** Registra el metodo de envio propio. */
add_filter('woocommerce_shipping_methods', function ($methods) {
    $methods['vn_colombia'] = 'VN_Shipping_Colombia';
    return $methods;
});

add_action('woocommerce_shipping_init', function () {
    require_once VISNEX_CO_PATH . 'includes/class-vn-shipping-colombia.php';
});

/** Registra la pasarela de contraentrega mejorada. */
add_filter('woocommerce_payment_gateways', function ($gateways) {
    $gateways[] = 'VN_COD_Gateway';
    return $gateways;
});
