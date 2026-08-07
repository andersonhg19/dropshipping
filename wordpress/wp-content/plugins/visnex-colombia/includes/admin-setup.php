<?php
/**
 * Panel de puesta en marcha.
 *
 * Reune en una sola pantalla lo que hay que hacer para que la tienda venda de
 * verdad, con el estado real de cada cosa. Sustituye a "acuerdate de configurar
 * la pasarela", que es como se pierden las semanas.
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

add_action('admin_menu', function () {
    add_submenu_page(
        'woocommerce',
        'VISNEX — Puesta en marcha',
        'VISNEX Setup',
        'manage_woocommerce',
        'visnex-setup',
        'visnex_render_setup_page'
    );
});

/**
 * Comprueba el estado real de cada requisito.
 * Nada de "probablemente": se consulta el estado efectivo.
 */
function visnex_setup_checks(): array
{
    $gateways = WC()->payment_gateways() ? WC()->payment_gateways->get_available_payment_gateways() : [];
    $active_plugins = (array) get_option('active_plugins', []);

    $has_plugin = function (string $needle) use ($active_plugins): bool {
        foreach ($active_plugins as $p) {
            if (str_contains($p, $needle)) {
                return true;
            }
        }
        return false;
    };

    // Paginas legales sin marcadores pendientes.
    $legal_ok = true;
    foreach (['politica-de-privacidad', 'terminos-y-condiciones', 'politica-de-devoluciones', 'politica-de-envios'] as $slug) {
        $page = get_page_by_path($slug, OBJECT, 'page');
        if (!$page || str_contains($page->post_content, '[COMPLETAR')) {
            $legal_ok = false;
            break;
        }
    }

    $currency = get_woocommerce_currency();

    return [
        [
            'title' => 'Moneda en pesos colombianos',
            'ok'    => $currency === 'COP',
            'note'  => $currency === 'COP' ? 'COP configurado' : "Actualmente: {$currency}",
            'link'  => admin_url('admin.php?page=wc-settings&tab=general'),
            'why'   => 'Vender en COP con decimales o en otra moneda confunde y hace abandonar.',
        ],
        [
            'title' => 'Pago contra entrega activo',
            'ok'    => isset($gateways['vn_cod']) || isset($gateways['cod']),
            'note'  => isset($gateways['vn_cod']) ? 'VISNEX COD activo' : (isset($gateways['cod']) ? 'COD nativo activo (mejor usar el de VISNEX)' : 'Sin contraentrega'),
            'link'  => admin_url('admin.php?page=wc-settings&tab=checkout&section=vn_cod'),
            'why'   => 'En el nicho de dropshipping por anuncios en Colombia, el contra entrega es entre el 40% y el 65% de las ventas.',
        ],
        [
            'title' => 'Pasarela de pago en linea',
            'ok'    => $has_plugin('woocommerce-mercadopago') || $has_plugin('wompi'),
            'note'  => $has_plugin('woocommerce-mercadopago')
                ? 'Mercado Pago instalado'
                : ($has_plugin('wompi') ? 'Wompi instalado' : 'Ninguna instalada'),
            'link'  => admin_url('plugin-install.php?s=mercadopago&tab=search&type=term'),
            'why'   => 'Para quien SI quiere pagar por adelantado. Mercado Pago tiene 100.000 instalaciones y se actualiza cada pocos dias; Wompi (Bancolombia) aporta Nequi y PSE.',
        ],
        [
            'title' => 'Metodo de envio configurado',
            'ok'    => !empty(WC()->shipping() ? WC()->shipping->get_shipping_methods() : []) && visnex_has_shipping_zone(),
            'note'  => visnex_has_shipping_zone() ? 'Zona de envio con metodo activo' : 'Sin zonas de envio configuradas',
            'link'  => admin_url('admin.php?page=wc-settings&tab=shipping'),
            'why'   => 'Sin metodo de envio, el checkout se bloquea y nadie puede comprar.',
        ],
        [
            'title' => 'Paginas legales completas',
            'ok'    => $legal_ok,
            'note'  => $legal_ok ? 'Sin marcadores pendientes' : 'Faltan datos (NIT, direccion, telefono)',
            'link'  => admin_url('edit.php?post_type=page'),
            'why'   => 'La Ley 1480 de 2011 exige informar el derecho de retracto. Ademas, unas politicas a medio hacer se leen como tienda poco seria.',
        ],
        [
            'title' => 'Tema VISNEX activo',
            'ok'    => get_stylesheet() === 'visnex',
            'note'  => 'Tema actual: ' . get_stylesheet(),
            'link'  => admin_url('themes.php'),
            'why'   => 'Es el que estiliza carrito, checkout y mi cuenta. Sin el, el embudo de pago cae al Storefront gris de fabrica.',
        ],
    ];
}

function visnex_has_shipping_zone(): bool
{
    if (!class_exists('WC_Shipping_Zones')) {
        return false;
    }
    foreach (WC_Shipping_Zones::get_zones() as $zone) {
        if (!empty($zone['shipping_methods'])) {
            return true;
        }
    }
    $default = WC_Shipping_Zones::get_zone(0);
    return $default && !empty($default->get_shipping_methods(true));
}

function visnex_render_setup_page(): void
{
    $checks = visnex_setup_checks();
    $done = count(array_filter($checks, fn($c) => $c['ok']));
    $total = count($checks);
    $pct = $total ? (int) round($done / $total * 100) : 0;
    ?>
    <div class="wrap">
        <h1>VISNEX — Puesta en marcha</h1>
        <p style="max-width:760px;color:#50575e">
            Lo que falta para que la tienda pueda vender de verdad. El estado se
            calcula consultando la configuracion real, no una lista de tareas.
        </p>

        <div style="max-width:760px;background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:20px;margin:20px 0">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
                <strong style="font-size:16px"><?php echo esc_html("$done de $total listo"); ?></strong>
                <span style="color:#50575e"><?php echo esc_html($pct); ?>%</span>
            </div>
            <div style="height:8px;background:#f0f0f1;border-radius:999px;overflow:hidden">
                <div style="height:100%;width:<?php echo esc_attr($pct); ?>%;background:<?php echo $pct === 100 ? '#1B7F4F' : '#2271b1'; ?>"></div>
            </div>
        </div>

        <table class="widefat striped" style="max-width:760px">
            <tbody>
            <?php foreach ($checks as $c) : ?>
                <tr>
                    <td style="width:34px;vertical-align:top;padding-top:14px">
                        <?php if ($c['ok']) : ?>
                            <span style="color:#1B7F4F;font-size:18px" aria-label="Listo">&#10003;</span>
                        <?php else : ?>
                            <span style="color:#8A5A00;font-size:18px" aria-label="Pendiente">&#9679;</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <strong><?php echo esc_html($c['title']); ?></strong><br>
                        <span style="color:#50575e"><?php echo esc_html($c['note']); ?></span>
                        <p style="color:#787c82;font-size:12px;margin:6px 0 0"><?php echo esc_html($c['why']); ?></p>
                    </td>
                    <td style="width:130px;text-align:right;vertical-align:middle">
                        <a class="button<?php echo $c['ok'] ? '' : ' button-primary'; ?>" href="<?php echo esc_url($c['link']); ?>">
                            <?php echo $c['ok'] ? 'Revisar' : 'Configurar'; ?>
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <h2 style="margin-top:32px">Pasarelas de pago para Colombia</h2>
        <table class="widefat striped" style="max-width:760px">
            <thead>
                <tr><th>Opcion</th><th>Medios</th><th>Datos del repositorio oficial</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Mercado Pago</strong><br><span style="color:#50575e;font-size:12px">Recomendada para empezar</span></td>
                    <td>Tarjetas, PSE, efectivo, cuotas</td>
                    <td>100.000 instalaciones &middot; 3,9&#9733; con 691 resenas &middot; actualizado hace dias</td>
                </tr>
                <tr>
                    <td><strong>Wompi</strong> (Bancolombia)</td>
                    <td><strong>Nequi</strong>, PSE, tarjetas, Bancolombia</td>
                    <td>6.000 instalaciones &middot; 2,3&#9733; con solo 4 resenas &middot; actualizado may-2026</td>
                </tr>
                <tr>
                    <td><strong>Contra entrega</strong><br><span style="color:#50575e;font-size:12px">Ya incluida en este plugin</span></td>
                    <td>Efectivo al recibir</td>
                    <td>Sin comisiones de pasarela. Entre el 40% y el 65% de las ventas del nicho</td>
                </tr>
            </tbody>
        </table>
        <p style="max-width:760px;color:#50575e;font-size:13px">
            <strong>Recomendacion:</strong> Mercado Pago por volumen y mantenimiento, y Wompi
            si Nequi es importante para tu publico. Se pueden tener las dos activas a la vez:
            cuantos mas medios, menos abandono. Las cuatro estrellas de diferencia entre una
            y otra hay que leerlas con cuidado — Wompi solo tiene 4 resenas, que no es una
            muestra significativa.
        </p>

        <h2 style="margin-top:32px">Envios</h2>
        <p style="max-width:760px;color:#50575e;font-size:13px">
            Este plugin trae <strong>VISNEX Envios Colombia</strong>: tarifas por zona desde
            Bogota, configurables, sin depender de nadie. Los plugins de Coordinadora y
            Servientrega exigen un convenio comercial vigente con la transportadora, que no se
            consigue sin volumen; el de mipaquete lleva sin actualizarse desde marzo de 2025.
            Cuando tengas volumen y convenio, instalas el de la transportadora y desactivas este.
        </p>
        <p>
            <a class="button" href="<?php echo esc_url(admin_url('admin.php?page=wc-settings&tab=shipping')); ?>">Configurar tarifas de envio</a>
        </p>
    </div>
    <?php
}
