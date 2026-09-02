/**
 * D'MIKA — Capa de experiencia.
 * ---------------------------------------------------------------------------
 * Lo que separa una tienda que "esta bien" de una que se recuerda no es una
 * animacion grande: son cinco o seis respuestas pequenas que llegan cuando el
 * ojo las espera. Eso es lo que hay aqui.
 *
 *   1. LA ENTRADA        el monograma se dibuja solo y levanta la cortina
 *   2. IMANES            los botones se acercan al cursor
 *   3. DESCIFRADO        los antetitulos se resuelven letra a letra
 *   4. TEMPERATURA       el fondo cambia de tono segun la seccion
 *
 * REGLAS, LAS MISMAS DE SIEMPRE
 *   - Nada de aqui es imprescindible. Si este archivo no carga, la tienda
 *     funciona: todo lo que hace es ceremonia.
 *   - Cero dependencias.
 *   - Se apaga entero con prefers-reduced-motion.
 *   - Nada bloquea la lectura ni el teclado. La entrada, en particular, tiene
 *     un plazo maximo pase lo que pase.
 */
(function () {
  'use strict';

  var QUIETO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TACTIL = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* =====================================================================
     1. LA ENTRADA
     ---------------------------------------------------------------------
     El monograma se DIBUJA: primero el contorno, como si lo trazara una
     pluma, y despues se rellena. Se puede hacer porque el logo es un vector
     de verdad, no una imagen — es el pago de haberlo calcado.

     Tres cautelas, porque una cortina a pantalla completa es la forma mas
     rapida de dejar a alguien fuera de una tienda:
       - Solo la primera vez por pestana (sessionStorage).
       - Plazo maximo de 2,2 s pase lo que pase, aunque falle algo.
       - Se puede saltar con un clic o con una tecla.
     ================================================================== */

  function entrada() {
    if (QUIETO) return;
    var caja = document.getElementById('dm-entrada');
    if (!caja) return;

    // Ya se vio en esta pestana: fuera sin ceremonia.
    var vista = false;
    try { vista = sessionStorage.getItem('dm_entrada') === '1'; } catch (e) { /* modo privado */ }
    if (vista) { caja.remove(); return; }

    document.documentElement.classList.add('dm-entrando');

    var trazos = caja.querySelectorAll('.dm-entrada__trazo');
    trazos.forEach(function (t) {
      // getTotalLength da la longitud real del contorno. Se usa para que la
      // linea "avance": se dibuja el trazo entero como un guion tan largo
      // como el propio contorno y se va acercando el desfase a cero.
      var L = 0;
      try { L = t.getTotalLength(); } catch (e) { L = 4000; }
      t.style.strokeDasharray = L;
      t.style.strokeDashoffset = L;
      // El navegador tiene que ver el valor inicial antes de que cambie, o
      // no hay transicion: se lee una propiedad para forzar el reflow.
      void t.getBoundingClientRect();
      t.style.transition = 'stroke-dashoffset 1s cubic-bezier(.65,0,.35,1)';
      t.style.strokeDashoffset = '0';
    });

    var cerrado = false;
    function cerrar() {
      if (cerrado) return;
      cerrado = true;
      try { sessionStorage.setItem('dm_entrada', '1'); } catch (e) { /* da igual */ }
      caja.classList.add('is-fuera');
      document.documentElement.classList.remove('dm-entrando');
      // Se quita del arbol cuando termina de subir, no antes: si se borra a
      // mitad, la cortina desaparece de golpe.
      setTimeout(function () { if (caja.parentNode) caja.remove(); }, 1100);
    }

    // El relleno entra cuando el contorno ya esta trazado.
    setTimeout(function () { caja.classList.add('is-lleno'); }, 920);
    // Y la cortina sube.
    // 1,65 s hasta que sube la cortina. Se probo con 2,1 y se hacia largo: en una
    // tienda, cada decima antes del escaparate es gente que se va. Lo justo para
    // que el trazo se lea sin que nadie tenga que esperar a un adorno.
    var plazo = setTimeout(cerrar, 1650);

    // Salidas de emergencia: nadie se queda encerrado esperando un adorno.
    function saltar() { clearTimeout(plazo); cerrar(); }
    caja.addEventListener('click', saltar);
    addEventListener('keydown', saltar, { once: true });
    // Y el tope duro, por si algo de arriba fallara.
    setTimeout(cerrar, 2200);
  }

  /* =====================================================================
     2. IMANES
     ---------------------------------------------------------------------
     El boton se desplaza un poco hacia el cursor cuando este se acerca. Es
     un efecto minusculo -maximo 9 px- y es de los que mas se notan: el
     puntero deja de resbalar sobre una superficie y empieza a encontrar
     resistencia.
     ================================================================== */

  var IMANES = '.dm-puerta, .vn-btn, .single_add_to_cart_button, .dm-cab__marca, .vn-section__more a';

  function imanes() {
    if (QUIETO || TACTIL) return;

    document.querySelectorAll(IMANES).forEach(function (el) {
      var r = null;
      var pendiente = false;
      var mx = 0, my = 0;

      function mover() {
        pendiente = false;
        if (!r) return;
        var dx = mx - (r.left + r.width / 2);
        var dy = my - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy);
        // El radio de atraccion crece con el boton: uno grande tira desde mas
        // lejos, que es lo que espera el ojo.
        var radio = Math.max(r.width, r.height) * 0.85 + 46;
        if (d > radio) {
          el.style.translate = '';
          return;
        }
        var f = (1 - d / radio) * 9;
        el.style.translate = (dx / d * f).toFixed(2) + 'px ' + (dy / d * f).toFixed(2) + 'px';
      }

      addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (!pendiente) {
          pendiente = true;
          // La caja se remide en cada cuadro de movimiento y no en cada evento:
          // getBoundingClientRect obliga al navegador a recalcular la maqueta.
          requestAnimationFrame(function () { r = el.getBoundingClientRect(); mover(); });
        }
      }, { passive: true });

      el.addEventListener('mouseleave', function () { el.style.translate = ''; });
    });
  }

  /* =====================================================================
     3. DESCIFRADO
     ---------------------------------------------------------------------
     Los antetitulos se resuelven letra a letra, pasando por caracteres al
     azar antes de asentarse. Es el unico gesto de aqui que no viene de la
     moda sino de la maquina, y es exactamente lo que da la sensacion de que
     detras hay algo calculando.

     Se usa SOLO en los antetitulos -texto corto, en mayusculas, decorativo-.
     Hacerlo con un parrafo seria ilegible y con un precio, una mentira.
     ================================================================== */

  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>-_=+*';

  function descifrar(el) {
    var fin = el.dataset.dmTexto || el.textContent;
    el.dataset.dmTexto = fin;
    var letras = fin.split('');
    var cuadro = 0;
    // Cada letra se asienta en un momento distinto para que la palabra se
    // resuelva de izquierda a derecha en vez de toda a la vez.
    var listas = letras.map(function (_, i) { return 3 + i * 1.7 + Math.random() * 5; });

    function paso() {
      var out = '';
      var quedan = 0;
      for (var i = 0; i < letras.length; i++) {
        if (letras[i] === ' ') { out += ' '; continue; }
        if (cuadro >= listas[i]) {
          out += letras[i];
        } else {
          quedan++;
          out += ALFABETO[(Math.random() * ALFABETO.length) | 0];
        }
      }
      el.textContent = out;
      cuadro++;
      if (quedan) requestAnimationFrame(paso);
      else el.textContent = fin;   // se restituye exacto, con sus acentos
    }
    requestAnimationFrame(paso);
  }

  function descifrados() {
    if (QUIETO) return;
    // Los nombres reales del sitio, comprobados en el HTML servido. Antes
    // apuntaba a `.vn-section__eyebrow`, que no existe en ninguna pagina: el
    // efecto estaba escrito y no se ejecutaba sobre nada.
    var sel = '.vn-duo__eyebrow, .vn-strip__eyebrow, .vn-editorial__eyebrow, '
            + '.vn-section__eyebrow, .dm-hero__canto, .dm-puerta__c';
    var objetivos = document.querySelectorAll(sel);
    if (!objetivos.length || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);       // una vez y ya: repetirlo cansa
        descifrar(e.target);
      });
    }, { threshold: 0.9 });

    objetivos.forEach(function (o) { obs.observe(o); });
  }

  /* =====================================================================
     4. CONTINUIDAD — YA RESUELTA EN EL TEMA
     ---------------------------------------------------------------------
     Cada tarjeta ya sale de functions.php con su propio
     `view-transition-name: vn-foto-{id}`, y la foto de la ficha lleva el
     mismo. El navegador los empareja solo: no hace falta nombrar nada al
     pulsar. Lo que habia aqui era una segunda implementacion del mismo
     efecto, y dos sistemas nombrando el mismo elemento se anulan.
     ================================================================== */

  /* =====================================================================
     5. TEMPERATURA
     ---------------------------------------------------------------------
     El fondo de la pagina cambia de tono segun la seccion que se este
     mirando: marfil arriba, arena en el medio, casi negro al llegar al pie.
     No se percibe como un cambio de color -es demasiado lento- sino como que
     la pagina avanza hacia algun sitio.
     ================================================================== */

  function temperatura() {
    if (QUIETO || !('IntersectionObserver' in window)) return;

    var secciones = document.querySelectorAll('[data-dm-tono]');
    if (!secciones.length) return;

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          document.documentElement.style.setProperty('--dm-tono', e.target.dataset.dmTono);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });   // solo la seccion del centro manda

    secciones.forEach(function (s) { obs.observe(s); });
  }

  /* ------------------------------------------------------------------ */

  function arrancar() {
    window.__dmExpOK = true;
    entrada();
    imanes();
    descifrados();
    temperatura();
  }

  // La entrada tiene que montarse cuanto antes; el resto puede esperar.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
