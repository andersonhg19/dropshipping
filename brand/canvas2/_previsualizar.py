# -*- coding: utf-8 -*-
"""
Convierte un .dc.html en HTML plano para poder MIRARLO antes de guardarlo.

El formato de artboard depende de un runtime que solo existe dentro del lienzo,
asi que un .dc.html no se abre en el navegador tal cual. Esto quita el envoltorio
(<x-dc>, <helmet>, el <script src="./support.js">), incrusta las fotos como
data: y deja una pagina normal.

Solo sirve para los artboards ESTATICOS. El interactivo (Vitrina) usa
{{holes}} y <sc-for>, que sin el runtime no se resuelven: para ese se hace una
resolucion minima aqui mismo, suficiente para ver la maqueta parada.
"""
import base64
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))


def data_uri(nombre):
    ruta = os.path.join(AQUI, nombre)
    if not os.path.exists(ruta):
        return None
    ext = nombre.rsplit('.', 1)[-1].lower()
    mime = {'jpg': 'jpeg', 'jpeg': 'jpeg', 'png': 'png', 'webp': 'webp'}.get(ext, ext)
    b = base64.b64encode(open(ruta, 'rb').read()).decode()
    return f'data:image/{mime};base64,{b}'


def plano(nombre_dc, sustituciones=None):
    s = open(os.path.join(AQUI, nombre_dc), encoding='utf-8').read()

    # Fuera el envoltorio del formato.
    s = s.replace('<script src="./support.js"></script>', '')
    s = s.replace('<x-dc>', '').replace('</x-dc>', '')
    s = s.replace('<helmet>', '').replace('</helmet>', '')
    # Fuera la logica: aqui no hay runtime que la ejecute.
    s = re.sub(r'<script data-dc-script>.*?</script>', '', s, flags=re.S)

    # Los <sc-for> se dejan con una sola repeticion, la del marcador.
    s = re.sub(r'<sc-for[^>]*>', '', s)
    s = s.replace('</sc-for>', '')

    # Valores fijos para ver la maqueta parada.
    for k, v in (sustituciones or {}).items():
        s = s.replace('{{' + k + '}}', v)
    # Lo que quede sin resolver, fuera, para que no se lea "{{...}}".
    s = re.sub(r'\{\{[^}]*\}\}', '', s)

    # Las fotos, incrustadas.
    for f in os.listdir(AQUI):
        if f.lower().endswith(('.jpg', '.png', '.webp')):
            uri = data_uri(f)
            if uri:
                s = s.replace(f'"{f}"', f'"{uri}"')
    return s


if __name__ == '__main__':
    salidas = []
    for n in ['Main.dc.html', 'Atelier.dc.html', 'Editorial.dc.html']:
        out = '_ver-' + n.replace('.dc.html', '.html')
        open(os.path.join(AQUI, out), 'w', encoding='utf-8').write(plano(n))
        salidas.append(out)

    # Vitrina: se fija un estado (crudo / talla M) para verla parada.
    out = '_ver-Vitrina.html'
    open(os.path.join(AQUI, out), 'w', encoding='utf-8').write(
        plano('Vitrina.dc.html', {
            'foto': 'blazer-mujer.jpg',
            'nombreColor': 'Crudo',
            'm.clase': 'mini on', 'm.foto': 'blazer-mujer.jpg',
            'c.clase': 'color on', 'c.estilo': 'background:#E8DFD1', 'c.nombre': 'Crudo',
            's.clase': 'talla on', 's.t': 'M',
        }))
    salidas.append(out)
    print('\n'.join(salidas))
