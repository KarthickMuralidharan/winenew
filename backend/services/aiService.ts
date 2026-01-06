import { AuthService } from '../../frontend/utils/authService';
// AI Sommelier Service - GEMINI API INTEGRATION
// API keys are read from environment variables only - never hardcoded or exposed to frontend

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface WineDetails {
    name: string;
    type: string;
    vintage: string;
    region?: string;
    country?: string;
    grape?: string;
}

// Fallback lookup table for shelf life when API is unavailable
const SHELF_LIFE_TABLE: Record<string, { min: number; max: number }> = {
    'Red-Bordeaux': { min: 10, max: 25 },
    'Red-Burgundy': { min: 8, max: 20 },
    'Red-Napa Valley': { min: 8, max: 15 },
    'Red-default': { min: 5, max: 10 },
    'White-Burgundy': { min: 5, max: 15 },
    'White-default': { min: 2, max: 5 },
    'Sparkling-Champagne': { min: 3, max: 10 },
    'Sparkling-default': { min: 1, max: 3 },
    'Rose-default': { min: 1, max: 3 },
    'Dessert-default': { min: 10, max: 50 },
};

export const AIService = {
    /**
     * Get shelf life / drinking window prediction
     * Uses Gemini API if available, falls back to lookup table
     */
    getShelfLifeAdvice: async (wineDetails: WineDetails): Promise<{ advice: string; peakWindow?: { start: number; end: number } }> => {
        const user = await AuthService.getCurrentAppUser();
        if (user?.subscriptionTier === 'free') {
            return { advice: 'This is a premium feature. Please upgrade your subscription to get AI-powered shelf life advice.' };
        }

        const { type, vintage, name, region, country, grape } = wineDetails;
        const vintageYear = parseInt(vintage) || new Date().getFullYear();
        const currentYear = new Date().getFullYear();

        // Try Gemini API first (only if key is provided)
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                const prompt = `You are a sommelier expert. Analyze this wine and provide drinking window advice.

Wine Details:
- Name: ${name}
- Type: ${type}
- Vintage: ${vintage}
- Region: ${region || 'Unknown'}
- Country: ${country || 'Unknown'}
- Grape: ${grape || 'Unknown'}

Respond with ONLY valid JSON in this format:
{
  "advice": "brief recommendation",
  "peakStart": 2025,
  "peakEnd": 2035
}`;

                const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 200
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.status}`);
                }

                const data = await response.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (content) {
                    try {
                        // Extract JSON from response (may contain markdown)
                        const jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            return {
                                advice: parsed.advice,
                                peakWindow: { start: parsed.peakStart, end: parsed.peakEnd }
                            };
                        }
                    } catch (parseError) {
                        console.error('[AIService] Failed to parse Gemini response:', parseError);
                    }
                }
            } catch (error) {
                console.error('[AIService] Gemini API call failed:', error);
            }
        }

        // Fallback: Use lookup table (no API key needed)
        const key = `${type}-${region || 'default'}`;
        const fallbackKey = `${type}-default`;
        const window = SHELF_LIFE_TABLE[key] || SHELF_LIFE_TABLE[fallbackKey] || { min: 3, max: 8 };

        const peakStart = vintageYear + window.min;
        const peakEnd = vintageYear + window.max;

        let advice: string;
        if (currentYear < peakStart) {
            advice = `This ${vintage} ${name} is still young. Best drinking window starts around ${peakStart}.`;
        } else if (currentYear > peakEnd) {
            advice = `⚠️ This wine may be past its peak (ended ${peakEnd}). Drink soon if it was stored well.`;
        } else {
            advice = `✅ This ${vintage} ${name} is in its prime! Peak window: ${peakStart}-${peakEnd}.`;
        }

        return { advice, peakWindow: { start: peakStart, end: peakEnd } };
    },

    /**
     * Get food pairing recommendations from user's inventory
     * Uses Gemini API if available, falls back to keyword matching
     */
    getFoodPairing: async (meal: string, availableWines: any[]): Promise<string> => {
        const user = await AuthService.getCurrentAppUser();
        if (user?.subscriptionTier === 'free') {
            return 'This is a premium feature. Please upgrade your subscription to get AI-powered food pairing recommendations.';
        }

        // Try Gemini API first (only if key is provided)
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                const wineList = availableWines.slice(0, 10).map(w => ({
                    name: w.details.name,
                    type: w.details.type,
                    vintage: w.details.vintage,
                    region: w.details.region,
                    country: w.details.country
                }));

                const prompt = `You are a professional sommelier. Recommend the best wine pairing from the user's inventory.

Meal: ${meal}

Available Wines in Cellar:
${JSON.stringify(wineList, null, 2)}

Provide a concise, enthusiastic recommendation (1-2 sentences) that mentions the specific wine name and why it pairs well.`;

                const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 150
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.status}`);
                }

                const data = await response.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (content) {
                    return content.trim();
                }
            } catch (error) {
                console.error('[AIService] Gemini pairing call failed:', error);
            }
        }

        // Fallback: Basic keyword matching (no API needed)
        const lowerMeal = meal.toLowerCase();

        if (lowerMeal.includes('steak') || lowerMeal.includes('beef') || lowerMeal.includes('lamb')) {
            const match = availableWines.find(w => w.details.type === 'Red');
            if (match) return `🍷 Best pairing: ${match.details.name} (${match.details.vintage}). Red meats love bold tannins!`;
            return "I recommend a bold Cabernet or Malbec, but you don't have one in stock.";
        }

        if (lowerMeal.includes('fish') || lowerMeal.includes('seafood') || lowerMeal.includes('shrimp')) {
            const match = availableWines.find(w => w.details.type === 'White');
            if (match) return `🥂 Try: ${match.details.name}. A crisp white complements seafood beautifully.`;
            return 'A Sauvignon Blanc or Chablis would be perfect here.';
        }

        if (lowerMeal.includes('chicken') || lowerMeal.includes('pork')) {
            const match = availableWines.find(w => ['White', 'Rose'].includes(w.details.type));
            if (match) return `Pair with: ${match.details.name}. Lighter dishes work with both whites and rosés.`;
        }

        if (lowerMeal.includes('cheese') || lowerMeal.includes('dessert')) {
            const match = availableWines.find(w => w.details.type === 'Dessert' || w.details.type === 'Sparkling');
            if (match) return `🍾 Special occasion! Try: ${match.details.name}.`;
        }

        return `For "${meal}", I'd need to analyze your specific inventory more. Consider a versatile Pinot Noir or Chardonnay.`;
    }
};
