// Geo-locking Service
// Uses free IP geolocation API to restrict app usage to specific countries

const IPINFO_API_URL = 'https://ipinfo.io/json';

// Allowed country codes (ISO 3166-1 alpha-2)
// Set to empty array [] to disable geo-locking
// Example: ['US', 'CA', 'GB', 'AU']
const ALLOWED_COUNTRIES: string[] = [];

interface GeoLocation {
    ip: string;
    city: string;
    region: string;
    country: string; // ISO country code
    loc: string; // lat,lng
    timezone: string;
}

interface GeoLockResult {
    allowed: boolean;
    country: string | null;
    countryCode: string | null;
    reason?: string;
}

export const GeoLockService = {
    /**
     * Check if current location is allowed
     * Returns immediately if geo-locking is disabled
     */
    checkAccess: async (): Promise<GeoLockResult> => {
        // Store in local const to help TypeScript narrow the type
        const allowedCountries = ALLOWED_COUNTRIES;

        // If no restrictions configured, allow access
        if (!allowedCountries || allowedCountries.length === 0) {
            return { allowed: true, country: null, countryCode: null };
        }

        try {
            const location = await GeoLockService.getCurrentLocation();

            if (!location) {
                // If we can't determine location, allow access (fail-open)
                console.warn('[GeoLock] Could not determine location, allowing access');
                return { allowed: true, country: null, countryCode: null };
            }

            const isAllowed = allowedCountries.includes(location.country);

            return {
                allowed: isAllowed,
                country: await GeoLockService.getCountryName(location.country),
                countryCode: location.country,
                reason: isAllowed ? undefined : `This app is not available in ${location.country}`
            };
        } catch (e) {
            console.error('[GeoLock] Check failed:', e);
            // Fail-open on error
            return { allowed: true, country: null, countryCode: null };
        }
    },

    /**
     * Get current location from IP
     */
    getCurrentLocation: async (): Promise<GeoLocation | null> => {
        try {
            const response = await fetch(IPINFO_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            return data as GeoLocation;
        } catch (e) {
            console.error('[GeoLock] Failed to get location:', e);
            return null;
        }
    },

    /**
     * Get country name from ISO code
     */
    getCountryName: async (code: string): Promise<string> => {
        const countryNames: Record<string, string> = {
            'US': 'United States',
            'CA': 'Canada',
            'GB': 'United Kingdom',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France',
            'IT': 'Italy',
            'ES': 'Spain',
            'JP': 'Japan',
            'CN': 'China',
            'IN': 'India',
            'BR': 'Brazil',
            'MX': 'Mexico',
            'NZ': 'New Zealand',
            'ZA': 'South Africa',
            'AR': 'Argentina',
            'CL': 'Chile',
            'PT': 'Portugal',
            'AT': 'Austria',
        };
        return countryNames[code] || code;
    },

    /**
     * Enable geo-locking for specific countries
     * Note: In production, this should be configured server-side
     */
    setAllowedCountries: (countries: string[]) => {
        // This is a placeholder - in production, restrictions should be enforced server-side
        console.log('[GeoLock] Setting allowed countries:', countries);
    }
};
