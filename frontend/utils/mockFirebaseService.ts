// Mock Firebase Service for Development
// This allows the app to run without Firebase configuration

interface MockUser {
    uid: string;
    email: string;
    subscriptionTier: 'free' | 'premium' | 'professional';
    twoFactorEnabled: boolean;
    deviceFingerprints: string[];
    allowedCountries: string[];
}

interface MockCabinet {
    id: string;
    ownerId: string;
    name: string;
    type: 'cabinet' | 'room' | 'rack';
    dimensions: { rows: number; columns: number; depth: number };
    roomLayout?: { x: number; y: number; width: number; height: number };
}

interface MockBottle {
    id: string;
    ownerId: string;
    cabinetId: string;
    location: { row: number; col: number; depthIndex: number };
    details: {
        name: string;
        winery: string;
        vintage: string;
        type: 'Red' | 'White' | 'Rose' | 'Sparkling' | 'Dessert' | 'Other';
        country?: string;
        region?: string;
        grape?: string;
        price?: number;
        volume?: number;
    };
    status: 'stored' | 'consumed' | 'opened'; // NEW: opened status
    addedDate: string;
    consumedDate?: string;
    openedDate?: string; // NEW: when bottle was opened
    rating?: number;
    notes?: string;
    barcode?: string;
    labelImage?: string;
    bottleImage?: string;
    peakDrinkingWindow?: { start: number; end: number }; // NEW: for AI advisor
}

// Mock data storage
const mockStorage = {
    users: new Map<string, MockUser>(),
    cabinets: new Map<string, MockCabinet>(),
    bottles: new Map<string, MockBottle>(),
    consumed: new Map<string, MockBottle>(),
};

// Initialize with demo user
const demoUser: MockUser = {
    uid: 'demo-user-123',
    email: 'demo@wineapp.com',
    subscriptionTier: 'free',
    twoFactorEnabled: false,
    deviceFingerprints: [],
    allowedCountries: [],
};
mockStorage.users.set(demoUser.uid, demoUser);

// Demo cabinet
const demoCabinet: MockCabinet = {
    id: 'demo-cabinet-1',
    ownerId: demoUser.uid,
    name: 'My Wine Cabinet',
    type: 'cabinet',
    dimensions: { rows: 5, columns: 6, depth: 2 },
};
mockStorage.cabinets.set(demoCabinet.id, demoCabinet);

// Demo bottles
const demoBottle1: MockBottle = {
    id: 'demo-bottle-1',
    ownerId: demoUser.uid,
    cabinetId: demoCabinet.id,
    location: { row: 1, col: 2, depthIndex: 0 },
    details: {
        name: 'Cabernet Sauvignon',
        winery: 'Napa Valley Estates',
        vintage: '2018',
        type: 'Red',
        country: 'USA',
        region: 'Napa Valley',
        grape: 'Cabernet Sauvignon',
        price: 45,
        volume: 750,
    },
    status: 'stored',
    addedDate: new Date().toISOString(),
    peakDrinkingWindow: { start: 2025, end: 2035 }, // AI advisor data
};

const demoBottle2: MockBottle = {
    id: 'demo-bottle-2',
    ownerId: demoUser.uid,
    cabinetId: demoCabinet.id,
    location: { row: 2, col: 3, depthIndex: 0 },
    details: {
        name: 'Chardonnay',
        winery: 'Burgundy Estates',
        vintage: '2020',
        type: 'White',
        country: 'France',
        region: 'Burgundy',
        grape: 'Chardonnay',
        price: 35,
        volume: 750,
    },
    status: 'stored',
    addedDate: new Date().toISOString(),
    peakDrinkingWindow: { start: 2024, end: 2028 }, // AI advisor data
};

const demoBottle3: MockBottle = {
    id: 'demo-bottle-3',
    ownerId: demoUser.uid,
    cabinetId: demoCabinet.id,
    location: { row: 3, col: 1, depthIndex: 0 },
    details: {
        name: 'Barolo',
        winery: 'Cantina del Barolo',
        vintage: '2017',
        type: 'Red',
        country: 'Italy',
        region: 'Piedmont',
        grape: 'Nebbiolo',
        price: 65,
        volume: 750,
    },
    status: 'stored',
    addedDate: new Date().toISOString(),
    peakDrinkingWindow: { start: 2025, end: 2035 },
};

mockStorage.bottles.set(demoBottle1.id, demoBottle1);
mockStorage.bottles.set(demoBottle2.id, demoBottle2);
mockStorage.bottles.set(demoBottle3.id, demoBottle3);

export const MockFirebaseService = {
    // Auth
    getCurrentUser: async (): Promise<MockUser | null> => {
        return demoUser;
    },

    signIn: async (email: string, password: string): Promise<MockUser> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return demoUser;
    },

    signUp: async (email: string, password: string): Promise<MockUser> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newUser: MockUser = {
            uid: 'user-' + Date.now(),
            email,
            subscriptionTier: 'free',
            twoFactorEnabled: false,
            deviceFingerprints: [],
            allowedCountries: [],
        };
        mockStorage.users.set(newUser.uid, newUser);
        return newUser;
    },

    signOut: async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
    },

    // User Profile
    getUserProfile: async (uid: string): Promise<MockUser | null> => {
        return mockStorage.users.get(uid) || null;
    },

    updateUserProfile: async (uid: string, data: Partial<MockUser>): Promise<void> => {
        const user = mockStorage.users.get(uid);
        if (user) {
            mockStorage.users.set(uid, { ...user, ...data });
        }
    },

    // Cabinets
    getUserCabinets: async (uid: string): Promise<MockCabinet[]> => {
        return Array.from(mockStorage.cabinets.values()).filter(c => c.ownerId === uid);
    },

    getCabinet: async (id: string): Promise<MockCabinet | null> => {
        return mockStorage.cabinets.get(id) || null;
    },

    createCabinet: async (cabinet: Omit<MockCabinet, 'id'>): Promise<string> => {
        const id = 'cab-' + Date.now();
        const newCabinet: MockCabinet = { ...cabinet, id };
        mockStorage.cabinets.set(id, newCabinet);
        return id;
    },

    updateCabinet: async (id: string, data: Partial<MockCabinet>): Promise<void> => {
        const cabinet = mockStorage.cabinets.get(id);
        if (cabinet) {
            mockStorage.cabinets.set(id, { ...cabinet, ...data });
        }
    },

    getRoomRacks: async (parentId: string): Promise<MockCabinet[]> => {
        return Array.from(mockStorage.cabinets.values()).filter(c => c.id === parentId);
    },

    // Bottles
    getBottle: async (id: string): Promise<MockBottle | null> => {
        return mockStorage.bottles.get(id) || mockStorage.consumed.get(id) || null;
    },

    getCabinetBottles: async (cabinetId: string): Promise<MockBottle[]> => {
        return Array.from(mockStorage.bottles.values()).filter(b => b.cabinetId === cabinetId);
    },

    addBottle: async (bottle: Omit<MockBottle, 'id'>): Promise<string> => {
        const id = 'bot-' + Date.now();
        const newBottle: MockBottle = { ...bottle, id };
        mockStorage.bottles.set(id, newBottle);
        return id;
    },

    updateBottle: async (id: string, data: Partial<MockBottle>): Promise<void> => {
        const bottle = mockStorage.bottles.get(id);
        if (bottle) {
            mockStorage.bottles.set(id, { ...bottle, ...data });
        }
    },

    consumeBottle: async (id: string, rating?: number, notes?: string): Promise<void> => {
        const bottle = mockStorage.bottles.get(id);
        if (bottle) {
            const consumed: MockBottle = {
                ...bottle,
                status: 'consumed',
                consumedDate: new Date().toISOString(),
                rating,
                notes
            };
            mockStorage.bottles.delete(id);
            mockStorage.consumed.set(id, consumed);
        }
    },

    // NEW: Open bottle lifecycle method - permanently removes from cabinet
    openBottle: async (id: string): Promise<void> => {
        const bottle = mockStorage.bottles.get(id);
        if (bottle) {
            const opened: MockBottle = {
                ...bottle,
                status: 'opened',
                openedDate: new Date().toISOString()
            };
            mockStorage.bottles.delete(id);
            // Store in consumed map since it's permanently removed
            mockStorage.consumed.set(id, opened);
        }
    },

    getConsumedBottles: async (uid: string): Promise<MockBottle[]> => {
        return Array.from(mockStorage.consumed.values()).filter(b => b.ownerId === uid);
    },

    // NEW: Get all bottles (stored + opened + consumed) for history
    getAllBottles: async (uid: string): Promise<MockBottle[]> => {
        const stored = Array.from(mockStorage.bottles.values()).filter(b => b.ownerId === uid);
        const consumed = Array.from(mockStorage.consumed.values()).filter(b => b.ownerId === uid);
        return [...stored, ...consumed];
    },

    // NEW: Get stock summary for dashboard
    getStockSummary: async (uid: string): Promise<any> => {
        const bottles = Array.from(mockStorage.bottles.values()).filter(b => b.ownerId === uid);

        const byType: Record<string, number> = {};
        const byVintage: Record<string, number> = {};
        let totalValue = 0;

        bottles.forEach(bottle => {
            const type = bottle.details.type;
            byType[type] = (byType[type] || 0) + 1;

            const vintage = bottle.details.vintage;
            if (vintage) {
                byVintage[vintage] = (byVintage[vintage] || 0) + 1;
            }

            if (bottle.details.price) {
                totalValue += bottle.details.price;
            }
        });

        return {
            totalBottles: bottles.length,
            totalValue,
            byType,
            byVintage,
            oldestVintage: Object.keys(byVintage).sort()[0],
            newestVintage: Object.keys(byVintage).sort().reverse()[0]
        };
    },

    // 2FA & Security
    setup2FA: async (): Promise<{ secret: string; qrCodeUrl: string }> => {
        return {
            secret: 'DEMO-SECRET-' + Math.random().toString(36).substr(2, 10),
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO-2FA',
        };
    },

    enable2FA: async (secret: string): Promise<void> => {
        const user = mockStorage.users.get(demoUser.uid);
        if (user) {
            user.twoFactorEnabled = true;
            mockStorage.users.set(user.uid, user);
        }
    },

    verify2FA: async (code: string): Promise<boolean> => {
        return code === '123456';
    },

    generateDeviceFingerprint: async (): Promise<string> => {
        return 'fingerprint-' + Math.random().toString(36).substr(2, 16);
    },

    rememberDevice: async (uid: string, fingerprint: string): Promise<void> => {
        const user = mockStorage.users.get(uid);
        if (user) {
            user.deviceFingerprints.push(fingerprint);
            mockStorage.users.set(uid, user);
        }
    },

    // Subscription
    updateUserSubscription: async (uid: string, tier: 'free' | 'premium' | 'professional'): Promise<void> => {
        const user = mockStorage.users.get(uid);
        if (user) {
            user.subscriptionTier = tier;
            mockStorage.users.set(uid, user);
        }
    },

    // Mock sync (no-op for demo)
    syncPendingChanges: async (): Promise<void> => {
        console.log('[MockSync] No pending changes to sync');
    },
};
