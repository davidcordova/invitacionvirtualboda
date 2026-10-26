/**
 * Storage Service - Wedding Guest Management & State Machine
 * Carlos & Jackie - Recepciones Villa Venecia 2026
 */

const STORAGE_KEY = 'boda_carlos_jackie_guests_v1';

export const INITIAL_GUESTS = [
  {
    id: 'INV-8F3A',
    name: 'Familia Pérez Gómez',
    phone: '+51 987 654 321',
    passes: 4,
    confirmedPasses: 4,
    attendedPasses: 0,
    table: 'Mesa 4',
    customNote: '¡Los esperamos con todo nuestro cariño en Villa Venecia!',
    status: 'confirmada',
    dietaryRestrictions: '1 menú infantil, 1 celíaco',
    songSuggestion: 'Vivir Mi Vida - Marc Anthony',
    wishes: '¡Muchas felicidades Carlos y Jackie! Que Dios bendiga su unión siempre.',
    viewedAt: '2026-10-20T14:30:00Z',
    confirmedAt: '2026-10-21T10:15:00Z',
    checkedInAt: null
  },
  {
    id: 'INV-4D9E',
    name: 'Lic. Roberto Mendoza y Acompañante',
    phone: '+51 912 345 678',
    passes: 2,
    confirmedPasses: 2,
    attendedPasses: 0,
    table: 'Mesa 2',
    customNote: 'Será un gran honor contar con su grata presencia.',
    status: 'enviada',
    dietaryRestrictions: '',
    songSuggestion: '',
    wishes: '',
    viewedAt: null,
    confirmedAt: null,
    checkedInAt: null
  },
  {
    id: 'INV-7C2B',
    name: 'Dra. Sofía Valenzuela',
    phone: '+51 998 877 665',
    passes: 1,
    confirmedPasses: 1,
    attendedPasses: 0,
    table: 'Mesa de Honor',
    customNote: 'Gracias por ser parte fundamental de nuestras vidas.',
    status: 'ingreso',
    dietaryRestrictions: 'Vegetariana',
    songSuggestion: 'Can’t Take My Eyes Off You - Frankie Valli',
    wishes: '¡Qué vivan los novios! Les deseo toda la felicidad del mundo.',
    viewedAt: '2026-10-18T09:20:00Z',
    confirmedAt: '2026-10-18T11:45:00Z',
    checkedInAt: '2026-10-24T18:30:00Z'
  },
  {
    id: 'INV-3A6F',
    name: 'Carlos Andrés Benítez & Sra.',
    phone: '+51 954 112 233',
    passes: 2,
    confirmedPasses: 2,
    attendedPasses: 0,
    table: 'Mesa 6',
    customNote: '¡Listos para celebrar y brindar juntos!',
    status: 'vista',
    dietaryRestrictions: '',
    songSuggestion: 'Bailando - Enrique Iglesias',
    wishes: '',
    viewedAt: '2026-10-22T19:40:00Z',
    confirmedAt: null,
    checkedInAt: null
  },
  {
    id: 'INV-9K1L',
    name: 'Ing. Fernando Castillo y Familia',
    phone: '+51 933 445 566',
    passes: 3,
    confirmedPasses: 0,
    attendedPasses: 0,
    table: 'Mesa 8',
    customNote: 'Un afectuoso saludo para todos ustedes.',
    status: 'declinada',
    dietaryRestrictions: '',
    songSuggestion: '',
    wishes: 'Lamentamos mucho no poder asistir por viaje de trabajo, pero les mandamos un fuerte abrazo.',
    viewedAt: '2026-10-19T16:10:00Z',
    confirmedAt: '2026-10-19T18:00:00Z',
    checkedInAt: null
  },
  {
    id: 'INV-2M8P',
    name: 'Tíos Alberto y Carmen Ruiz',
    phone: '+51 977 123 456',
    passes: 2,
    confirmedPasses: 0,
    attendedPasses: 0,
    table: 'Mesa 1',
    customNote: 'Con un inmenso cariño para nuestros queridos sobrinos.',
    status: 'pendiente',
    dietaryRestrictions: '',
    songSuggestion: '',
    wishes: '',
    viewedAt: null,
    confirmedAt: null,
    checkedInAt: null
  }
];

class StorageService {
  constructor() {
    this.subscribers = [];
    this.init();
  }

  init() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      this.resetToDefaults();
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    const data = this.getGuests();
    this.subscribers.forEach(cb => cb(data));
  }

  generateToken() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'INV-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getGuests() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  }

  getGuestById(id) {
    if (!id) return null;
    const guests = this.getGuests();
    return guests.find(g => g.id.toLowerCase() === id.trim().toLowerCase()) || null;
  }

  saveGuest(guestData) {
    const guests = this.getGuests();
    let updated;
    if (guestData.id) {
      const index = guests.findIndex(g => g.id.toLowerCase() === guestData.id.toLowerCase());
      if (index !== -1) {
        guests[index] = { ...guests[index], ...guestData };
        updated = guests[index];
      } else {
        guestData.id = guestData.id.toUpperCase();
        guests.push(guestData);
        updated = guestData;
      }
    } else {
      guestData.id = this.generateToken();
      guestData.status = guestData.status || 'pendiente';
      guestData.confirmedPasses = guestData.confirmedPasses || 0;
      guestData.attendedPasses = 0;
      guests.push(guestData);
      updated = guestData;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    this.notify();
    return updated;
  }

  deleteGuest(id) {
    let guests = this.getGuests();
    guests = guests.filter(g => g.id.toLowerCase() !== id.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    this.notify();
  }

  bulkAddGuests(newList) {
    const guests = this.getGuests();
    const existingTokens = new Set(guests.map(g => g.id.toUpperCase()));

    newList.forEach(item => {
      let token = item.id ? item.id.toUpperCase() : null;
      if (!token || existingTokens.has(token)) {
        do {
          token = this.generateToken();
        } while (existingTokens.has(token));
      }
      existingTokens.add(token);

      guests.push({
        id: token,
        name: item.name || 'Invitado Especial',
        phone: item.phone || '',
        passes: parseInt(item.passes, 10) || 1,
        confirmedPasses: 0,
        attendedPasses: 0,
        table: item.table || 'Por asignar',
        customNote: item.customNote || '',
        status: 'pendiente',
        dietaryRestrictions: '',
        songSuggestion: '',
        wishes: '',
        viewedAt: null,
        confirmedAt: null,
        checkedInAt: null
      });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    this.notify();
    return guests;
  }

  markGuestViewed(id) {
    const guest = this.getGuestById(id);
    if (!guest) return null;
    if (guest.status === 'pendiente' || guest.status === 'enviada') {
      guest.status = 'vista';
      guest.viewedAt = new Date().toISOString();
      return this.saveGuest(guest);
    }
    return guest;
  }

  confirmGuestRsvp(id, { attending, confirmedPasses, dietaryRestrictions, songSuggestion, wishes }) {
    const guest = this.getGuestById(id);
    if (!guest) return null;

    if (attending) {
      guest.status = 'confirmada';
      guest.confirmedPasses = Math.min(Math.max(1, parseInt(confirmedPasses, 10) || 1), guest.passes);
    } else {
      guest.status = 'declinada';
      guest.confirmedPasses = 0;
    }

    guest.dietaryRestrictions = dietaryRestrictions || '';
    guest.songSuggestion = songSuggestion || '';
    guest.wishes = wishes || '';
    guest.confirmedAt = new Date().toISOString();

    return this.saveGuest(guest);
  }

  checkinGuest(id, passesToCheckin) {
    const guest = this.getGuestById(id);
    if (!guest) return { success: false, message: 'Invitado no encontrado.' };

    const passesToAdd = parseInt(passesToCheckin, 10) || 1;
    const currentAttended = guest.attendedPasses || 0;
    const maxPasses = guest.passes || 1;

    const newAttended = Math.min(currentAttended + passesToAdd, maxPasses);
    guest.attendedPasses = newAttended;
    guest.status = 'ingreso';
    guest.checkedInAt = new Date().toISOString();

    this.saveGuest(guest);
    return {
      success: true,
      guest,
      newAttended,
      totalPasses: maxPasses,
      allEntered: newAttended >= maxPasses
    };
  }

  getMetrics() {
    const guests = this.getGuests();
    const totalGroups = guests.length;
    const totalPassesIssued = guests.reduce((sum, g) => sum + (parseInt(g.passes, 10) || 0), 0);
    const totalConfirmedPasses = guests.reduce((sum, g) => sum + (g.status === 'confirmada' || g.status === 'ingreso' ? (parseInt(g.confirmedPasses, 10) || parseInt(g.passes, 10) || 0) : 0), 0);
    const totalDeclinedPasses = guests.reduce((sum, g) => sum + (g.status === 'declinada' ? (parseInt(g.passes, 10) || 0) : 0), 0);
    const totalAttendedPasses = guests.reduce((sum, g) => sum + (parseInt(g.attendedPasses, 10) || 0), 0);
    const checkedInGuestsCount = guests.filter(g => g.status === 'ingreso' || (g.attendedPasses && g.attendedPasses > 0)).length;

    const confirmationPercentage = totalPassesIssued > 0 ? Math.round((totalConfirmedPasses / totalPassesIssued) * 100) : 0;

    return {
      totalGroups,
      totalPassesIssued,
      totalConfirmedPasses,
      totalDeclinedPasses,
      totalAttendedPasses,
      checkedInGuestsCount,
      confirmationPercentage
    };
  }

  getMusicSettings() {
    const MUSIC_KEY = 'boda_music_config_v1';
    try {
      const raw = localStorage.getItem(MUSIC_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // If it was stored as a massive data: URL, clean it up to prevent quota crash
        if (parsed.url && parsed.url.startsWith('data:')) {
          parsed.url = '/assets/musica.mp3';
          localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading music config from storage:', e);
      try { localStorage.removeItem(MUSIC_KEY); } catch(err) {}
    }
    return {
      url: '/assets/musica.mp3',
      title: 'Carlos & Jackie — Melodía Nupcial',
      volume: 0.65,
      autoplay: true
    };
  }

  saveMusicSettings(settings) {
    const MUSIC_KEY = 'boda_music_config_v1';
    const current = this.getMusicSettings();
    const updated = { ...current, ...settings };
    
    // Sanitize URL for localStorage: never store massive base64 strings in localStorage
    const toStore = { ...updated };
    if (toStore.url && toStore.url.startsWith('data:')) {
      toStore.url = '/assets/musica.mp3';
    }

    try {
      localStorage.setItem(MUSIC_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Could not save music config to localStorage:', e);
    }
    this.notify();
    return updated;
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GUESTS));
    this.notify();
    return INITIAL_GUESTS;
  }
}

export const storage = new StorageService();
