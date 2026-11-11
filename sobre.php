<?php
/**
 * Vista Dedicada del Sobre Digital en PDF — Carlos & Jackie (MVP PHP)
 * Permite previsualizar, personalizar opcionalmente el título/dedicatoria
 * y descargar el Sobre Oficial en PDF con link interactivo y QR hacia la invitación.
 */
require_once __DIR__ . '/config.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✉️</text></svg>">
  <title>Sobre Digital en PDF — <?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?></title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/fonts.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/sobre.css">
</head>
<body class="sobre-page">

  <div class="sobre-container">
    <!-- Top Header -->
    <header class="sobre-topbar">
      <div class="sobre-brand">
        <div>
          <div class="sobre-brand-sub">✦ SOBRE OFICIAL DE INVITACIÓN ✦</div>
          <h1 class="sobre-brand-title"><?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?></h1>
        </div>
      </div>

      <a href="index.php" class="sobre-back-link">
        ← Volver a la Invitación
      </a>
    </header>

    <div class="sobre-grid">
      <!-- Vista Previa en Vivo del Sobre (Canvas 1680x1184 A5 Horizontal) -->
      <div class="sobre-preview-card">
        <div class="sobre-preview-header">
          <span>VISTA PREVIA DEL SOBRE (FORMATO A5 HORIZONTAL)</span>
          <span>CON HIPERVÍNCULO Y QR ACTIVO</span>
        </div>

        <div class="sobre-canvas-mount" id="sobre-canvas-mount">
          <span style="font-size: 14px; color: #7b6a48;">Generando vista previa del sobre...</span>
        </div>

        <p style="margin-top: 12px; font-size: 14px; font-style: italic; color: #666;">
          Al abrir el archivo PDF descargado en cualquier celular o computadora, tocar cualquier parte del sobre abrirá directamente la invitación web.
        </p>
      </div>

      <!-- Panel de Descarga y Personalización Rápida -->
      <div class="sobre-controls-card">
        <h2 class="sobre-controls-title">Sobre en PDF con Link</h2>
        <p class="sobre-controls-desc">
          Este sobre genérico está listo para descargar y compartir por WhatsApp con todos tus invitados. Si lo deseas, puedes ajustar el texto o enlace antes de descargarlo:
        </p>

        <div class="sobre-field">
          <label for="sobre-title-input">Destinatario / Título del Sobre:</label>
          <input
            type="text"
            id="sobre-title-input"
            class="sobre-input"
            value="<?= htmlspecialchars($WEDDING_CONFIG['generic_guest_title']) ?>"
          >
        </div>

        <div class="sobre-field">
          <label for="sobre-note-input">Frase de Dedicatoria:</label>
          <input
            type="text"
            id="sobre-note-input"
            class="sobre-input"
            value="<?= htmlspecialchars($WEDDING_CONFIG['generic_pass_note']) ?>"
          >
        </div>

        <div class="sobre-field">
          <label for="sobre-url-input">Link de la Invitación (embebido en el PDF y QR):</label>
          <input
            type="url"
            id="sobre-url-input"
            class="sobre-input"
            value="<?= htmlspecialchars($WEDDING_CONFIG['invitation_url']) ?>"
          >
        </div>

        <div class="sobre-actions-list">
          <button type="button" id="btn-sobre-pdf" class="btn-sobre-action primary">
            📄 Descargar Sobre en PDF (Con Link)
          </button>

          <button type="button" id="btn-sobre-png" class="btn-sobre-action">
            🖼️ Descargar Sobre como Imagen PNG
          </button>

          <button type="button" id="btn-sobre-copy" class="btn-sobre-action">
            📋 Copiar Imagen del Sobre al Portapapeles
          </button>

          <button type="button" id="btn-sobre-whatsapp" class="btn-sobre-action whatsapp">
            💬 Compartir Link de Invitación por WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Inyección de Configuración PHP a JavaScript -->
  <script>
    window.WEDDING_CONFIG = <?= json_encode($WEDDING_CONFIG, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>

  <!-- Librerías Locales Auto-Contenidas -->
  <script src="assets/qrcode.min.js"></script>
  <script src="assets/jspdf.umd.min.js"></script>

  <!-- Scripts -->
  <script src="js/audio.js"></script>
  <script src="js/envelope.js"></script>
  <script src="js/sobre.js"></script>
</body>
</html>

