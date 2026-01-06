import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for offline queue
interface QueuedOperation {
    id: string;
    type: 'add' | 'update' | 'delete';
    collection: 'cabinets' | 'bottles';
    data: any;
    timestamp: number;
}

const QUEUE_KEY = '@offline_queue';
const CACHE_PREFIX = '@cache_';

export const OfflineService = {
    /**
     * Add an operation to the offline queue
     */
    queueOperation: async (operation: Omit<QueuedOperation, 'id' | 'timestamp'>): Promise<void> => {
        try {
            const queue = await OfflineService.getQueue();
            const newOp: QueuedOperation = {
                ...operation,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            };
            queue.push(newOp);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            console.log('[Offline] Queued operation:', newOp.type, newOp.collection);
        } catch (e) {
            console.error('[Offline] Failed to queue operation:', e);
        }
    },

    /**
     * Get all pending operations
     */
    getQueue: async (): Promise<QueuedOperation[]> => {
        try {
            const data = await AsyncStorage.getItem(QUEUE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[Offline] Failed to get queue:', e);
            return [];
        }
    },

    /**
     * Clear a specific operation from queue (after successful sync)
     */
    removeFromQueue: async (operationId: string): Promise<void> => {
        try {
            const queue = await OfflineService.getQueue();
            const filtered = queue.filter(op => op.id !== operationId);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error('[Offline] Failed to remove from queue:', e);
        }
    },

    /**
     * Clear entire queue
     */
    clearQueue: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(QUEUE_KEY);
        } catch (e) {
            console.error('[Offline] Failed to clear queue:', e);
        }
    },

    /**
     * Cache data locally
     */
    cacheData: async (key: string, data: any): Promise<void> => {
        try {
            await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
                data,
                cachedAt: Date.now()
            }));
        } catch (e) {
            console.error('[Offline] Failed to cache data:', e);
        }
    },

    /**
     * Get cached data
     */
    getCachedData: async <T>(key: string): Promise<{ data: T; cachedAt: number } | null> => {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            console.error('[Offline] Failed to get cached data:', e);
            return null;
        }
    },

    /**
     * Check if we have cached data
     */
    hasCachedData: async (key: string): Promise<boolean> => {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            return cached !== null;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get queue length (for UI indicator)
     */
    getPendingCount: async (): Promise<number> => {
        const queue = await OfflineService.getQueue();
        return queue.length;
    }
};
