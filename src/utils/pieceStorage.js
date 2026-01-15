/**
 * Piece Storage Utility
 * Handles saving and loading pieces using IndexedDB
 */

const DB_NAME = 'ChessPieceEditor';
const DB_VERSION = 1;
const STORE_NAME = 'pieces';

/**
 * Initialize IndexedDB
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Save a piece to IndexedDB
 */
export async function savePiece(piece) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const pieceData = {
      ...piece,
      updatedAt: new Date().toISOString()
    };

    const request = store.put(pieceData);

    request.onsuccess = () => resolve(pieceData);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load a piece from IndexedDB
 */
export async function loadPiece(id) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load all pieces from IndexedDB
 */
export async function loadAllPieces() {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a piece from IndexedDB
 */
export async function deletePiece(id) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all pieces from IndexedDB
 */
export async function clearAllPieces() {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generate unique ID for a piece
 */
export function generatePieceId() {
  return `piece_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export piece as PNG blob
 */
export function exportPieceAsPNG(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Export piece as data URL
 */
export function exportPieceAsDataURL(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * Load image from file
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Load image from URL
 */
export function loadImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Download piece as PNG file
 */
export async function downloadPiece(canvas, filename) {
  const blob = await exportPieceAsPNG(canvas);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `chess-piece-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Create thumbnail from canvas
 */
export function createThumbnail(canvas, maxSize = 64) {
  const thumbnailCanvas = document.createElement('canvas');
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);

  thumbnailCanvas.width = canvas.width * scale;
  thumbnailCanvas.height = canvas.height * scale;

  const ctx = thumbnailCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  return thumbnailCanvas.toDataURL('image/png');
}
