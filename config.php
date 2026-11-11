<?php
/**
 * ============================================================================
 * CONFIGURACIÓN GENERAL DE LA INVITACIÓN DE BODA — Carlos & Jackie (MVP PHP)
 * ============================================================================
 * Archivo centralizado listo para subir a cualquier hosting con cPanel.
 * No requiere base de datos.
 */

// Detectar automáticamente la URL base del sitio (funciona en dominio raíz, subcarpeta o localhost)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443)
    ? 'https' : 'http';

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$rawDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$scriptDir = ($rawDir === '.' || $rawDir === '/') ? '' : rtrim($rawDir, '/');
$detectedBaseUrl = $protocol . '://' . $host . $scriptDir;

$WEDDING_CONFIG = [
    // Datos de los Novios
    'couple_names'       => 'Carlos & Jackie',
    'groom_name'         => 'Carlos',
    'bride_name'         => 'Jackie',
    'hero_Upper_title'   => '¡NOS CASAMOS!',

    // Padres de los Novios
    'bride_parents' => [
        'César Augusto Lopez',
        'Natividad Zuñiga'
    ],
    'groom_parents' => [
        'Juan Aguirre',
        'Bertila Cabeza'
    ],

    // Texto de la Tarjeta Genérica (impresa en el pliego y en el Sobre PDF)
    'generic_pass_label' => 'INVITACIÓN ESPECIAL',
    'generic_guest_title'=> 'Familia & Amigos',
    'generic_pass_meta'  => 'Boda Civil & Recepción',
    'generic_pass_note'  => '¡Será un gran honor contar con su grata presencia en este día tan especial!',

    // Fecha y Hora del Evento
    'event_date_display' => '26 | DICIEMBRE | 2026',
    'event_date_full'    => 'Sábado, 26 de Diciembre de 2026',
    'event_time_display' => '7:00PM',
    'event_iso_countdown'=> '2026-12-26T19:00:00-05:00',
    'rsvp_deadline_text' => '10 de diciembre',

    // Ubicación y Mapas
    'venue_name'         => 'Recepciones Villa Venecia',
    'venue_district'     => 'San Juan de Lurigancho',
    'venue_address_lines'=> "Recepciones Villa Venecia\nAv. 13 De Enero 1532\n(a espaldas del parque Zonal Huiracocha)\nSan Juan de Lurigancho",
    'google_maps_url'    => 'https://www.google.com/maps/search/?api=1&query=Av.+13+De+Enero+1532+San+Juan+de+Lurigancho',
    'waze_url'           => 'https://waze.com/ul?q=Av.+13+De+Enero+1532+San+Juan+de+Lurigancho',

    // Confirmación de Asistencia por WhatsApp — Número de la Novia (+51 977 800 311)
    'whatsapp_rsvp_phone'   => '51977800311',
    'whatsapp_rsvp_display' => '+51 977 800 311',
    'whatsapp_rsvp_message' => '¡Hola! 💍 Muchas gracias por la invitación, quiero confirmar mi participación en la Boda de Carlos & Jackie el sábado 26 de diciembre de 2026. ¡Ahí estaremos para celebrar juntos! ✨',

    // Cuentas Bancarias y Mesa de Regalos
    'bank_accounts' => [
        [
            'label'       => 'Cuenta Millonaria Soles en Interbank:',
            'value'       => '4893076373459',
            'holder'      => '',
            'copy_value'  => '4893076373459',
            'button_text' => 'Copiar Cuenta'
        ],
        [
            'label'       => 'Cuenta Interbancario (CCI) en Interbank:',
            'value'       => '00348901307637345922',
            'holder'      => '',
            'copy_value'  => '00348901307637345922',
            'button_text' => 'Copiar CCI'
        ],
        [
            'label'       => 'Para Plin:',
            'value'       => '944 253 004',
            'holder'      => 'Carlos Miguel Aguirre',
            'copy_value'  => '944253004',
            'button_text' => 'Copiar Plin'
        ]
    ],

    // Configuración de Música de Fondo
    'music' => [
        'url'        => 'assets/musica.mp3',
        'autoplay'   => true,
        'volume'     => 0.65,
        'labelPlay'  => '¡Dale play!',
        'labelPause' => 'Pausar música'
    ],

    // URL oficial de producción (embebida en el Sobre PDF, QR, OpenGraph y Calendario)
    'base_url'       => 'https://alphastudio.net.pe/invitacion',
    'invitation_url' => 'https://alphastudio.net.pe/invitacion',
    'sobre_url'      => 'https://alphastudio.net.pe/invitacion/sobre.php'
];
