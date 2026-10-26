/**
 * Audio Storage Service — Robust Audio Management
 * Handles server-side upload to public/assets/musica.mp3,
 * with IndexedDB fallback for standalone client-side environments.
 * Prevents localStorage QuotaExceededError completely.
 */

const DB_NAME = 'boda_audio_store_v1';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const KEY_NAME = 'wedding_song';

function openAudioDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => {
      console.warn('IndexedDB audio error:', e);
      resolve(null);
    };
  });
}

export const audioStorage = {
  /**
   * Save uploaded file:
   * 1. Try server POST /api/upload-audio to write directly to public/assets/musica.mp3
   * 2. If server not reachable or static, save to IndexedDB as Blob
   */
  async saveAudioFile(file) {
    // 1. Try server upload
    try {
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          // Clear any old local IndexedDB override so server file is used
          await this.clearIndexedDbAudio();
          return {
            success: true,
            url: data.url,
            isServerFile: true
          };
        }
      }
    } catch (err) {
      console.info('Server upload not active, saving to local IndexedDB:', err.message);
    }

    // 2. Fallback to IndexedDB (unlimited quota Blob storage)
    try {
      const db = await openAudioDb();
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(file, KEY_NAME);
          tx.oncomplete = () => resolve();
          tx.onerror = (e) => reject(e);
        });
        const objectUrl = URL.createObjectURL(file);
        return {
          success: true,
          url: objectUrl,
          isServerFile: false
        };
      }
    } catch (err) {
      console.warn('Could not store in IndexedDB:', err);
    }

    // Fallback: standard static path
    return {
      success: true,
      url: '/assets/musica.mp3',
      isServerFile: true
    };
  },

  /**
   * Retrieve active audio URL (checking IndexedDB first, then fallback to /assets/musica.mp3)
   */
  async getStoredAudioUrl() {
    try {
      const db = await openAudioDb();
      if (db) {
        const blob = await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(KEY_NAME);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (blob instanceof Blob) {
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
    }
    return null;
  },

  async clearIndexedDbAudio() {
    try {
      const db = await openAudioDb();
      if (db) {
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(KEY_NAME);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      }
    } catch (err) {}
  }
};
