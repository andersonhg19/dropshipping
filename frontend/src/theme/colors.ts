export const brand = {
  0: '#ffffff', // blanco, fondo general
  50: '#e8eff4', // celeste muy claro, background general
  100: '#b3e3f9', // celeste claro, headers/fondos alternos
  200: '#2ca9e3', // celeste, botones hover/focus (también usado en tabs hover)
  300: 'rgba(44,169,227,0.7)', // celeste transparencia 70% (tabs secundarias hover)
  400: '#003c64', // celeste oscuro, botones/tabs principales/títulos fondo claro
  500: 'rgba(0,60,100,0.7)', // celeste oscuro transparencia 70% (tabs secundarias normal)
  600: '#002a4c',
  700: '#001f33',
  800: '#001a29',
  900: '#000d14',
}

export const purple = {
  50: 'hsl(270, 100%, 98%)',
  100: 'hsl(270, 90%, 95%)',
  200: 'hsl(270, 80%, 90%)',
  300: 'hsl(270, 70%, 80%)',
  400: 'hsl(270, 60%, 65%)',
  500: 'hsl(270, 50%, 50%)',
  600: 'hsl(270, 40%, 40%)',
  700: 'hsl(270, 30%, 30%)',
  800: 'hsl(270, 20%, 20%)',
  900: 'hsl(270, 10%, 10%)',
}

export const gray = {
  50: 'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%, 6%)',
  900: 'hsl(220, 35%, 3%)',
}

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
}

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
}

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
}

const primitives = { brand, gray, green, orange, red, purple }
export default primitives
