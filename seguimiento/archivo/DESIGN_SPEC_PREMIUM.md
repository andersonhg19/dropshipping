# VISNEX - Especificacion de Diseno Premium
## Basado en analisis de: Gucci, iShop, Apple, Nike, Stella Guan, Bombon.rs

> Documento generado: 2026-04-12
> Proposito: Guia CSS/UI definitiva para la tienda WordPress de VISNEX

---

## 1. Analisis por Sitio de Referencia

### 1.1 Apple (apple.com/co)
- **Navegacion**: Barra fija superior, fondo semi-transparente con backdrop-filter blur. Logo centrado-izquierda. ~8 items minimalistas. Iconos de busqueda y bolsa a la derecha.
- **Hero**: Secciones de viewport completo (100vh) por producto. Titulo grande centrado + subtitulo + 2 CTAs ("Mas informacion" / "Comprar"). Fondo oscuro/claro alternante.
- **Tipografia**: SF Pro Display / SF Pro Text. Titulos hasta 56px, peso 600. Cuerpo 17px, peso 400. Letter-spacing -0.022em en titulos.
- **Colores**: Fondo #000000 y #FBFBFD alternante. Texto blanco sobre oscuro, #1D1D1F sobre claro. Links azul #2997FF.
- **Grid de productos**: No usa grid tradicional en home. Tarjetas gigantes de producto individual.
- **Efectos**: Scroll suave, aparicion fade-in al scroll, transiciones de opacidad 0.3s. Sin parallax agresivo.
- **Footer**: Fondo #F5F5F7, tipografia 12px, multiples columnas con links grises, separador fino.

### 1.2 Gucci (gucci.com)
- **Navegacion**: Header negro/transparente sticky. Logo centrado prominente (serif, heritage). Menu hamburguesa a la izquierda. Busqueda + cuenta + bolsa a la derecha. Muy limpio.
- **Hero**: Imagenes editoriales full-width, aspect ratio 16:9 o mas anchas. Minimo texto sobre imagen. CTA discreto "Shop Now" con borde fino.
- **Tipografia**: Fuente serif para logotipo. Sans-serif (Helvetica Now / custom) para cuerpo. Titulos 28-40px, uppercase con letter-spacing 2-4px. Cuerpo 14px.
- **Colores**: Negro #000, blanco #FFF, beige/crema #F7F4EF. Dorado sutil en acentos. Casi monocromatico.
- **Grid**: 2-4 columnas. Imagenes con aspect-ratio 3:4 (vertical, moda). Hover: zoom sutil de imagen + aparicion de segundo color/variante.
- **Efectos**: Transiciones elegantes, carga progresiva de imagenes, menu fullscreen overlay con animacion slide.
- **Footer**: Negro, minimalista, columnas de links blancos, iconos sociales.

### 1.3 Nike (nike.com/es)
- **Navegacion**: Barra sticky blanca. Logo Swoosh izquierda. Menu central (Hombre, Mujer, Ninos, Ofertas). Busqueda expandible + favoritos + carrito derecha.
- **Hero**: Banner full-width con imagen lifestyle. Titulo bold grande (48-64px). Subtitulo corto. CTA boton negro solido con bordes redondeados (30px).
- **Tipografia**: Nike Futura / Helvetica Neue. Titulos bold condensed, uppercase. Cuerpo 16px regular. Letter-spacing 1.5px en titulos.
- **Colores**: Blanco #FFF fondo principal. Negro #111 textos/botones. Rojo Nike #C41E3A como acento en ofertas. Gris #757575 textos secundarios.
- **Grid**: 3 columnas desktop, 2 tablet, 1 movil. Gap 12-16px. Imagenes 1:1 o 4:5. Hover: escala 1.02 + shadow sutil.
- **Secciones home**: Banner promo top > Hero principal > Tendencias (carousel) > Destacados (grid 3col) > Categorias (cards grandes) > Deporte/Estilo (editorial) > Footer.
- **Efectos**: Carousels fluidos, lazy loading, transiciones hover 0.2s ease. Scroll horizontal en categorias.

### 1.4 iShop Colombia (co.tiendasishop.com)
- **Navegacion**: Header blanco sticky con barra de anuncio superior (envio gratis, etc). Logo iShop centrado. Menu categorias dropdown. Busqueda + cuenta + carrito.
- **Hero**: Slider con banners promocionales. Botones CTA "Comprar ahora" rectangulares.
- **Tipografia**: System fonts / Helvetica. Titulos 24-36px, semibold. Cuerpo 14-16px. Limpio y funcional.
- **Colores**: Blanco #FFF fondo. Negro #333 texto. Azul #0071E3 (Apple-like) para CTAs. Gris claro #F5F5F5 secciones alternas.
- **Grid**: 4 columnas desktop. Cards con padding generoso, sombra sutil. Precio destacado. Producto centrado en imagen.
- **Efectos**: Slider automtico, hover en cards con elevacion. Shopify como plataforma.

### 1.5 Stella Guan (stellaguan.com)
- **Navegacion**: Minimalista, transparente sobre hero. Logo personal a la izquierda. 4-5 items. Menu hamburguesa en movil.
- **Hero**: Imagen editorial full-viewport. Tipografia grande superpuesta con animacion de entrada. Estetica artistica/editorial.
- **Tipografia**: Serif elegante para titulos (tipo Playfair Display). Sans-serif para cuerpo. Titulos 48-72px. Letter-spacing amplio en subtitulos uppercase.
- **Colores**: Paleta suave, neutros calidos. Blanco roto, negro suave #222, acentos rosa/nude/terracota.
- **Grid**: 2 columnas con imagenes grandes editoriales. Espaciado generoso (gap 30-40px). Aspecto galeria de arte.
- **Efectos**: Parallax suave en secciones. Fade-in al scroll. Cursores personalizados. Transiciones lentas y elegantes (0.6-0.8s).
- **WordPress**: Usa WordPress como CMS.

### 1.6 Bombon.rs
- **Navegacion**: Header limpio, Next.js app. Minimalista con logo izquierda. Pocos items de menu. Carrito con badge.
- **Hero**: Composicion visual creativa. Tipografia display grande. Colores vibrantes o pasteles segun temporada.
- **Tipografia**: Fuentes modernas, combinacion display + sans-serif. Titulos con personalidad. Cuerpo 15-16px.
- **Colores**: Paleta de moda con tonos actuales. Fondos claros. Acentos de color bold para temporada.
- **Grid**: Grid asimetrico/masonry en algunas secciones. 3-4 columnas. Imagenes product-focused.
- **Efectos**: Animaciones de entrada suaves. Hover con zoom de imagen. Transiciones fluidas entre paginas.

---

## 2. Especificacion de Diseno VISNEX

### 2.1 Paleta de Colores

```css
:root {
  /* Primarios */
  --vn-black:         #0A0A0A;      /* Negro profundo - texto principal, nav */
  --vn-white:         #FFFFFF;      /* Blanco puro - fondos principales */
  --vn-off-white:     #FAFAFA;      /* Blanco roto - secciones alternas */

  /* Neutros */
  --vn-gray-100:      #F5F5F7;      /* Fondo secciones (inspirado Apple) */
  --vn-gray-200:      #E8E8ED;      /* Bordes, separadores */
  --vn-gray-300:      #D2D2D7;      /* Bordes hover */
  --vn-gray-500:      #86868B;      /* Texto secundario */
  --vn-gray-700:      #424245;      /* Texto terciario */
  --vn-gray-900:      #1D1D1F;      /* Texto sobre fondo claro (Apple) */

  /* Acento principal - Azul premium */
  --vn-accent:        #2997FF;      /* Links, CTAs secundarios (Apple blue) */
  --vn-accent-hover:  #0077ED;      /* Hover del acento */

  /* Acento moda - Para highlights */
  --vn-fashion:       #C8A97E;      /* Dorado suave (luxury feel, Gucci-inspired) */
  --vn-fashion-light: #E8D5B7;      /* Dorado claro para fondos */

  /* Funcionales */
  --vn-success:       #2D8A39;      /* En stock, confirmaciones */
  --vn-error:         #DE3B40;      /* Errores, ofertas/descuentos */
  --vn-warning:       #F5A623;      /* Alertas */

  /* Overlay */
  --vn-overlay:       rgba(0, 0, 0, 0.5);    /* Modales, menu mobile */
  --vn-overlay-light: rgba(0, 0, 0, 0.03);   /* Hover sutil */
}
```

### 2.2 Tipografia

**Fuentes seleccionadas:**
- **Titulos**: `"Inter"` (weight 300-700) - Limpia, moderna, excelente para display
- **Cuerpo**: `"Inter"` (weight 400-500) - Legibilidad superior
- **Acento/Editorial**: `"Playfair Display"` (weight 400-700) - Solo para secciones hero y titulos especiales (inspirado Stella Guan/Gucci)

```css
:root {
  /* Font Families */
  --vn-font-primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --vn-font-editorial:  'Playfair Display', Georgia, 'Times New Roman', serif;

  /* Scale tipografico (Mobile-first) */
  --vn-text-xs:    0.75rem;    /* 12px - legal, fine print */
  --vn-text-sm:    0.875rem;   /* 14px - labels, meta info */
  --vn-text-base:  1rem;       /* 16px - cuerpo principal */
  --vn-text-lg:    1.125rem;   /* 18px - cuerpo grande */
  --vn-text-xl:    1.25rem;    /* 20px - subtitulos */
  --vn-text-2xl:   1.5rem;     /* 24px - titulos seccion mobile */
  --vn-text-3xl:   1.875rem;   /* 30px - titulos seccion */
  --vn-text-4xl:   2.25rem;    /* 36px - hero mobile */
  --vn-text-5xl:   3rem;       /* 48px - hero desktop */
  --vn-text-6xl:   3.75rem;    /* 60px - hero grande */
  --vn-text-7xl:   4.5rem;     /* 72px - hero impacto (Stella Guan style) */

  /* Font Weights */
  --vn-weight-light:    300;
  --vn-weight-regular:  400;
  --vn-weight-medium:   500;
  --vn-weight-semibold: 600;
  --vn-weight-bold:     700;

  /* Letter Spacing */
  --vn-tracking-tight:    -0.022em;   /* Titulos grandes (Apple) */
  --vn-tracking-normal:    0;         /* Cuerpo */
  --vn-tracking-wide:      0.05em;    /* Subtitulos */
  --vn-tracking-wider:     0.1em;     /* Labels uppercase */
  --vn-tracking-widest:    0.2em;     /* CTAs uppercase (Gucci) */

  /* Line Heights */
  --vn-leading-none:    1;
  --vn-leading-tight:   1.15;    /* Titulos */
  --vn-leading-snug:    1.3;     /* Subtitulos */
  --vn-leading-normal:  1.6;     /* Cuerpo */
  --vn-leading-relaxed: 1.75;    /* Texto largo */
}

/* Clases tipograficas */
.vn-hero-title {
  font-family: var(--vn-font-editorial);
  font-size: var(--vn-text-5xl);
  font-weight: var(--vn-weight-regular);
  line-height: var(--vn-leading-tight);
  letter-spacing: var(--vn-tracking-tight);
  color: var(--vn-white);
}

@media (min-width: 768px) {
  .vn-hero-title {
    font-size: var(--vn-text-7xl);
  }
}

.vn-section-title {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-2xl);
  font-weight: var(--vn-weight-semibold);
  line-height: var(--vn-leading-tight);
  letter-spacing: var(--vn-tracking-tight);
  color: var(--vn-gray-900);
}

@media (min-width: 768px) {
  .vn-section-title {
    font-size: var(--vn-text-4xl);
  }
}

.vn-body {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-base);
  font-weight: var(--vn-weight-regular);
  line-height: var(--vn-leading-normal);
  color: var(--vn-gray-900);
}

.vn-label {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-xs);
  font-weight: var(--vn-weight-medium);
  letter-spacing: var(--vn-tracking-widest);
  text-transform: uppercase;
  color: var(--vn-gray-500);
}
```

### 2.3 Espaciado y Layout

```css
:root {
  /* Spacing scale */
  --vn-space-1:    0.25rem;    /* 4px */
  --vn-space-2:    0.5rem;     /* 8px */
  --vn-space-3:    0.75rem;    /* 12px */
  --vn-space-4:    1rem;       /* 16px */
  --vn-space-5:    1.25rem;    /* 20px */
  --vn-space-6:    1.5rem;     /* 24px */
  --vn-space-8:    2rem;       /* 32px */
  --vn-space-10:   2.5rem;     /* 40px */
  --vn-space-12:   3rem;       /* 48px */
  --vn-space-16:   4rem;       /* 64px */
  --vn-space-20:   5rem;       /* 80px */
  --vn-space-24:   6rem;       /* 96px */
  --vn-space-32:   8rem;       /* 128px */

  /* Container */
  --vn-container-sm:    640px;
  --vn-container-md:    768px;
  --vn-container-lg:    1024px;
  --vn-container-xl:    1280px;
  --vn-container-2xl:   1440px;
  --vn-container-pad:   clamp(1rem, 5vw, 3rem);  /* Padding lateral responsive */

  /* Border Radius */
  --vn-radius-none:  0;
  --vn-radius-sm:    4px;     /* Inputs, tags */
  --vn-radius-md:    8px;     /* Cards, botones */
  --vn-radius-lg:    12px;    /* Cards grandes */
  --vn-radius-xl:    16px;    /* Modales */
  --vn-radius-2xl:   24px;    /* Botones pill (Nike style) */
  --vn-radius-full:  9999px;  /* Circulos, badges */

  /* Shadows */
  --vn-shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.05);
  --vn-shadow-md:    0 4px 12px rgba(0, 0, 0, 0.08);
  --vn-shadow-lg:    0 8px 30px rgba(0, 0, 0, 0.12);
  --vn-shadow-xl:    0 20px 60px rgba(0, 0, 0, 0.15);
  --vn-shadow-card:  0 2px 8px rgba(0, 0, 0, 0.06);
  --vn-shadow-card-hover: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

### 2.4 Navegacion / Header

**Inspiracion principal**: Apple (transparencia + blur) + Gucci (logo centrado prominente)

```css
/* Header */
.vn-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 52px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estado: sobre hero (transparente) */
.vn-header--transparent {
  background: transparent;
  color: var(--vn-white);
}

/* Estado: scroll (blur glass) */
.vn-header--scrolled {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--vn-gray-900);
}
```

**Estructura del header:**
```
[Hamburger(mobile)] [Logo VISNEX centrado] [Busqueda] [Cuenta] [Carrito(badge)]
```

**Menu desktop (debajo del header, aparece al hover):**
- Maximo 6 items: `Mujer` | `Hombre` | `Accesorios` | `Nuevos` | `Sale` | `Marcas`
- Submenu: Overlay fullscreen con backdrop blur, columnas de categorias, imagen editorial a la derecha
- Animacion: Slide down 0.3s + fade del overlay

**Menu mobile:**
- Overlay fullscreen desde la izquierda
- Slide-in 0.4s ease
- Items grandes (48px alto minimo) para facilitar tap
- Acordeon para subcategorias

### 2.5 Secciones del Homepage (en orden)

#### Seccion 0: Barra de Anuncio (Announcement Bar)
**Inspiracion**: Nike + iShop
```css
.vn-announcement {
  height: 36px;
  background: var(--vn-black);
  color: var(--vn-white);
  font-size: var(--vn-text-xs);
  font-weight: var(--vn-weight-medium);
  letter-spacing: var(--vn-tracking-wide);
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}
```
- Contenido: "Envio gratis en compras +$200.000" o promo activa
- Puede cerrarse con X (se oculta con slide up)

#### Seccion 1: Hero Principal
**Inspiracion**: Apple (impacto visual) + Stella Guan (editorial fashion)

- **Altura**: 100vh (viewport completo) menos header
- **Contenido**: Imagen/video full-bleed de campaña de moda
- **Overlay**: Gradiente sutil `linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)`
- **Texto**: Centrado inferior, titulo editorial con Playfair Display
- **CTAs**: 2 botones lado a lado

```css
.vn-hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  max-height: 1200px;
  overflow: hidden;
}

.vn-hero__image {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
  transform: scale(1);
  transition: transform 8s ease-out;  /* Ken Burns suave */
}

.vn-hero.is-visible .vn-hero__image {
  transform: scale(1.05);
}

.vn-hero__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--vn-space-16) var(--vn-container-pad) var(--vn-space-20);
  text-align: center;
  color: var(--vn-white);
}

.vn-hero__title {
  font-family: var(--vn-font-editorial);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: var(--vn-weight-regular);
  line-height: var(--vn-leading-tight);
  letter-spacing: var(--vn-tracking-tight);
  margin-bottom: var(--vn-space-4);
}

.vn-hero__subtitle {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-lg);
  font-weight: var(--vn-weight-light);
  letter-spacing: var(--vn-tracking-wide);
  margin-bottom: var(--vn-space-8);
  opacity: 0.9;
}
```

#### Seccion 2: Categorias Destacadas
**Inspiracion**: Nike (cards grandes) + Apple (grid limpio)

- **Layout**: Grid de 3 columnas (desktop), 1 columna (mobile)
- **Cards**: Imagen full, aspect-ratio 4:5, titulo superpuesto abajo
- **Categorias**: "Mujer", "Hombre", "Accesorios"
- **Hover**: Zoom imagen 1.05 + oscurecimiento overlay

```css
.vn-categories {
  padding: var(--vn-space-20) var(--vn-container-pad);
  background: var(--vn-white);
}

.vn-categories__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--vn-space-4);
  max-width: var(--vn-container-2xl);
  margin: 0 auto;
}

@media (max-width: 768px) {
  .vn-categories__grid {
    grid-template-columns: 1fr;
    gap: var(--vn-space-3);
  }
}

.vn-category-card {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  cursor: pointer;
  border-radius: var(--vn-radius-md);
}

.vn-category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.vn-category-card:hover img {
  transform: scale(1.05);
}

.vn-category-card__label {
  position: absolute;
  bottom: var(--vn-space-8);
  left: var(--vn-space-8);
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-2xl);
  font-weight: var(--vn-weight-semibold);
  color: var(--vn-white);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

#### Seccion 3: Productos Nuevos (Carousel)
**Inspiracion**: Nike (carousel horizontal) + iShop (cards de producto)

- **Titulo de seccion**: "Recien Llegados" con link "Ver todos >"
- **Layout**: Carousel horizontal con scroll snap
- **Productos**: 4 visibles en desktop, 1.5 en mobile (peek effect)

```css
.vn-new-arrivals {
  padding: var(--vn-space-16) 0;
  background: var(--vn-off-white);
}

.vn-new-arrivals__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 var(--vn-container-pad);
  margin-bottom: var(--vn-space-8);
  max-width: var(--vn-container-2xl);
  margin-left: auto;
  margin-right: auto;
}

.vn-carousel {
  display: flex;
  gap: var(--vn-space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 0 var(--vn-container-pad);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.vn-carousel::-webkit-scrollbar {
  display: none;
}

.vn-carousel__item {
  flex: 0 0 calc(25% - var(--vn-space-3));
  scroll-snap-align: start;
}

@media (max-width: 1024px) {
  .vn-carousel__item {
    flex: 0 0 calc(33.333% - var(--vn-space-3));
  }
}

@media (max-width: 768px) {
  .vn-carousel__item {
    flex: 0 0 calc(70%);  /* Peek del siguiente */
  }
}
```

#### Seccion 4: Banner Editorial (Split)
**Inspiracion**: Gucci (editorial) + Apple (impacto)

- **Layout**: 50/50 imagen + texto (alterna en cada aparicion)
- **Imagen**: Foto editorial de moda, aspect-ratio libre
- **Texto**: Lado opuesto, centrado vertical: label + titulo + parrafo + CTA

```css
.vn-editorial {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 80vh;
}

@media (max-width: 768px) {
  .vn-editorial {
    grid-template-columns: 1fr;
  }
}

.vn-editorial__image {
  overflow: hidden;
}

.vn-editorial__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.vn-editorial__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--vn-space-16) var(--vn-space-12);
  background: var(--vn-gray-100);
}

.vn-editorial__label {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-xs);
  font-weight: var(--vn-weight-medium);
  letter-spacing: var(--vn-tracking-widest);
  text-transform: uppercase;
  color: var(--vn-fashion);
  margin-bottom: var(--vn-space-4);
}

.vn-editorial__title {
  font-family: var(--vn-font-editorial);
  font-size: clamp(1.875rem, 3vw, 3rem);
  font-weight: var(--vn-weight-regular);
  line-height: var(--vn-leading-tight);
  color: var(--vn-gray-900);
  margin-bottom: var(--vn-space-6);
}
```

#### Seccion 5: Grid de Productos Tendencia
**Inspiracion**: Nike (grid solido) + Bombon.rs (asimetria)

- **Titulo**: "Tendencia" o "Lo Mas Buscado"
- **Layout**: Grid 4 columnas desktop, 2 mobile
- **8-12 productos visibles**, boton "Ver mas" al final

```css
.vn-trending {
  padding: var(--vn-space-20) var(--vn-container-pad);
  background: var(--vn-white);
  max-width: var(--vn-container-2xl);
  margin: 0 auto;
}

.vn-product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--vn-space-4);
}

@media (max-width: 1024px) {
  .vn-product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .vn-product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--vn-space-2);
  }
}
```

#### Seccion 6: Coleccion Destacada (Full-width)
**Inspiracion**: Apple (seccion inmersiva) + Gucci (mood)

- **Altura**: 70-90vh
- **Fondo oscuro** con imagen de coleccion
- **Texto centrado** blanco sobre oscuro
- **CTA**: "Explorar coleccion"

```css
.vn-collection-hero {
  position: relative;
  height: 80vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--vn-white);
  overflow: hidden;
}

.vn-collection-hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Parallax suave */
}

@media (max-width: 768px) {
  .vn-collection-hero__bg {
    background-attachment: scroll; /* Sin parallax en mobile */
  }
}
```

#### Seccion 7: Marcas / Proveedores
**Inspiracion**: iShop (logos de marca)

- **Layout**: Fila de logos, scroll horizontal o grid
- **Logos**: Monocromo (grayscale), al hover se colorean
- **Fondo**: var(--vn-gray-100)

```css
.vn-brands {
  padding: var(--vn-space-16) var(--vn-container-pad);
  background: var(--vn-gray-100);
}

.vn-brands__grid {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--vn-space-10);
  max-width: var(--vn-container-xl);
  margin: 0 auto;
}

.vn-brands__logo {
  height: 32px;
  opacity: 0.4;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.vn-brands__logo:hover {
  opacity: 1;
  filter: grayscale(0%);
}
```

#### Seccion 8: Propuesta de Valor / Trust
**Inspiracion**: Nike + iShop

- **Layout**: 4 columnas con icono + texto
- **Items**: Envio Gratis | Devolucion Facil | Pago Seguro | Atencion 24/7
- **Iconos**: Linea fina, monocromo, 24x24px

```css
.vn-trust {
  padding: var(--vn-space-12) var(--vn-container-pad);
  border-top: 1px solid var(--vn-gray-200);
  border-bottom: 1px solid var(--vn-gray-200);
}

.vn-trust__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--vn-space-6);
  max-width: var(--vn-container-xl);
  margin: 0 auto;
  text-align: center;
}

@media (max-width: 768px) {
  .vn-trust__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vn-trust__icon {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--vn-space-3);
  stroke: var(--vn-gray-900);
  stroke-width: 1.5px;
}

.vn-trust__title {
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-semibold);
  margin-bottom: var(--vn-space-1);
}

.vn-trust__text {
  font-size: var(--vn-text-xs);
  color: var(--vn-gray-500);
}
```

#### Seccion 9: Newsletter
**Inspiracion**: Gucci + Stella Guan

- **Fondo**: var(--vn-black)
- **Texto**: Blanco, centrado
- **Input**: Estilo minimal, borde inferior blanco, sin borde completo
- **Boton**: Blanco sobre negro, o outline blanco

```css
.vn-newsletter {
  padding: var(--vn-space-20) var(--vn-container-pad);
  background: var(--vn-black);
  text-align: center;
  color: var(--vn-white);
}

.vn-newsletter__title {
  font-family: var(--vn-font-editorial);
  font-size: var(--vn-text-3xl);
  margin-bottom: var(--vn-space-3);
}

.vn-newsletter__subtitle {
  font-size: var(--vn-text-base);
  color: var(--vn-gray-500);
  margin-bottom: var(--vn-space-8);
}

.vn-newsletter__form {
  display: flex;
  max-width: 480px;
  margin: 0 auto;
  gap: var(--vn-space-3);
}

.vn-newsletter__input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--vn-white);
  font-size: var(--vn-text-base);
  padding: var(--vn-space-3) 0;
  outline: none;
  transition: border-color 0.3s;
}

.vn-newsletter__input:focus {
  border-color: var(--vn-white);
}

.vn-newsletter__input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.vn-newsletter__btn {
  background: var(--vn-white);
  color: var(--vn-black);
  border: none;
  padding: var(--vn-space-3) var(--vn-space-6);
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-semibold);
  letter-spacing: var(--vn-tracking-wider);
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.3s;
}

.vn-newsletter__btn:hover {
  opacity: 0.85;
}
```

### 2.6 Footer
**Inspiracion**: Apple (estructura columnar, limpio) + Gucci (oscuro elegante)

```css
.vn-footer {
  background: var(--vn-gray-100);
  padding: var(--vn-space-16) var(--vn-container-pad) var(--vn-space-8);
}

.vn-footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: var(--vn-space-8);
  max-width: var(--vn-container-2xl);
  margin: 0 auto;
}

@media (max-width: 768px) {
  .vn-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

**Columnas del footer:**
1. **VISNEX** - Logo + descripcion breve + redes sociales (iconos 20px)
2. **Comprar** - Mujer, Hombre, Accesorios, Nuevos, Sale
3. **Ayuda** - Contacto, Envios, Devoluciones, Tallas, FAQ
4. **Legal** - Privacidad, Terminos, Cookies

**Bottom bar**: Copyright + metodos de pago (iconos SVG monocromo)

```css
.vn-footer__bottom {
  margin-top: var(--vn-space-12);
  padding-top: var(--vn-space-6);
  border-top: 1px solid var(--vn-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--vn-text-xs);
  color: var(--vn-gray-500);
}
```

### 2.7 Tarjeta de Producto (Product Card)

**Inspiracion**: Nike (limpia, funcional) + Gucci (hover elegante)

```css
.vn-product-card {
  position: relative;
  cursor: pointer;
}

/* Imagen del producto */
.vn-product-card__image-wrapper {
  position: relative;
  aspect-ratio: 3 / 4;        /* Vertical - estandar moda */
  overflow: hidden;
  background: var(--vn-gray-100);
  border-radius: var(--vn-radius-md);
  margin-bottom: var(--vn-space-3);
}

.vn-product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Segunda imagen al hover (hover swap - Gucci/Zara style) */
.vn-product-card__image--hover {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.vn-product-card:hover .vn-product-card__image--hover {
  opacity: 1;
}

.vn-product-card:hover .vn-product-card__image {
  transform: scale(1.03);
}

/* Badge: NUEVO, -30%, etc */
.vn-product-card__badge {
  position: absolute;
  top: var(--vn-space-3);
  left: var(--vn-space-3);
  background: var(--vn-black);
  color: var(--vn-white);
  font-size: var(--vn-text-xs);
  font-weight: var(--vn-weight-medium);
  letter-spacing: var(--vn-tracking-wider);
  text-transform: uppercase;
  padding: var(--vn-space-1) var(--vn-space-2);
  border-radius: var(--vn-radius-sm);
}

.vn-product-card__badge--sale {
  background: var(--vn-error);
}

/* Quick add - aparece en hover */
.vn-product-card__quick-add {
  position: absolute;
  bottom: var(--vn-space-3);
  left: var(--vn-space-3);
  right: var(--vn-space-3);
  background: var(--vn-white);
  color: var(--vn-black);
  border: none;
  padding: var(--vn-space-3);
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-semibold);
  letter-spacing: var(--vn-tracking-wide);
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s ease;
  border-radius: var(--vn-radius-sm);
}

.vn-product-card:hover .vn-product-card__quick-add {
  opacity: 1;
  transform: translateY(0);
}

/* Wishlist heart */
.vn-product-card__wishlist {
  position: absolute;
  top: var(--vn-space-3);
  right: var(--vn-space-3);
  width: 36px;
  height: 36px;
  background: var(--vn-white);
  border-radius: var(--vn-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  box-shadow: var(--vn-shadow-sm);
}

.vn-product-card:hover .vn-product-card__wishlist {
  opacity: 1;
}

/* Info del producto */
.vn-product-card__info {
  padding: 0 var(--vn-space-1);
}

.vn-product-card__brand {
  font-size: var(--vn-text-xs);
  font-weight: var(--vn-weight-medium);
  color: var(--vn-gray-500);
  letter-spacing: var(--vn-tracking-wider);
  text-transform: uppercase;
  margin-bottom: var(--vn-space-1);
}

.vn-product-card__name {
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-medium);
  color: var(--vn-gray-900);
  margin-bottom: var(--vn-space-1);
  line-height: var(--vn-leading-snug);

  /* Truncar a 2 lineas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vn-product-card__price {
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-semibold);
  color: var(--vn-gray-900);
}

.vn-product-card__price--original {
  text-decoration: line-through;
  color: var(--vn-gray-500);
  font-weight: var(--vn-weight-regular);
  margin-left: var(--vn-space-2);
}

.vn-product-card__price--sale {
  color: var(--vn-error);
}

/* Colores disponibles (dots) */
.vn-product-card__colors {
  display: flex;
  gap: var(--vn-space-1);
  margin-top: var(--vn-space-2);
}

.vn-product-card__color-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--vn-radius-full);
  border: 1px solid var(--vn-gray-200);
}
```

### 2.8 Botones

```css
/* Boton primario - Negro solido (Nike) */
.vn-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--vn-space-2);
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-semibold);
  letter-spacing: var(--vn-tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.vn-btn--primary {
  background: var(--vn-black);
  color: var(--vn-white);
  padding: var(--vn-space-4) var(--vn-space-8);
  border-radius: var(--vn-radius-2xl);  /* Pill shape - Nike */
}

.vn-btn--primary:hover {
  background: var(--vn-gray-700);
}

/* Boton secundario - Outline (Gucci) */
.vn-btn--secondary {
  background: transparent;
  color: var(--vn-gray-900);
  padding: var(--vn-space-4) var(--vn-space-8);
  border: 1.5px solid var(--vn-gray-900);
  border-radius: var(--vn-radius-2xl);
}

.vn-btn--secondary:hover {
  background: var(--vn-gray-900);
  color: var(--vn-white);
}

/* Boton sobre fondo oscuro */
.vn-btn--white {
  background: var(--vn-white);
  color: var(--vn-black);
  padding: var(--vn-space-4) var(--vn-space-8);
  border-radius: var(--vn-radius-2xl);
}

.vn-btn--white:hover {
  background: var(--vn-gray-200);
}

/* Link button (Apple "Mas informacion >") */
.vn-btn--link {
  background: none;
  color: var(--vn-accent);
  padding: 0;
  font-size: var(--vn-text-base);
  text-transform: none;
  letter-spacing: normal;
}

.vn-btn--link:hover {
  text-decoration: underline;
}

/* Tamanos */
.vn-btn--sm {
  font-size: var(--vn-text-xs);
  padding: var(--vn-space-2) var(--vn-space-5);
}

.vn-btn--lg {
  font-size: var(--vn-text-base);
  padding: var(--vn-space-5) var(--vn-space-10);
}
```

### 2.9 Animaciones y Efectos

```css
/* ============================================
   ANIMACIONES - Inspiracion cruzada
   Apple: Fade-in al scroll, suave
   Stella Guan: Parallax, transiciones lentas
   Nike: Rapido, energico
   Gucci: Elegante, minimal
   ============================================ */

/* Fade in desde abajo (para elementos al hacer scroll) */
.vn-animate-in {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.vn-animate-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger para grids (cada hijo aparece con delay) */
.vn-stagger > .vn-animate-in:nth-child(1) { transition-delay: 0ms; }
.vn-stagger > .vn-animate-in:nth-child(2) { transition-delay: 80ms; }
.vn-stagger > .vn-animate-in:nth-child(3) { transition-delay: 160ms; }
.vn-stagger > .vn-animate-in:nth-child(4) { transition-delay: 240ms; }
.vn-stagger > .vn-animate-in:nth-child(5) { transition-delay: 320ms; }
.vn-stagger > .vn-animate-in:nth-child(6) { transition-delay: 400ms; }
.vn-stagger > .vn-animate-in:nth-child(7) { transition-delay: 480ms; }
.vn-stagger > .vn-animate-in:nth-child(8) { transition-delay: 560ms; }

/* Parallax suave (solo desktop) */
@media (min-width: 1024px) {
  .vn-parallax {
    will-change: transform;
    transition: transform 0.1s linear;
  }
}

/* Cursor personalizado para links de imagen (Stella Guan inspired) */
@media (hover: hover) {
  .vn-cursor-view {
    cursor: none;
  }

  .vn-cursor-view::after {
    content: 'VER';
    position: fixed;
    pointer-events: none;
    width: 80px;
    height: 80px;
    background: var(--vn-black);
    color: var(--vn-white);
    border-radius: var(--vn-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--vn-text-xs);
    font-weight: var(--vn-weight-semibold);
    letter-spacing: var(--vn-tracking-widest);
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.3s, transform 0.3s;
  }

  .vn-cursor-view:hover::after {
    opacity: 1;
    transform: scale(1);
  }
}

/* Transiciones de pagina (para SPA feel) */
.vn-page-transition-enter {
  opacity: 0;
}

.vn-page-transition-enter-active {
  opacity: 1;
  transition: opacity 0.4s ease;
}

/* Smooth scroll global */
html {
  scroll-behavior: smooth;
}

/* Reducir motion para usuarios que lo prefieren */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .vn-animate-in {
    opacity: 1;
    transform: none;
  }
}
```

**JavaScript para Intersection Observer (activar animaciones al scroll):**
```javascript
// Activar animaciones cuando los elementos entran al viewport
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.vn-animate-in').forEach(el => {
  observer.observe(el);
});
```

### 2.10 Responsive Breakpoints

```css
/* Breakpoints */
/* Mobile:       < 640px   */
/* Mobile-lg:    640-767px  */
/* Tablet:       768-1023px */
/* Desktop:      1024-1279px */
/* Desktop-lg:   1280-1439px */
/* Desktop-xl:   >= 1440px  */

@media (max-width: 639px)  { /* mobile */ }
@media (min-width: 640px)  { /* mobile-lg+ */ }
@media (min-width: 768px)  { /* tablet+ */ }
@media (min-width: 1024px) { /* desktop+ */ }
@media (min-width: 1280px) { /* desktop-lg+ */ }
@media (min-width: 1440px) { /* desktop-xl+ */ }
```

### 2.11 Pagina de Producto (PDP)

**Inspiracion**: Apple (galeria limpia) + Nike (info organizada) + Gucci (elegancia)

**Layout desktop**: 60% galeria izquierda | 40% info derecha (sticky)

```css
.vn-pdp {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 0;
  max-width: var(--vn-container-2xl);
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .vn-pdp {
    grid-template-columns: 1fr;
  }
}

/* Galeria - scroll vertical de imagenes */
.vn-pdp__gallery {
  display: flex;
  flex-direction: column;
  gap: var(--vn-space-2);
}

.vn-pdp__gallery img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

/* Info - sticky en desktop */
.vn-pdp__info {
  padding: var(--vn-space-12) var(--vn-space-8);
  position: sticky;
  top: 60px;
  height: fit-content;
}

.vn-pdp__brand {
  font-size: var(--vn-text-xs);
  letter-spacing: var(--vn-tracking-widest);
  text-transform: uppercase;
  color: var(--vn-gray-500);
  margin-bottom: var(--vn-space-2);
}

.vn-pdp__name {
  font-family: var(--vn-font-primary);
  font-size: var(--vn-text-2xl);
  font-weight: var(--vn-weight-semibold);
  color: var(--vn-gray-900);
  margin-bottom: var(--vn-space-3);
}

.vn-pdp__price {
  font-size: var(--vn-text-xl);
  font-weight: var(--vn-weight-semibold);
  margin-bottom: var(--vn-space-6);
}

/* Selector de talla */
.vn-size-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: var(--vn-space-2);
  margin-bottom: var(--vn-space-6);
}

.vn-size-btn {
  padding: var(--vn-space-3);
  border: 1px solid var(--vn-gray-200);
  border-radius: var(--vn-radius-sm);
  background: var(--vn-white);
  font-size: var(--vn-text-sm);
  font-weight: var(--vn-weight-medium);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.vn-size-btn:hover {
  border-color: var(--vn-gray-900);
}

.vn-size-btn--selected {
  background: var(--vn-black);
  color: var(--vn-white);
  border-color: var(--vn-black);
}

.vn-size-btn--disabled {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Boton agregar al carrito */
.vn-add-to-cart {
  width: 100%;
  padding: var(--vn-space-5);
  background: var(--vn-black);
  color: var(--vn-white);
  border: none;
  border-radius: var(--vn-radius-2xl);
  font-size: var(--vn-text-base);
  font-weight: var(--vn-weight-semibold);
  letter-spacing: var(--vn-tracking-wide);
  cursor: pointer;
  transition: background 0.3s;
}

.vn-add-to-cart:hover {
  background: var(--vn-gray-700);
}

/* Acordeones de info */
.vn-accordion {
  border-top: 1px solid var(--vn-gray-200);
}

.vn-accordion__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--vn-space-5) 0;
  cursor: pointer;
  font-weight: var(--vn-weight-medium);
  font-size: var(--vn-text-sm);
}

.vn-accordion__body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.vn-accordion.is-open .vn-accordion__body {
  max-height: 500px;
}
```

---

## 3. Resumen de Decisiones de Diseno

| Elemento | Valor VISNEX | Inspiracion |
|----------|-------------|-------------|
| Nav background | Blur glass transparente | Apple |
| Nav items | 6 maximo | Gucci |
| Hero height | 100vh | Apple + Stella Guan |
| Hero font | Playfair Display serif | Stella Guan + Gucci |
| Body font | Inter sans-serif | Apple (SF Pro equivalent) |
| Product image ratio | 3:4 vertical | Gucci + moda estandar |
| Product grid | 4 col desktop, 2 mobile | Nike |
| Hover efecto cards | Image swap + zoom 1.03 | Gucci + Nike |
| Botones forma | Pill (border-radius 24px) | Nike |
| Botones color | Negro solido, outline secundario | Nike + Gucci |
| Seccion fondo alterno | Blanco / #F5F5F7 | Apple |
| Sombras | Sutiles, apenas perceptibles | Apple |
| Animaciones scroll | Fade-in + translateY(30px) | Apple + Stella Guan |
| Stagger delay | 80ms entre items | Nike |
| Color acento | Dorado suave #C8A97E | Gucci (luxury feel) |
| Color links | Azul #2997FF | Apple |
| Footer | Gris claro, columnar | Apple |
| Newsletter | Fondo negro, input minimal | Gucci |
| Parallax | Solo desktop, background-attachment fixed | Stella Guan |
| Mobile menu | Fullscreen overlay slide-in | Gucci |
| Announcement bar | Negra, uppercase, 36px alto | Nike + iShop |
| PDP layout | 60/40 galeria/info, info sticky | Apple + Nike |

---

## 4. Orden de Secciones Homepage (Final)

```
1.  Announcement Bar         (36px, negro, promo activa)
2.  Header/Nav               (52px, fixed, blur glass)
3.  Hero Principal            (100vh, editorial fashion, 2 CTAs)
4.  Categorias Destacadas     (3 cards 4:5, Mujer/Hombre/Accesorios)
5.  Recien Llegados           (Carousel horizontal, 4 productos visibles)
6.  Banner Editorial Split    (50/50 imagen + texto, label dorado)
7.  Tendencia / Lo Mas Buscado (Grid 4x2, 8 productos)
8.  Coleccion Destacada       (Full-width 80vh, parallax, CTA centrado)
9.  Marcas                    (Logos grayscale, hover color)
10. Propuesta de Valor        (4 iconos: envio, devolucion, pago, atencion)
11. Newsletter                (Fondo negro, Playfair title, input minimal)
12. Footer                    (4 columnas, gris claro, redes + pagos)
```

---

## 5. Fuentes a Cargar (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

---

## 6. Iconos Recomendados

- **Libreria**: Lucide Icons (open source, linea fina, consistente)
- **Tamano nav**: 20px
- **Tamano trust bar**: 40px
- **Stroke width**: 1.5px
- **Iconos clave**: Search, User, ShoppingBag, Heart, ChevronDown, Menu, X, Truck, RotateCcw, Shield, Headphones

---

## 7. Imagenes

- **Hero**: Minimo 1920x1080px, comprimidas WebP con fallback JPG
- **Product cards**: 600x800px minimo (3:4), WebP
- **Editorial**: 1200x1600px (3:4) o 1920x1080 (16:9)
- **Lazy loading**: Todas las imagenes debajo del fold
- **Placeholder**: Fondo `var(--vn-gray-100)` con shimmer animation

```css
/* Shimmer placeholder para lazy loading */
@keyframes vn-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.vn-image-placeholder {
  background: linear-gradient(
    90deg,
    var(--vn-gray-100) 25%,
    var(--vn-gray-200) 50%,
    var(--vn-gray-100) 75%
  );
  background-size: 200% 100%;
  animation: vn-shimmer 1.5s ease-in-out infinite;
}
```
