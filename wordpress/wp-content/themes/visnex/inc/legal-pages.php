<?php
/**
 * Paginas legales.
 *
 * Antes habia 8 enlaces href="#" muertos. En Colombia esto no es solo un
 * problema de confianza: la Ley 1480 de 2011 (Estatuto del Consumidor) exige
 * informar el derecho de retracto y las condiciones de la venta, y la Ley 1581
 * de 2012 exige politica de tratamiento de datos personales.
 *
 * Las paginas se crean solas al activar el tema, con contenido real y
 * marcadores {{...}} para los datos que solo el dueno del negocio puede
 * rellenar (NIT, direccion, telefono).
 *
 * AVISO: este contenido es una base solida y correcta en su estructura, pero
 * NO sustituye la revision de un abogado antes de vender de verdad.
 *
 * @package visnex
 */

defined('ABSPATH') || exit;

/** Marcadores a reemplazar en el panel antes de publicar. */
function visnex_legal_placeholders(): array
{
    return [
        '{{RAZON_SOCIAL}}' => get_bloginfo('name'),
        '{{NIT}}'          => '[COMPLETAR: NIT o cedula]',
        '{{DIRECCION}}'    => '[COMPLETAR: direccion de notificaciones]',
        '{{CIUDAD}}'       => 'Bogota D.C., Colombia',
        '{{EMAIL}}'        => get_bloginfo('admin_email'),
        '{{TELEFONO}}'     => '[COMPLETAR: celular de contacto]',
        '{{SITIO}}'        => home_url(),
    ];
}

function visnex_legal_fill(string $html): string
{
    return strtr($html, visnex_legal_placeholders());
}

/**
 * Definicion de las paginas. El contenido va envuelto en .vn-legal para que
 * herede la tipografia de lectura de base.css.
 */
function visnex_legal_pages(): array
{
    $hoy = date_i18n('j \d\e F \d\e Y');

    return [
        'politica-de-privacidad' => [
            'title'   => 'Politica de Privacidad',
            'content' => '
<div class="vn-legal">
<p class="vn-legal__updated">Ultima actualizacion: ' . $hoy . '</p>

<p>En {{RAZON_SOCIAL}} (NIT {{NIT}}), responsable del tratamiento de datos, protegemos tu informacion personal conforme a la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1074 de 2015</strong>.</p>

<h2>1. Que datos recogemos</h2>
<ul>
<li><strong>Identificacion y contacto:</strong> nombre, celular, correo electronico y direccion de entrega.</li>
<li><strong>Datos del pedido:</strong> productos, monto, medio de pago y estado del envio.</li>
<li><strong>Datos tecnicos:</strong> direccion IP, navegador y paginas visitadas, a traves de cookies.</li>
</ul>
<p><strong>No almacenamos datos de tu tarjeta.</strong> Los pagos con tarjeta, PSE o Nequi se procesan directamente en la pasarela de pagos, que cuenta con certificacion PCI DSS.</p>

<h2>2. Para que los usamos</h2>
<ul>
<li>Procesar, confirmar y despachar tu pedido.</li>
<li>Contactarte por WhatsApp o telefono para confirmar la entrega.</li>
<li>Atender peticiones, quejas, reclamos y devoluciones.</li>
<li>Enviarte comunicaciones comerciales, <em>solo si lo autorizas expresamente</em>.</li>
</ul>

<h2>3. Con quien los compartimos</h2>
<p>Compartimos unicamente lo necesario para cumplir con tu pedido:</p>
<ul>
<li><strong>Transportadoras:</strong> nombre, direccion y celular, para poder entregarte.</li>
<li><strong>Pasarela de pagos:</strong> los datos de la transaccion.</li>
<li><strong>Autoridades:</strong> cuando exista una orden judicial o legal.</li>
</ul>
<p>No vendemos ni alquilamos tus datos a terceros. Nunca.</p>

<h2>4. Tus derechos</h2>
<p>Como titular de los datos puedes, en cualquier momento y de forma gratuita:</p>
<ul>
<li><strong>Conocer</strong> que datos tuyos tenemos.</li>
<li><strong>Actualizar o rectificar</strong> los que esten incompletos o desactualizados.</li>
<li><strong>Solicitar prueba</strong> de la autorizacion que nos diste.</li>
<li><strong>Revocar la autorizacion</strong> o pedir la supresion de tus datos, salvo que exista un deber legal de conservarlos.</li>
<li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio.</li>
</ul>
<div class="vn-legal__callout">
<p><strong>Como ejercer tus derechos:</strong> escribenos a {{EMAIL}} o al {{TELEFONO}} indicando tu nombre, el documento y tu solicitud. Respondemos consultas en maximo <strong>10 dias habiles</strong> y reclamos en maximo <strong>15 dias habiles</strong>, segun la ley.</p>
</div>

<h2>5. Cuanto tiempo los conservamos</h2>
<p>Conservamos los datos del pedido durante el tiempo que exige la normativa contable y tributaria colombiana. Los datos de marketing se eliminan en cuanto revocas la autorizacion.</p>

<h2>6. Cookies</h2>
<p>Usamos cookies propias para mantener tu carrito y tu sesion, y cookies de analitica para entender que paginas se visitan. Puedes desactivarlas desde tu navegador, aunque el carrito dejara de funcionar correctamente.</p>

<h2>7. Contacto</h2>
<p>{{RAZON_SOCIAL}} &middot; NIT {{NIT}}<br>{{DIRECCION}}, {{CIUDAD}}<br>{{EMAIL}} &middot; {{TELEFONO}}</p>
</div>',
        ],

        'terminos-y-condiciones' => [
            'title'   => 'Terminos y Condiciones',
            'content' => '
<div class="vn-legal">
<p class="vn-legal__updated">Ultima actualizacion: ' . $hoy . '</p>

<p>Estos terminos rigen las compras en {{SITIO}}, operado por {{RAZON_SOCIAL}} (NIT {{NIT}}). Al hacer un pedido aceptas lo aqui descrito.</p>

<h2>1. Productos y precios</h2>
<ul>
<li>Todos los precios estan en <strong>pesos colombianos (COP)</strong> e incluyen IVA cuando aplica.</li>
<li>Las fotografias son ilustrativas. Puede haber variaciones leves de color segun la pantalla.</li>
<li>Los precios pueden cambiar sin aviso previo, pero <strong>nunca despues de que confirmemos tu pedido</strong>.</li>
<li>Si un producto aparece con un precio manifiestamente erroneo, te contactaremos antes de despachar para confirmar o cancelar sin costo.</li>
</ul>

<h2>2. Como se perfecciona la compra</h2>
<p>Tu pedido es una oferta de compra. La venta queda perfeccionada cuando <strong>te confirmamos el pedido</strong> por WhatsApp, telefono o correo. Hasta ese momento cualquiera de las dos partes puede desistir sin penalidad.</p>

<h2>3. Formas de pago</h2>
<table>
<thead><tr><th>Medio</th><th>Cuando se paga</th></tr></thead>
<tbody>
<tr><td>Contra entrega (efectivo)</td><td>Al recibir el pedido, directamente al transportador</td></tr>
<tr><td>Tarjeta debito o credito</td><td>Al confirmar la compra</td></tr>
<tr><td>PSE / Nequi</td><td>Al confirmar la compra</td></tr>
</tbody>
</table>
<p>En el pago contra entrega es indispensable que el celular registrado este disponible. <strong>Si no logramos confirmarte el pedido, no lo despachamos.</strong></p>

<h2>4. Envios</h2>
<p>Ver la <a href="' . home_url('/politica-de-envios/') . '">Politica de Envios</a>.</p>

<h2>5. Derecho de retracto</h2>
<div class="vn-legal__callout">
<p>Conforme al <strong>articulo 47 de la Ley 1480 de 2011</strong>, tienes derecho a retractarte de la compra dentro de los <strong>cinco (5) dias habiles</strong> siguientes a la entrega, sin necesidad de justificar el motivo. Ver la <a href="' . home_url('/politica-de-devoluciones/') . '">Politica de Devoluciones</a>.</p>
</div>

<h2>6. Garantia</h2>
<p>Todos los productos cuentan con la <strong>garantia legal</strong> del articulo 7 de la Ley 1480 de 2011 frente a defectos de fabricacion o calidad. El plazo minimo es de tres (3) meses desde la entrega, salvo que el fabricante ofrezca uno mayor.</p>
<p>La garantia no cubre el desgaste normal por uso, danos por mal uso o lavado incorrecto, ni modificaciones hechas por el cliente.</p>

<h2>7. Propiedad intelectual</h2>
<p>Las marcas, textos, fotografias y diseno de este sitio pertenecen a {{RAZON_SOCIAL}} o a sus titulares, y no pueden reproducirse sin autorizacion escrita.</p>

<h2>8. Ley aplicable y controversias</h2>
<p>Estos terminos se rigen por la ley colombiana. Cualquier controversia se tramitara ante los jueces competentes de {{CIUDAD}}, sin perjuicio de tu derecho a acudir a la Superintendencia de Industria y Comercio.</p>

<h2>9. Contacto</h2>
<p>{{RAZON_SOCIAL}} &middot; NIT {{NIT}}<br>{{DIRECCION}}, {{CIUDAD}}<br>{{EMAIL}} &middot; {{TELEFONO}}</p>
</div>',
        ],

        'politica-de-devoluciones' => [
            'title'   => 'Politica de Devoluciones y Retracto',
            'content' => '
<div class="vn-legal">
<p class="vn-legal__updated">Ultima actualizacion: ' . $hoy . '</p>

<h2>1. Derecho de retracto: 5 dias habiles</h2>
<div class="vn-legal__callout">
<p>Si compraste a distancia (por esta tienda), el <strong>articulo 47 de la Ley 1480 de 2011</strong> te da derecho a retractarte dentro de los <strong>cinco (5) dias habiles</strong> siguientes a la entrega. <strong>No tienes que explicar por que.</strong></p>
</div>

<h3>Que necesitas para el retracto</h3>
<ul>
<li>Que el producto no haya sido usado y conserve sus etiquetas y empaque original.</li>
<li>Avisarnos dentro de los 5 dias habiles al {{TELEFONO}} o a {{EMAIL}}.</li>
</ul>
<p>Los costos de transporte del retorno corren por cuenta del consumidor, como establece la ley. Devolvemos el dinero en un maximo de <strong>30 dias calendario</strong> desde que recibimos el producto.</p>

<h2>2. Cambio por talla o color</h2>
<p>Adicional al retracto legal, aceptamos cambios dentro de los <strong>15 dias calendario</strong> siguientes a la entrega, siempre que el producto no haya sido usado y conserve etiquetas.</p>
<p>El primer cambio por talla dentro de la misma ciudad lo asumimos nosotros. Los siguientes tienen el costo del flete.</p>

<h2>3. Producto defectuoso o equivocado</h2>
<p>Si el producto llega con un defecto de fabricacion o no corresponde a lo que pediste, <strong>lo cambiamos o devolvemos el 100% del dinero, incluido el flete, sin costo para ti</strong>.</p>
<p>Escribenos dentro de las 48 horas siguientes a la entrega con fotos del producto y del empaque.</p>

<h2>4. Que NO se puede devolver</h2>
<ul>
<li>Ropa interior y trajes de bano, por razones de higiene (salvo defecto de fabricacion).</li>
<li>Productos personalizados o hechos a la medida.</li>
<li>Productos con senales evidentes de uso, lavado o alteracion.</li>
</ul>

<h2>5. Como solicitarlo</h2>
<table>
<thead><tr><th>Paso</th><th>Que hacer</th></tr></thead>
<tbody>
<tr><td>1</td><td>Escribenos al {{TELEFONO}} (WhatsApp) o a {{EMAIL}} con tu numero de pedido.</td></tr>
<tr><td>2</td><td>Te confirmamos la solicitud y te indicamos la direccion de retorno.</td></tr>
<tr><td>3</td><td>Envias el producto en su empaque original.</td></tr>
<tr><td>4</td><td>Al recibirlo y verificarlo, procesamos el cambio o la devolucion del dinero.</td></tr>
</tbody>
</table>

<h2>6. Devolucion del dinero</h2>
<p>Se reintegra por el mismo medio de pago utilizado. Si pagaste contra entrega, se hace por transferencia a la cuenta o Nequi que nos indiques, a nombre de quien realizo la compra.</p>
</div>',
        ],

        'politica-de-envios' => [
            'title'   => 'Politica de Envios',
            'content' => '
<div class="vn-legal">
<p class="vn-legal__updated">Ultima actualizacion: ' . $hoy . '</p>

<h2>1. Cobertura y tiempos</h2>
<p>Despachamos desde Bogota a todo el territorio nacional.</p>
<table>
<thead><tr><th>Destino</th><th>Tiempo estimado</th></tr></thead>
<tbody>
<tr><td>Bogota y area metropolitana</td><td>1 a 2 dias habiles</td></tr>
<tr><td>Ciudades principales</td><td>2 a 3 dias habiles</td></tr>
<tr><td>Ciudades intermedias</td><td>3 a 5 dias habiles</td></tr>
<tr><td>Zonas rurales y de dificil acceso</td><td>5 a 8 dias habiles</td></tr>
</tbody>
</table>
<p>Los tiempos se cuentan <strong>desde que confirmamos el pedido</strong>, no desde que lo haces. Son estimados de la transportadora y pueden variar por causas ajenas a nosotros (clima, orden publico, temporada alta).</p>

<h2>2. Costo del envio</h2>
<ul>
<li><strong>Envio gratis</strong> en pedidos iguales o superiores a $150.000 COP.</li>
<li>Por debajo de ese monto, el costo se calcula segun el destino y se muestra antes de confirmar la compra.</li>
</ul>

<h2>3. Pago contra entrega</h2>
<div class="vn-legal__callout">
<p>Disponible en la mayoria de ciudades del pais. Pagas <strong>en efectivo</strong> al transportador en el momento de la entrega.</p>
<p><strong>Importante:</strong> te contactamos por WhatsApp o telefono para confirmar el pedido antes de despacharlo. Si no logramos comunicarnos contigo tras varios intentos, el pedido se cancela automaticamente.</p>
</div>

<h2>4. Confirmacion y seguimiento</h2>
<p>Una vez despachado te enviamos el numero de guia para que sigas tu pedido en la pagina de la transportadora.</p>

<h2>5. Entregas fallidas</h2>
<p>La transportadora realiza hasta <strong>dos (2) intentos</strong> de entrega. Si no es posible entregar, el paquete regresa a nuestra bodega y te contactamos para coordinar un nuevo envio, cuyo flete corre por cuenta del comprador.</p>

<h2>6. Revisa antes de firmar</h2>
<p>Te recomendamos revisar el estado del empaque delante del transportador. Si llega visiblemente danado, dejalo constar en la guia o rechaza la entrega y avisanos de inmediato.</p>

<h2>7. Contacto</h2>
<p>{{TELEFONO}} (WhatsApp) &middot; {{EMAIL}}</p>
</div>',
        ],

        'contacto' => [
            'title'   => 'Contacto',
            'content' => '
<div class="vn-legal">
<h2>Hablemos</h2>
<p>Escribenos y te respondemos lo antes posible. La via mas rapida es WhatsApp.</p>

<table>
<tbody>
<tr><th>WhatsApp</th><td>{{TELEFONO}}</td></tr>
<tr><th>Correo</th><td>{{EMAIL}}</td></tr>
<tr><th>Direccion</th><td>{{DIRECCION}}, {{CIUDAD}}</td></tr>
<tr><th>Horario de atencion</th><td>Lunes a viernes 8:00 a 18:00 &middot; Sabados 9:00 a 13:00</td></tr>
</tbody>
</table>

<h2>Peticiones, quejas y reclamos</h2>
<p>Si tienes un reclamo sobre un pedido, escribenos indicando tu <strong>numero de pedido</strong>. Respondemos en un maximo de 15 dias habiles, conforme a la ley.</p>

<h2>Datos de la empresa</h2>
<p>{{RAZON_SOCIAL}}<br>NIT {{NIT}}<br>{{DIRECCION}}, {{CIUDAD}}</p>
</div>',
        ],
    ];
}

/**
 * Crea las paginas legales que falten.
 *
 * Es idempotente: si la pagina ya existe con ese slug, no la toca. Asi no
 * sobrescribe cambios que hagas desde el panel.
 */
function visnex_install_legal_pages(): array
{
    $created = [];

    foreach (visnex_legal_pages() as $slug => $page) {
        $existing = get_page_by_path($slug, OBJECT, 'page');
        if ($existing) {
            continue;
        }

        $id = wp_insert_post([
            'post_title'   => $page['title'],
            'post_name'    => $slug,
            'post_content' => visnex_legal_fill($page['content']),
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_author'  => 1,
            'comment_status' => 'closed',
            'ping_status'  => 'closed',
        ]);

        if ($id && !is_wp_error($id)) {
            $created[] = $slug;
        }
    }

    return $created;
}

// Al activar el tema, se instalan solas.
add_action('after_switch_theme', function () {
    visnex_install_legal_pages();
});

/**
 * Aviso en el panel mientras queden marcadores sin rellenar.
 * Publicar una politica de privacidad con "[COMPLETAR: NIT]" es peor que no
 * tenerla, asi que conviene que se vea.
 */
add_action('admin_notices', function () {
    if (!current_user_can('manage_options')) {
        return;
    }

    $pending = [];
    foreach (array_keys(visnex_legal_pages()) as $slug) {
        $page = get_page_by_path($slug, OBJECT, 'page');
        if ($page && str_contains($page->post_content, '[COMPLETAR')) {
            $pending[] = $page;
        }
    }

    if (!$pending) {
        return;
    }

    echo '<div class="notice notice-warning"><p><strong>VISNEX:</strong> hay '
        . count($pending) . ' pagina(s) legal(es) con datos por completar (NIT, direccion, telefono). '
        . 'Publicar politicas con marcadores sin rellenar es un riesgo legal y de confianza. Editar: ';
    $links = array_map(
        fn($p) => '<a href="' . esc_url(get_edit_post_link($p->ID)) . '">' . esc_html($p->post_title) . '</a>',
        $pending
    );
    echo implode(' &middot; ', $links) . '</p></div>';
});
