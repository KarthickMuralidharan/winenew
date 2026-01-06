// Wine Database Service
// Integrates with external wine APIs (Vivino, Wine-Searcher) to fetch wine metadata

import { WineLabelData, VivinoProduct } from '../types';

// Configuration - Use environment variables
const VIVINO_API_BASE = 'https://api.vivino.com';
const WINE_SEARCHER_API_BASE = 'https://api.wine-searcher.com';
const VIVINO_API_KEY = process.env.EXPO_PUBLIC_VIVINO_API_KEY;
const WINE_SEARCHER_API_KEY = process.env.EXPO_PUBLIC_WINE_SEARCHER_API_KEY;

// Mock data for development (since we don't have actual API keys)
const MOCK_WINES: Record<string, VivinoProduct> = {
    '750ml': {
        id: 1,
        name: 'Sample Wine',
        vineyard: 'Sample Winery',
        year: 2020,
        country: { code: 'US', name: 'United States' },
        region: { name: 'Napa Valley' },
        type: 'Red',
        varietal: { name: 'Cabernet Sauvignon' },
    }
};

interface WineSearchResult {
    success: boolean;
    products?: VivinoProduct[];
    error?: string;
}

interface BarcodeLookupResult {
    success: boolean;
    product?: VivinoProduct;
    error?: string;
}

export const WineDatabaseService = {
    /**
     * Lookup wine by barcode
     * Uses Vivino or Wine-Searcher API
     */
    lookupByBarcode: async (barcode: string): Promise<BarcodeLookupResult> => {
        // In production, this would call the actual API
        // For now, we return mock data or simulate an API call

        console.log(`[WineDB] Looking up barcode: ${barcode}`);

        try {
            // Simulate API call (replace with actual API in production)
            // const response = await fetch(`${VIVINO_API_BASE}/barcodes/${barcode}`, {
            //     headers: { 'X-API-Key': VIVINO_API_KEY }
            // });

            // Mock response for development
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            // Check if barcode matches common wine patterns
            const isValidBarcode = /^\d{8,14}$/.test(barcode);
            if (!isValidBarcode) {
                return { success: false, error: 'Invalid barcode format' };
            }

            // Return mock data
            return {
                success: true,
                product: {
                    id: parseInt(barcode.slice(-6)),
                    name: `Wine ${barcode.slice(-4)}`,
                    vineyard: 'Unknown Winery',
                    year: 2020 + Math.floor(Math.random() * 5),
                    country: { code: 'US', name: 'United States' },
                    region: { name: 'California' },
                    type: 'Red',
                    varietal: { name: 'Cabernet Sauvignon' }
                }
            };
        } catch (error: any) {
            console.error('[WineDB] Barcode lookup failed:', error);
            return { success: false, error: error.message || 'Failed to lookup barcode' };
        }
    },

    /**
     * Search wines by name
     */
    searchByName: async (query: string, limit: number = 10): Promise<WineSearchResult> => {
        console.log(`[WineDB] Searching for: ${query}`);

        try {
            // In production:
            // const response = await fetch(
            //     `${VIVINO_API_BASE}/wines?q=${encodeURIComponent(query)}&limit=${limit}`,
            //     { headers: { 'X-API-Key': VIVINO_API_KEY } }
            // );

            // Mock search results
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockResults: VivinoProduct[] = [
                {
                    id: 1,
                    name: `${query} Cabernet Sauvignon`,
                    vineyard: 'Napa Valley Estates',
                    year: 2018,
                    country: { code: 'US', name: 'United States' },
                    region: { name: 'Napa Valley' },
                    type: 'Red',
                    varietal: { name: 'Cabernet Sauvignon' }
                },
                {
                    id: 2,
                    name: `${query} Reserve`,
                    vineyard: 'French Classics',
                    year: 2015,
                    country: { code: 'FR', name: 'France' },
                    region: { name: 'Bordeaux' },
                    type: 'Red',
                    varietal: { name: 'Merlot' }
                }
            ];

            return { success: true, products: mockResults };
        } catch (error: any) {
            console.error('[WineDB] Search failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get wine details by ID
     */
    getWineDetails: async (wineId: number): Promise<BarcodeLookupResult> => {
        try {
            // In production:
            // const response = await fetch(
            //     `${VIVINO_API_BASE}/wines/${wineId}`,
            //     { headers: { 'X-API-Key': VIVINO_API_KEY } }
            // );

            return {
                success: true,
                product: {
                    id: wineId,
                    name: 'Detailed Wine',
                    vineyard: 'Premium Winery',
                    year: 2019,
                    country: { code: 'IT', name: 'Italy' },
                    region: { name: 'Tuscany' },
                    type: 'Red',
                    varietal: { name: 'Sangiovese' }
                }
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Convert API response to our WineLabelData format
     */
    convertToLabelData: (product: VivinoProduct): WineLabelData => {
        return {
            name: product.name,
            winery: product.vineyard,
            vintage: product.year?.toString(),
            country: product.country?.name,
            region: product.region?.name,
            grape: product.varietal?.name,
            // Note: barcode and volume would come from separate lookup
        };
    },

    /**
     * Get wine pricing from Wine-Searcher
     */
    getWinePrices: async (wineName: string): Promise<{ minPrice: number; avgPrice: number } | null> => {
        try {
            // In production, this would call the Wine-Searcher API
            // const response = await fetch(
            //     `${WINE_SEARCHER_API_BASE}/api/v1/wines?q=${encodeURIComponent(wineName)}`,
            //     { headers: { 'X-API-Key': WINE_SEARCHER_API_KEY } }
            // );

            // Mock pricing
            return {
                minPrice: 15 + Math.random() * 100,
                avgPrice: 30 + Math.random() * 150
            };
        } catch (error) {
            console.error('[WineDB] Price lookup failed:', error);
            return null;
        }
    }
};

/**
 * Enhanced barcode scanner that also fetches wine data
 */
export const scanAndLookup = async (
    barcode: string,
    labelOcr?: WineLabelData
): Promise<{
    barcode: string;
    ocrData?: WineLabelData;
    apiData?: VivinoProduct;
    combinedData: WineLabelData;
}> => {
    const result = {
        barcode,
        ocrData: labelOcr,
        apiData: undefined as VivinoProduct | undefined,
        combinedData: { ...labelOcr } as WineLabelData
    };

    // Try to get data from API
    const apiResult = await WineDatabaseService.lookupByBarcode(barcode);
    if (apiResult.success && apiResult.product) {
        result.apiData = apiResult.product;
        result.combinedData = {
            ...result.combinedData,
            ...WineDatabaseService.convertToLabelData(apiResult.product)
        };
    }

    return result;
};

/**
 * Batch lookup for bulk scanning
 */
export const batchBarcodeLookup = async (barcodes: string[]): Promise<Map<string, VivinoProduct>> => {
    const results = new Map<string, VivinoProduct>();

    // Process in parallel (with rate limiting for production)
    await Promise.all(
        barcodes.map(async (barcode) => {
            const result = await WineDatabaseService.lookupByBarcode(barcode);
            if (result.success && result.product) {
                results.set(barcode, result.product);
            }
        })
    );

    return results;
};
