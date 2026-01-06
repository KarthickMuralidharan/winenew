// OCR Label Recognition Service
// NOTE: expo-text-recognition doesn't exist. This is a mock implementation.
// For production, integrate with Google Cloud Vision API or AWS Rekognition.

import { WineLabelData } from '../types';

// Common wine-related keywords for parsing
const WINE_KEYWORDS = {
    countries: ['France', 'Italia', 'Italy', 'Spain', 'España', 'USA', 'United States', 'Argentina', 'Chile',
        'Australia', 'Germany', 'Portugal', 'South Africa', 'New Zealand', 'Austria', 'Hungary', 'Greece'],
    regions: ['Bordeaux', 'Burgundy', 'Champagne', 'Chianti', 'Napa', 'Napa Valley', 'Tuscany', 'Barolo',
        'Barbaresco', 'Rioja', 'Piedmont', 'Rhone', 'Alsace', 'Loire', 'Moselle', 'Mendoza', 'Barossa',
        'Marlborough', 'Sonoma', 'Paso Robles', 'Willamette', 'Columbia Valley'],
    types: ['Red', 'White', 'Rosé', 'Rose', 'Sparkling', 'Champagne', 'Dessert', 'Port', 'Sherry', 'Madeira'],
    grapes: ['Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc',
        'Riesling', 'Syrah', 'Shiraz', 'Grenache', 'Malbec', 'Tempranillo', 'Sangiovese', 'Nebbiolo',
        'Barbera', 'Zinfandel', 'Viognier', 'Chenin Blanc', 'Grüner Veltliner', 'Pinot Grigio', 'Pinot Gris'],
};

interface RecognitionResult {
    success: boolean;
    data?: WineLabelData;
    error?: string;
}

export const OCRService = {
    /**
     * Scan wine label and extract information
     * NOTE: This is a mock implementation. In production, use:
     * - Google Cloud Vision API
     * - AWS Rekognition
     * - Azure Computer Vision
     * @param imageUri - URI of the captured image
     */
    scanLabel: async (_imageUri: string): Promise<RecognitionResult> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[OCR] Mock OCR - real implementation requires cloud vision API');

        // Return mock result indicating feature is not yet configured
        return {
            success: false,
            error: 'OCR not configured. Add wine details manually, or integrate Google Cloud Vision API.'
        };
    },

    /**
     * Get detailed recognition result with all text blocks
     */
    scanLabelDetailed: async (_imageUri: string) => {
        return {
            success: false,
            blocks: [],
            fullText: '',
            error: 'OCR not configured'
        };
    },

    /**
     * Check if OCR is available
     */
    isAvailable: (): boolean => {
        return false; // OCR requires cloud API integration
    }
};

/**
 * Parse extracted text to identify wine information
 * This function can be used when you integrate a real OCR service
 */
export function parseWineLabelText(text: string): WineLabelData {
    const data: WineLabelData = {};
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const combinedText = lines.join(' ').toLowerCase();

    // Extract vintage (4-digit year between 1900 and 2099)
    const yearPattern = /\b(19[5-9]\d|20[0-2]\d)\b/;
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
        data.vintage = yearMatch[0];
    }

    // Extract country
    for (const country of WINE_KEYWORDS.countries) {
        if (text.toLowerCase().includes(country.toLowerCase())) {
            data.country = country;
            break;
        }
    }

    // Extract region
    for (const region of WINE_KEYWORDS.regions) {
        if (text.toLowerCase().includes(region.toLowerCase())) {
            data.region = region;
            break;
        }
    }

    // Extract grape variety
    for (const grape of WINE_KEYWORDS.grapes) {
        if (combinedText.includes(grape.toLowerCase())) {
            data.grape = grape;
            break;
        }
    }

    // Extract alcohol percentage
    const alcoholPattern = /(\d+(?:\.\d+)?)\s*%\s*(?:vol\.|alc\.?)?/i;
    const alcoholMatch = text.match(alcoholPattern);
    if (alcoholMatch) {
        data.alcohol = `${alcoholMatch[1]}%`;
    }

    // Extract volume (e.g., 750ml, 1L, 1.5L)
    const volumePattern = /(?:75|150|300|500|1000|1500|3000)\s*ml|1\.?\d?\s*L/i;
    const volumeMatch = text.match(volumePattern);
    if (volumeMatch) {
        data.volume = volumeMatch[0];
    }

    // Try to identify wine name
    if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length > 2 && firstLine.length < 100) {
            data.name = firstLine;
        }
    }

    return data;
}

/**
 * Batch scan multiple labels
 */
export const batchScanLabels = async (imageUris: string[]): Promise<RecognitionResult[]> => {
    const results: RecognitionResult[] = [];

    for (const uri of imageUris) {
        const result = await OCRService.scanLabel(uri);
        results.push(result);
    }

    return results;
};

/**
 * Confidence scoring for OCR results
 */
export const calculateConfidence = (text: string): number => {
    let score = 0;

    if (text.split('\n').length > 3) score += 20;

    const keywords = [...WINE_KEYWORDS.countries, ...WINE_KEYWORDS.regions, ...WINE_KEYWORDS.grapes];
    const foundKeywords = keywords.filter(kw =>
        text.toLowerCase().includes(kw.toLowerCase())
    );
    score += Math.min(foundKeywords.length * 10, 30);

    if (/\b(19[5-9]\d|20[0-2]\d)\b/.test(text)) score += 20;
    if (/\d+\s*%/.test(text)) score += 15;
    if (/\d+\s*(ml|L)/i.test(text)) score += 15;

    return Math.min(score, 100);
};

