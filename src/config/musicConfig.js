/**
 * ============================================================================
 * CONFIGURACIÓN DE MÚSICA DE LA BODA — Carlos & Jackie
 * ============================================================================
 * 
 * Puedes configurar la música de dos formas muy sencillas:
 * 
 * OPCIÓN 1 (Subir archivo MP3 local):
 * -----------------------------------
 * Guarda tu archivo de audio con el nombre "musica.mp3" dentro de la carpeta:
 *   public/assets/musica.mp3
 * y deja la propiedad 'url' como: '/assets/musica.mp3'.
 * 
 * OPCIÓN 2 (Colocar un link online directo):
 * -----------------------------------------
 * Pega el enlace directo a tu archivo de audio (MP3, AAC, etc.) alojado en la nube.
 * Ejemplo:
 *   url: 'https://miservidor.com/nuestra-cancion.mp3'
 */

export const MUSIC_CONFIG = {
  // Ruta local en public/ o enlace web directo a tu archivo MP3:
  url: '/assets/musica.mp3',

  // ¿Reproducir automáticamente al abrir la invitación? (true / false)
  autoplay: true,

  // Volumen de la música (entre 0.0 y 1.0)
  volume: 0.65,

  // Texto para el reproductor
  labelPlay: '¡Dale play!',
  labelPause: 'Pausar música',
  labelPlaying: '♪ Sonando...',
};
