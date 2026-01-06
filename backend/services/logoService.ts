// Logo.dev Service for Real Brand Logos
// API key is read from environment variables only

const LOGO_API_KEY = process.env.EXPO_PUBLIC_LOGO_API_KEY || '';
const LOGO_ENDPOINT = 'https://api.logo.dev';

export interface LogoData {
    domain: string;
    logo: string;
    name: string;
    color: string;
}

export const LogoService = {
    /**
     * Get real logo for a wine brand or winery
     * Uses Logo.dev API if available, falls back to placeholder
     */
    getWineryLogo: async (wineryName: string, domain?: string): Promise<LogoData> => {
        // Try Logo.dev API first
        if (LOGO_API_KEY && LOGO_API_KEY !== 'your_logo_dev_api_key_here') {
            try {
                // Use winery name or domain to search for logo
                const searchQuery = domain || wineryName.toLowerCase().replace(/\s+/g, '');

                const response = await fetch(`${LOGO_ENDPOINT}/logos?query=${encodeURIComponent(searchQuery)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${LOGO_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        return {
                            domain: data[0].domain || domain || '',
                            logo: data[0].logo_url,
                            name: data[0].name || wineryName,
                            color: data[0].primary_color || '#8B4513'
                        };
                    }
                }
            } catch (error) {
                console.error('[LogoService] Logo.dev API call failed:', error);
            }
        }

        // Fallback: Return placeholder with generated color
        return {
            domain: domain || '',
            logo: '',
            name: wineryName,
            color: LogoService.generateBrandColor(wineryName)
        };
    },

    /**
     * Get logos for multiple wineries at once
     */
    getMultipleLogos: async (wineries: Array<{ name: string; domain?: string }>): Promise<LogoData[]> => {
        const results = await Promise.all(
            wineries.map(winery => LogoService.getWineryLogo(winery.name, winery.domain))
        );
        return results;
    },

    /**
     * Generate consistent brand color from name
     */
    generateBrandColor: (name: string): string => {
        const colors = ['#8B4513', '#D2691E', '#A0522D', '#CD853F', '#DEB887', '#D2691E'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Get wine type icon (for when logo is not available)
     */
    getWineTypeIcon: (type: string): string => {
        const icons: Record<string, string> = {
            'Red': 'wine-bar',
            'White': 'glass-wine',
            'Rose': 'glass-wine',
            'Sparkling': 'glass-flute',
            'Dessert': 'cupcake',
            'Other': 'bottle-wine'
        };
        return icons[type] || 'bottle-wine';
    }
};
