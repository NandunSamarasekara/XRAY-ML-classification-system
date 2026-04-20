const DB_NAME = 'WedakamDraftDB';
const STORE_NAME = 'draft_images';
const DB_VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
            }
        };
    });
};

export const saveDraftImages = async (reportId, normalImageBase64, heatmapBase64) => {
    if (!reportId || (!normalImageBase64 && !heatmapBase64)) return;
    
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.put({
                reportId: reportId.toString(),
                normalImage: normalImageBase64,
                heatmapImage: heatmapBase64,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error('Failed to save draft images to IndexedDB', err);
    }
};

export const getDraftImages = async (reportId) => {
    if (!reportId) return null;
    
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(reportId.toString());

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error('Failed to get draft images from IndexedDB', err);
        return null;
    }
};

export const deleteDraftImages = async (reportId) => {
    if (!reportId) return;
    
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(reportId.toString());

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error('Failed to delete draft images from IndexedDB', err);
    }
};
