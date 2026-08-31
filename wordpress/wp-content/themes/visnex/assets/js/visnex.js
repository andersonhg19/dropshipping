/**
 * VISNEX — JavaScript del tema.
 *
 * Reglas que se siguen aqui:
 *   - Nada es imprescindible: si el JS falla, la tienda sigue funcionando.
 *   - Se respeta prefers-reduced-motion en todo lo que se mueve.
 *   - Cero dependencias externas.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Animaciones de entrada
     ------------------------------------------------------------------ */
  function initAnimations() {
    var targets = document.querySelectorAll('.vn-animate-in');
    if (!targets.length) return;

    // Sin IntersectionObserver o con movimiento reducido, se muestra todo ya.
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Cabecera al hacer scroll
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('vn-header--scrolled', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     Elementos descartables (barra de anuncio)
     ------------------------------------------------------------------ */
  function initDismiss() {
    document.querySelectorAll('[data-vn-dismiss]').forEach(function (btn) {
      var id = btn.getAttribute('data-vn-dismiss');

      // Si ya se cerro antes, no se vuelve a mostrar en esta sesion.
      try {
        if (sessionStorage.getItem('vn-dismissed-' + id) === '1') {
          var el0 = document.getElementById(id);
          if (el0) el0.style.display = 'none';
        }
      } catch (e) { /* sessionStorage bloqueado: se ignora */ }

      btn.addEventListener('click', function () {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
        try { sessionStorage.setItem('vn-dismissed-' + id, '1'); } catch (e) {}
      });
    });
  }

  /* ---------------------------------------------------------------------
     Newsletter
     ------------------------------------------------------------------ */
  function initNewsletter() {
    var form = document.querySelector('[data-vn-newsletter]');
    if (!form) return;
    var msg = document.querySelector('.vn-newsletter__msg');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input || !input.value) return;

      // El boton no tenia handler: hacia clic y no pasaba nada.
      // Hasta que se conecte un proveedor de correo real, al menos se responde.
      if (msg) {
        msg.textContent = 'Gracias. Te avisaremos de las novedades en ' + input.value + '.';
      }
      form.reset();
    });
  }

  /* ---------------------------------------------------------------------
     Galeria de la landing COD
     ------------------------------------------------------------------ */
  function initGallery() {
    var main = document.querySelector('[data-vn-main-img]');
    var thumbs = document.querySelectorAll('[data-vn-thumb]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        main.src = thumb.getAttribute('data-full') || thumb.src;
        thumbs.forEach(function (t) { t.setAttribute('aria-current', 'false'); });
        thumb.setAttribute('aria-current', 'true');
      });
    });
  }

  /* ---------------------------------------------------------------------
     Barra fija de compra en movil
     ------------------------------------------------------------------ */
  function initStickyBar() {
    var bar = document.querySelector('[data-vn-sticky]');
    var anchor = document.querySelector('[data-vn-sticky-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;

    // La barra aparece cuando el formulario sale de pantalla, no antes:
    // mostrarla encima del propio formulario solo estorba.
    var io = new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0 });

    io.observe(anchor);
  }

  /* ---------------------------------------------------------------------
     Cantidad en el formulario COD
     ------------------------------------------------------------------ */
  function initQty() {
    document.querySelectorAll('[data-vn-qty]').forEach(function (wrap) {
      var input = wrap.querySelector('input');
      if (!input) return;

      wrap.querySelectorAll('button[data-step]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var step = parseInt(btn.getAttribute('data-step'), 10);
          var min = parseInt(input.getAttribute('min') || '1', 10);
          var max = parseInt(input.getAttribute('max') || '99', 10);
          var next = Math.min(max, Math.max(min, (parseInt(input.value, 10) || min) + step));
          input.value = next;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Total en vivo del formulario COD
     ------------------------------------------------------------------ */
  function initCodTotal() {
    var form = document.querySelector('[data-vn-cod-form]');
    if (!form) return;

    var unit = parseInt(form.getAttribute('data-unit-price') || '0', 10);
    var shipping = parseInt(form.getAttribute('data-shipping') || '0', 10);
    var freeFrom = parseInt(form.getAttribute('data-free-from') || '0', 10);
    var qtyInput = form.querySelector('[data-vn-qty] input');

    function fmt(n) {
      return '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    }

    function update() {
      var qty = parseInt(qtyInput && qtyInput.value, 10) || 1;
      var sub = unit * qty;
      var ship = (freeFrom > 0 && sub >= freeFrom) ? 0 : shipping;

      var set = function (sel, value) {
        var el = form.querySelector(sel);
        if (el) el.textContent = value;
      };
      set('[data-vn-sub]', fmt(sub));
      set('[data-vn-ship]', ship === 0 ? 'Gratis' : fmt(ship));
      set('[data-vn-total]', fmt(sub + ship));

      var sticky = document.querySelector('[data-vn-sticky-price]');
      if (sticky) sticky.textContent = fmt(sub + ship);
    }

    if (qtyInput) qtyInput.addEventListener('change', update);
    update();
  }

  /* ---------------------------------------------------------------------
     Validacion del formulario COD
     ------------------------------------------------------------------ */
  function initCodValidation() {
    var form = document.querySelector('[data-vn-cod-form]');
    if (!form) return;

    function setError(field, message) {
      var wrap = field.closest('.vn-cod-form__field');
      if (!wrap) return;
      var slot = wrap.querySelector('.vn-cod-form__error');
      wrap.setAttribute('data-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function validatePhone(value) {
      var digits = (value || '').replace(/\D/g, '');
      if (digits.length === 12 && digits.indexOf('57') === 0) digits = digits.slice(2);
      // Movil colombiano: 10 digitos empezando por 3.
      return digits.length === 10 && digits[0] === '3';
    }

    var phone = form.querySelector('[name="vn_phone"]');
    if (phone) {
      phone.addEventListener('blur', function () {
        setError(phone, validatePhone(phone.value) ? '' : 'Debe tener 10 digitos y empezar por 3. Ej: 300 123 4567');
      });
      phone.addEventListener('input', function () {
        if (phone.getAttribute('aria-invalid') && validatePhone(phone.value)) setError(phone, '');
      });
    }

    form.addEventListener('submit', function (e) {
      var ok = true;

      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          setError(field, 'Este campo es obligatorio');
          ok = false;
        } else {
          setError(field, '');
        }
      });

      if (phone && phone.value.trim() && !validatePhone(phone.value)) {
        setError(phone, 'Debe tener 10 digitos y empezar por 3. Ej: 300 123 4567');
        ok = false;
      }

      if (!ok) {
        e.preventDefault();
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); }
        return;
      }

      var submit = form.querySelector('[type="submit"]');
      if (submit) {
        submit.setAttribute('aria-busy', 'true');
        submit.textContent = 'Enviando pedido...';
      }
    });
  }

  /* ------------------------------------------------------------------ */
  function init() {
    initAnimations();
    initHeader();
    initDismiss();
    initNewsletter();
    initGallery();
    initStickyBar();
    initQty();
    initCodTotal();
    initCodValidation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ---------------------------------------------------------------------
   Cabecera D'MIKA: aviso rotativo, buscador desplegable y panel móvil.
   ------------------------------------------------------------------ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function avisoRotativo() {
    var aviso = document.getElementById('dm-aviso');
    if (!aviso) return;

    try {
      if (sessionStorage.getItem('dm-aviso-cerrado') === '1') { aviso.style.display = 'none'; return; }
    } catch (e) { /* almacenamiento bloqueado: se ignora */ }

    var cerrar = aviso.querySelector('[data-dm-cerrar-aviso]');
    if (cerrar) {
      cerrar.addEventListener('click', function () {
        aviso.style.display = 'none';
        try { sessionStorage.setItem('dm-aviso-cerrado', '1'); } catch (e) {}
      });
    }

    var msgs = aviso.querySelectorAll('.dm-aviso__msg');
    if (msgs.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      msgs[i].classList.remove('is-activo');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-activo');
    }, 4200);
  }

  function buscador() {
    var btn = document.querySelector('[data-dm-abrir-busqueda]');
    var caja = document.getElementById('dm-busqueda');
    if (!btn || !caja) return;

    btn.addEventListener('click', function () {
      var abierto = !caja.hidden;
      caja.hidden = abierto;
      btn.setAttribute('aria-expanded', String(!abierto));
      if (!abierto) {
        var campo = caja.querySelector('input[type="search"]');
        if (campo) campo.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !caja.hidden) {
        caja.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  function panelMovil() {
    var abrir = document.querySelector('[data-dm-abrir-menu]');
    var panel = document.getElementById('dm-panel');
    if (!abrir || !panel) return;

    var previo = null;

    function abrirPanel() {
      previo = document.activeElement;
      panel.hidden = false;
      // Un cuadro para que la transición arranque desde el estado cerrado.
      requestAnimationFrame(function () { panel.classList.add('is-abierto'); });
      document.body.classList.add('dm-sin-scroll');
      abrir.setAttribute('aria-expanded', 'true');
      var primero = panel.querySelector('a, button');
      if (primero) primero.focus();
    }

    function cerrarPanel() {
      panel.classList.remove('is-abierto');
      document.body.classList.remove('dm-sin-scroll');
      abrir.setAttribute('aria-expanded', 'false');
      var esperar = reduce ? 0 : 380;
      setTimeout(function () { panel.hidden = true; }, esperar);
      if (previo && previo.focus) previo.focus();
    }

    abrir.addEventListener('click', abrirPanel);
    panel.querySelectorAll('[data-dm-cerrar-menu]').forEach(function (el) {
      el.addEventListener('click', cerrarPanel);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) cerrarPanel();
    });
  }

  function arrancar() { avisoRotativo(); buscador(); panelMovil(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
