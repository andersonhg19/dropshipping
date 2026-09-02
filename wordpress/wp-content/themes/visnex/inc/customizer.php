<?php
/**
 * VISNEX — Personalizador.
 *
 * Todo lo que se ve en la portada —cada imagen y cada texto— se edita desde
 * Apariencia → Personalizar, sin tocar un solo archivo.
 *
 * POR QUE EXISTE ESTE ARCHIVO
 * ---------------------------
 * Antes, la portada buscaba `assets/img/hero.jpg` y compañía. Si el archivo no
 * existía, dibujaba un degradado gris. Nadie subió nunca esas fotos, así que
 * la home llevaba meses con el hero vacío, las tres tarjetas de categoría
 * vacías y la mitad derecha de "Nuestra Historia" en blanco — sin un solo
 * error a la vista, porque el degradado es un fallback silencioso.
 *
 * Ese diseño tenía dos problemas: el fallo no se notaba, y cambiar una foto
 * exigía entrar por FTP. Ahora cada imagen es un ajuste del Personalizador
 * respaldado por la biblioteca de medios, con la imagen del tema como valor
 * por defecto. Se cambia desde el navegador y se ve al instante.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/* -----------------------------------------------------------------------------
   Catálogo de imágenes de escenografía
   -------------------------------------------------------------------------- */

/**
 * Las imágenes que trae el tema, con su texto alternativo por defecto.
 *
 * La clave es el nombre del archivo en `assets/img/` (sin extensión) y también
 * el sufijo del ajuste del Personalizador: `visnex_img_hero_ella`, etc.
 */
function visnex_image_slots(): array
{
    return [
        'hero_ella'      => ['file' => 'hero-ella',      'label' => 'Portada — panel Ella',      'alt' => 'Abrigo largo rosa en una galeria de columnas'],
        'hero_el'        => ['file' => 'hero-el',        'label' => 'Portada — panel El',        'alt' => 'Jersey de cuello alto verde y gorro naranja en una azotea'],
        'cat_mujer'      => ['file' => 'cat-mujer',      'label' => 'Categoria — Mujer',         'alt' => 'Abrigo azul cielo con bolso rosa en una plaza'],
        'cat_hombre'     => ['file' => 'cat-hombre',     'label' => 'Categoria — Hombre',        'alt' => 'Cazadora de cuero negra sobre pared de ladrillo'],
        'cat_vestidos'   => ['file' => 'cat-vestidos',   'label' => 'Categoria — Vestidos',      'alt' => 'Vestido rojo de lunares al viento'],
        'cat_camisetas'  => ['file' => 'cat-camisetas',  'label' => 'Categoria — Camisetas',     'alt' => 'Camiseta blanca colgada sobre hormigon'],
        'cat_chaquetas'  => ['file' => 'cat-chaquetas',  'label' => 'Categoria — Chaquetas',     'alt' => 'Cazadora vaquera con cuello de pana sobre fondo negro'],
        'cat_accesorios' => ['file' => 'cat-accesorios', 'label' => 'Categoria — Accesorios',    'alt' => 'Botas, cinturon, reloj y gafas ordenados sobre madera clara'],
        'lookbook_ella'  => ['file' => 'lookbook-ella',  'label' => 'Lookbook — Ella',           'alt' => 'Jersey de punto grueso en color crudo con pantalon negro'],
        'lookbook_el'    => ['file' => 'lookbook-el',    'label' => 'Lookbook — El',             'alt' => 'Detalle de chaqueta oscura y reloj de vestir'],
        'editorial'      => ['file' => 'editorial',      'label' => 'Nuestra historia',          'alt' => 'Interior de una tienda de ropa con lamparas colgantes'],
        'banner_color'   => ['file' => 'banner-color',   'label' => 'Banda de básicos',        'alt' => 'Perchero con prendas en crudo, oxido y negro'],
        'textura_rack'   => ['file' => 'textura-rack',   'label' => 'Textura — perchero',        'alt' => 'Perchero con prendas en tonos calidos'],
    ];
}

/**
 * URL de una imagen del tema, o cadena vacía si el archivo no está.
 *
 * @param string $file Nombre sin extensión.
 * @param string $ext  Extensión ('webp' o 'jpg').
 * @param bool   $small Variante reducida para móvil.
 */
function visnex_theme_img(string $file, string $ext = 'jpg', bool $small = false): string
{
    $name = $file . ($small ? '-sm' : '') . '.' . $ext;
    $path = get_stylesheet_directory() . '/assets/img/' . $name;

    return file_exists($path)
        ? get_stylesheet_directory_uri() . '/assets/img/' . $name
        : '';
}

/**
 * Resuelve una ranura de imagen a las URLs que necesita `<picture>`.
 *
 * Orden de preferencia:
 *   1. Lo que haya elegido el usuario en el Personalizador (biblioteca de medios).
 *   2. La imagen que trae el tema.
 *   3. Nada — y entonces la sección se pinta sin foto, no rota.
 *
 * @return array{webp:string,jpg:string,webp_sm:string,jpg_sm:string,alt:string,w:int,h:int}
 */
function visnex_image(string $slot): array
{
    $slots = visnex_image_slots();
    $meta  = $slots[$slot] ?? ['file' => '', 'alt' => ''];

    $empty = ['webp' => '', 'jpg' => '', 'webp_sm' => '', 'jpg_sm' => '', 'alt' => $meta['alt'], 'w' => 0, 'h' => 0, 'ancho' => 1400];

    // 1. Elección del usuario.
    $attachment_id = (int) get_theme_mod('visnex_img_' . $slot, 0);
    if ($attachment_id > 0) {
        $src = wp_get_attachment_image_src($attachment_id, 'full');
        if ($src) {
            $alt = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
            // Una sola URL: el navegador no tiene WebP de una subida arbitraria,
            // así que se sirve el original en ambas ranuras. WordPress ya genera
            // sus propios tamaños intermedios.
            $med = wp_get_attachment_image_src($attachment_id, 'large');

            /*
             * Si el adjunto que eligio el usuario corresponde a una de las
             * fotos que trae el tema, se sirve el WebP del tema: pesa un 61 %
             * menos y es exactamente la misma imagen.
             *
             * Antes esta rama devolvia 'webp' => '' siempre, asi que en cuanto
             * alguien tocaba el Personalizador —o sea, en el camino NORMAL— la
             * portada pasaba a servir los JPEG. En disco conviven
             * hero-ella.webp (63 KB) y hero-ella.jpg (295 KB), y se estaba
             * mandando el segundo.
             */
            $webp = '';
            $webp_sm = '';
            $fichero = $meta['file'] ?? '';

            if ($fichero !== '') {
                $ruta_subida = get_post_meta($attachment_id, '_wp_attached_file', true);
                if (is_string($ruta_subida) && str_contains(basename($ruta_subida), $fichero)) {
                    $webp    = visnex_theme_img($fichero, 'webp');
                    $webp_sm = visnex_theme_img($fichero, 'webp', true);
                }
            }

            return [
                'webp'    => $webp,
                'jpg'     => $src[0],
                'webp_sm' => $webp_sm !== '' ? $webp_sm : $webp,
                'jpg_sm'  => $med ? $med[0] : $src[0],
                'alt'     => $alt !== '' ? $alt : $meta['alt'],
                'w'       => (int) $src[1],
                'h'       => (int) $src[2],
                'ancho'   => (int) $src[1],
            ];
        }
    }

    // 2. La del tema.
    if ($meta['file'] === '') {
        return $empty;
    }

    $jpg = visnex_theme_img($meta['file'], 'jpg');
    if ($jpg === '') {
        return $empty;
    }

    // El ancho real del fichero del tema, para escribir descriptores honestos.
    $ruta  = get_stylesheet_directory() . '/assets/img/' . $meta['file'] . '.jpg';
    $medida = @getimagesize($ruta);
    $ancho  = $medida ? (int) $medida[0] : 1400;

    return [
        'webp'    => visnex_theme_img($meta['file'], 'webp'),
        'jpg'     => $jpg,
        'webp_sm' => visnex_theme_img($meta['file'], 'webp', true),
        'jpg_sm'  => visnex_theme_img($meta['file'], 'jpg', true),
        'alt'     => $meta['alt'],
        'w'       => $ancho,
        'h'       => 0,
        'ancho'   => $ancho,
    ];
}

/**
 * Pinta un `<picture>` con WebP y respaldo JPEG.
 *
 * WebP pesa un 61 % menos que el JPEG equivalente en este set de fotos. El
 * `<source>` deja que el navegador elija: los que no lo soporten reciben el
 * JPEG sin que haya que detectar nada en servidor.
 *
 * @param string $slot    Ranura del catálogo.
 * @param string $class   Clase CSS de la etiqueta <img>.
 * @param bool   $eager   true para la imagen de portada (sin lazy, con prioridad).
 * @param string $sizes   Atributo sizes.
 */
function visnex_picture(string $slot, string $class = '', bool $eager = false, string $sizes = '100vw'): void
{
    $img = visnex_image($slot);
    if ($img['jpg'] === '') {
        return;
    }

    $loading = $eager ? 'eager' : 'lazy';
    $fetch   = $eager ? ' fetchpriority="high"' : '';
    ?>
    <picture class="vn-pic">
        <?php if ($img['webp'] !== '') : ?>
            <?php /* Los descriptores salen del ancho REAL del fichero. Antes se
                     escribia "1600w" a ciegas sobre imagenes de 840 px, asi que
                     el navegador creia estar pidiendo el doble de lo que habia
                     y elegia mal. */ ?>
            <source
                type="image/webp"
                srcset="<?php echo esc_url($img['webp_sm']); ?> <?php echo (int) round($img['ancho'] * 0.55); ?>w, <?php echo esc_url($img['webp']); ?> <?php echo (int) $img['ancho']; ?>w"
                sizes="<?php echo esc_attr($sizes); ?>">
        <?php endif; ?>
        <?php if ($img['jpg_sm'] !== '' && $img['jpg_sm'] !== $img['jpg']) : ?>
            <source
                type="image/jpeg"
                srcset="<?php echo esc_url($img['jpg_sm']); ?> <?php echo (int) round($img['ancho'] * 0.55); ?>w, <?php echo esc_url($img['jpg']); ?> <?php echo (int) $img['ancho']; ?>w"
                sizes="<?php echo esc_attr($sizes); ?>">
        <?php endif; ?>
        <img
            src="<?php echo esc_url($img['jpg']); ?>"
            alt="<?php echo esc_attr($img['alt']); ?>"
            class="<?php echo esc_attr($class); ?>"
            loading="<?php echo esc_attr($loading); ?>"
            decoding="async"<?php echo $fetch; ?>>
    </picture>
    <?php
}

/* -----------------------------------------------------------------------------
   Textos editables
   -------------------------------------------------------------------------- */

/**
 * Los textos de la portada, con su valor por defecto.
 *
 * Se declaran en un solo sitio para que registrar el ajuste, leerlo y
 * documentarlo no puedan desincronizarse.
 */
function visnex_text_slots(): array
{
    /*
     * DOS DECISIONES QUE CONDICIONAN TODA ESTA LISTA
     *
     * 1. NADA DE TEMPORADAS. Ni "nueva coleccion", ni "otono-invierno", ni
     *    "edicion limitada". Todo eso obliga a reescribir la portada cada pocos
     *    meses y, en cuanto se queda viejo, la tienda parece abandonada — que es
     *    la senal mas rapida de "aqui no hay nadie detras". El eje es el FONDO
     *    DE ARMARIO: prendas de diario que valen igual en marzo que en octubre.
     *    Mantener la tienda pasa a ser cambiar productos, no reescribir la casa.
     *
     * 2. DOS MERCADOS: ESPANA Y COLOMBIA. Por eso aqui no hay ni una cifra en
     *    pesos ni una pasarela local. "Envio gratis desde $150.000" no significa
     *    nada en Madrid, y "Nequi y PSE" tampoco. Los textos globales son
     *    neutros y en espanol comun a los dos paises; lo que cambia de un
     *    mercado a otro se ajusta desde aqui, sin tocar codigo.
     */
    return [
        // Avisos
        'aviso'         => ['label' => 'Barra de aviso',         'default' => 'Envíos a España y Colombia', 'section' => 'visnex_general'],
        'marquee'       => ['label' => 'Banda deslizante',       'default' => 'Envíos a España y Colombia · Cambios en 30 días · Pago seguro · Te respondemos por WhatsApp', 'section' => 'visnex_general'],

        // Portada
        'hero_eyebrow'  => ['label' => 'Antetítulo',         'default' => 'Clothing for every you', 'section' => 'visnex_hero'],
        'hero_titulo'   => ['label' => 'Título',             'default' => 'Ropa que se siente tuya', 'section' => 'visnex_hero'],
        /*
         * El titular del hero va en DOS campos y no en uno.
         *
         * No es capricho de maquetacion: las dos lineas se pintan distinto
         * -la segunda en cursiva, en oro y desplazada a la derecha- y entran
         * escalonadas. Con un solo campo habria que adivinar donde parte, y
         * partir un titular por el sitio equivocado es lo que hace que una
         * portada se vea amateur. Asi el corte lo decide quien escribe.
         *
         * hero_titulo (el de arriba) se conserva porque lo usan la ficha y las
         * etiquetas de compartir, donde el titular va seguido.
         */
        'hero_titulo_1' => ['label' => 'Título · primera línea',  'default' => 'La ropa', 'section' => 'visnex_hero'],
        'hero_titulo_2' => ['label' => 'Título · segunda línea (cursiva en oro)', 'default' => 'se siente tuya', 'section' => 'visnex_hero'],
        'hero_texto'    => ['label' => 'Descripción',        'default' => 'Prendas de algodón pensadas para el día a día. Buen corte, buen tejido y el mismo cuidado en cada pieza.', 'section' => 'visnex_hero'],
        'hero_ella_label' => ['label' => 'Etiqueta del panel Ella', 'default' => 'Ella', 'section' => 'visnex_hero'],
        'hero_el_label' => ['label' => 'Etiqueta del panel Él', 'default' => 'Él', 'section' => 'visnex_hero'],

        // Categorias
        'cats_titulo'   => ['label' => 'Título',             'default' => 'Compra por categoría', 'section' => 'visnex_cats'],
        'cats_texto'    => ['label' => 'Descripción',        'default' => 'Encuentra exactamente lo que buscas', 'section' => 'visnex_cats'],
        'sel_titulo'    => ['label' => 'Título de la selección', 'default' => 'Selección', 'section' => 'visnex_cats'],
        'sel_texto'     => ['label' => 'Descripción de la selección', 'default' => 'Las piezas por las que empezar', 'section' => 'visnex_cats'],
        'mas_titulo'    => ['label' => 'Título del segundo bloque', 'default' => 'Lo que más se lleva', 'section' => 'visnex_cats'],
        'mas_texto'     => ['label' => 'Descripción del segundo bloque', 'default' => 'Las prendas que más salen de la tienda', 'section' => 'visnex_cats'],

        // Lookbook
        'look_titulo'   => ['label' => 'Título',             'default' => 'Dos maneras de llevarlo', 'section' => 'visnex_look'],
        'look_texto'    => ['label' => 'Descripción',        'default' => 'La misma pieza, dos formas de vestirla', 'section' => 'visnex_look'],
        'look_ella_t'   => ['label' => 'Ella · título', 'default' => 'Sencillo, y que no dé trabajo', 'section' => 'visnex_look'],
        'look_el_t'     => ['label' => 'Él · título', 'default' => 'Menos piezas, mejores piezas', 'section' => 'visnex_look'],

        // Banda
        'strip_eyebrow' => ['label' => 'Antetítulo de la banda', 'default' => 'Básicos', 'section' => 'visnex_general'],
        'strip_titulo'  => ['label' => 'Título de la banda', 'default' => 'Piezas que no pasan de moda', 'section' => 'visnex_general'],

        // Editorial
        'edit_label'    => ['label' => 'Antetítulo',         'default' => 'Quiénes somos', 'section' => 'visnex_edit'],
        'edit_titulo'   => ['label' => 'Título',             'default' => 'Lo de diario, bien hecho', 'section' => 'visnex_edit'],
        'edit_texto'    => ['label' => 'Texto',                   'default' => 'Elegimos pocas prendas y las elegimos despacio: las que uno se pone de verdad, las que aguantan el lavado número treinta. Trabajamos con proveedores que ya conocemos, y en los dos países en los que estamos las condiciones de cambio son las mismas.', 'section' => 'visnex_edit'],

        // Barra de confianza. Editable porque es lo primero que cambia de un
        // mercado a otro: los metodos de pago y los plazos no son los mismos.
        'trust_1_t'     => ['label' => '1 · Título',    'default' => 'Envíos a España y Colombia', 'section' => 'visnex_trust'],
        'trust_1_d'     => ['label' => '1 · Detalle',        'default' => 'Con seguimiento en cada pedido', 'section' => 'visnex_trust'],
        'trust_2_t'     => ['label' => '2 · Título',    'default' => 'Cambios en 30 días', 'section' => 'visnex_trust'],
        'trust_2_d'     => ['label' => '2 · Detalle',        'default' => 'Si no es tu talla, se cambia', 'section' => 'visnex_trust'],
        'trust_3_t'     => ['label' => '3 · Título',    'default' => 'Pago seguro', 'section' => 'visnex_trust'],
        'trust_3_d'     => ['label' => '3 · Detalle',        'default' => 'Tarjeta, transferencia y contra entrega', 'section' => 'visnex_trust'],
        'trust_4_t'     => ['label' => '4 · Título',    'default' => 'Te respondemos', 'section' => 'visnex_trust'],
        'trust_4_d'     => ['label' => '4 · Detalle',        'default' => 'Por WhatsApp, de persona a persona', 'section' => 'visnex_trust'],

        // Boletin
        'news_titulo'   => ['label' => 'Título del boletín', 'default' => 'Entérate cuando entren piezas nuevas', 'section' => 'visnex_general'],
        'news_texto'    => ['label' => 'Descripción del boletín', 'default' => 'Un correo cuando hay algo que merece la pena. Ni uno más.', 'section' => 'visnex_general'],
    ];
}

/**
 * Lee un texto del Personalizador o devuelve su valor por defecto.
 */
function visnex_text(string $slot): string
{
    $slots = visnex_text_slots();
    $default = $slots[$slot]['default'] ?? '';

    $value = get_theme_mod('visnex_txt_' . $slot, $default);

    return $value !== '' ? $value : $default;
}

/* -----------------------------------------------------------------------------
   Registro en el Personalizador
   -------------------------------------------------------------------------- */

add_action('customize_register', function (WP_Customize_Manager $wp_customize) {

    $wp_customize->add_panel('visnex_home', [
        'title'       => 'VISNEX — Portada',
        'description' => 'Las imágenes y los textos de la página de inicio. Todo lo que cambies aquí se ve en la vista previa antes de publicar.',
        'priority'    => 5,
    ]);

    $sections = [
        'visnex_general' => ['Avisos y banda',      'La barra superior y el texto que se desliza.'],
        'visnex_hero'    => ['Portada',             'Los dos paneles de apertura: Ella y Él.'],
        'visnex_cats'    => ['Categorías',          'Las seis tarjetas de categoría y sus fotos.'],
        'visnex_look'    => ['Lookbook',            'El bloque doble de inspiración.'],
        'visnex_edit'    => ['Quiénes somos',       'El bloque editorial con foto e historia de marca.'],
        'visnex_trust'   => ['Barra de confianza',  'Envíos, cambios, pago y atención. Es lo primero que cambia entre España y Colombia, por eso se edita aquí.'],
    ];

    foreach ($sections as $id => [$title, $desc]) {
        $wp_customize->add_section($id, [
            'title'       => $title,
            'description' => $desc,
            'panel'       => 'visnex_home',
        ]);
    }

    // --- Imágenes ---------------------------------------------------------
    $image_section = [
        'hero_ella' => 'visnex_hero',   'hero_el' => 'visnex_hero',
        'cat_mujer' => 'visnex_cats',   'cat_hombre' => 'visnex_cats',
        'cat_vestidos' => 'visnex_cats','cat_camisetas' => 'visnex_cats',
        'cat_chaquetas' => 'visnex_cats','cat_accesorios' => 'visnex_cats',
        'lookbook_ella' => 'visnex_look','lookbook_el' => 'visnex_look',
        'editorial' => 'visnex_edit',
        'banner_color' => 'visnex_general', 'textura_rack' => 'visnex_general',
    ];

    foreach (visnex_image_slots() as $slot => $meta) {
        $wp_customize->add_setting('visnex_img_' . $slot, [
            'default'           => 0,
            'sanitize_callback' => 'absint',
            'transport'         => 'refresh',
        ]);

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, 'visnex_img_' . $slot, [
            'label'       => $meta['label'],
            'description' => 'Si lo dejas vacío se usa la foto que trae el tema.',
            'section'     => $image_section[$slot] ?? 'visnex_general',
            'mime_type'   => 'image',
        ]));
    }

    // --- Textos -----------------------------------------------------------
    foreach (visnex_text_slots() as $slot => $meta) {
        $wp_customize->add_setting('visnex_txt_' . $slot, [
            'default'           => $meta['default'],
            'sanitize_callback' => 'wp_kses_post',
            'transport'         => 'refresh',
        ]);

        $long = in_array($slot, ['hero_texto', 'edit_texto', 'aviso', 'marquee', 'news_texto'], true);

        $wp_customize->add_control('visnex_txt_' . $slot, [
            'label'   => $meta['label'],
            'section' => $meta['section'],
            'type'    => $long ? 'textarea' : 'text',
        ]);
    }
});

/* -----------------------------------------------------------------------------
   Valores de partida
   -------------------------------------------------------------------------- */

/**
 * Apunta cada ranura a su adjunto de la biblioteca de medios la primera vez.
 *
 * Sin esto, el Personalizador abriría con todos los campos de imagen vacíos y
 * daría la impresión de que no hay nada configurado — aunque la portada se vea
 * bien porque tira de los archivos del tema. Enlazar los adjuntos hace que lo
 * que el usuario ve en el panel sea lo que hay en la página.
 *
 * Se ejecuta una sola vez: deja una marca en las opciones.
 */
add_action('after_setup_theme', function () {
    if (get_option('visnex_media_vinculado') === '1') {
        return;
    }

    $vinculados = 0;

    foreach (visnex_image_slots() as $slot => $meta) {
        if ((int) get_theme_mod('visnex_img_' . $slot, 0) > 0) {
            continue;
        }

        // El importador guarda el adjunto con el título "VISNEX {nombre}".
        $found = get_posts([
            'post_type'      => 'attachment',
            'post_status'    => 'inherit',
            'posts_per_page' => 1,
            'title'          => 'VISNEX ' . $meta['file'],
            'fields'         => 'ids',
        ]);

        if (!empty($found[0])) {
            set_theme_mod('visnex_img_' . $slot, (int) $found[0]);
            $vinculados++;
        }
    }

    if ($vinculados > 0) {
        update_option('visnex_media_vinculado', '1');
    }
}, 20);
