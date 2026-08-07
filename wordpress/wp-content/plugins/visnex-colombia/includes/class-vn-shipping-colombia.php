<?php
/**
 * Metodo de envio: tarifas por zona desde Bogota.
 *
 * POR QUE ESTO Y NO UN PLUGIN DE TRANSPORTADORA
 * ---------------------------------------------
 * Los plugins de Coordinadora y Servientrega exigen tener un CONVENIO COMERCIAL
 * vigente con la transportadora — que no se consigue sin volumen. El de
 * mipaquete lleva sin actualizarse desde marzo de 2025.
 *
 * Este metodo no depende de nadie: funciona desde el minuto uno, con tarifas
 * por zona configurables, y cubre el caso real del negocio. Cuando haya volumen
 * y convenio, se instala el plugin de la transportadora y este se desactiva.
 *
 * Ademas, en dropshipping con Dropi el flete lo pone el proveedor, asi que
 * estas tarifas aplican sobre todo a producto propio.
 *
 * @package visnex-colombia
 */

defined('ABSPATH') || exit;

if (!class_exists('WC_Shipping_Method')) {
    return;
}

class VN_Shipping_Colombia extends WC_Shipping_Method
{
    /**
     * Zonas de destino.
     *
     * Los departamentos de dificil acceso se separan porque el flete real
     * puede triplicarse. Cobrar tarifa de Medellin a San Andres es vender
     * a perdida sin enterarse.
     */
    private const ZONES = [
        'bogota' => [
            'label'  => 'Bogota y area metropolitana',
            'cities' => ['bogota', 'bogota dc', 'bogota d.c.', 'soacha', 'chia', 'cajica', 'zipaquira', 'mosquera', 'funza', 'madrid', 'la calera', 'cota', 'sopo', 'tocancipa'],
            'states' => [],
            'days'   => '1 a 2 dias habiles',
        ],
        'principales' => [
            'label'  => 'Ciudades principales',
            'cities' => ['medellin', 'cali', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales', 'armenia', 'ibague', 'cucuta', 'villavicencio', 'santa marta', 'neiva', 'pasto', 'monteria', 'valledupar', 'popayan', 'sincelejo', 'tunja', 'riohacha', 'envigado', 'itagui', 'bello', 'sabaneta', 'palmira', 'floridablanca', 'giron', 'soledad'],
            'states' => [],
            'days'   => '2 a 3 dias habiles',
        ],
        'dificil' => [
            'label'  => 'Zonas de dificil acceso',
            'cities' => ['leticia', 'mitu', 'puerto carreno', 'inirida', 'san andres', 'providencia', 'san jose del guaviare'],
            // Codigos ISO de departamento en WooCommerce (CO-XXX).
            'states' => ['AMA', 'GUA', 'GUV', 'VAU', 'VID', 'SAP', 'PUT', 'CAQ'],
            'days'   => '5 a 8 dias habiles',
        ],
        // Todo lo que no encaje arriba cae en 'intermedias'.
    ];

    public function __construct($instance_id = 0)
    {
        $this->id                 = 'vn_colombia';
        $this->instance_id        = absint($instance_id);
        $this->method_title       = 'VISNEX Envios Colombia';
        $this->method_description = 'Tarifas por zona desde Bogota. No requiere convenio con transportadora ni API externa.';
        $this->supports           = ['shipping-zones', 'instance-settings', 'instance-settings-modal'];

        $this->init();
    }

    public function init(): void
    {
        $this->init_form_fields();
        $this->init_settings();
        // Los ajustes de este metodo son POR INSTANCIA (uno por zona de envio).
        // Sin esta llamada, get_option() no encuentra las tarifas y todas las
        // zonas acaban cobrando el mismo valor por defecto.
        $this->init_instance_settings();

        $this->title   = $this->option('title', 'Envio a domicilio');
        $this->enabled = $this->option('enabled', 'yes');

        add_action('woocommerce_update_options_shipping_' . $this->id, [$this, 'process_admin_options']);
    }

    /**
     * Lee un ajuste con respaldo en el valor por defecto declarado.
     *
     * get_option() de WooCommerce solo consulta los ajustes de instancia si
     * instance_id es distinto de cero. Este metodo funciona tambien fuera de
     * una zona (pruebas, calculos desde la landing), cayendo al default
     * declarado en instance_form_fields en vez de a un valor arbitrario.
     */
    private function option(string $key, $fallback = '')
    {
        if (isset($this->instance_settings[$key]) && $this->instance_settings[$key] !== '') {
            return $this->instance_settings[$key];
        }
        if (isset($this->settings[$key]) && $this->settings[$key] !== '') {
            return $this->settings[$key];
        }
        if (isset($this->instance_form_fields[$key]['default'])) {
            return $this->instance_form_fields[$key]['default'];
        }
        return $fallback;
    }

    public function init_form_fields(): void
    {
        $this->instance_form_fields = [
            'title' => [
                'title'       => 'Titulo',
                'type'        => 'text',
                'description' => 'Lo que ve el cliente en el checkout.',
                'default'     => 'Envio a domicilio',
                'desc_tip'    => true,
            ],
            'rate_bogota' => [
                'title'       => 'Tarifa Bogota y alrededores (COP)',
                'type'        => 'number',
                'default'     => '9000',
                'desc_tip'    => true,
                'description' => 'Bogota, Soacha, Chia, Cajica, Zipaquira, Mosquera, Funza, Madrid y municipios vecinos.',
            ],
            'rate_principales' => [
                'title'       => 'Tarifa ciudades principales (COP)',
                'type'        => 'number',
                'default'     => '14000',
                'desc_tip'    => true,
                'description' => 'Medellin, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira y capitales.',
            ],
            'rate_intermedias' => [
                'title'       => 'Tarifa resto del pais (COP)',
                'type'        => 'number',
                'default'     => '18000',
                'desc_tip'    => true,
                'description' => 'Municipios intermedios y pequenos no listados en las otras zonas.',
            ],
            'rate_dificil' => [
                'title'       => 'Tarifa zonas de dificil acceso (COP)',
                'type'        => 'number',
                'default'     => '32000',
                'desc_tip'    => true,
                'description' => 'Amazonas, Guainia, Guaviare, Vaupes, Vichada, San Andres, Putumayo, Caqueta.',
            ],
            'free_from' => [
                'title'       => 'Envio gratis desde (COP)',
                'type'        => 'number',
                'default'     => '150000',
                'desc_tip'    => true,
                'description' => 'Subtotal a partir del cual el envio es gratis. 0 para desactivar.',
            ],
            'free_excludes_dificil' => [
                'title'       => 'Excluir zonas dificiles del envio gratis',
                'type'        => 'checkbox',
                'label'       => 'Si, cobrar siempre el envio en zonas de dificil acceso',
                'default'     => 'yes',
                'description' => 'Recomendado: el flete a San Andres o Amazonas se come el margen de un pedido normal.',
            ],
            'cod_surcharge' => [
                'title'       => 'Recargo por contraentrega (COP)',
                'type'        => 'number',
                'default'     => '0',
                'desc_tip'    => true,
                'description' => 'Las transportadoras cobran una comision por recaudar el efectivo (tipicamente 3-5%). Puedes repercutirla o absorberla.',
            ],
        ];
    }

    /**
     * Determina la zona a partir de la ciudad y el departamento del destino.
     * La ciudad manda sobre el departamento: Medellin es principal aunque
     * Antioquia tenga municipios intermedios.
     */
    public function resolve_zone(string $city, string $state): string
    {
        $city = $this->normalize($city);
        $state = strtoupper(trim($state));

        foreach (self::ZONES as $key => $zone) {
            foreach ($zone['cities'] as $c) {
                if ($city === $this->normalize($c)) {
                    return $key;
                }
            }
        }

        // El departamento solo decide si la ciudad no dio respuesta.
        foreach (self::ZONES as $key => $zone) {
            if (!empty($zone['states']) && in_array($state, $zone['states'], true)) {
                return $key;
            }
        }

        return 'intermedias';
    }

    /** Quita tildes y normaliza para comparar nombres de ciudad. */
    private function normalize(string $text): string
    {
        $text = trim(mb_strtolower($text, 'UTF-8'));
        $from = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ'];
        $to   = ['a', 'e', 'i', 'o', 'u', 'u', 'n', 'a', 'e', 'i', 'o', 'u'];
        $text = str_replace($from, $to, $text);
        return preg_replace('/[^a-z0-9 ]/', '', $text) ?? $text;
    }

    public function zone_label(string $zone): string
    {
        return self::ZONES[$zone]['label'] ?? 'Resto del pais';
    }

    public function zone_days(string $zone): string
    {
        return self::ZONES[$zone]['days'] ?? '3 a 5 dias habiles';
    }

    /** Tarifa aplicable a un destino, ya considerando el envio gratis. */
    public function quote(string $city, string $state, float $subtotal): array
    {
        $zone = $this->resolve_zone($city, $state);
        $cost = (float) $this->option('rate_' . $zone, $this->option('rate_intermedias', 18000));

        $free_from = (float) $this->option('free_from', 150000);
        $exclude   = $this->option('free_excludes_dificil', 'yes') === 'yes';
        $is_free   = $free_from > 0
            && $subtotal >= $free_from
            && !($exclude && $zone === 'dificil');

        return [
            'zone'  => $zone,
            'label' => $this->zone_label($zone),
            'days'  => $this->zone_days($zone),
            'cost'  => $is_free ? 0.0 : $cost,
            'free'  => $is_free,
        ];
    }

    public function calculate_shipping($package = []): void
    {
        $city  = $package['destination']['city'] ?? '';
        $state = $package['destination']['state'] ?? '';

        $subtotal = 0.0;
        foreach ($package['contents'] as $item) {
            $subtotal += (float) ($item['line_subtotal'] ?? 0);
        }

        $q = $this->quote($city, $state, $subtotal);

        // El tiempo de entrega en la etiqueta baja las preguntas al soporte
        // y reduce el abandono: el cliente ya no tiene que adivinar.
        $label = $this->title . ' — ' . $q['days'];
        if ($q['free']) {
            $label = 'Envio GRATIS — ' . $q['days'];
        }

        $this->add_rate([
            'id'      => $this->get_rate_id(),
            'label'   => $label,
            'cost'    => $q['cost'],
            'package' => $package,
            'meta_data' => [
                'Zona'            => $q['label'],
                'Tiempo estimado' => $q['days'],
            ],
        ]);
    }
}
