# Especificación Técnica y Tokens de Diseño — Estilo "Claudia y Óscar" (Click & Love)

Este documento contiene las medidas exactas, tokens cromáticos, tipográficos, activos gráficos y estructura de las 11 secciones extraídas de la invitación original `https://clickandlove.lat/claudiayoscar?inv=CODIGO` y su tarjeta PDF (`plantilla_base.pdf`).

---

## 1. Arquitectura de Layout: "Pliego Vertical de Papel Verjurado"

A diferencia de una página web convencional con tarjetas flotantes redondeadas, el diseño replica una **papelería nupcial continua en formato pliego vertical** centrada en la pantalla:

- **Fondo exterior (Desktop viewport `1366px`)**: Blanco puro (`#ffffff`) a los lados.
- **Franja central de papel (`Paper Strip`)**:
  - Ancho fijo en desktop: **`516px`** (centrado con `margin: 0 auto`, equivalente a `left: 425px` a `941px` en un canvas de `1366px`).
  - En dispositivos móviles (`<= 540px`): `width: 100%; max-width: 516px;`.
  - Columna interna de contenido: **`425px`** de ancho máximo (`padding-left: 45.5px; padding-right: 45.5px;` en desktop, `24px` en móvil).
  - Textura de fondo: `paper-texture.jpg` (`MAHDqs0hd9Y.jpg`), papel fino verjurado/acanalado en tono marfil cálido (`#f5f2eb` / `#f2eee6`), repetido verticalmente sin cortes ni bordes redondeados entre secciones.

---

## 2. Sistema Tipográfico Exacto

Todas las fuentes originales están incluidas en `resources/fonts/` y declaradas en `resources/fonts/fonts.css`:

| Rol Tipográfico | Fuente Original (`@font-face`) | Fallback Google Fonts | Pesos Utilizados | Tamaños y Uso Exacto |
| :--- | :--- | :--- | :--- | :--- |
| **Caligrafía Principal (Display / Títulos)** | `'Eyesome Script'` | `'Great Vibes'`, `'Alex Brush'`, cursive | `400` (Regular) | • Nombres portada (`Óscar y Claudia`): **`64px`**, `line-height: 0.96em`, color `#404040`<br>• Títulos de sección (`Ceremonia y fiesta`, `Itinerario`): **`56px`**, `line-height: 0.62em–0.98em`, color `#000000` o `#4c4c4c`<br>• Títulos secundarios (`Dress code`, `Mesa de regalos`, `Tómalo en cuenta`, `Confirmar asistencia`, `Coco y Clau`): **`53.33px`–`55.5px`**, color `#4c4c4c` o `#404040`<br>• Callout musical (`¡Dale play!`): **`28px`**, `line-height: 1.04em`, color `#4c4c4c` |
| **Editorial Serif (Cuerpo, Fechas y Subtítulos)** | `'RoxboroughCF'` | `'Cormorant Garamond'`, `'Playfair Display'`, serif | `100` (Thin)<br>`300` (Light)<br>`400` (Regular)<br>`500` (Medium)<br>`700` (Bold) | • Subtítulo superior (`¡NOS CASAMOS!`, `NUESTRO MATRI`): **`21.33px`**, Regular `400`, `text-transform: uppercase`, `line-height: 1.39em`, color `#404040`<br>• Fecha destacada (`28 \| NOVIEMBRE \| 2026`): **`37.33px`**, Regular `400`, uppercase, color `#4c4c4c`<br>• Subtítulos en negrita (`Nos acompañan nuestras mamás:`, `Nuestros testigos:`, `Y padrinos:`, `¡Llegó el día para celebrar juntos!`, `12:30PM`): **`21.33px`**, Bold `700`, color `#4c4c4c`<br>• Párrafos y nombres de padres/padrinos: **`20px`–`21.33px`**, Light `300` o Regular `400`, `line-height: 1.39em–1.44em`, color `#4c4c4c`<br>• Textos de Itinerario y Dirección: **`21.33px`**, Light `300`, color `#131313` |
| **Botones Minimalistas (UI)** | `'Lato'` | `'Lato'`, `'Montserrat'`, sans-serif | `300` (Light) | • Texto de botones (`UBICACIÓN`, `CONFIRMAR`): **`18.67px`–`20px`**, Light `300`, uppercase, color `#404040` / `#4c4c4c` |

---

## 3. Paleta de Colores Oficial

```css
:root {
  /* Fondos y Papel */
  --outer-canvas-bg: #ffffff;
  --paper-base: #f5f2eb;          /* Color base del papel verjurado */
  --paper-cream-node: #fdf6ec;    /* Relleno de los círculos del timeline */
  --player-fill: #fff6e5;         /* Relleno crema del reproductor dibujado a mano */

  /* Tintas y Tipografía */
  --ink-charcoal: #404040;        /* Nombres principales, subtítulo portada, líneas y bordes */
  --ink-body: #4c4c4c;            /* Cuerpo de texto, títulos de sección y descripciones */
  --ink-deep: #131313;            /* Texto de dirección e ítems de itinerario */
  --ink-black: #000000;           /* Títulos "Ceremonia y fiesta", "Itinerario", "Dress code" */
  --ink-sketch: #333231;          /* Trazo del reproductor musical SVG */

  /* Acentos Acuarela y Lacre */
  --sage-watercolor: #72826c;     /* Verde salvia apagado (mancha acuarela y regalo) */
  --bottle-green-swatch: #0f8a5f; /* Muestra acuarela verde botella (color a evitar) */
  --ivory-swatch: #fffce6;        /* Muestra acuarela ivory (color a evitar) */
  --wax-gold: #b89146;            /* Dorado lacre del sello en el sobre PDF */
  --wax-gold-dark: #7b6a48;       /* Tinta dorada oscura para metadatos de pase/mesa */
}
```

---

## 4. Tratamiento Fotográfico y Estilo de Ilustraciones

1. **Fotografía Hero con Desvanecido Orgánico hacia el Papel (`Section 0 & 1`)**:
   - La foto principal de los novios (`hero-couple.jpg`, `516px × 990px`) ocupa todo el ancho de la franja de `516px` en la parte superior.
   - **Efecto clave**: La parte inferior de la fotografía se funde suavemente con la textura del papel verjurado mediante una máscara de gradiente (`-webkit-mask-image: linear-gradient(to bottom, #000 50%, transparent 98%)` o un overlay con la textura de papel), de modo que el texto `¡NOS CASAMOS!` y `Óscar y Claudia` aparece escrito sobre la transición entre la foto y el papel.
2. **Retratos de Pareja en Acuarela con Bordes Difuminados (`Section 1 & 10`)**:
   - Las fotos secundarias (`couple-watercolor-1.png` y `couple-watercolor-2.png`) tienen un tratamiento de **acuarela digital con bordes tipo nube/esfumado blanco/transparente** (sin marcos rectangulares duros).
   - Al colocarse sobre el papel texturizado, se integran como si hubieran sido pintadas a mano directamente sobre el pliego.
3. **Ilustraciones Botánicas/Objetos en Acuarela y Lápiz de Color**:
   - Todos los íconos son ilustraciones artísticas pintadas en acuarela y lápiz sobre fondo transparente (nunca emojis planos ni íconos vectoriales genéricos):
     - `rings-bow.png` (`135×133px`): Anillos de oro entrelazados con lazo de satén marfil (usado en portada PDF y en "Ceremonia y fiesta").
     - `rings-box.png` (`140×137px`) + `watercolor-wash-sage.png` (`181×172px` detrás): Anillos en caja blanca de terciopelo sobre mancha de acuarela verde salvia para "Ceremonia civil".
     - `plate-cutlery.png` (`197×197px`): Plato de cerámica ilustrada con servilleta floral y cubiertos para "Almuerzo".
     - `champagne-flutes.png` (`144×177px`): Copas de champán brindando con lazos blancos para "Brindis".
     - `disco-ball.png` (`189×195px`) + `sparkles-gold.png` (`46×86px`): Bola disco en acuarela gris/plata con destellos dorados para "Fiesta".
     - `dress-watercolor.png` (`137×238px`) y `suit-watercolor.png` (`79×238px`): Vestido largo rosa pastel y traje beige de lino con pajarita para "Dress code".
     - `swatch-white.png`, `swatch-ivory.png`, `swatch-green.png` (`96×75px` c/u): Tres pinceladas de acuarela mostrando los colores prohibidos (blanco, ivory, verde botella).
     - `gift-box-sage.png` (`117×133px`): Caja de regalo en acuarela verde salvia con lazo dorado para "Mesa de regalos".
     - `lightbulb-watercolor.png` (`91×114px`): Bombilla cálida en acuarela amarilla para "Tómalo en cuenta".
     - `music-player-frame.svg` (`309×125px`) + `arrow-drawn-sprite.png`: Reproductor estilo sketch dibujado a mano con botón play y barra de progreso para "¡Dale play!".

---

## 5. Mapa Completo de las 11 Secciones (Blueprint Exacto)

### Sección 0 y 1: Portada Hero + Música + Mensaje de Historia + Retrato Acuarela 1
- **Foto Hero**: `hero-couple.jpg` arriba (`width: 100%` del pliego de `516px`), fundiéndose hacia abajo con el papel.
- **Texto sobre el desvanecido inferior de la foto**:
  - Subtítulo: `¡NOS CASAMOS!` (`RoxboroughCF` Regular `21.33px`, uppercase, `#404040`).
  - Título en 3 líneas:
    ```
    Óscar
    y
    Claudia
    ```
    (`Eyesome Script` `64px`, `line-height: 0.96em`, `#404040`, centrado).
- **Retrato Acuarela 1**: `couple-watercolor-1.png` (`491×655px` centrado).
- **Widget "¡Dale play!"**:
  - Ilustración `music-player-frame.svg` (`309×125px`) centrada.
  - Texto `¡Dale play!` (`Eyesome Script` `28px`, `#4c4c4c`) superpuesto dentro del marco, acompañado de la flecha dibujada a mano rotada `-81deg`.
  - Al hacer clic, activa/pausa la canción de fondo (o abre el audio/YouTube `https://youtu.be/kLueJWSnxg4?t=73`).
- **Párrafo Emotivo**:
  - `"Nos encontramos, crecimos juntos y ahora queremos celebrar este nuevo capítulo rodeados de las personas que más queremos y han sido parte de nuestro camino."` (`RoxboroughCF` Regular `21.33px`, `#4c4c4c`, `max-width: 425px`).

### Sección 2: Bendición Familiar (Mamás, Papás en el Corazón, Testigos y Padrinos)
Todo centrado en una sola columna (`425px`), alternando encabezados en `RoxboroughCF Bold 21.33px` y nombres en `RoxboroughCF Light 20px` (`line-height: 1.44em`, `#4c4c4c`):
1. **Nos acompañan nuestras mamás:**
   - Alicia Puente
   - Silvia Barraza
2. **Y nuestros papás siempre en el corazón🕊️:**
   - Óscar Villanueva
   - Alberto Castro
3. **Nuestros testigos:**
   - Rudy Melo
   - Belén Garay
4. **Y padrinos:**
   - Álvaro Cole
   - Vitalia Villanueva

### Sección 3: Fecha y Cuenta Regresiva
- Encabezado: `¡Llegó el día para celebrar juntos!` (`RoxboroughCF Bold 21.33px`, `#4c4c4c`).
- Fecha: `28 | NOVIEMBRE | 2026` (`RoxboroughCF Regular 37.33px`, uppercase, `#4c4c4c`).
- Hora: `12:30PM` (`RoxboroughCF Bold 21.33px`, `#4c4c4c`).
- Contador regresivo minimalista (`Días : Horas : Minutos : Segundos`) integrado sobre el papel (ancho `269px`), con números en `RoxboroughCF` y etiquetas sutiles.

### Sección 4: Ceremonia y Fiesta (Ubicación)
- Ilustración superior: `rings-bow.png` (`135×133px` centrada).
- Título en 2 líneas:
  ```
  Ceremonia
  y fiesta
  ```
  (`Eyesome Script` `56px`, `line-height: 0.98em`, `#000000`).
- Dirección:
  ```
  Nueva Toledo 222A
  Cieneguilla
  ```
  (`RoxboroughCF` Regular/Thin `21.33px`, `#131313`).
- Botón minimalista rectangular:
  - Dimensiones: `188.4px × 37.5px`, borde `1px solid #4c4c4c`, `border-radius: 0`, fondo transparente.
  - Texto: `UBICACIÓN` (`Lato Light 20px`, `#4c4c4c`, uppercase) con enlace a Google Maps (`https://maps.app.goo.gl/VtzufEuL5WPYbzp56`).

### Sección 5: Itinerario (Línea de Tiempo Vertical Alternada)
- Título: `Itinerario` (`Eyesome Script` `56px`, `#000000`).
- **Eje central vertical**: Línea vertical de `1px solid #404040` de `466.5px` de alto en el centro exacto de la columna, con **4 nodos circulares** (`11.6px × 11.6px`, `border-radius: 50%`, `background: #fdf6ec`, `border: 1px solid #404040`) en `y = 250px, 409px, 561px, 711px`.
- **4 Hitos alternados Izquierda / Derecha**:
  1. **Izquierda (Hito 1)**: Mancha acuarela `watercolor-wash-sage.png` (`181×172px`) + encima `rings-box.png` (`140×137px`) + texto debajo `Ceremonia civil` / `1:00pm` (`RoxboroughCF Light 21.33px`, `#131313`).
  2. **Derecha (Hito 2)**: Ilustración `plate-cutlery.png` (`197×197px`) + texto debajo `Almuerzo` / `2:00pm`.
  3. **Izquierda (Hito 3)**: Ilustración `champagne-flutes.png` (`144×177px`) + texto debajo `Brindis` / `3:00pm`.
  4. **Derecha (Hito 4)**: Ilustración `disco-ball.png` (`189×195px`) con `sparkles-gold.png` (`46×86px`) en la esquina superior derecha + texto debajo `Fiesta` / `4:00pm`.

### Sección 6: Dress Code + Muestras de Acuarela
- Título: `Dress code` (`Eyesome Script` `53.33px`, `#000000`).
- Subtítulo: `Casual elegante` (`RoxboroughCF Regular 21.33px`, `#4c4c4c`).
- Ilustraciones lado a lado en el centro:
  - Izquierda: `dress-watercolor.png` (`137×238px`).
  - Derecha: `suit-watercolor.png` (`79×238px`).
- Descripción:
  - `"Eres libre de elegir pero ten en cuenta que el evento será en un lugar campestre, considera colores vivos y zapatos cómodos."`
  - `"Evitar los colores: blanco, ivory y verde botella."` (`RoxboroughCF Light 21.33px` / `20px`, `#4c4c4c`).
- **3 Muestras de pinceladas en fila horizontal**:
  - `swatch-white.png` (`96×75px`)
  - `swatch-ivory.png` (`96×75px`)
  - `swatch-green.png` (`96×75px`)

### Sección 7: Mesa de Regalos
- Ilustración superior: `gift-box-sage.png` (`117×133px` centrada).
- Título: `Mesa de regalos` (`Eyesome Script` `53.33px`, `#4c4c4c`).
- Texto: `"Estamos felices con tu compañía, y si deseas puedes contribuir a nuestros proyectos y sueños como familia."` (`RoxboroughCF Light 21.33px`, `#4c4c4c`).
- Datos bancarios (centrados, `RoxboroughCF Light 21.33px`, `#4c4c4c`, con opción de copiar sutil):
  ```
  Cta. Interbank Soles  8983497157007
  CCI  00389801349715700749

  Plin 937574827
  ```

### Sección 8: Tómalo en Cuenta (Solo Adultos)
- Ilustración superior: `lightbulb-watercolor.png` (`91×114px` centrada).
- Título: `Tómalo en cuenta` (`Eyesome Script` `53.33px`, `#4c4c4c`).
- Texto: `"Queremos que vivas nuestra boda al máximo y que nunca dejes la pista de baile. Por ello, nuestra celebración será exclusiva para adultos. Agradecemos su comprensión."` (`RoxboroughCF Light 21.33px`, `#4c4c4c`).

### Sección 9: Confirmar Asistencia (RSVP)
- Título: `Confirmar asistencia` (`Eyesome Script` `53.33px`, `#4c4c4c`).
- Texto: `"Te pedimos nos puedas confirmar tu asistencia hasta el 30 de septiembre en el siguiente link:"` (`RoxboroughCF Light/Medium 21.33px`, `#4c4c4c`).
- Botón rectangular minimalista:
  - Dimensiones: `188.4px × 47.75px`, `border: 1px solid #404040`, `border-radius: 0`, fondo transparente.
  - Texto: `CONFIRMAR` (`Lato Light 18.67px`, uppercase, `#404040`).
- *(Cuando se integra con un sistema dinámico de invitados y RSVP en la misma página, al hacer clic en `CONFIRMAR` se despliega suavemente el formulario editorial de confirmación sobre el mismo papel texturizado, junto con el Pase Personalizado y el QR de verificación).*

### Sección 10: Cierre ("¡Te esperamos! Coco y Clau")
- Subtítulo: `¡Te esperamos!` (`RoxboroughCF Light 21.33px`, `#404040`).
- Título: `Coco y Clau` (`Eyesome Script` `55.47px`, `#404040`).
- Retrato Acuarela 2: `couple-watercolor-2.png` (`515×515px` centrado).

---

## 6. Especificación de la Portada PDF / Sobre con Sello de Lacre (`plantilla_base.pdf`)

Para tarjetas PDF personalizadas o animación de apertura de sobre:
- Proporción del lienzo: `1024.5 × 1606.5` (vertical), con textura `paper-texture.jpg` a sangre completa.
- Arriba al centro: `rings-bow.png` (`width: 24%`).
- Subtítulo: `NUESTRO MATRI` (`RoxboroughCF` Regular, uppercase, tracking `0.22em`, `#2b2927`).
- Nombres: `Óscar y Claudia` (`Eyesome Script`, `#2b2927`).
- Centro: Sobre cerrado en acuarela `envelope-watercolor.png` (`width: 86%`) con sello de lacre dorado en el centro (`wax-seal.png`).
- Solapa superior del sobre: Impresión tipográfica del nombre del invitado (`PASE EXCLUSIVO PARA`, nombre de la familia en serif, cantidad de pases y mesa).
- Esquina inferior derecha del sobre: Sello con código QR de autenticidad y token (`#INV-XXXX`).
- Debajo del sobre: Flecha punteada curva apuntando al sello de lacre y texto `CLICK PARA ABRIR LA INVITACIÓN` (`Lato Light`, uppercase, tracking `0.1em`).
