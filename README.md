# 💍 Carlos & Jackie — Invitación Virtual de Boda & Sobre Digital PDF (MVP PHP)

Invitación digital interactiva y generador de sobre en PDF con link directo para la boda civil y recepción de **Carlos & Jackie** en **Recepciones Villa Venecia (SJL)**.

Reestructurado en **PHP directo (sin base de datos ni dependencias de Node.js)**, listo para subir directamente a cualquier hosting con **cPanel (`public_html`)**.

---

## ✨ Características del MVP

### 💌 1. Landing Page de la Invitación ([`index.php`](index.php))
- **Estética Editorial & Acuarelas:** Pliego continuo sobre papel verjurado marfil, tipografías *Roxborough CF* & *Eyesome Script* y retratos artísticos en acuarela con Lightbox interactivo.
- **✨ Pasarela Automática (`Auto-Scroll`):** Recorrido guiado cinemático (~48 px/s) con controles para pausar, reanudar, cambiar velocidad (`1x` / `1.5x`), acoplar arriba/abajo y minimizar.
- **🎵 Motor de Música Nupcial en Bucle:** Reproducción continua (`assets/musica.mp3`) con controles integrados de volumen y silencio.
- **📅 Cuenta Regresiva & Agendar en Calendario ([`calendario.php`](calendario.php)):** Contador en tiempo real y descarga nativa de archivo `.ics` compatible con Google Calendar, Apple Calendar y Outlook.
- **🎁 Mesa de Regalos Interactiva:** Copiado con un clic de números de cuenta BCP, BBVA, CCI y Yape/Plin.
- **💬 Confirmación de Asistencia (RSVP) hacia WhatsApp:** Formulario editorial corto (Nombre/Familia + Asistiré / No asistiré + Mensaje opcional) que lanza confetti y abre WhatsApp con el mensaje listo para enviar a los novios.
- **📄 Descarga Directa del Sobre PDF:** Botón integrado para descargar el sobre en PDF con link interactivo hacia la invitación.

### ✉️ 2. Generador del Sobre Digital en PDF ([`sobre.php`](sobre.php))
- **Formato A5 Horizontal de Alta Definición (`1680 x 1184 px`):** Diseño de sobre con sello de lacre, nombres de los novios, código QR escaneable y botón de apertura.
- **PDF con Hipervínculo Activo:** Al tocar cualquier parte del PDF desde el celular o computadora, se abre directamente el link de la invitación virtual.
- **Personalización Rápida Opcional:** Permite ajustar el título/destinatario, la dedicatoria o el enlace antes de descargar el PDF o imagen PNG.

---

## 📂 Estructura del Proyecto (Lista para cPanel)

```text
├── index.php           # Landing page principal de la invitación
├── sobre.php           # Vista y descargador del Sobre Digital en PDF / PNG
├── calendario.php      # Generador nativo del evento .ics para calendario
├── config.php          # Configuración centralizada (nombres, fecha, WhatsApp, cuentas, música)
├── .htaccess           # Configuración Apache para cPanel (UTF-8, caché, MIME types)
├── css/                # Hojas de estilo modulares (variables, main, landing, sobre)
├── js/                 # Lógica de audio, pasarela automática, sobre PDF y landing
└── assets/             # Fotos en acuarela, fuentes Click & Love, musica.mp3 y librerías locales
```

---

## 🚀 Cómo Probar Localmente y Subir a cPanel

### Ejecución Local con PHP
```bash
php -S localhost:8000
```
- **Invitación Principal:** `http://localhost:8000/` (o `http://localhost:8000/index.php`)
- **Sobre Digital PDF:** `http://localhost:8000/sobre.php`

### Despliegue en Hosting con cPanel
1. Comprime en un archivo `.zip` todos los archivos de la raíz (`index.php`, `sobre.php`, `calendario.php`, `config.php`, `.htaccess`, `css/`, `js/`, `assets/`).
2. Ingresa al **Administrador de Archivos** de tu **cPanel** y abre la carpeta `public_html` (o la subcarpeta donde alojarás la invitación).
3. Sube y descomprime el archivo `.zip`.
4. *(Opcional)* Edita [`config.php`](config.php) desde el mismo cPanel si deseas actualizar el número de WhatsApp para confirmaciones (`whatsapp_rsvp_phone`) o las cuentas bancarias.
