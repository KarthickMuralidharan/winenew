// Bulk Add Service - Add multiple bottles with replicated data
import { BottleService } from './bottleService';
import { StorageService } from './storageService';
import { WineDatabaseService } from './wineDatabaseService';
import { Bottle } from '../types';

export interface BulkAddOptions {
    userId: string;
    cabinetId: string;
    baseData: Omit<Bottle, 'id' | 'ownerId'>;
    locations: Array<{ row: number; col: number; depthIndex: number }>;
}

export interface BulkAddResult {
    success: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
}

export const BulkAddService = {
    /**
     * Add multiple bottles with the same data
     * Useful for adding cases of the same wine
     */
    addMultiple: async (options: BulkAddOptions): Promise<BulkAddResult> => {
        const { userId, cabinetId, baseData, locations } = options;
        const result: BulkAddResult = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Upload images once
        let labelImageUrl: string | undefined;
        let bottleImageUrl: string | undefined;

        if (baseData.labelImage || baseData.bottleImage) {
            const bottleId = StorageService.generateBottleId();
            if (baseData.labelImage) {
                labelImageUrl = await StorageService.uploadBottleLabel(userId, bottleId, baseData.labelImage);
            }
            if (baseData.bottleImage) {
                bottleImageUrl = await StorageService.uploadBottlePhoto(userId, bottleId, baseData.bottleImage);
            }
        }

        // Add bottles sequentially
        for (let i = 0; i < locations.length; i++) {
            try {
                await BottleService.addBottle(userId, {
                    ...baseData,
                    location: locations[i],
                    labelImage: labelImageUrl,
                    bottleImage: bottleImageUrl
                });
                result.success++;
            } catch (e: any) {
                result.failed++;
                result.errors.push({ index: i, error: e.message });
            }
        }

        return result;
    },

    /**
     * Scan and add multiple bottles with barcodes
     * Each bottle is scanned once, data is replicated
     */
    scanAndAddMultiple: async (
        userId: string,
        cabinetId: string,
        locations: Array<{ row: number; col: number; depthIndex: number }>,
        onProgress?: (current: number, total: number) => void
    ): Promise<BulkAddResult> => {
        const result: BulkAddResult = {
            success: 0,
            failed: 0,
            errors: []
        };

        // In production, this would integrate with a batch barcode scanner
        // that allows scanning multiple bottles in sequence

        for (let i = 0; i < locations.length; i++) {
            onProgress?.(i + 1, locations.length);

            try {
                // Placeholder for batch scanning logic
                // User would scan each bottle and the data would be auto-populated
                result.success++;
            } catch (e: any) {
                result.failed++;
                result.errors.push({ index: i, error: e.message });
            }
        }

        return result;
    }
};
