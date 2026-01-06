import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Bottle } from '../types';
import { SyncService } from './syncService';
import { OfflineService } from './offlineService';

const BOTTLE_COLLECTION = 'bottles';

export const BottleService = {
    /**
     * Add a bottle - saves locally first, syncs to server if online
     */
    addBottle: async (userId: string, data: Omit<Bottle, 'id' | 'ownerId'>): Promise<Bottle> => {
        const isOnline = await SyncService.isOnline();
        const bottleData = { ...data, ownerId: userId };

        if (isOnline) {
            try {
                const docRef = await addDoc(collection(db, BOTTLE_COLLECTION), bottleData);
                const newBottle = { id: docRef.id, ...bottleData } as Bottle;

                // Update local cache
                const cached = await SyncService.getCachedBottles(data.cabinetId) || [];
                cached.push(newBottle);
                await SyncService.cacheBottles(data.cabinetId, cached);

                return newBottle;
            } catch (e) {
                console.error('[BottleService] Online save failed, falling back to offline:', e);
            }
        }

        // Offline: Generate local ID and queue
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newBottle = { id: localId, ...bottleData } as Bottle;

        // Save to cache
        const cached = await SyncService.getCachedBottles(data.cabinetId) || [];
        cached.push(newBottle);
        await SyncService.cacheBottles(data.cabinetId, cached);

        // Queue for sync
        await OfflineService.queueOperation({
            type: 'add',
            collection: 'bottles',
            data: bottleData
        });

        console.log('[BottleService] Saved offline, queued for sync');
        return newBottle;
    },

    /**
     * Get bottles in a cabinet - tries server first, falls back to cache
     */
    getCabinetBottles: async (cabinetId: string): Promise<Bottle[]> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const q = query(
                    collection(db, BOTTLE_COLLECTION),
                    where('cabinetId', '==', cabinetId),
                    where('status', '==', 'stored')
                );
                const querySnapshot = await getDocs(q);
                const bottles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bottle));

                // Update cache
                await SyncService.cacheBottles(cabinetId, bottles);

                return bottles;
            } catch (e) {
                console.error('[BottleService] Fetch failed, using cache:', e);
            }
        }

        // Offline: Use cache
        const cached = await SyncService.getCachedBottles(cabinetId);
        if (cached) {
            return cached.filter(b => b.status === 'stored');
        }

        return [];
    },

    /**
     * Consume a bottle - mark as consumed with rating
     */
    consumeBottle: async (bottleId: string, rating?: number): Promise<void> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const docRef = doc(db, BOTTLE_COLLECTION, bottleId);
                await updateDoc(docRef, {
                    status: 'consumed',
                    consumedDate: new Date().toISOString(),
                    rating: rating || null
                });
                return;
            } catch (e) {
                console.error('[BottleService] Consume failed:', e);
            }
        }

        // Queue operation for later
        await OfflineService.queueOperation({
            type: 'update',
            collection: 'bottles',
            data: { bottleId, status: 'consumed', rating }
        });
    },

    /**
     * Get a single bottle by ID
     */
    getBottle: async (id: string): Promise<Bottle | null> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const docRef = doc(db, BOTTLE_COLLECTION, id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    return { id: snap.id, ...snap.data() } as Bottle;
                }
            } catch (e) {
                console.error('[BottleService] Fetch bottle failed:', e);
            }
        }

        return null;
    },

    /**
     * Get consumed bottles for history
     */
    getConsumedBottles: async (userId: string): Promise<Bottle[]> => {
        const isOnline = await SyncService.isOnline();

        if (isOnline) {
            try {
                const q = query(
                    collection(db, BOTTLE_COLLECTION),
                    where('ownerId', '==', userId),
                    where('status', '==', 'consumed')
                );
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bottle));
            } catch (e) {
                console.error('[BottleService] Fetch consumed failed:', e);
            }
        }

        return [];
    }
};

