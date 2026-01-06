import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineService } from './offlineService';

// Keys for local cache
const CACHE_KEYS = {
    CABINETS: '@cache_cabinets',
    BOTTLES: '@cache_bottles_',
    LAST_SYNC: '@last_sync_time',
};

// Sync status type
interface SyncStatus {
    isOnline: boolean;
    pendingOperations: number;
    lastSyncTime: number | null;
}

let networkListener: (() => void) | null = null;

export const SyncService = {
    /**
     * Check if device is online
     */
    isOnline: async (): Promise<boolean> => {
        try {
            const networkState = await Network.getNetworkStateAsync();
            return (networkState.isConnected ?? false) && (networkState.isInternetReachable ?? false);
        } catch (e) {
            console.error('[SyncService] Network check failed:', e);
            return false;
        }
    },

    /**
     * Get current sync status
     */
    getStatus: async (): Promise<SyncStatus> => {
        const isOnline = await SyncService.isOnline();
        const pendingOperations = await OfflineService.getPendingCount();
        const lastSyncStr = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
        const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr) : null;

        return { isOnline, pendingOperations, lastSyncTime };
    },

    /**
     * Start listening for network changes
     */
    startNetworkListener: (onNetworkChange: (isOnline: boolean) => void) => {
        // Poll network status every 10 seconds
        const checkNetwork = async () => {
            const online = await SyncService.isOnline();
            onNetworkChange(online);

            // If we're back online, try to sync
            if (online) {
                const pending = await OfflineService.getPendingCount();
                if (pending > 0) {
                    console.log(`[SyncService] Back online with ${pending} pending operations. Syncing...`);
                    await SyncService.syncPendingOperations();
                }
            }
        };

        // Initial check
        checkNetwork();

        // Set up polling
        const intervalId = setInterval(checkNetwork, 10000);
        networkListener = () => clearInterval(intervalId);

        return () => {
            if (networkListener) {
                networkListener();
                networkListener = null;
            }
        };
    },

    /**
     * Sync all pending operations to server
     */
    syncPendingOperations: async (): Promise<{ success: number; failed: number }> => {
        const queue = await OfflineService.getQueue();
        let success = 0;
        let failed = 0;

        for (const operation of queue) {
            try {
                // Import services dynamically to avoid circular deps
                const { CabinetService } = await import('./cabinetService');
                const { BottleService } = await import('./bottleService');

                if (operation.collection === 'cabinets') {
                    if (operation.type === 'add') {
                        await CabinetService.addCabinet(operation.data.ownerId, operation.data);
                    }
                    // Add update/delete handling as needed
                } else if (operation.collection === 'bottles') {
                    if (operation.type === 'add') {
                        await BottleService.addBottle(operation.data.ownerId, operation.data);
                    }
                }

                // Remove from queue after successful sync
                await OfflineService.removeFromQueue(operation.id);
                success++;
            } catch (e) {
                console.error(`[SyncService] Failed to sync operation ${operation.id}:`, e);
                failed++;
            }
        }

        // Update last sync time
        await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());

        console.log(`[SyncService] Sync complete: ${success} succeeded, ${failed} failed`);
        return { success, failed };
    },

    /**
     * Cache data locally
     */
    cacheData: async (key: string, data: any): Promise<void> => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('[SyncService] Cache write failed:', e);
        }
    },

    /**
     * Get cached data
     */
    getCachedData: async <T>(key: string): Promise<T | null> => {
        try {
            const cached = await AsyncStorage.getItem(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                return parsed.data as T;
            }
            return null;
        } catch (e) {
            console.error('[SyncService] Cache read failed:', e);
            return null;
        }
    },

    /**
     * Cache cabinets for offline access
     */
    cacheCabinets: async (userId: string, cabinets: any[]): Promise<void> => {
        await SyncService.cacheData(`${CACHE_KEYS.CABINETS}_${userId}`, cabinets);
    },

    /**
     * Get cached cabinets
     */
    getCachedCabinets: async (userId: string): Promise<any[] | null> => {
        return SyncService.getCachedData(`${CACHE_KEYS.CABINETS}_${userId}`);
    },

    /**
     * Cache bottles for a cabinet
     */
    cacheBottles: async (cabinetId: string, bottles: any[]): Promise<void> => {
        await SyncService.cacheData(`${CACHE_KEYS.BOTTLES}${cabinetId}`, bottles);
    },

    /**
     * Get cached bottles
     */
    getCachedBottles: async (cabinetId: string): Promise<any[] | null> => {
        return SyncService.getCachedData(`${CACHE_KEYS.BOTTLES}${cabinetId}`);
    }
};
