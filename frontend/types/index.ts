// Shared types for frontend

export interface AppUser {
    uid: string;
    email: string | null;
    displayName?: string | null;
    subscriptionTier?: 'free' | 'premium' | 'professional';
}

export interface UserProfile {
    email: string;
    displayName: string;
    subscriptionTier: 'free' | 'premium' | 'professional';
    createdAt: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    twoFactorVerified?: boolean;
    allowedCountries: string[];
    deviceFingerprints?: string[];
    authProvider?: string;
}

export interface Cabinet {
    id: string;
    ownerId: string;
    name: string;
    type: 'cabinet' | 'room' | 'rack';
    parentId?: string;
    dimensions: {
        rows: number;
        columns: number;
        depth: number;
    };
    roomLayout?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    zone?: {
        name: string;
        targetTempCelsius?: number;
    };
}

export interface Bottle {
    id: string;
    ownerId: string;
    cabinetId: string;
    location: {
        row: number;
        col: number;
        depthIndex: number;
    };
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
    labelImage?: string;
    bottleImage?: string;
    barcode?: string;
    status: 'stored' | 'consumed' | 'opened';
    addedDate: string;
    consumedDate?: string;
    openedDate?: string;
    rating?: number;
    notes?: string;
    peakDrinkingWindow?: {
        start: number;
        end: number;
    };
}

export interface WineLabelData {
    name?: string;
    winery?: string;
    vintage?: string;
    country?: string;
    region?: string;
    grape?: string;
    alcohol?: string;
    volume?: string;
    barcode?: string;
    price?: number;
}

export interface VivinoProduct {
    id: number;
    name: string;
    vineyard?: string;
    year?: number;
    country: {
        code: string;
        name: string;
    };
    region?: {
        name: string;
    };
    type: string;
    varietal?: {
        name: string;
    };
    image?: string;
}

export interface ColorBreakdown {
    type: string;
    count: number;
    percentage: number;
    color: string;
    icon: string;
    gradient: string[];
}

export interface StockAlert {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    icon: string;
}

export interface DashboardStats {
    totalBottles: number;
    totalValue: number;
    cabinets: number;
    byType: Record<string, number>;
}

export interface ScanResult {
    success: boolean;
    data?: WineLabelData;
    error?: string;
    confidence: number;
}

export interface CameraPermission {
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'undetermined';
}

export interface QueuedOperation {
    id: string;
    type: 'add' | 'update' | 'delete';
    collection: 'cabinets' | 'bottles';
    data: any;
    timestamp: number;
}

export interface SyncStatus {
    isOnline: boolean;
    pendingOperations: number;
    lastSyncTime: number | null;
}

// Frontend-specific types
export interface NavigationItem {
    label: string;
    icon: string;
    route: string;
    activeIcon?: string;
}
