# -*- coding: utf-8 -*-
"""
Genera los cuatro artboards de direccion de diseno para D'MIKA.

Se generan y no se escriben a mano porque los cuatro comparten el logo
vectorizado (4,8 KB de trazado por pieza) y la paleta. Copiar eso cuatro veces
es como se acaba con cuatro logos ligeramente distintos.
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
LOGO = json.load(open(os.path.join(AQUI, '_logo.json')))


def svg(pieza, alto, color=None, clase=''):
    p = LOGO[pieza]
    vb = p['vb']
    w, h = float(vb.split()[2]), float(vb.split()[3])
    ancho = round(alto * w / h)
    cuerpo = ''.join(
        f'<path fill="{color or x["fill"]}" fill-rule="evenodd" d="{x["d"]}"/>'
        for x in p['paths'])
    c = f' class="{clase}"' if clase else ''
    return (f'<svg{c} viewBox="{vb}" width="{ancho}" height="{alto}" '
            f'aria-label="D\'MIKA" role="img">{cuerpo}</svg>')


CABEZA = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500;600&display=swap">
  <style>
%s
  </style>
</helmet>
'''

PIE = '''</x-dc>
</body>
</html>
'''

BASE = '''
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; }
    :root {
      --negro:  #171717;
      --marfil: #F4EFE7;
      --arena:  #D8C7B0;
      --oro:    #B99A5E;
      --moka:   #6F5A4A;
      --tinta:  #836838;
      --didone: "Bodoni Moda", "Didot", "Times New Roman", serif;
      --palo:   "Jost", "Futura", system-ui, sans-serif;
    }
    a { color: var(--oro); text-decoration: none; }
    a:hover { color: var(--tinta); }
    .eti {
      font-family: var(--palo); font-size: 10px; font-weight: 500;
      letter-spacing: .28em; text-transform: uppercase;
    }
'''


def escribe(nombre, css, cuerpo):
    open(os.path.join(AQUI, nombre), 'w', encoding='utf-8').write(
        (CABEZA % (BASE + css)) + cuerpo + PIE)
    print(f'  {nombre}')


# ===========================================================================
# A · PASARELA — la tienda como pelicula de moda
# ===========================================================================
css_a = '''
    .lienzo {
      width: 1440px; height: 1150px; position: relative; overflow: hidden;
      background: #0B0B0B; color: var(--marfil); font-family: var(--palo);
    }
    /* La foto ocupa TODO. No es un banner dentro de una pagina: es el fondo
       sobre el que ocurre todo lo demas. */
    .foto {
      position: absolute; inset: 0;
      background: url("hero-ella.jpg") center 22% / cover no-repeat;
      animation: respirar 26s ease-in-out infinite alternate;
    }
    @keyframes respirar {
      from { transform: scale(1.06) translateX(-1%); }
      to   { transform: scale(1.16) translateX(1%); }
    }
    .velo {
      position: absolute; inset: 0;
      background:
        linear-gradient(180deg, rgba(11,11,11,.82) 0%, rgba(11,11,11,.15) 34%, rgba(11,11,11,.55) 72%, #0B0B0B 100%),
        linear-gradient(90deg, rgba(11,11,11,.7) 0%, transparent 46%);
    }
    /* El titular se recorta contra la foto con blend: donde la foto es clara
       el texto se ve oscuro y al reves. Es lo que hace que el tipo y la imagen
       sean UNA cosa y no texto encima de una foto. */
    .titular {
      position: absolute; left: 64px; top: 300px; z-index: 3;
      font-family: var(--didone); font-weight: 400;
      font-size: 176px; line-height: .84; letter-spacing: -.035em;
      margin: 0; color: var(--marfil); mix-blend-mode: difference;
      max-width: 900px;
    }
    .titular em { font-style: italic; color: var(--oro); display: block; margin-left: 130px; }
    .titular span {
      display: inline-block; opacity: 0;
      animation: subir 1.15s cubic-bezier(.16,1,.3,1) forwards;
    }
    @keyframes subir {
      from { opacity: 0; transform: translateY(78px) rotate(3deg); }
      to   { opacity: 1; transform: none; }
    }
    /* Texto vertical en el canto: es la firma de las casas de moda en web y
       ocupa un espacio que si no queda muerto. */
    .canto {
      position: absolute; right: 30px; top: 190px; z-index: 4;
      writing-mode: vertical-rl; color: var(--oro);
      letter-spacing: .42em; font-size: 10px; text-transform: uppercase;
    }
    .cab {
      position: absolute; top: 0; left: 0; right: 0; height: 84px; z-index: 6;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px;
    }
    .nav { display: flex; gap: 30px; }
    .nav span { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .85; }
    /* La pasarela: una tira de looks que corre sola por abajo. Se arrastra y
       se para al pasar por encima. */
    .pasarela {
      position: absolute; left: 0; right: 0; bottom: 0; height: 300px; z-index: 5;
      display: flex; align-items: flex-end; gap: 18px; padding: 0 40px 34px;
      overflow: hidden;
    }
    .look {
      position: relative; flex: 0 0 216px; height: 262px; overflow: hidden;
      filter: grayscale(1) contrast(1.06); transition: filter .5s, transform .5s;
      animation: desfilar 34s linear infinite;
    }
    .look:hover { filter: none; transform: translateY(-14px); }
    .look img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .look b {
      position: absolute; left: 12px; bottom: 10px; font-family: var(--didone);
      font-size: 17px; font-weight: 400; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.7);
    }
    @keyframes desfilar { from { transform: translateX(0); } to { transform: translateX(-40px); } }
    .nlook {
      position: absolute; left: 12px; top: 10px; font-size: 9px;
      letter-spacing: .22em; color: var(--oro);
    }
    .cta {
      position: absolute; left: 64px; top: 690px; z-index: 4;
      display: flex; align-items: center; gap: 22px;
    }
    .boton {
      display: inline-flex; align-items: center; gap: 12px;
      padding: 17px 34px; border: 1px solid var(--oro); color: var(--oro);
      font-size: 11px; letter-spacing: .24em; text-transform: uppercase;
      position: relative; overflow: hidden;
    }
    .boton::after {
      content: ''; position: absolute; inset: 0; background: var(--oro);
      transform: translateY(101%); transition: transform .45s cubic-bezier(.16,1,.3,1);
    }
    .boton:hover { color: var(--negro); }
    .boton:hover::after { transform: none; }
    .boton em { position: relative; z-index: 2; font-style: normal; }
    .sub { max-width: 300px; font-size: 12px; line-height: 1.75; color: rgba(244,239,231,.62); }
    .grano {
      position: absolute; inset: 0; z-index: 7; pointer-events: none; opacity: .06;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='.85' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
    }
'''

def letras(txt, base=0):
    return ''.join(
        f'<span style="animation-delay:{base + i * 0.06:.2f}s">{c if c != " " else "&nbsp;"}</span>'
        for i, c in enumerate(txt))

cuerpo_a = f'''
<div class="lienzo">
  <div class="foto"></div>
  <div class="velo"></div>

  <div class="cab">
    <div class="nav"><span>Mujer</span><span>Hombre</span><span>Nuevo</span></div>
    {svg('logotipo', 19, 'var(--marfil)')}
    <div class="nav"><span>Buscar</span><span>Bolsa (0)</span></div>
  </div>

  <div class="canto">Temporada 01 &nbsp;—&nbsp; Bogotá / Madrid</div>

  <h1 class="titular">{letras('LA ROPA')}<em>{letras('se mueve', 0.5)}</em></h1>

  <div class="cta">
    <span class="boton"><em>Ver la coleccion</em></span>
    <p class="sub">Doce piezas. Se fotografian en movimiento porque asi es como se van a usar.</p>
  </div>

  <div class="pasarela">
    <div class="look" style="animation-delay:-0s"><img src="lookbook-ella.jpg" alt=""><span class="nlook">01</span><b>Abrigo largo</b></div>
    <div class="look" style="animation-delay:-3s"><img src="blazer-negro.jpg" alt=""><span class="nlook">02</span><b>Blazer negro</b></div>
    <div class="look" style="animation-delay:-6s"><img src="lookbook-el.jpg" alt=""><span class="nlook">03</span><b>Punto grueso</b></div>
    <div class="look" style="animation-delay:-9s"><img src="blazer-mujer.jpg" alt=""><span class="nlook">04</span><b>Sastre crudo</b></div>
    <div class="look" style="animation-delay:-12s"><img src="camisa-burdeos.jpg" alt=""><span class="nlook">05</span><b>Camisa seda</b></div>
    <div class="look" style="animation-delay:-15s"><img src="hero-el.jpg" alt=""><span class="nlook">06</span><b>Cuello alto</b></div>
  </div>

  <div class="grano"></div>
</div>
'''

escribe('Main.dc.html', css_a, cuerpo_a)


# ===========================================================================
# B · ATELIER — la tienda como un espacio con profundidad
# ===========================================================================
css_b = '''
    .lienzo {
      width: 1440px; height: 1150px; position: relative; overflow: hidden;
      background: radial-gradient(120% 90% at 50% 8%, #FBF8F3 0%, var(--marfil) 40%, #E6DCCC 100%);
      color: var(--negro); font-family: var(--palo);
      perspective: 1400px; perspective-origin: 50% 40%;
    }
    /* El suelo. Una rejilla en perspectiva es lo que convierte una pagina
       plana en una habitacion: el ojo lee la fuga y asume profundidad. */
    .suelo {
      position: absolute; left: -30%; right: -30%; bottom: -6%; height: 62%;
      background-image:
        linear-gradient(90deg, rgba(111,90,74,.16) 1px, transparent 1px),
        linear-gradient(0deg, rgba(111,90,74,.16) 1px, transparent 1px);
      background-size: 88px 88px;
      transform: rotateX(74deg);
      transform-origin: 50% 100%;
      mask-image: linear-gradient(to top, #000 20%, transparent 88%);
      -webkit-mask-image: linear-gradient(to top, #000 20%, transparent 88%);
    }
    .horizonte {
      position: absolute; left: 0; right: 0; top: 46%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(185,154,94,.55), transparent);
    }
    .cab {
      position: absolute; top: 0; left: 0; right: 0; height: 84px; z-index: 20;
      display: flex; align-items: center; justify-content: space-between; padding: 0 44px;
    }
    .nav { display: flex; gap: 30px; }
    .nav span { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--moka); }
    /* Los planos: cada prenda vive a una PROFUNDIDAD distinta (translateZ), no
       a un tamano distinto. Al mover el raton, las cercanas se desplazan mas
       que las lejanas — que es como funciona la vista de verdad. */
    .escena {
      position: absolute; inset: 0; transform-style: preserve-3d;
      display: grid; place-items: center;
    }
    .plano {
      position: absolute; transform-style: preserve-3d;
      animation: flotar 9s ease-in-out infinite alternate;
    }
    @keyframes flotar {
      from { transform: translate3d(var(--x), calc(var(--y) - 10px), var(--z)) rotateY(var(--ry)); }
      to   { transform: translate3d(var(--x), calc(var(--y) + 10px), var(--z)) rotateY(var(--ry)); }
    }
    .prenda {
      width: var(--w); height: var(--h); overflow: hidden;
      box-shadow: 0 42px 80px -24px rgba(23,23,23,.42), 0 4px 14px rgba(23,23,23,.1);
      background: #fff;
    }
    .prenda img { width: 100%; height: 100%; object-fit: cover; display: block; }
    /* La chapa lleva fondo propio. Sin el, la etiqueta de una prenda LEJANA
       cae detras de una cercana y se lee a medias — que es exactamente lo que
       pasaba: "Sastre cru..." cortado por el abrigo de delante. */
    .chapa {
      position: absolute; left: 50%; transform: translateX(-50%);
      bottom: -40px; white-space: nowrap; text-align: center;
      background: rgba(244,239,231,.92); padding: 7px 16px;
      backdrop-filter: blur(3px);
    }
    .chapa b { display: block; font-family: var(--didone); font-size: 15px; font-weight: 400; }
    .chapa i { font-style: normal; font-size: 10px; letter-spacing: .16em; color: var(--tinta); }
    .centro { position: absolute; z-index: 12; text-align: center; top: 128px; left: 0; right: 0; }
    .centro h1 {
      font-family: var(--didone); font-size: 92px; line-height: .94; margin: 22px 0 0;
      font-weight: 400; letter-spacing: -.025em;
    }
    .centro h1 em { font-style: italic; color: var(--tinta); }
    .centro p {
      max-width: 430px; margin: 20px auto 0; font-size: 13px; line-height: 1.85; color: var(--moka);
    }
    .entrar {
      display: inline-flex; align-items: center; gap: 14px; margin-top: 30px;
      padding: 16px 36px; background: var(--negro); color: var(--marfil);
      font-size: 11px; letter-spacing: .24em; text-transform: uppercase;
    }
    .pie {
      position: absolute; left: 0; right: 0; bottom: 34px; z-index: 14;
      display: flex; justify-content: center; gap: 54px;
    }
    .pie div { text-align: center; }
    .pie b { font-family: var(--didone); font-size: 27px; font-weight: 400; display: block; }
    .pie span { font-size: 9px; letter-spacing: .22em; text-transform: uppercase; color: var(--moka); }
'''

cuerpo_b = f'''
<div class="lienzo">
  <div class="suelo"></div>
  <div class="horizonte"></div>

  <div class="cab">
    <div class="nav"><span>Mujer</span><span>Hombre</span><span>Atelier</span></div>
    {svg('logotipo', 19, 'var(--negro)')}
    <div class="nav"><span>Buscar</span><span>Bolsa (0)</span></div>
  </div>

  <div class="escena">
    <div class="plano" style="--x:-548px; --y:104px; --z:-430px; --ry:17deg; animation-delay:-1s">
      <div class="prenda" style="--w:196px; --h:262px"><img src="blazer-mujer.jpg" alt=""></div>
      <div class="chapa"><b>Sastre crudo</b><i>$189.900</i></div>
    </div>
    <div class="plano" style="--x:-238px; --y:276px; --z:-60px; --ry:8deg; animation-delay:-3s">
      <div class="prenda" style="--w:238px; --h:318px"><img src="lookbook-ella.jpg" alt=""></div>
      <div class="chapa"><b>Abrigo largo</b><i>$249.900</i></div>
    </div>
    <div class="plano" style="--x:258px; --y:270px; --z:-40px; --ry:-9deg; animation-delay:-5s">
      <div class="prenda" style="--w:238px; --h:318px"><img src="hero-el.jpg" alt=""></div>
      <div class="chapa"><b>Cuello alto</b><i>$129.900</i></div>
    </div>
    <div class="plano" style="--x:566px; --y:98px; --z:-450px; --ry:-18deg; animation-delay:-7s">
      <div class="prenda" style="--w:192px; --h:256px"><img src="blazer-negro.jpg" alt=""></div>
      <div class="chapa"><b>Blazer negro</b><i>$209.900</i></div>
    </div>
  </div>

  <div class="centro">
    <span class="eti" style="color:var(--tinta)">El atelier</span>
    <h1>Entra y <em>mira</em><br>alrededor</h1>
    <p>Las prendas estan colgadas en el espacio. Te acercas a la que te llama, la giras, la ves de cerca.</p>
    <div><span class="entrar">Recorrer el atelier</span></div>
  </div>

  <div class="pie">
    <div><b>12</b><span>piezas</span></div>
    <div><b>2</b><span>paises</span></div>
    <div><b>30</b><span>dias de cambio</span></div>
  </div>
</div>
'''
escribe('Atelier.dc.html', css_b, cuerpo_b)


# ===========================================================================
# C · EDITORIAL — la revista de moda que se mueve
# ===========================================================================
css_c = '''
    .lienzo {
      width: 1440px; height: 1150px; position: relative; overflow: hidden;
      background: var(--marfil); color: var(--negro); font-family: var(--palo);
    }
    .cab {
      position: absolute; top: 0; left: 0; right: 0; height: 78px; z-index: 30;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px; border-bottom: 1px solid var(--negro); background: var(--marfil);
    }
    .nav { display: flex; gap: 28px; }
    .nav span { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
    /* Numero de portada, como una revista. Enorme y recortado por el borde:
       eso es lo que dice "esto es una publicacion", no una tienda. */
    .numero {
      position: absolute; right: -76px; top: 60px; z-index: 2;
      font-family: var(--didone); font-size: 420px; line-height: .74;
      color: var(--arena); font-weight: 400; letter-spacing: -.06em;
    }
    /* Las fotos van GIRADAS y SUPERPUESTAS. Una rejilla ordenada es lo que
       hacia que la pagina se viera de catalogo; el desorden controlado es lo
       que la hace parecer una portada. */
    .recorte {
      position: absolute; overflow: hidden; z-index: 5;
      box-shadow: 0 30px 60px -22px rgba(23,23,23,.4);
      animation: entrar 1.1s cubic-bezier(.16,1,.3,1) backwards;
    }
    @keyframes entrar {
      from { opacity: 0; transform: translateY(52px) rotate(0deg) scale(.94); }
    }
    .recorte img { width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform .8s cubic-bezier(.16,1,.3,1); }
    .recorte:hover img { transform: scale(1.07); }
    .r1 { left: 78px;  top: 168px; width: 330px; height: 440px; transform: rotate(-4.5deg); animation-delay:.1s }
    .r2 { left: 372px; top: 372px; width: 296px; height: 396px; transform: rotate(3.2deg);  animation-delay:.25s }
    .r3 { right: 172px; top: 214px; width: 268px; height: 352px; transform: rotate(5.5deg); animation-delay:.4s }
    .r4 { right: 96px;  top: 520px; width: 212px; height: 280px; transform: rotate(-3deg);  animation-delay:.55s }
    /* El titular pisa las fotos. Ese cruce es el gesto. */
    .titular {
      position: absolute; left: 58px; top: 396px; z-index: 12; margin: 0;
      font-family: var(--didone); font-size: 154px; line-height: .82;
      font-weight: 400; letter-spacing: -.04em; pointer-events: none;
      /* Halo de marfil en ocho direcciones. El titular cruza fotos claras y
         oscuras, y sin esto la palabra que cae sobre la foto oscura se pierde.
         Un halo es lo que hace la impresion cuando el tipo pisa la imagen. */
      text-shadow:
         2px  2px 0 rgba(244,239,231,.92), -2px  2px 0 rgba(244,239,231,.92),
         2px -2px 0 rgba(244,239,231,.92), -2px -2px 0 rgba(244,239,231,.92),
         0 3px 0 rgba(244,239,231,.92), 0 -3px 0 rgba(244,239,231,.92),
         3px 0 0 rgba(244,239,231,.92), -3px 0 0 rgba(244,239,231,.92),
         0 4px 34px rgba(244,239,231,.75);
    }
    .titular em { font-style: italic; display: block; margin-left: 190px; color: var(--tinta); }
    .kicker {
      position: absolute; left: 62px; top: 138px; z-index: 12;
      display: flex; align-items: center; gap: 14px;
    }
    .kicker s { width: 62px; height: 1px; background: var(--oro); display: block; }
    /* Banda deslizante: el recurso de portada por excelencia. */
    .banda {
      position: absolute; left: 0; right: 0; top: 812px; z-index: 20; height: 62px;
      background: var(--negro); color: var(--marfil);
      display: flex; align-items: center; overflow: hidden;
      transform: rotate(-1.6deg); width: 112%; margin-left: -6%;
      border-top: 1px solid var(--oro); border-bottom: 1px solid var(--oro);
    }
    .tira { display: flex; gap: 42px; white-space: nowrap; animation: correr 22s linear infinite; padding-left: 42px; }
    .tira span { font-family: var(--didone); font-size: 25px; font-style: italic; }
    .tira i { color: var(--oro); font-style: normal; }
    @keyframes correr { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .fichas {
      position: absolute; left: 0; right: 0; bottom: 44px; z-index: 22;
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 26px; padding: 0 58px;
    }
    .ficha { border-top: 1px solid var(--negro); padding-top: 14px; }
    .ficha b { display: block; font-family: var(--didone); font-size: 19px; font-weight: 400; }
    .ficha p { margin: 5px 0 0; font-size: 11px; line-height: 1.6; color: var(--moka); }
    .ficha u { display: block; margin-top: 8px; font-size: 10px; letter-spacing: .2em;
      text-transform: uppercase; color: var(--tinta); text-decoration: none;
      border-bottom: 1px solid var(--oro); width: fit-content; padding-bottom: 2px; }
    .grano {
      position: absolute; inset: 0; z-index: 28; pointer-events: none; opacity: .05;
      mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
    }
'''

cuerpo_c = f'''
<div class="lienzo">
  <div class="numero">01</div>

  <div class="cab">
    <div class="nav"><span>Mujer</span><span>Hombre</span><span>Editorial</span></div>
    {svg('logotipo', 18, 'var(--negro)')}
    <div class="nav"><span>Buscar</span><span>Bolsa (0)</span></div>
  </div>

  <div class="kicker"><s></s><span class="eti" style="color:var(--tinta)">Numero uno · Septiembre</span></div>

  <div class="recorte r1"><img src="lookbook-ella.jpg" alt=""></div>
  <div class="recorte r2"><img src="blazer-mujer.jpg" alt=""></div>
  <div class="recorte r3"><img src="hero-el.jpg" alt=""></div>
  <div class="recorte r4"><img src="camisa-burdeos.jpg" alt=""></div>

  <h1 class="titular">Nada<em>de temporada</em></h1>

  <div class="banda">
    <div class="tira">
      <span>Doce piezas <i>·</i></span><span><i>Algodon peinado</i></span><span>Bogota <i>—</i> Madrid <i>·</i></span>
      <span><i>Cambios en 30 dias</i></span><span>Doce piezas <i>·</i></span><span><i>Algodon peinado</i></span>
      <span>Bogota <i>—</i> Madrid <i>·</i></span><span><i>Cambios en 30 dias</i></span>
    </div>
  </div>

  <div class="fichas">
    <div class="ficha"><b>El abrigo</b><p>Lana con un 12% de cachemir. Cae recto y no se abre al andar.</p><u>Ver la pieza</u></div>
    <div class="ficha"><b>El sastre</b><p>Hombro blando, sin hombrera. Se puede doblar en la maleta.</p><u>Ver la pieza</u></div>
    <div class="ficha"><b>El punto</b><p>Cuello alto que no pica. Probado con quince personas.</p><u>Ver la pieza</u></div>
    <div class="ficha"><b>La camisa</b><p>Seda lavada. Se plancha a baja temperatura y ya.</p><u>Ver la pieza</u></div>
  </div>

  <div class="grano"></div>
</div>
'''
escribe('Editorial.dc.html', css_c, cuerpo_c)


# ===========================================================================
# D | VITRINA - la prenda manda, y responde
# ===========================================================================
css_d = """
    .lienzo {
      width: 1440px; height: 1150px; position: relative; overflow: hidden;
      background: var(--marfil); color: var(--negro); font-family: var(--palo);
      display: grid; grid-template-columns: 1fr 520px;
    }
    .cab {
      position: absolute; top: 0; left: 0; right: 0; height: 80px; z-index: 30;
      display: flex; align-items: center; justify-content: space-between; padding: 0 40px;
    }
    .nav { display: flex; gap: 28px; }
    .nav span { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; }
    /* Izquierda: la prenda a tamano indecente. Si la tienda vende ropa, la
       ropa tiene que ser lo mas grande de la pantalla. */
    .escaparate {
      position: relative; overflow: hidden;
      background: radial-gradient(70% 60% at 50% 34%, #FFFDFA 0%, #EDE4D6 100%);
      display: grid; place-items: center;
    }
    .pieza {
      position: relative; width: 470px; height: 640px; overflow: hidden;
      box-shadow: 0 60px 100px -30px rgba(23,23,23,.45);
      transition: transform .7s cubic-bezier(.16,1,.3,1);
    }
    .pieza:hover { transform: translateY(-10px) scale(1.014); }
    .pieza img { width: 100%; height: 100%; object-fit: cover; display: block; }
    /* La lupa de tejido: el detalle que un catalogo nunca da y que es
       exactamente la duda de quien compra ropa por internet. */
    .lupa {
      position: absolute; right: -46px; bottom: 66px; width: 176px; height: 176px;
      border-radius: 50%; border: 1px solid var(--oro); overflow: hidden;
      box-shadow: 0 24px 50px -14px rgba(23,23,23,.4); background: #fff;
    }
    .lupa img { width: 420%; height: 420%; max-width: none; object-fit: cover;
      transform: translate(-38%, -34%); }
    .lupa em {
      position: absolute; left: 0; right: 0; bottom: 12px; text-align: center;
      font-style: normal; font-size: 8px; letter-spacing: .2em;
      text-transform: uppercase; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.8);
    }
    .miniaturas {
      position: absolute; left: 46px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 12px; z-index: 8;
    }
    .mini { width: 62px; height: 82px; overflow: hidden; cursor: pointer;
      opacity: .5; transition: opacity .3s, transform .3s; }
    .mini:hover { opacity: 1; transform: translateX(4px); }
    .mini.on { opacity: 1; outline: 1px solid var(--oro); outline-offset: 3px; }
    .mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
    /* Derecha: la decision de compra entera, sin bajar la pagina. */
    .panel {
      background: var(--marfil); border-left: 1px solid var(--arena);
      padding: 116px 52px 40px; display: flex; flex-direction: column;
    }
    .panel h1 {
      font-family: var(--didone); font-size: 52px; line-height: 1.02;
      font-weight: 400; margin: 14px 0 0; letter-spacing: -.02em;
    }
    .precio { display: flex; align-items: baseline; gap: 12px; margin-top: 16px; }
    .precio b { font-family: var(--didone); font-size: 32px; font-weight: 400; }
    .precio s { color: var(--moka); font-size: 16px; }
    .precio i { font-style: normal; font-size: 10px; letter-spacing: .16em;
      text-transform: uppercase; color: var(--tinta); border: 1px solid var(--oro); padding: 3px 8px; }
    .desc { font-size: 13px; line-height: 1.8; color: var(--moka); margin: 20px 0 0; }
    .grupo { margin-top: 30px; }
    .grupo > .eti { color: var(--moka); display: block; margin-bottom: 12px; }
    .colores { display: flex; gap: 12px; }
    .color { width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
      border: 1px solid rgba(23,23,23,.16); transition: transform .25s; position: relative; }
    .color:hover { transform: scale(1.09); }
    .color.on::after {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      border: 1px solid var(--oro);
    }
    .tallas { display: flex; gap: 10px; }
    .talla {
      min-width: 52px; height: 46px; display: grid; place-items: center; cursor: pointer;
      border: 1px solid var(--arena); font-size: 12px; letter-spacing: .1em;
      transition: all .25s;
    }
    .talla:hover { border-color: var(--moka); }
    .talla.on { background: var(--negro); color: var(--marfil); border-color: var(--negro); }
    .talla.no { opacity: .3; text-decoration: line-through; cursor: not-allowed; }
    .comprar {
      margin-top: 30px; height: 58px; background: var(--negro); color: var(--marfil);
      display: grid; place-items: center; cursor: pointer;
      font-size: 12px; letter-spacing: .24em; text-transform: uppercase;
      position: relative; overflow: hidden;
    }
    .comprar::after {
      content: ''; position: absolute; inset: 0; background: var(--tinta);
      transform: translateY(101%); transition: transform .4s cubic-bezier(.16,1,.3,1);
    }
    .comprar span { position: relative; z-index: 2; }
    .comprar:hover::after { transform: none; }
    .promesas { margin-top: auto; padding-top: 26px; border-top: 1px solid var(--arena); }
    .promesa { display: flex; gap: 11px; align-items: center; padding: 7px 0;
      font-size: 11px; color: var(--moka); }
    .promesa svg { flex: 0 0 15px; }
"""

logica_d = """
class Component extends DCLogic {
  constructor(p) {
    super(p);
    // Todo lo que se ve a la derecha depende de esto y de nada mas.
    this.state = { color: 0, talla: 2 };
  }
  renderVals() {
    const colores = [
      { nombre: 'Crudo',   hex: '#E8DFD1', foto: 'blazer-mujer.jpg' },
      { nombre: 'Negro',   hex: '#171717', foto: 'blazer-negro.jpg' },
      { nombre: 'Burdeos', hex: '#6E2733', foto: 'camisa-burdeos.jpg' }
    ];
    const tallas = [
      { t: 'XS', hay: true }, { t: 'S', hay: true }, { t: 'M', hay: true },
      { t: 'L', hay: true },  { t: 'XL', hay: false }
    ];
    const sel = this.state.color;
    const self = this;
    return {
      foto: colores[sel].foto,
      nombreColor: colores[sel].nombre,
      colores: colores.map(function (c, i) {
        return Object.assign({}, c, {
          clase: 'color' + (i === sel ? ' on' : ''),
          estilo: 'background:' + c.hex,
          pick: function () { self.setState({ color: i }); }
        });
      }),
      miniaturas: colores.map(function (c, i) {
        return Object.assign({}, c, {
          clase: 'mini' + (i === sel ? ' on' : ''),
          pick: function () { self.setState({ color: i }); }
        });
      }),
      tallas: tallas.map(function (s, i) {
        return Object.assign({}, s, {
          clase: 'talla' + (!s.hay ? ' no' : (i === self.state.talla ? ' on' : '')),
          pick: function () { if (s.hay) self.setState({ talla: i }); }
        });
      })
    };
  }
}
"""

cuerpo_d = (
'<div class="lienzo">\n'
'  <div class="cab">\n'
'    <div class="nav"><span>Mujer</span><span>Hombre</span><span>Tienda</span></div>\n'
'    ' + svg('logotipo', 18, 'var(--negro)') + '\n'
'    <div class="nav"><span>Buscar</span><span>Bolsa (1)</span></div>\n'
'  </div>\n'
'\n'
'  <div class="escaparate">\n'
'    <div class="miniaturas">\n'
'      <sc-for list="{{miniaturas}}" as="m" hint-placeholder-count="3">\n'
'        <div class="{{m.clase}}" onClick="{{m.pick}}"><img src="{{m.foto}}" alt=""></div>\n'
'      </sc-for>\n'
'    </div>\n'
'    <div class="pieza">\n'
'      <img src="{{foto}}" alt="">\n'
'      <div class="lupa"><img src="{{foto}}" alt=""><em>Tejido x4</em></div>\n'
'    </div>\n'
'  </div>\n'
'\n'
'  <div class="panel">\n'
'    <span class="eti" style="color:var(--tinta)">Sastreria &middot; Mujer</span>\n'
'    <h1>Blazer de<br>hombro blando</h1>\n'
'    <div class="precio"><b>$189.900</b><s>$229.900</s><i>-17%</i></div>\n'
'    <p class="desc">Lana fria con forro de cupro. El hombro va sin hombrera, asi que cae\n'
'    siguiendo el cuerpo y no se marca. Color elegido: {{nombreColor}}.</p>\n'
'\n'
'    <div class="grupo">\n'
'      <span class="eti">Color</span>\n'
'      <div class="colores">\n'
'        <sc-for list="{{colores}}" as="c" hint-placeholder-count="3">\n'
'          <div class="{{c.clase}}" style="{{c.estilo}}" onClick="{{c.pick}}" title="{{c.nombre}}"></div>\n'
'        </sc-for>\n'
'      </div>\n'
'    </div>\n'
'\n'
'    <div class="grupo">\n'
'      <span class="eti">Talla</span>\n'
'      <div class="tallas">\n'
'        <sc-for list="{{tallas}}" as="s" hint-placeholder-count="5">\n'
'          <div class="{{s.clase}}" onClick="{{s.pick}}">{{s.t}}</div>\n'
'        </sc-for>\n'
'      </div>\n'
'    </div>\n'
'\n'
'    <div class="comprar"><span>Anadir a la bolsa</span></div>\n'
'\n'
'    <div class="promesas">\n'
'      <div class="promesa"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#836838" stroke-width="1.4"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>Pagas cuando llega. Bogota en 24 h.</div>\n'
'      <div class="promesa"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#836838" stroke-width="1.4"><path d="M4 5h16v6a9 9 0 0 1-8 9 9 9 0 0 1-8-9z"/><path d="M9 12l2 2 4-4"/></svg>Cambio de talla gratis, 30 dias.</div>\n'
'      <div class="promesa"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#836838" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Te respondemos por WhatsApp.</div>\n'
'    </div>\n'
'  </div>\n'
'</div>\n'
'\n'
'<script data-dc-script>\n' + logica_d + '\n</script>\n'
)
escribe('Vitrina.dc.html', css_d, cuerpo_d)

print('listo')
