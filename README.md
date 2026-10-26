# 💍 Carlos & Jackie — Invitación Virtual de Boda & Sistema de Recepción

Invitación digital interactiva y sistema de gestión de invitados para la boda civil y recepción de Carlos & Jackie en **Recepciones Villa Venecia (SJL)**.

Diseñado siguiendo una estética editorial *Click & Love / Luxury Vintage*: pliego continuo sobre papel verjurado marfil, tipografías Roxborough CF & Eyesome Script, detalles en oro envejecido y acuarelas en tonos tierra y sepia.

---

## ✨ Características Principales

### 💌 Landing Page Pública (Invitación)
- **Estética Editorial & Acuarelas:** Retratos artísticos en tonos cálidos y texturas orgánicas sin bordes rectos.
- **✨ Pasarela Automática (Auto-Scroll):** Recorrido guiado cinemático a velocidad de lectura natural (~48 px/s), con opciones de pausar, reanudar, acelerar (1x / 1.5x) y detener.
- **🎵 Motor de Música Nupcial en Bucle:** Reproducción continua de la canción de fondo (`audio.loop = true`), con controles integrados de volumen, play/pausa y silenciar, ubicados estratégicamente para no obstruir el pliego de la invitación.
- **📅 Cuenta Regresiva & Botón de Calendario:** Contador en tiempo real y descarga directa de evento `.ics` para Google Calendar / Apple Calendar.
- **💌 RSVP & Sobre Digital con QR:** Confirmación de asistencia interactiva con confetti, y generación instantánea del pase oficial en PDF / Imagen de sobre con código QR de acceso.

### 🛡️ Panel de Control & Backoffice (`/#admin`)
- **Acceso por Roles (RBAC):**
  - **👑 Administrador (Novios / Wedding Planner):** Acceso total a la lista de invitados, importación/exportación masiva con Excel, descarga de paquetes ZIP de tarjetas en PDF, y configuración de canción de fondo.
  - **🛡️ Portería / Seguridad:** Interfaz blindada y optimizada para control de accesos rápidos y búsqueda por mesa en la puerta.
- **📷 Escáner QR de Puerta (`/#checkin`):** Lector de cámara en vivo para validar y registrar ingresos de pases en tiempo real con alertas sonoras.
- **📤 Compartir por WhatsApp:** Envío de invitaciones personalizadas con mensaje formateado, enlace directo y copia automática de tarjeta.

---

## 🚀 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/davidcordova/invitacionvirtualboda.git
cd invitacionvirtualboda

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🛠️ Tecnologías Utilizadas

- **Vite & JavaScript Moderno (ES Modules)**
- **HTML5 Canvas & jsPDF** (Generación de sobres y pases PDF en 300 DPI)
- **Html5-Qrcode & qrcode** (Generación y escaneo de códigos QR)
- **Web Audio API & HTML5 Audio** (Motor de audio romántico en bucle)
- **SheetJS (xlsx) & JSZip** (Gestión de invitados y descarga en lote)
- **Vanilla CSS3** (Diseño responsivo, glassmorphism y microanimaciones)

---

## 🔒 Usuarios de Acceso al Sistema

- **Administrador:** `admin` / `boda2026`
- **Portería:** `porteria` / `puerta2026`
