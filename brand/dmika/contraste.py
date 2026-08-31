def lin(c):
    c = c/255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def L(hexs):
    h = hexs.lstrip('#'); r,g,b = (int(h[i:i+2],16) for i in (0,2,4))
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)
def ratio(a,b):
    la, lb = L(a), L(b)
    hi, lo = max(la,lb), min(la,lb)
    return (hi+0.05)/(lo+0.05)

P = {'Negro Carbon':'#171717','Marfil Calido':'#F4EFE7','Beige Arena':'#D8C7B0',
     'Dorado Champagne':'#B99A5E','Marron Moka':'#6F5A4A','Blanco Limpio':'#FFFFFF'}
fondos = [('Marfil','#F4EFE7'), ('Blanco','#FFFFFF'), ('Negro','#171717'), ('Arena','#D8C7B0')]

print(f"{'TEXTO':<20}" + "".join(f"{n:>12}" for n,_ in fondos))
for nombre, hx in P.items():
    fila = f"{nombre:<20}"
    for _, bg in fondos:
        r = ratio(hx, bg)
        marca = 'AA' if r>=4.5 else ('AAg' if r>=3 else 'X')
        fila += f"{r:>8.2f} {marca:<3}"
    print(fila)

print("\nBuscando un dorado legible sobre marfil (>=4.5:1):")
for cand in ['#8C6F3A','#836838','#7A6030','#6E5629','#8A6B2E']:
    print(f"  {cand}  marfil {ratio(cand,'#F4EFE7'):.2f}  blanco {ratio(cand,'#FFFFFF'):.2f}")
