<?php
/**
 * Plugin Name: VISNEX Uploads
 * Description: Ayudas de subida de imagenes para la importacion masiva de productos: permite MIME de webp y arregla el sideload de URLs sin extension de archivo.
 * Version: 1.0
 * Author: VISNEX
 *
 * -----------------------------------------------------------------------------
 * ESTE ARCHIVO SUSTITUYE A visnex-style.php
 *
 * Aquel mu-plugin mezclaba dos cosas que no tienen nada que ver: infraestructura
 * de subida de archivos y 1.512 lineas de diseno inyectadas inline en wp_head.
 *
 * Todo el diseno se movio al tema hijo `visnex`, donde el CSS esta versionado,
 * es cacheable y se compone de tokens. Aqui queda SOLO lo que de verdad tiene
 * que ser un mu-plugin: los filtros de subida, que deben estar activos aunque
 * se cambie de tema, porque los usa el importador de productos del SaaS.
 * -----------------------------------------------------------------------------
 */

defined('ABSPATH') || exit;

/** Tipos de imagen aceptados en la biblioteca de medios. */
add_filter('upload_mimes', function ($mimes) {
    $mimes['jpg|jpeg|jpe'] = 'image/jpeg';
    $mimes['png']  = 'image/png';
    $mimes['webp'] = 'image/webp';
    return $mimes;
});

/**
 * Permite importar imagenes cuya URL no lleva extension.
 *
 * Muchas fuentes de imagenes sirven en URLs sin `.jpg`. WordPress rechaza el
 * archivo por no poder deducir el tipo; aqui se deduce del contenido real con
 * finfo y se corrige el nombre.
 */
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {
    if (!empty($data['type'])) {
        return $data;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo === false) {
        return $data;
    }
    $real_mime = finfo_file($finfo, $file);
    finfo_close($finfo);

    $ext_map = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    if (!isset($ext_map[$real_mime])) {
        return $data;
    }

    $ext = $ext_map[$real_mime];
    $data['ext']  = $ext;
    $data['type'] = $real_mime;

    if (!preg_match('/\.' . $ext . '$/i', $filename)) {
        $data['proper_filename'] = $filename . '.' . $ext;
    }

    return $data;
}, 10, 4);

/** Da extension al archivo temporal descargado, para que pase la validacion. */
add_filter('wp_handle_sideload_prefilter', function ($file) {
    if (pathinfo($file['name'], PATHINFO_EXTENSION) !== '') {
        return $file;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo === false) {
        return $file;
    }
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $ext_map = [
        'image/jpeg' => '.jpg',
        'image/png'  => '.png',
        'image/webp' => '.webp',
        'image/gif'  => '.gif',
    ];

    if (isset($ext_map[$mime])) {
        $file['name'] .= $ext_map[$mime];
    }

    return $file;
});
