---
name: clickandlove-wedding-style
description: >-
  Replica con fidelidad exacta la línea gráfica, dirección de arte, tipografías
  originales (Eyesome Script, RoxboroughCF, Lato), textura de papel verjurado,
  ilustraciones en acuarela y estructura editorial de la invitación de boda
  "Claudia y Óscar" (clickandlove.lat/claudiayoscar) y su tarjeta PDF con sobre
  y sello de lacre. Activa esta skill siempre que el usuario pida crear,
  diseñar, maquetar o actualizar una invitación de boda, landing page nupcial
  o tarjeta de invitación con este estilo.
---

# Click & Love Wedding Style — Guía de Línea Gráfica y Diseño ("Claudia y Óscar")

Esta skill dota al agente de todos los recursos gráficos, fuentes originales (`.woff`), texturas de papel especial, ilustraciones en acuarela y reglas de composición para replicar al 100% el estilo editorial nupcial de **Click & Love (`clickandlove.lat/claudiayoscar`)**.

---

## 1. Principios Esenciales de la Línea Gráfica

Cuando construyas o modifiques una invitación de boda usando esta skill, aplica estrictamente estos **6 pilares visuales**:

1. **Formato de Pliego Vertical de Papel Verjurado (`516px` Paper Strip)**:
   - Nunca uses tarjetas flotantes modernas con bordes redondeados (`border-radius: 20px`) ni sombras pesadas tipo dashboard.
   - El diseño consiste en una **franja vertical continua de `516px` de ancho** centrada en la pantalla (`margin: 0 auto`), con fondo exterior blanco (`#ffffff`) en pantallas grandes y `100%` de ancho en móviles.
   - Toda la franja de `516px` lleva como fondo continuo la textura de **papel fino verjurado/acanalado color marfil** (`resources/media/paper-texture.jpg`, color base `#f5f2eb`), con una columna interna de lectura de **`425px`**.
2. **Trinidad Tipográfica Exacta (Fuentes Locales Incluidas)**:
   - **Títulos y Nombres en Caligrafía**: `'Eyesome Script'` (`64px` para los nombres de los novios, `53px–56px` para títulos de sección como *Ceremonia y fiesta*, *Itinerario*, *Dress code*, *Mesa de regalos*, *Tómalo en cuenta*, *Confirmar asistencia*, *Coco y Clau*).
   - **Cuerpo Editorial, Fechas y Subtítulos**: `'RoxboroughCF'` (pesos Thin `100`, Light `300`, Regular `400`, Medium `500`, Bold `700`). Úsala en `21.33px` para textos y subtítulos (`¡NOS CASAMOS!`), `20px` Light para listas de padres/testigos/padrinos, y `37.33px` para la fecha principal (`28 | NOVIEMBRE | 2026`).
   - **Botones Minimalistas**: `'Lato'` Light `300` (`18.67px–20px`, mayúsculas) dentro de botones rectangulares de borde fino (`border: 1px solid #404040`, **`border-radius: 0`**, fondo transparente).
3. **Fotografía Hero con Fusión Orgánica al Papel**:
   - La foto superior de la pareja (`resources/media/hero-couple.jpg`) ocupa los `516px` de ancho y se desvanece suavemente en su borde inferior (`mask-image: linear-gradient(to bottom, black 55%, transparent 98%)`) fundiéndose con la textura del papel verjurado donde aparecen `¡NOS CASAMOS!` y `Óscar y Claudia`.
4. **Retratos de Pareja en Acuarela con Bordes Difuminados**:
   - Las fotografías secundarias de los novios (`couple-watercolor-1.png` y `couple-watercolor-2.png`) tienen acabado de **pintura en acuarela con bordes esfumados/nube** sin marcos rectangulares, integrándose directamente sobre la fibra del papel.
5. **Ilustraciones Artísticas en Acuarela (Cero Emojis Planos)**:
   - Todos los íconos de secciones e itinerario son ilustraciones en acuarela y lápiz sobre fondo transparente incluidas en `resources/media/` (anillos con lazo blanco, caja de anillos sobre mancha verde salvia, plato y cubiertos, copas de champán, bola disco con destellos dorados, vestido y traje en acuarela, pinceladas de colores a evitar, caja de regalo verde salvia, bombilla en acuarela y reproductor dibujado a mano).
6. **Línea de Tiempo Vertical Alternada (`Itinerario`)**:
   - Eje vertical central de `1px solid #404040` con pequeños nodos circulares (`12px`, relleno `#fdf6ec`, borde `#404040`) y 4 eventos alternados a izquierda y derecha con su ilustración en acuarela arriba y texto en `'RoxboroughCF'` Light debajo.

---

## 2. Recursos Incluidos en esta Skill

Todos los archivos originales extraídos de la invitación están listos para copiarse al proyecto del usuario desde `./resources/`:

- **Fuentes Originales (`.woff` + `fonts.css`)**:
  - Directorio: [resources/fonts/](./resources/fonts/)
  - Hoja de estilos lista para importar: [fonts.css](./resources/fonts/fonts.css) (`Eyesome Script`, `RoxboroughCF` 100/300/400/500/700, `Lato` 300, `Brittany` 400, `Georgia Pro` 400).
- **Texturas, Acuarelas e Ilustraciones Originales**:
  - Directorio: [resources/media/](./resources/media/)
  - `paper-texture.jpg`: Textura de papel verjurado marfil.
  - `hero-couple.jpg`: Fotografía vertical de portada.
  - `couple-watercolor-1.png` y `couple-watercolor-2.png`: Retratos de los novios en acuarela con bordes esfumados.
  - `music-player-frame.svg` y `arrow-drawn-sprite.png`: Reproductor musical dibujado a mano y flecha para *"¡Dale play!"*.
  - `rings-bow.png`: Anillos de oro con lazo blanco (portada PDF y sección *Ceremonia y fiesta*).
  - `watercolor-wash-sage.png`, `rings-box.png`, `plate-cutlery.png`, `champagne-flutes.png`, `disco-ball.png`, `sparkles-gold.png`: Ilustraciones del *Itinerario*.
  - `dress-watercolor.png`, `suit-watercolor.png`, `swatch-white.png`, `swatch-ivory.png`, `swatch-green.png`: Ilustraciones y muestras de color de *Dress code*.
  - `gift-box-sage.png`: Regalo en acuarela verde salvia (*Mesa de regalos*).
  - `lightbulb-watercolor.png`: Bombilla en acuarela (*Tómalo en cuenta*).
  - `envelope-watercolor.png` y `wax-seal.png`: Sobre en acuarela y sello de lacre para la portada interactiva o tarjeta PDF.
- **Especificación Detallada de Medidas y Secciones**:
  - Consulta [design-tokens-and-sections.md](./references/design-tokens-and-sections.md) para ver las medidas exactas en píxeles, colores hexadecimales y estructura de las 11 secciones.

---

## 3. Procedimiento Paso a Paso para Crear o Actualizar una Invitación

1. **Leer la Especificación Técnica**:
   - Revisa [design-tokens-and-sections.md](./references/design-tokens-and-sections.md) para consultar las medidas exactas, colores y textos de cada una de las 11 secciones.
2. **Copiar los Activos al Proyecto**:
   - Copia las carpetas `resources/fonts/` y `resources/media/` dentro del directorio público de activos del proyecto web (por ejemplo, `public/assets/claudia-oscar/`).
3. **Importar Tipografías y Configurar el Pliego de Papel**:
   - Enlaza `fonts.css` en el `<head>` del HTML.
   - Configura el contenedor principal `.paper-strip` con `max-width: 516px; margin: 0 auto; background-color: #f5f2eb; background-image: url('.../paper-texture.jpg'); background-repeat: repeat-y; background-size: 516px auto;`.
4. **Maquetar las 11 Secciones Fieles al Original**:
   - **Sección 0/1**: Foto hero con máscara de desvanecido inferior + `¡NOS CASAMOS!` + `Óscar y Claudia` en `Eyesome Script` (`64px`) + retrato en acuarela 1 + reproductor dibujado a mano `¡Dale play!` + cita romántica.
   - **Sección 2**: Bloques familiares (*Nos acompañan nuestras mamás*, *Y nuestros papás siempre en el corazón🕊️*, *Nuestros testigos*, *Y padrinos*).
   - **Sección 3**: *¡Llegó el día para celebrar juntos!* + fecha `28 | NOVIEMBRE | 2026` + hora + cuenta regresiva minimalista.
   - **Sección 4**: Ilustración `rings-bow.png` + *Ceremonia y fiesta* + dirección + botón rectangular `UBICACIÓN`.
   - **Sección 5**: *Itinerario* con línea central vertical de `1px`, 4 nodos circulares y las 4 ilustraciones en acuarela alternadas a izquierda y derecha.
   - **Sección 6**: *Dress code* (*Casual elegante*) con ilustraciones de vestido y traje en acuarela + texto + 3 pinceladas de acuarela (`swatch-white.png`, `swatch-ivory.png`, `swatch-green.png`).
   - **Sección 7**: *Mesa de regalos* con `gift-box-sage.png` y cuentas bancarias / Plin.
   - **Sección 8**: *Tómalo en cuenta* con `lightbulb-watercolor.png` (nota de celebración exclusiva para adultos).
   - **Sección 9**: *Confirmar asistencia* con botón rectangular `CONFIRMAR` (y si el proyecto tiene sistema de invitados/pases/QR, despliega o integra el Pase Personalizado, formulario RSVP y código QR manteniendo exactamente la misma estética de papel verjurado, bordes finos `#404040` y tipografías `Eyesome Script` + `RoxboroughCF`).
   - **Sección 10**: Cierre *¡Te esperamos!* + *Coco y Clau* + segundo retrato en acuarela `couple-watercolor-2.png`.
5. **Verificación Visual**:
   - Comprueba que todas las fuentes `.woff` e imágenes en acuarela carguen sin errores (`HTTP 200`), que no existan tarjetas blancas modernas que rompan la continuidad del papel verjurado y que el diseño sea responsivo en móvil y desktop.
