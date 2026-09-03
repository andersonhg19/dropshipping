/**
 * D'MIKA — El Recorrido.
 * ---------------------------------------------------------------------------
 * Convierte el scroll en avance por el espacio.
 *
 * LA LINEA DE TIEMPO MAESTRA
 * Todo cuelga de UN solo numero: `--avance`, de 0 a 1, que dice por donde va la
 * camara. La escena entera se mueve con el, y de el salen tambien la sala
 * activa del mapa y la pista de "sigue bajando". Un unico origen para todo el
 * movimiento es lo que evita que las piezas se desincronicen — que es como se
 * ven los recorridos mal hechos.
 *
 * DOS CAMINOS, Y EL BUENO NO PASA POR AQUI
 * Donde el navegador tiene `animation-timeline: scroll()`, el avance lo calcula
 * EL PROPIO NAVEGADOR en el compositor, sin ejecutar una linea de JavaScript
 * por cuadro. Este archivo entonces casi no hace nada: solo el mapa y el
 * paralaje del raton.
 * Donde no lo tiene, se calcula aqui, en un `scroll` pasivo con
 * requestAnimationFrame.
 *
 * CALIDAD SEGUN EL APARATO
 * Es lo que separa un recorrido que va fino de uno que da saltos. Se mide lo
 * que se puede medir -nucleos, memoria, si el puntero es fino- y en los
 * aparatos justos se apaga el paralaje y se reduce la profundidad. Vale mas un
 * recorrido corto y fluido que uno largo a trompicones.
 */
(function () {
  'use strict';

  var QUIETO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function arrancar() {
    var seccion = document.querySelector('.dm-recorrido');
    if (!seccion || QUIETO) return;

    var escena = seccion.querySelector('[data-dm-escena]');
    var marcas = seccion.querySelectorAll('[data-dm-marca]');
    var salas  = seccion.querySelectorAll('[data-dm-sala]');
    if (!escena || !salas.length) return;

    /* ------------------------------------------------------------------
       Calidad segun el aparato
       ------------------------------------------------------------------ */

    // No hay forma fiable de preguntar "¿esta GPU aguanta?". Lo que si se puede
    // leer es el numero de nucleos y la memoria, y con eso basta para separar
    // un portatil de un movil de gama de entrada.
    var nucleos = navigator.hardwareConcurrency || 4;
    var memoria = navigator.deviceMemory || 4;
    var fino    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var flojo   = nucleos <= 4 || memoria <= 4;

    if (flojo) {
      // Menos profundidad: menos planos que componer a la vez.
      escena.style.setProperty('--paso', fino ? '1150px' : '900px');
      seccion.classList.add('is-modesto');
    }

    /* ------------------------------------------------------------------
       El avance
       ------------------------------------------------------------------ */

    /*
     * EL AVANCE SE CALCULA AQUI, y no con `animation-timeline`.
     *
     * Lo intente primero por la via nativa, que es la que recomienda todo el
     * mundo porque corre en el compositor. No sirve para este caso, y el motivo
     * es de fondo: `scroll()` mide el progreso del CONTENEDOR DE SCROLL entero
     * -aqui, el documento de 11.599 px- y lo que hace falta es el progreso
     * DENTRO de esta seccion mientras su marco esta pegado. Son dos numeros
     * distintos. Con `scroll()` el recorrido terminaba antes de empezar.
     * (`contain`, que era mi rango, ni siquiera es sintaxis valida para
     * `scroll()`: pertenece a `view()`. Por eso `--avance` se quedaba en 0.)
     *
     * Se calcula a mano: una resta y una division, dentro de un
     * requestAnimationFrame y con el listener pasivo. Es una escritura de
     * variable por cuadro; el resto del trabajo -componer los planos en 3D- lo
     * sigue haciendo la GPU igual.
     */
    var nativo = false;

    var avance = 0;
    var pendiente = false;

    function medir() {
      var caja = seccion.getBoundingClientRect();
      var recorrido = caja.height - window.innerHeight;
      if (recorrido <= 0) return 0;
      // 0 cuando la seccion empieza a pasar por arriba, 1 cuando termina.
      return Math.max(0, Math.min(1, -caja.top / recorrido));
    }

    function pintar() {
      pendiente = false;

      if (!nativo) {
        escena.style.setProperty('--avance', avance.toFixed(4));
      }

      seccion.classList.toggle('is-andando', avance > 0.03);

      /*
       * CADA SALA SE ENCIENDE AL LLEGAR Y SE APAGA AL PASARLA.
       *
       * Sin esto, las tres salas se ven a la vez -sus rotulos superpuestos, sus
       * prendas mezcladas- y no se lee como un recorrido sino como un monton.
       * Se vio en la primera prueba: "Ella", "El" y "Lo ultimo" apilados en el
       * mismo sitio.
       *
       * `camara` dice en que sala esta la vista, en la misma escala que el
       * indice de cada una. La distancia entre las dos da lo cerca que esta:
       * a menos de media sala, encendida; a mas de una y media, apagada.
       */
      var camara = avance * (salas.length - 1);
      for (var k = 0; k < salas.length; k++) {
        var d = Math.abs(camara - k);
        var cerca = Math.max(0, Math.min(1, 1.45 - d));
        salas[k].style.setProperty('--cerca', cerca.toFixed(3));
      }

      // La sala activa. Se reparte el recorrido en tantos tramos como salas.
      var cual = Math.min(salas.length - 1, Math.floor(avance * salas.length + 0.35));
      for (var i = 0; i < marcas.length; i++) {
        marcas[i].classList.toggle('is-aqui', i === cual);
      }
    }

    function alScroll() {
      avance = medir();
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(pintar);
      }
    }

    addEventListener('scroll', alScroll, { passive: true });
    addEventListener('resize', alScroll, { passive: true });
    alScroll();

    /* ------------------------------------------------------------------
       El paralaje del raton
       ------------------------------------------------------------------
       Mover un poco la camara con el raton es lo que hace que el espacio
       parezca que TIENE lados. Es el efecto mas barato de los tres y el que
       mas se nota.
       ------------------------------------------------------------------ */

    if (fino && !flojo) {
      var rx = 0, ry = 0, dx = 0, dy = 0, vivo = false;

      function suavizar() {
        // Interpolacion: la camara llega un instante despues que el raton. Ese
        // retardo es lo que se percibe como peso; sin el, el movimiento es
        // nervioso y marea.
        rx += (dx - rx) * 0.07;
        ry += (dy - ry) * 0.07;
        escena.style.setProperty('--raton-x', rx.toFixed(4));
        escena.style.setProperty('--raton-y', ry.toFixed(4));

        if (Math.abs(dx - rx) > 0.001 || Math.abs(dy - ry) > 0.001) {
          requestAnimationFrame(suavizar);
        } else {
          vivo = false;   // se para sola: nada de bucles eternos
        }
      }

      seccion.addEventListener('mousemove', function (e) {
        dx = (e.clientX / window.innerWidth) * 2 - 1;
        dy = (e.clientY / window.innerHeight) * 2 - 1;
        if (!vivo) { vivo = true; requestAnimationFrame(suavizar); }
      }, { passive: true });

      seccion.addEventListener('mouseleave', function () {
        dx = 0; dy = 0;
        if (!vivo) { vivo = true; requestAnimationFrame(suavizar); }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
