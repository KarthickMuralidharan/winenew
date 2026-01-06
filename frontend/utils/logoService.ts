/**
 * Logo.dev Integration Service
 * Fetches real wine brand logos using Logo.dev API
 */

export interface LogoResult {
    success: boolean;
    logoUrl?: string;
    brandName: string;
    source?: string;
    error?: string;
}

export class LogoService {

    /**
     * Get wine brand logo from Logo.dev API
     * Uses the publishable API key for client-side requests
     */
    static async getWineLogo(brandName: string, vintage?: string): Promise<LogoResult> {
        const apiKey = process.env.EXPO_PUBLIC_LOGO_DEV_PUBLISHABLE_API_KEY;

        if (!apiKey || apiKey === 'your_logo_dev_api_key_here') {
            // Fallback to mock/logo service when API key is not configured
            return this.getFallbackLogo(brandName);
        }

        try {
            // Logo.dev API endpoint
            const apiUrl = `https://api.logo.dev/search`;

            // Build search query
            const query = `${brandName} ${vintage || ''} wine`.trim();

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: query,
                    limit: 1
                })
            });

            if (!response.ok) {
                throw new Error(`Logo.dev API error: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.length > 0 && data[0].logoUrl) {
                return {
                    success: true,
                    logoUrl: data[0].logoUrl,
                    brandName: data[0].name || brandName,
                    source: 'logo.dev'
                };
            }

            // If no logo found, use fallback
            return this.getFallbackLogo(brandName);

        } catch (error) {
            console.error('Error fetching logo from Logo.dev:', error);
            return this.getFallbackLogo(brandName);
        }
    }

    /**
     * Get logo for multiple bottles at once
     */
    static async getLogosForBottles(bottles: Array<{ name: string; winery: string; vintage?: string }>): Promise<Record<string, LogoResult>> {
        const results: Record<string, LogoResult> = {};

        for (const bottle of bottles) {
            const key = `${bottle.winery}-${bottle.name}`;
            results[key] = await this.getWineLogo(bottle.winery, bottle.vintage);
        }

        return results;
    }

    /**
     * Fallback logo generation when API is unavailable
     * Creates a colored circle with brand initials
     */
    private static getFallbackLogo(brandName: string): LogoResult {
        // Generate a consistent color based on brand name
        const color = this.getColorFromName(brandName);

        // Get initials (first letter of each word)
        const initials = brandName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);

        // Return a placeholder that can be used to generate a logo
        // In production, this could generate an SVG or use a placeholder image service
        return {
            success: false,
            brandName: brandName,
            source: 'fallback',
            error: 'Logo.dev API not configured',
            logoUrl: `https://via.placeholder.com/200/${color}/FFFFFF?text=${encodeURIComponent(initials)}`
        };
    }

    /**
     * Generate consistent color from brand name
     */
    private static getColorFromName(name: string): string {
        const colors = [
            '8B4513', // Brown
            'A0522D', // Sienna
            'CD853F', // Peru
            'D2691E', // Chocolate
            'A52A2A', // Brown
            '800000', // Maroon
            '6B4423', // Brown
            '7B3F00'  // Rust
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Check if Logo.dev is configured
     */
    static isConfigured(): boolean {
        const apiKey = process.env.EXPO_PUBLIC_LOGO_DEV_PUBLISHABLE_API_KEY;
        return apiKey && apiKey !== 'your_logo_dev_api_key_here';
    }

    /**
     * Get logo service status
     */
    static async getStatus(): Promise<{ configured: boolean; working: boolean }> {
        const configured = this.isConfigured();

        if (!configured) {
            return { configured: false, working: false };
        }

        // Test with a simple query
        try {
            const result = await this.getWineLogo('Bordeaux');
            return { configured: true, working: result.success };
        } catch (error) {
            return { configured: true, working: false };
        }
    }
}
