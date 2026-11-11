<?php
/**
 * Generador nativo de archivo .ICS para Google Calendar / Apple Calendar / Outlook
 */
require_once __DIR__ . '/config.php';

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="Boda_Carlos_y_Jackie.ics"');
header('Cache-Control: no-cache, must-revalidate');

$icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Carlos y Jackie//Boda 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:boda-carlos-y-jackie-2026@villavenecia',
    'DTSTAMP:' . gmdate('Ymd\THis\Z'),
    'DTSTART:20261227T000000Z',
    'DTEND:20261227T100000Z',
    'SUMMARY:Boda Civil & Recepción: ' . $WEDDING_CONFIG['couple_names'] . ' 💍',
    'DESCRIPTION:Recepción y celebración de boda civil de ' . $WEDDING_CONFIG['couple_names'] . ' en ' . $WEDDING_CONFIG['venue_name'] . ' (' . $WEDDING_CONFIG['venue_district'] . '). Invitación web: ' . $WEDDING_CONFIG['invitation_url'],
    'LOCATION:Recepciones Villa Venecia, Av. 13 De Enero 1532, San Juan de Lurigancho, Lima',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
];

echo implode("\r\n", $icsLines);
exit;

