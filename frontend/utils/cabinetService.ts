import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Cabinet } from '../types';
import { SyncService } from './syncService';
import { OfflineService } from './offlineService';

const CABINET_COLLECTION = 'cabinets';

export const CabinetService = {
    /**
     * Add a cabinet - saves locally first, syncs to server if online
     */
    addCabinet: async (userId: string, data: Omit<Cabinet, 'id' | 'ownerId'>): Promise<Cabinet> => {
        const isOnline = await SyncService.isOnline();
        const cabinetData = { ...data, ownerId: userId };

        if (isOnline) {
            // Online: Save directly to Firestore
            try {
                const docRef = await addDoc(collection(db, CABINET_COLLECTION), cabinetData);
                const newCabinet = { id: docRef.id, ...cabinetData } as Cabinet;

                // Update local cache
                const cached = await SyncService.getCachedCabinets(userId) || [];
                cached.push(newCabinet);
                await SyncService.cacheCabinets(userId, cached);

                return newCabinet;
            } catch (e) {
                console.error('[CabinetService] Online save failed, falling back to offline:', e);
                // Fall through to offline handling
            }
        }

        // Offline: Generate local ID and queue for later sync
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCabinet = { id: localId, ...cabinetData } as Cabinet;

        // Save to local cache immediately
        const cached = await SyncService.getCachedCabinets(userId) || [];
        cached.push(newCabinet);
        await SyncService.cacheCabinets(userId, cached);

        // Queue for server sync
        await OfflineService.queueOperation({
            type: 'add',
            collection: 'cabinets',
            data: cabinetData
        });

        console.log('[CabinetService] Saved offline, queued for sync');
        return newCabinet;
    },

    /**
     * Get user's cabinets - tries server first, falls back to cache
     */
    getUserCabinets: async (userId: string): Promise<Cabinet[]> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const q = query(collection(db, CABINET_COLLECTION), where('ownerId', '==', userId));
                const querySnapshot = await getDocs(q);
                const cabinets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cabinet));

                // Update cache with fresh data
                await SyncService.cacheCabinets(userId, cabinets);

                return cabinets;
            } catch (e) {
                console.error('[CabinetService] Fetch failed, using cache:', e);
            }
        }

        // Offline or fetch failed: Use cache
        const cached = await SyncService.getCachedCabinets(userId);
        if (cached) {
            console.log('[CabinetService] Returning cached cabinets');
            return cached;
        }

        return [];
    },

    /**
     * Get a single cabinet by ID
     */
    getCabinet: async (id: string): Promise<Cabinet | null> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const docRef = doc(db, CABINET_COLLECTION, id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    return { id: snap.id, ...snap.data() } as Cabinet;
                }
            } catch (e) {
                console.error('[CabinetService] Single fetch failed:', e);
            }
        }

        // For offline, we'd need to search the cache
        // This is a simplified implementation
        return null;
    },

    /**
     * Get all racks inside a room
     */
    getRoomRacks: async (roomId: string): Promise<Cabinet[]> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const q = query(
                    collection(db, CABINET_COLLECTION),
                    where('parentId', '==', roomId),
                    where('type', '==', 'rack')
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cabinet));
            } catch (e) {
                console.error('[CabinetService] Get room racks failed:', e);
            }
        }

        return [];
    },

    /**
     * Update a cabinet's data
     */
    updateCabinet: async (id: string, data: Partial<Cabinet>): Promise<void> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const docRef = doc(db, CABINET_COLLECTION, id);
                await updateDoc(docRef, data);
                return;
            } catch (e) {
                console.error('[CabinetService] Update cabinet failed:', e);
            }
        }

        // Queue operation for later sync
        await OfflineService.queueOperation({
            type: 'update',
            collection: 'cabinets',
            data: { id, ...data }
        });
    }
};

