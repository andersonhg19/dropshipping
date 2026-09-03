<?php
/**
 * D'MIKA — La figura vestida.
 *
 * QUE ES
 * Una silueta -de mujer o de hombre- con las prendas del look PUESTAS encima,
 * no tres fotos en fila.
 *
 * POR QUE
 * Tres tarjetas una al lado de otra son un listado. Un listado no contesta la
 * pregunta que se hace quien mira: "¿y esto junto, como se ve?". La figura si
 * la contesta de un vistazo, y es lo que hace un maniqui en un escaparate.
 *
 * COMO ESTA HECHO, QUE ES LA PARTE INTERESANTE
 * No hay recorte de fondo ni inteligencia artificial: las fotos de producto se
 * meten DENTRO de las regiones del cuerpo con `clipPath` de SVG. El torso se
 * recorta de la foto de arriba y las piernas de la foto de abajo.
 *
 * El truco que hace que encaje: `preserveAspectRatio`. La foto de arriba se
 * ancla por su BORDE SUPERIOR (xMidYMin), porque en una foto de prenda de
 * arriba lo que interesa esta arriba; la de abajo se ancla por el INFERIOR
 * (xMidYMax), porque un pantalon ocupa la parte baja del encuadre. Asi cada
 * prenda cae en la zona del cuerpo que le toca sin recortar nada a mano.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/**
 * Las regiones del cuerpo, por genero.
 *
 * Retícula de 300 x 640 en los dos casos, para que la figura de mujer y la de
 * hombre ocupen lo mismo y el panel no de un salto al cambiar.
 *
 * La diferencia entre las dos no es el tamano: es el ANCHO DE HOMBRO respecto
 * a la cintura y la cadera. Eso es lo que lee el ojo como "hombre" o "mujer"
 * en una silueta, mas que la altura.
 */
function dm_figura_partes(string $genero): array
{
    if ($genero === 'hombre') {
        return [
            // Cabeza y cuello.
            'cabeza' => 'M150,26 C168,26 180,42 180,60 C180,80 168,94 150,94 C132,94 120,80 120,60 C120,42 132,26 150,26 Z',
            // El pelo es lo que separa una cabeza de un huevo. Corto, ajustado.
            'pelo'   => 'M150,24 C170,24 182,38 182,58 C182,50 176,44 168,42 C160,40 140,40 132,42 C124,44 118,50 118,58 C118,38 130,24 150,24 Z',
            'cuello' => 'M138,88 L162,88 L164,110 L136,110 Z',
            // Hombros anchos, cintura poco marcada, cadera estrecha.
            'torso'  => 'M150,104 C118,104 92,112 88,124 C86,148 96,186 100,220 '
                      . 'C102,248 98,276 98,300 L202,300 C202,276 198,248 200,220 '
                      . 'C204,186 214,148 212,124 C208,112 182,104 150,104 Z',
            'brazoI' => 'M88,124 C78,150 72,196 70,246 C69,266 74,286 80,300 L96,296 C92,278 90,258 92,240 C96,196 100,152 104,128 Z',
            'brazoD' => 'M212,124 C222,150 228,196 230,246 C231,266 226,286 220,300 L204,296 C208,278 210,258 208,240 C204,196 200,152 196,128 Z',
            // Piernas rectas, con la escotadura del tiro.
            'piernas' => 'M98,300 L202,300 L196,606 L162,606 L150,392 L138,606 L104,606 Z',
        ];
    }

    return [
        'cabeza' => 'M150,28 C166,28 178,43 178,60 C178,79 166,92 150,92 C134,92 122,79 122,60 C122,43 134,28 150,28 Z',
        // Melena: cae por detras de los hombros y ata la cabeza al cuerpo.
        'pelo'   => 'M150,22 C172,22 184,38 184,60 C184,84 182,104 178,122 L166,120 '
                  . 'C172,102 174,80 172,62 C170,46 162,38 150,38 C138,38 130,46 128,62 '
                  . 'C126,80 128,102 134,120 L122,122 C118,104 116,84 116,60 C116,38 128,22 150,22 Z',
        'cuello' => 'M140,86 L160,86 L162,108 L138,108 Z',
        // Hombro mas estrecho, cintura marcada, cadera ancha.
        'torso'  => 'M150,102 C124,102 102,109 99,120 C97,143 108,178 113,212 '
                  . 'C116,236 106,262 104,290 C102,308 108,320 118,324 L182,324 '
                  . 'C192,320 198,308 196,290 C194,262 184,236 187,212 '
                  . 'C192,178 203,143 201,120 C198,109 176,102 150,102 Z',
        'brazoI' => 'M99,120 C90,146 84,190 82,238 C81,258 86,278 92,292 L106,288 C102,270 100,252 102,234 C106,190 110,148 114,124 Z',
        'brazoD' => 'M201,120 C210,146 216,190 218,238 C219,258 214,278 208,292 L194,288 C198,270 200,252 198,234 C194,190 190,148 186,124 Z',
        'piernas' => 'M118,324 L182,324 L176,606 L158,606 L150,404 L142,606 L124,606 Z',
    ];
}

/**
 * Elige, de todas las fotos de una prenda, la que mejor se deja VESTIR.
 *
 * EL PROBLEMA QUE RESUELVE, QUE SALIO AL MIRAR Y NO AL PENSAR
 * La primera version usaba siempre la foto principal. Con un modelo puesto
 * queda bien; con un bodegon -tres camisas dobladas sobre una mesa- el torso
 * de la figura sale con una mesa dentro. Ridiculo, y en la primera prueba
 * salio exactamente eso.
 *
 * No hay forma de saber sin mirar la foto si hay una persona dentro. Pero si
 * hay una senal barata y sorprendentemente fiable: LA PROPORCION. Una foto de
 * alguien vestido es vertical -el cuerpo es alto y estrecho- y un bodegon o un
 * plano cenital tiende a cuadrado o apaisado.
 *
 * Asi que se recorre la galeria y se coge la mas vertical. Si ninguna llega a
 * 1,15 de alto por ancho, se devuelve la principal y se asume el riesgo: es
 * mejor una figura imperfecta que un hueco.
 */
function dm_figura_mejor_foto(WC_Product $p): string
{
    $candidatas = array_filter(array_merge([$p->get_image_id()], $p->get_gallery_image_ids()));
    if (!$candidatas) {
        return '';
    }

    $mejor = 0;
    $razon = 0.0;

    foreach ($candidatas as $id) {
        $m = wp_get_attachment_metadata($id);
        if (empty($m['width']) || empty($m['height'])) {
            continue;
        }
        $r = $m['height'] / $m['width'];
        if ($r > $razon) {
            $razon = $r;
            $mejor = $id;
        }
    }

    $elegida = $mejor ?: (int) $p->get_image_id();
    return (string) wp_get_attachment_image_url($elegida, 'woocommerce_single');
}

/**
 * Pinta la figura con las prendas puestas.
 *
 * @param string $genero 'mujer' | 'hombre'
 * @param array  $prendas ['arriba' => url, 'abajo' => url, 'remate' => url]
 * @param string $id      Sufijo unico: si hay dos figuras en la pagina, sus
 *                        clipPath no pueden llamarse igual o la segunda usa las
 *                        regiones de la primera.
 */
function dm_figura(string $genero, array $prendas, string $id = 'a'): string
{
    $p = dm_figura_partes($genero);
    $piel = '#D8C7B0';   // Beige Arena: la silueta es marca, no carne.
    $sombra = 'rgba(23,23,23,.10)';

    $c = 'dmf-' . sanitize_html_class($id);

    ob_start();
    ?>
    <svg class="dm-figura" viewBox="0 0 300 640" role="img"
         aria-label="Figura con el look puesto" focusable="false">
        <defs>
            <clipPath id="<?php echo esc_attr($c); ?>-torso"><path d="<?php echo esc_attr($p['torso']); ?>"/></clipPath>
            <clipPath id="<?php echo esc_attr($c); ?>-piernas"><path d="<?php echo esc_attr($p['piernas']); ?>"/></clipPath>
            <?php /* El remate se recorta en dos franjas verticales a los lados
                     del torso: es como cae una chaqueta abierta. */ ?>
            <clipPath id="<?php echo esc_attr($c); ?>-flequillo">
                <rect x="100" y="0" width="100" height="52"/>
            </clipPath>
            <clipPath id="<?php echo esc_attr($c); ?>-remate">
                <path d="<?php echo esc_attr($p['torso']); ?>"/>
            </clipPath>
            <?php /* El hueco del centro es lo que hace que se lea como chaqueta
                     ABIERTA y deje ver la prenda de debajo.
                     Va con DEGRADADO y no con un rectangulo de borde duro: un
                     canto recto en mitad del pecho se lee como un error de
                     recorte, no como una solapa. */ ?>
            <linearGradient id="<?php echo esc_attr($c); ?>-solapa" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0"    stop-color="#fff"/>
                <stop offset=".30"  stop-color="#fff"/>
                <stop offset=".40"  stop-color="#000"/>
                <stop offset=".60"  stop-color="#000"/>
                <stop offset=".70"  stop-color="#fff"/>
                <stop offset="1"    stop-color="#fff"/>
            </linearGradient>
            <mask id="<?php echo esc_attr($c); ?>-abierta">
                <rect x="0" y="0" width="300" height="640"
                      fill="url(#<?php echo esc_attr($c); ?>-solapa)"/>
            </mask>

            <?php /* Un velo de marca por encima de las fotos. Las prendas vienen
                     de sesiones distintas -fondos, luces y temperaturas que no
                     casan- y sin esto la figura se ve como un collage de tres
                     revistas. Un 12% de marfil las lleva a la misma luz. */ ?>
            <linearGradient id="<?php echo esc_attr($c); ?>-luz" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0"   stop-color="#FFFDF9" stop-opacity=".26"/>
                <stop offset=".45" stop-color="#F4EFE7" stop-opacity=".10"/>
                <stop offset="1"   stop-color="#6F5A4A" stop-opacity=".16"/>
            </linearGradient>
        </defs>

        <?php /* La sombra en el suelo: sin ella la figura flota. */ ?>
        <ellipse cx="150" cy="616" rx="74" ry="9" fill="<?php echo esc_attr($sombra); ?>"/>

        <?php /* Cuerpo: cabeza, cuello y brazos van en color plano. La ropa se
                 encarga del torso y las piernas. */ ?>
        <path d="<?php echo esc_attr($p['cuello']); ?>" fill="<?php echo esc_attr($piel); ?>"/>
        <path d="<?php echo esc_attr($p['brazoI']); ?>" fill="<?php echo esc_attr($piel); ?>"/>
        <path d="<?php echo esc_attr($p['brazoD']); ?>" fill="<?php echo esc_attr($piel); ?>"/>

        <?php /* Fondo de las regiones vestidas, por si una prenda falta: se ve
                 el cuerpo y no un agujero blanco. */ ?>
        <path d="<?php echo esc_attr($p['torso']); ?>"   fill="<?php echo esc_attr($piel); ?>"/>
        <path d="<?php echo esc_attr($p['piernas']); ?>" fill="<?php echo esc_attr($piel); ?>"/>

        <?php if (!empty($prendas['abajo'])) : ?>
            <g clip-path="url(#<?php echo esc_attr($c); ?>-piernas)">
                <?php /* Anclada ABAJO y ACERCADA. Ver la nota del torso. */ ?>
                <image href="<?php echo esc_url($prendas['abajo']); ?>"
                       x="-30" y="150" width="360" height="560"
                       preserveAspectRatio="xMidYMax slice"/>
            </g>
        <?php endif; ?>

        <?php if (!empty($prendas['arriba'])) : ?>
            <g clip-path="url(#<?php echo esc_attr($c); ?>-torso)">
                <?php
                /*
                 * ACERCADA, y este es el aprendizaje de la primera version.
                 *
                 * Al principio la foto entraba entera en el torso. Con un modelo
                 * puesto quedaba bien; con un bodegon -tres camisas dobladas
                 * sobre una mesa- el torso salia con la MESA dentro. Ridiculo.
                 *
                 * Intente elegir la foto mas vertical de la galeria, suponiendo
                 * que un bodegon tiende a cuadrado. No sirvio de nada por un
                 * motivo mas simple: NINGUNO de los 101 productos tiene galeria.
                 * Solo hay una foto, y si esa es un bodegon no hay de donde
                 * elegir.
                 *
                 * Asi que se cambia lo que se ensena. Acercando el encuadre unas
                 * dos veces y medio, el cuerpo deja de llevar la ESCENA y pasa a
                 * llevar el TEJIDO: su color, su trama, su caida. Que es, al
                 * final, lo que se quiere ver puesto. Las prendas enteras se ven
                 * al lado, en sus fotos.
                 *
                 * El dia que haya fotos de modelo, subiendo el zoom a 1 vuelve
                 * la version literal sin tocar nada mas.
                 */
                ?>
                <image href="<?php echo esc_url($prendas['arriba']); ?>"
                       x="-25" y="30" width="350" height="470"
                       preserveAspectRatio="xMidYMin slice"/>
            </g>
        <?php endif; ?>

        <?php if (!empty($prendas['remate'])) : ?>
            <g clip-path="url(#<?php echo esc_attr($c); ?>-remate)"
               mask="url(#<?php echo esc_attr($c); ?>-abierta)">
                <image href="<?php echo esc_url($prendas['remate']); ?>"
                       x="-25" y="30" width="350" height="470"
                       preserveAspectRatio="xMidYMin slice"/>
            </g>
        <?php endif; ?>

        <?php /* El velo de luz, sobre la ropa y bajo la cabeza. */ ?>
        <g clip-path="url(#<?php echo esc_attr($c); ?>-torso)">
            <rect x="0" y="0" width="300" height="640" fill="url(#<?php echo esc_attr($c); ?>-luz)"/>
        </g>
        <g clip-path="url(#<?php echo esc_attr($c); ?>-piernas)">
            <rect x="0" y="0" width="300" height="640" fill="url(#<?php echo esc_attr($c); ?>-luz)"/>
        </g>

        <?php /* La cabeza va la ULTIMA para que ninguna prenda la pise. */ ?>
        <?php if (!empty($p['pelo'])) : ?>
            <path d="<?php echo esc_attr($p['pelo']); ?>" fill="#6F5A4A"/>
        <?php endif; ?>
        <path d="<?php echo esc_attr($p['cabeza']); ?>" fill="<?php echo esc_attr($piel); ?>"/>
        <?php if (!empty($p['pelo'])) : ?>
            <?php /* El pelo se pinta DOS veces: debajo para la melena que cae
                     por detras, y encima recortado para el flequillo. Con una
                     sola pasada, o tapa la cara o no se ve por detras. */ ?>
            <path d="<?php echo esc_attr($p['pelo']); ?>" fill="#6F5A4A"
                  clip-path="url(#<?php echo esc_attr($c); ?>-flequillo)"/>
        <?php endif; ?>

        <?php /* Un filete de contorno que ata las piezas y disimula el borde
                 duro del recorte. */ ?>
        <g fill="none" stroke="rgba(23,23,23,.22)" stroke-width="1.1">
            <path d="<?php echo esc_attr($p['torso']); ?>"/>
            <path d="<?php echo esc_attr($p['piernas']); ?>"/>
            <path d="<?php echo esc_attr($p['brazoI']); ?>"/>
            <path d="<?php echo esc_attr($p['brazoD']); ?>"/>
            <path d="<?php echo esc_attr($p['cabeza']); ?>"/>
        </g>
    </svg>
    <?php
    return ob_get_clean();
}
