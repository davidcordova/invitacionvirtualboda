<?php
/**
 * Landing Page Principal de la Invitación de Boda — Carlos & Jackie (MVP PHP)
 * Listo para subir directamente a public_html en cPanel.
 */
require_once __DIR__ . '/config.php';
header('Permissions-Policy: autoplay=(self *)');
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💍</text></svg>">
  <title><?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?> — Nuestra Boda Civil &amp; Recepción</title>
  <meta name="description" content="Invitación oficial de boda civil y recepción de <?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?>. <?= htmlspecialchars($WEDDING_CONFIG['event_date_full']) ?> en <?= htmlspecialchars($WEDDING_CONFIG['venue_name']) ?>, <?= htmlspecialchars($WEDDING_CONFIG['venue_district']) ?>.">

  <!-- Open Graph / WhatsApp Link Preview -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="💍 <?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?> — ¡Nos Casamos!">
  <meta property="og:description" content="Acompáñanos a celebrar nuestra Boda Civil y Recepción el <?= htmlspecialchars($WEDDING_CONFIG['event_date_full']) ?> en <?= htmlspecialchars($WEDDING_CONFIG['venue_name']) ?>.">
  <meta property="og:image" content="<?= htmlspecialchars($WEDDING_CONFIG['base_url'] . '/assets/portada_boda.jpg') ?>">

  <!-- Google Fonts: Editorial & Wedding Luxury Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">

  <!-- Fuentes Originales Click & Love (Eyesome Script, RoxboroughCF, Lato) -->
  <link rel="stylesheet" href="assets/fonts.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/landing.css">
</head>
<body class="wedding-body">

  <main id="app-root" class="app-main">
    <div class="wedding-body">
      <div class="paper-strip">

        <!-- ==========================================================================
             SECCIÓN 0 & 1: HERO CON FOTO PEGADA EN MARCO BLANCO + NOMBRES + DALE PLAY
             ========================================================================== -->
        <div class="hero-wrapper">
          <div class="pasted-photo-card hero-pasted-card with-tape tilt-subtle-left" data-lightbox="assets/foto_8.jpeg" data-caption="Carlos & Jackie — ¡Nos casamos!">
            <div class="pasted-photo-img-wrap">
              <img src="assets/foto_8.jpeg" alt="<?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?>">
            </div>
            <div class="pasted-photo-caption">Nuestra historia continúa...</div>
          </div>

          <div class="hero-titles">
            <div class="nos-casamos"><?= htmlspecialchars($WEDDING_CONFIG['hero_Upper_title']) ?></div>
            <h1 class="couple-names-hero"><?= htmlspecialchars($WEDDING_CONFIG['groom_name']) . "\ny\n" . htmlspecialchars($WEDDING_CONFIG['bride_name']) ?></h1>
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦ ❖ ✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>
          </div>
        </div>

        <div class="content-col">
          <!-- Tarjeta de Invitación Genérica Impresa en el Pliego (Letterpress sobre Papel) -->
          <div class="guest-letterpress-box">
            <div class="guest-letterpress-label">✦ <?= htmlspecialchars($WEDDING_CONFIG['generic_pass_label']) ?> ✦</div>
            <div class="guest-letterpress-name"><?= htmlspecialchars($WEDDING_CONFIG['generic_guest_title']) ?></div>
            <div class="guest-letterpress-meta">
              <span>💍 <?= htmlspecialchars($WEDDING_CONFIG['generic_pass_meta']) ?></span>
            </div>
            <?php if (!empty($WEDDING_CONFIG['generic_pass_note'])): ?>
              <div class="guest-letterpress-note">"<?= htmlspecialchars($WEDDING_CONFIG['generic_pass_note']) ?>"</div>
            <?php endif; ?>
          </div>

          <!-- Foto Pegada 2: En la laguna turquesa y montañas -->
          <div class="pasted-photo-card with-tape tape-right tilt-right" data-lightbox="assets/foto_6.jpeg" data-caption="Carlos & Jackie — Nuestro camino juntos">
            <div class="pasted-photo-img-wrap aspect-landscape">
              <img src="assets/foto_6.jpeg" alt="<?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?> en la laguna">
            </div>
            <div class="pasted-photo-caption">Nuestro camino juntos</div>
          </div>

          <!-- Reproductor Dibujado a Mano "¡Dale play!" -->
          <div class="dale-play-widget" id="btn-dale-play" title="Toca para reproducir o pausar la música">
            <img src="assets/music-player-frame.svg" alt="Reproductor de música" class="dale-play-svg">
            <div class="dale-play-arrow">
              <svg viewBox="0 0 48 36" fill="none" stroke="#333231" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="arrow-drawn-vector">
                <path d="M 6 28 C 14 16, 24 8, 38 6" />
                <path d="M 28 3 L 39 6 L 33 14" />
              </svg>
            </div>
            <div class="dale-play-text" id="dale-play-label"><?= htmlspecialchars($WEDDING_CONFIG['music']['labelPlay']) ?></div>
          </div>

          <!-- Párrafo Emotivo -->
          <p class="story-paragraph">
            Nos encontramos, crecimos juntos y ahora queremos celebrar este nuevo capítulo rodeados de las personas que más queremos y han sido parte de nuestro camino.
          </p>

          <!-- ==========================================================================
               SECCIÓN 2: FAMILIA Y BENDICIONES + FOTO PEGADA 3
               ========================================================================== -->
          <section class="family-section">
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>
            <div class="family-block">
              <div class="family-heading">Con la bendición de nuestros padres</div>
            </div>

            <div class="family-block">
              <div class="family-heading">Padres de la Novia</div>
              <?php foreach ($WEDDING_CONFIG['bride_parents'] as $parent): ?>
                <div class="family-names"><?= htmlspecialchars($parent) ?></div>
              <?php endforeach; ?>
            </div>

            <div class="family-block">
              <div class="family-heading">Padres del Novio</div>
              <?php foreach ($WEDDING_CONFIG['groom_parents'] as $parent): ?>
                <div class="family-names"><?= htmlspecialchars($parent) ?></div>
              <?php endforeach; ?>
            </div>

            <div class="pasted-photo-card with-tape tilt-left" style="margin-top: 28px;" data-lightbox="assets/foto_7.jpeg" data-caption="Carlos & Jackie — Cómplices en cada paso">
              <div class="pasted-photo-img-wrap aspect-vertical">
                <img src="assets/foto_7.jpeg" alt="<?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?>">
              </div>
              <div class="pasted-photo-caption">Cómplices en cada paso</div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 3: FECHA Y CUENTA REGRESIVA
               ========================================================================== -->
          <section class="date-section">
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦ ❖ ✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>
            <div class="date-intro">¡Llegó el día para celebrar juntos!</div>
            <div class="date-main"><?= htmlspecialchars($WEDDING_CONFIG['event_date_display']) ?></div>
            <div class="date-time"><?= htmlspecialchars($WEDDING_CONFIG['event_time_display']) ?></div>

            <!-- Contador regresivo estilo TickCounter sobre el papel -->
            <div class="tickcounter-box">
              <div class="tc-unit">
                <span class="tc-val" id="cd-days">00</span>
                <span class="tc-lbl">Días</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-hours">00</span>
                <span class="tc-lbl">Horas</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-minutes">00</span>
                <span class="tc-lbl">Minutos</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-seconds">00</span>
                <span class="tc-lbl">Segundos</span>
              </div>
            </div>

            <a href="calendario.php" class="btn-editorial-rect" style="margin-top: 22px;">
              AGENDAR
            </a>
          </section>

          <!-- ==========================================================================
               SECCIÓN 4: RECEPCIÓN Y FIESTA (UBICACIÓN VILLA VENECIA)
               ========================================================================== -->
          <section class="ceremony-section">
            <img src="assets/rings-bow.png" alt="Anillos con lazo" class="ceremony-rings-img">
            <div class="section-script-title">Recepción<br>y fiesta</div>

            <div class="ceremony-address"><?= htmlspecialchars($WEDDING_CONFIG['venue_address_lines']) ?></div>

            <p style="font-size: 16px; font-style: italic; color: #555555; margin-bottom: 22px;">
              Boda civil: acompáñanos a celebrar y brindar en nuestra recepción.
            </p>

            <div class="location-btn-row">
              <a href="<?= htmlspecialchars($WEDDING_CONFIG['google_maps_url']) ?>" target="_blank" rel="noopener noreferrer" class="btn-editorial-rect">
                UBICACIÓN
              </a>
              <a href="<?= htmlspecialchars($WEDDING_CONFIG['waze_url']) ?>" target="_blank" rel="noopener noreferrer" class="btn-editorial-rect">
                WAZE
              </a>
            </div>

            <!-- Foto Pegada 4: Frente al mar -->
            <div class="pasted-photo-card with-tape tape-right tilt-subtle-right" style="margin-top: 34px;" data-lightbox="assets/foto_3.jpeg" data-caption="Carlos & Jackie — Donde todo es mejor contigo">
              <div class="pasted-photo-img-wrap aspect-landscape">
                <img src="assets/foto_3.jpeg" alt="<?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?> frente al mar">
              </div>
              <div class="pasted-photo-caption">Donde todo es mejor contigo</div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 5: ITINERARIO (TIMELINE VERTICAL CON ACUARELAS ORIGINALES)
               ========================================================================== -->
          <section class="itinerary-section">
            <div class="itinerary-title">Itinerario</div>

            <div class="timeline-canvas">
              <div class="timeline-line"></div>
              <div class="timeline-node node-1"></div>
              <div class="timeline-node node-2"></div>
              <div class="timeline-node node-3"></div>
              <div class="timeline-node node-4"></div>

              <!-- Hito 1: Recepción (Izquierda) -->
              <div class="tl-item tl-left tl-item-1">
                <div class="tl-wash-wrap">
                  <img src="assets/watercolor-wash-sage.png" class="tl-wash-img" alt="Acuarela">
                  <img src="assets/rings-box.png" class="tl-rings-box-img" alt="Caja de anillos">
                </div>
                <div class="tl-label">Recepción<br>7:00pm</div>
              </div>

              <!-- Hito 2: Cena de Gala (Derecha) -->
              <div class="tl-item tl-right tl-item-2">
                <img src="assets/plate-cutlery.png" class="tl-plate-img" alt="Cena">
                <div class="tl-label">Cena<br>8:30pm</div>
              </div>

              <!-- Hito 3: Brindis (Izquierda) -->
              <div class="tl-item tl-left tl-item-3">
                <img src="assets/champagne-flutes.png" class="tl-flutes-img" alt="Brindis">
                <div class="tl-label">Brindis<br>9:30pm</div>
              </div>

              <!-- Hito 4: Fiesta y Baile (Derecha) -->
              <div class="tl-item tl-right tl-item-4">
                <div class="tl-disco-wrap">
                  <img src="assets/disco-ball.png" class="tl-disco-img" alt="Bola disco">
                  <img src="assets/sparkles-gold.png" class="tl-sparkles-img" alt="Destellos">
                </div>
                <div class="tl-label">Fiesta<br>10:00pm</div>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 6: DRESS CODE + MUESTRAS DE ACUARELA ORIGINALES
               ========================================================================== -->
          <section class="dresscode-section">
            <div class="dresscode-title">Dress code</div>
            <div class="dresscode-sub">Casual elegante</div>

            <div class="dresscode-illustrations">
              <img src="assets/dress-watercolor.png" class="img-dress" alt="Vestido en acuarela">
              <img src="assets/suit-watercolor.png" class="img-suit" alt="Terno en acuarela">
            </div>

            <div class="dresscode-text">
              Damas: Vestido • Caballeros: Terno<br>
              Queremos que vivas nuestra fiesta al máximo y disfrutes cada momento en la pista de baile.
            </div>

            <div class="dresscode-avoid">
              Evitar los colores: blanco, marfil y beige.
            </div>

            <div class="avoid-palette-card">
              <div class="avoid-palette-header">
                <span class="avoid-palette-pill">Paleta de colores</span>
              </div>

              <div class="avoid-palette-grid">
                <div class="avoid-swatch-item">
                  <div class="avoid-swatch-box swatch-color-blanco"></div>
                  <div class="avoid-swatch-label">
                    <span class="avoid-swatch-title">Blanco</span>
                    <span class="avoid-swatch-hex">(#FFFFFF)</span>
                  </div>
                </div>

                <div class="avoid-swatch-item">
                  <div class="avoid-swatch-box swatch-color-marfil"></div>
                  <div class="avoid-swatch-label">
                    <span class="avoid-swatch-title">Marfil</span>
                    <span class="avoid-swatch-hex">(#FFFFF0)</span>
                  </div>
                </div>

                <div class="avoid-swatch-item">
                  <div class="avoid-swatch-box swatch-color-beige"></div>
                  <div class="avoid-swatch-label">
                    <span class="avoid-swatch-title">Beige</span>
                    <span class="avoid-swatch-hex">(#F5F5DC)</span>
                  </div>
                </div>
              </div>

              <div class="avoid-palette-footer">
                <span class="avoid-palette-line"></span>
                <span class="avoid-palette-heart">♥</span>
                <span class="avoid-palette-line"></span>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN INTERMEDIA: NUESTROS MOMENTOS (ÁLBUM DE FOTOS PEGADAS EN PAPEL)
               ========================================================================== -->
          <section class="moments-section">
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦ ❖ ✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>
            <div class="moments-title">Nuestros Momentos</div>
            <p class="story-paragraph" style="margin-bottom: 18px; font-style: italic;">
              "Cada viaje, cada aventura y cada paso juntos nos han traído hasta este gran día."
            </p>

            <div class="moments-album-stack">
              <!-- Foto Pegada 5: Waqrapukara -->
              <div class="pasted-photo-card with-tape tilt-left" data-lightbox="assets/foto_9.jpeg" data-caption="Carlos & Jackie — Conquistando cumbres juntos">
                <div class="pasted-photo-img-wrap aspect-vertical">
                  <img src="assets/foto_9.jpeg" alt="Carlos y Jackie en Waqrapukara">
                </div>
                <div class="pasted-photo-caption">Conquistando cumbres juntos</div>
              </div>

              <!-- Dúo de Fotos Pegadas 6 y 7 -->
              <div class="moments-duo-grid">
                <div class="pasted-photo-card with-tape tilt-subtle-left" data-lightbox="assets/foto_1.jpeg" data-caption="Carlos & Jackie — Aventuras en el valle">
                  <div class="pasted-photo-img-wrap">
                    <img src="assets/foto_1.jpeg" alt="Carlos y Jackie en el valle">
                  </div>
                  <div class="pasted-photo-caption">Aventuras</div>
                </div>

                <div class="pasted-photo-card with-tape tape-right tilt-subtle-right" data-lightbox="assets/foto_4.jpeg" data-caption="Carlos & Jackie — Sumando historias">
                  <div class="pasted-photo-img-wrap">
                    <img src="assets/foto_4.jpeg" alt="Carlos y Jackie de viaje">
                  </div>
                  <div class="pasted-photo-caption">Nuevos destinos</div>
                </div>
              </div>

              <!-- Foto Pegada 8: Bosque de eucaliptos -->
              <div class="pasted-photo-card with-tape tape-right tilt-right" data-lightbox="assets/foto_5.jpeg" data-caption="Carlos & Jackie — Entre risas y naturaleza">
                <div class="pasted-photo-img-wrap aspect-vertical">
                  <img src="assets/foto_5.jpeg" alt="Carlos y Jackie en el bosque">
                </div>
                <div class="pasted-photo-caption">Entre risas y naturaleza</div>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 7: OBSEQUIO (LLUVIA DE SOBRES)
               ========================================================================== -->
          <section class="gifts-section">
            <img src="assets/gift-box-sage.png" class="gift-box-img" alt="Caja de regalo">
            <div class="gifts-title">Obsequio</div>

            <div class="gifts-note">
              Estamos felices con tu compañía, y si deseas puedes contribuir a nuestros proyectos y sueños como familia.
            </div>

            <div class="gifts-accounts">
              <?php foreach ($WEDDING_CONFIG['bank_accounts'] as $acc): ?>
                <div class="gift-account-item">
                  <strong><?= htmlspecialchars($acc['label']) ?></strong> <?= htmlspecialchars($acc['value']) ?><br>
                  <?php if (!empty($acc['holder'])): ?>
                    <span class="gift-account-holder">Titular: <strong><?= htmlspecialchars($acc['holder']) ?></strong></span><br>
                  <?php endif; ?>
                  <button type="button" class="copy-inline-btn" data-copy="<?= htmlspecialchars($acc['copy_value']) ?>">
                    <?= htmlspecialchars($acc['button_text']) ?>
                  </button>
                </div>
              <?php endforeach; ?>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 8 & 9: QUERIDA FAMILIA Y AMIGOS (SOLO ADULTOS) + CONFIRMAR ASISTENCIA DIRECTO A WHATSAPP
               ========================================================================== -->
          <section class="adults-section" id="rsvp-section">
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦ ❖ ✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>

            <div class="adults-title">Querida<br>Familia y Amigos</div>
            <div class="adults-text">
              Nos encantan los niños, pero queremos que en este día solo tengan que preocuparse por pasarla increíble. Es por ello que los menores de edad se quedan en casa.<br>
              Agradecemos desde ya su comprensión.
            </div>

            <?php
              $waPhone = preg_replace('/[^0-9]/', '', $WEDDING_CONFIG['whatsapp_rsvp_phone'] ?? '51977800311');
              $waMsg   = $WEDDING_CONFIG['whatsapp_rsvp_message'] ?? '¡Hola! 💍 Muchas gracias por la invitación, quiero confirmar mi participación en la Boda de Carlos & Jackie el sábado 26 de diciembre de 2026. ¡Ahí estaremos para celebrar juntos! ✨';
              $directWaUrl = 'https://wa.me/' . $waPhone . '?text=' . rawurlencode($waMsg);
            ?>

            <div class="rsvp-direct-block">
              <a
                href="<?= htmlspecialchars($directWaUrl) ?>"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-confirmar-script-box"
                id="btn-direct-rsvp-wa"
              >
                Confirma tu asistencia Aquí
              </a>

              <div class="rsvp-confirma-sub">CONFIRMA O ESCRÍBENOS</div>
              <div class="rsvp-deadline-note">
                Confirmar asistencia antes del <strong><?= htmlspecialchars($WEDDING_CONFIG['rsvp_deadline_text']) ?></strong>
              </div>
            </div>

            <!-- Tarjeta del Sobre Digital en PDF con Link a la Invitación -->
            <div class="editorial-envelope-card">
              <div class="editorial-envelope-card-label">✦ SOBRE DIGITAL DE BODA ✦</div>
              <div class="editorial-envelope-card-title">Sobre de Invitación en PDF</div>
              <div class="editorial-envelope-card-desc">
                Descarga el sobre oficial en PDF con enlace directo y código QR hacia esta invitación virtual.
              </div>
              <div class="editorial-envelope-actions">
                <button type="button" id="btn-download-envelope-pdf" class="btn-editorial-rect" style="width: 100%; max-width: 280px; font-size: 14px; margin-top: 0;">
                  ✉ DESCARGAR SOBRE PDF
                </button>
                <a href="sobre.php" class="copy-inline-btn" style="text-decoration: none; margin-top: 4px;">
                  Ver y personalizar Sobre Digital →
                </a>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 10: CIERRE ("¡Te esperamos! Carlos y Jackie" + FOTO PEGADA 9)
               ========================================================================== -->
          <section class="closing-section">
            <div class="gold-leaf-divider">
              <span class="gold-leaf-divider-line"></span>
              <span class="gold-leaf-divider-icon">✦ ❖ ✦</span>
              <span class="gold-leaf-divider-line"></span>
            </div>
            <div class="closing-wait">¡Te esperamos!</div>
            <div class="closing-names">Carlos y Jackie</div>

            <div class="pasted-photo-card with-tape tilt-subtle-left" style="margin-top: 18px;" data-lightbox="assets/foto_2.jpeg" data-caption="Carlos & Jackie — ¡Los esperamos para celebrar!">
              <div class="pasted-photo-img-wrap aspect-landscape">
                <img src="assets/foto_2.jpeg" alt="<?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?>">
              </div>
              <div class="pasted-photo-caption">¡Nos vemos el 26 de diciembre!</div>
            </div>

            <div class="sobre-discreet-footer">
              <a href="sobre.php">✉ Generador de Sobre PDF con Link</a>
            </div>
          </section>
        </div>

      </div>

      <!-- Modal Lightbox para apreciar las fotografías en pantalla completa -->
      <div class="watercolor-lightbox" id="watercolor-lightbox">
        <div class="watercolor-lightbox-content">
          <button class="watercolor-lightbox-close" id="lightbox-close" aria-label="Cerrar">&times;</button>
          <img src="" alt="Fotografía <?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?>" class="watercolor-lightbox-img" id="lightbox-img">
          <div class="watercolor-lightbox-caption" id="lightbox-caption"><?= htmlspecialchars($WEDDING_CONFIG['couple_names']) ?></div>
        </div>
      </div>
    </div>
  </main>

  <!-- Audio Element Mount -->
  <div id="audio-engine-mount"></div>

  <!-- Inyección de Configuración PHP a JavaScript -->
  <script>
    window.WEDDING_CONFIG = <?= json_encode($WEDDING_CONFIG, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
  </script>

  <!-- Librerías Locales Auto-Contenidas (Sin dependencias externas) -->
  <script src="assets/confetti.min.js"></script>
  <script src="assets/qrcode.min.js"></script>
  <script src="assets/jspdf.umd.min.js"></script>

  <!-- Scripts de la Invitación -->
  <script src="js/audio.js"></script>
  <script src="js/envelope.js"></script>
  <script src="js/landing.js"></script>
</body>
</html>
