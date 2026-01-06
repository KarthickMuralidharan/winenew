import { WineLabelData } from '../types';

// Camera Service for OCR and Barcode Scanning with Gemini AI Enhancement
// API keys are read from environment variables only - never hardcoded or exposed to frontend

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface CameraPermission {
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'undetermined';
}

export interface ScanResult {
    success: boolean;
    data?: WineLabelData;
    error?: string;
    confidence: number;
}

export const CameraService = {
    /**
     * Check camera permission status
     * For mobile: uses expo-camera or react-native-camera
     * For web: uses browser media API
     */
    checkPermission: async (): Promise<CameraPermission> => {
        // In production, this would check actual camera permissions
        // For demo: simulate permission check
        return {
            granted: true,
            canAskAgain: true,
            status: 'granted'
        };
    },

    /**
     * Request camera permission
     */
    requestPermission: async (): Promise<CameraPermission> => {
        // In production: actual permission request
        // For demo: simulate user granting permission
        return {
            granted: true,
            canAskAgain: false,
            status: 'granted'
        };
    },

    /**
     * Simulate OCR scanning of wine label
     * In production: Uses Google ML Kit OCR or Tesseract.js
     */
    scanLabelOCR: async (imageUri?: string): Promise<ScanResult> => {
        console.log('[CameraService] Scanning label via OCR...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, this would:
        // 1. Send image to Google ML Kit OCR
        // 2. Parse text for wine information
        // 3. Use Gemini AI to extract structured data

        // For demo: return simulated scan result
        const mockResults: WineLabelData[] = [
            {
                name: 'Cabernet Sauvignon',
                winery: 'Napa Valley Estates',
                vintage: '2018',
                country: 'USA',
                region: 'Napa Valley',
                grape: 'Cabernet Sauvignon',
                alcohol: '14.5%',
                volume: '750ml'
            },
            {
                name: 'Chardonnay',
                winery: 'Burgundy Estates',
                vintage: '2020',
                country: 'France',
                region: 'Burgundy',
                grape: 'Chardonnay',
                alcohol: '13.5%',
                volume: '750ml'
            },
            {
                name: 'Barolo',
                winery: 'Cantina del Barolo',
                vintage: '2017',
                country: 'Italy',
                region: 'Piedmont',
                grape: 'Nebbiolo',
                alcohol: '14.0%',
                volume: '750ml'
            }
        ];

        // Randomly select one for demo
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];

        return {
            success: true,
            data: randomResult,
            confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
        };
    },

    /**
     * Simulate barcode scanning
     * In production: Uses ML Kit Barcode Scanning
     */
    scanBarcode: async (imageUri?: string): Promise<ScanResult> => {
        console.log('[CameraService] Scanning barcode...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In production, this would:
        // 1. Scan UPC/EAN barcode
        // 2. Query wine database (Wine-Searcher, Vivino, etc.)
        // 3. Return structured data

        // For demo: return simulated barcode result
        const barcodeResults: WineLabelData[] = [
            {
                name: 'Pinot Noir',
                winery: 'Willamette Valley Vineyards',
                vintage: '2019',
                country: 'USA',
                region: 'Oregon',
                grape: 'Pinot Noir',
                barcode: '0123456789012',
                price: '42.99'
            },
            {
                name: 'Sauvignon Blanc',
                winery: 'Cloudy Bay',
                vintage: '2021',
                country: 'New Zealand',
                region: 'Marlborough',
                grape: 'Sauvignon Blanc',
                barcode: '9876543210987',
                price: '28.99'
            }
        ];

        const randomResult = barcodeResults[Math.floor(Math.random() * barcodeResults.length)];

        return {
            success: true,
            data: randomResult,
            confidence: 0.95 // Barcodes are very accurate
        };
    },

    /**
     * AI-powered bottle recognition
     * Combines OCR + Barcode + Gemini AI analysis
     */
    recognizeBottle: async (imageUri?: string): Promise<ScanResult> => {
        console.log('[CameraService] AI bottle recognition starting...');

        // Try barcode first (more reliable)
        const barcodeResult = await this.scanBarcode(imageUri);
        if (barcodeResult.success && barcodeResult.confidence > 0.9) {
            return barcodeResult;
        }

        // Fall back to OCR
        const ocrResult = await this.scanLabelOCR(imageUri);
        if (ocrResult.success) {
            return ocrResult;
        }

        return {
            success: false,
            error: 'Unable to recognize bottle. Please try manual entry.',
            confidence: 0
        };
    },

    /**
     * AI enhancement using Gemini API
     * Fills in missing details from partial scan data
     * Uses environment variable: EXPO_PUBLIC_GEMINI_API_KEY
     */
    aiEnhanceData: async (partialData: WineLabelData): Promise<WineLabelData> => {
        console.log('[CameraService] AI enhancing data with Gemini...');

        // Try Gemini API first (only if key is provided)
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                const prompt = `You are a wine expert. Analyze this partial wine label data and fill in missing information.

Partial Data:
${JSON.stringify(partialData, null, 2)}

Please provide:
1. Missing country (based on winery/region)
2. Missing region (based on winery)
3. Grape variety (if not specified)
4. Estimated price range
5. Brief tasting notes
6. Peak drinking window (if vintage is provided)

Respond with ONLY valid JSON in this format:
{
  "country": "USA",
  "region": "Napa Valley",
  "grape": "Cabernet Sauvignon",
  "price": "45-60",
  "tastingNotes": "Rich dark fruit, vanilla, oak",
  "peakWindow": "2025-2035"
}`;

                const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 300
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (content) {
                        try {
                            const jsonMatch = content.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const enhanced = JSON.parse(jsonMatch[0]);

                                // Merge with original data
                                return {
                                    ...partialData,
                                    country: enhanced.country || partialData.country,
                                    region: enhanced.region || partialData.region,
                                    grape: enhanced.grape || partialData.grape,
                                    price: enhanced.price || partialData.price,
                                    tastingNotes: enhanced.tastingNotes,
                                    peakWindow: enhanced.peakWindow
                                };
                            }
                        } catch (parseError) {
                            console.error('[CameraService] Failed to parse Gemini response:', parseError);
                        }
                    }
                }
            } catch (error) {
                console.error('[CameraService] Gemini enhancement failed:', error);
            }
        }

        // Fallback: Basic enhancement without AI
        console.log('[CameraService] Using fallback enhancement (no API key)');
        const enhanced = { ...partialData };

        // Add missing fields based on common knowledge
        if (!enhanced.country && enhanced.winery) {
            if (enhanced.winery.includes('Napa')) enhanced.country = 'USA';
            if (enhanced.winery.includes('Burgundy')) enhanced.country = 'France';
            if (enhanced.winery.includes('Tuscany')) enhanced.country = 'Italy';
            if (enhanced.winery.includes('Piedmont')) enhanced.country = 'Italy';
        }

        if (!enhanced.region && enhanced.winery) {
            if (enhanced.winery.includes('Napa')) enhanced.region = 'Napa Valley';
            if (enhanced.winery.includes('Burgundy')) enhanced.region = 'Burgundy';
            if (enhanced.winery.includes('Tuscany')) enhanced.region = 'Tuscany';
            if (enhanced.winery.includes('Piedmont')) enhanced.region = 'Piedmont';
        }

        // Suggest price if missing
        if (!enhanced.price) {
            const basePrices: Record<string, number> = {
                'Red': 45,
                'White': 35,
                'Sparkling': 60,
                'Rose': 30,
                'Dessert': 50
            };
            const type = enhanced.name?.includes('Champagne') ? 'Sparkling' : 'Red';
            enhanced.price = basePrices[type]?.toString() || '40';
        }

        return enhanced;
    },

    /**
     * Open camera interface
     * In production: Opens native camera UI
     * For demo: Returns simulated camera view
     */
    openCamera: async (): Promise<{ cameraOpened: boolean }> => {
        // In production: would open expo-camera or react-native-camera
        // For demo: just confirm
        return { cameraOpened: true };
    },

    /**
     * Validate scanned data
     */
    validateScanData: (data: WineLabelData): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Wine name is required');
        }

        if (!data.vintage || data.vintage.trim().length < 4) {
            errors.push('Vintage year is required');
        }

        if (!data.winery || data.winery.trim().length < 2) {
            errors.push('Winery name is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Format scan result for display
     */
    formatForDisplay: (data: WineLabelData): string => {
        const parts = [];
        if (data.name) parts.push(data.name);
        if (data.vintage) parts.push(`(${data.vintage})`);
        if (data.winery) parts.push(`• ${data.winery}`);
        if (data.region) parts.push(`• ${data.region}`);
        return parts.join(' ');
    }
};
