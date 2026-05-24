export interface PendingDownload {
  id?: number;
  blob: Blob;
  filename: string;
}

/**
 * Open/initialize the IndexedDB database.
 */
function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open('refinedocs_cache_db', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingDownloads')) {
        db.createObjectStore('pendingDownloads', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a file blob and its filename to IndexedDB.
 */
export async function savePendingDownload(blob: Blob, filename: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingDownloads', 'readwrite');
    const store = transaction.objectStore('pendingDownloads');
    const request = store.add({ blob, filename });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all pending downloads from IndexedDB and clears the object store.
 */
export async function getAndClearPendingDownloads(): Promise<PendingDownload[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pendingDownloads', 'readwrite');
    const store = transaction.objectStore('pendingDownloads');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result || [];
      if (items.length > 0) {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve(items);
        clearRequest.onerror = () => reject(clearRequest.error);
      } else {
        resolve([]);
      }
    };

    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}

/**
 * Helper to trigger a file download from a Blob.
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts a data URL to a Blob.
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}
