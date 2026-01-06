import { MockFirebaseService } from './mockFirebaseService';
import { Bottle } from '../types';

export interface StockSummary {
    totalBottles: number;
    totalValue: number;
    byType: Record<string, number>; // Red: 5, White: 3, etc.
    byColor: Record<string, number>; // Red: 5, White: 3, etc.
    byVintage: Record<string, number>; // 2018: 2, 2020: 3, etc.
    byCountry: Record<string, number>; // USA: 4, France: 3, etc.
    oldestVintage?: string;
    newestVintage?: string;
    averagePrice: number;
}

export const StockService = {
    /**
     * Calculate comprehensive stock summary
     */
    calculateStockSummary: async (bottles: Bottle[]): Promise<StockSummary> => {
        const summary: StockSummary = {
            totalBottles: bottles.length,
            totalValue: 0,
            byType: {},
            byColor: {},
            byVintage: {},
            byCountry: {},
            averagePrice: 0
        };

        if (bottles.length === 0) {
            return summary;
        }

        let totalPrice = 0;
        let vintages: number[] = [];

        bottles.forEach(bottle => {
            // Total value
            if (bottle.details.price) {
                totalPrice += bottle.details.price;
            }

            // Count by type (wine color)
            const type = bottle.details.type;
            summary.byType[type] = (summary.byType[type] || 0) + 1;
            summary.byColor[type] = (summary.byColor[type] || 0) + 1;

            // Count by vintage
            const vintage = bottle.details.vintage;
            if (vintage && vintage !== 'N/V') {
                summary.byVintage[vintage] = (summary.byVintage[vintage] || 0) + 1;
                const vintageYear = parseInt(vintage);
                if (!isNaN(vintageYear)) {
                    vintages.push(vintageYear);
                }
            }

            // Count by country
            if (bottle.details.country) {
                summary.byCountry[bottle.details.country] = (summary.byCountry[bottle.details.country] || 0) + 1;
            }
        });

        summary.totalValue = totalPrice;
        summary.averagePrice = totalPrice / bottles.length;

        if (vintages.length > 0) {
            vintages.sort((a, b) => a - b);
            summary.oldestVintage = vintages[0].toString();
            summary.newestVintage = vintages[vintages.length - 1].toString();
        }

        return summary;
    },

    /**
     * Get stock breakdown by color with visual indicators
     */
    getColorBreakdown: async (bottles: Bottle[]): Promise<ColorBreakdown[]> => {
        const colorMap: Record<string, number> = {};

        bottles.forEach(bottle => {
            const color = bottle.details.type;
            colorMap[color] = (colorMap[color] || 0) + 1;
        });

        const colorConfig = {
            'Red': { color: '#8B4513', icon: 'circle', gradient: ['#8B4513', '#A0522D'] },
            'White': { color: '#F5DEB3', icon: 'circle', gradient: ['#F5DEB3', '#FFE4B5'] },
            'Rose': { color: '#FF69B4', icon: 'circle', gradient: ['#FF69B4', '#FFB6C1'] },
            'Sparkling': { color: '#FFD700', icon: 'sparkle', gradient: ['#FFD700', '#FFA500'] },
            'Dessert': { color: '#9370DB', icon: 'cup', gradient: ['#9370DB', '#BA55D3'] },
            'Other': { color: '#808080', icon: 'help-circle', gradient: ['#808080', '#A9A9A9'] }
        };

        return Object.entries(colorMap).map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / bottles.length) * 100),
            ...colorConfig[type as keyof typeof colorConfig] || colorConfig['Other']
        })).sort((a, b) => b.count - a.count);
    },

    /**
     * Get stock alerts (low stock, aging wines, etc.)
     */
    getStockAlerts: async (bottles: Bottle[]): Promise<StockAlert[]> => {
        const alerts: StockAlert[] = [];
        const now = new Date();
        const currentYear = now.getFullYear();

        // Check for low stock by type
        const typeCounts: Record<string, number> = {};
        bottles.forEach(b => {
            typeCounts[b.details.type] = (typeCounts[b.details.type] || 0) + 1;
        });

        Object.entries(typeCounts).forEach(([type, count]) => {
            if (count <= 2) {
                alerts.push({
                    type: 'low-stock',
                    severity: 'medium',
                    message: `Low stock: Only ${count} bottle${count > 1 ? 's' : ''} of ${type} wine`,
                    icon: 'alert-circle'
                });
            }
        });

        // Check for wines at peak drinking window
        bottles.forEach(bottle => {
            if (bottle.peakDrinkingWindow) {
                const { start, end } = bottle.peakDrinkingWindow;
                if (currentYear >= start && currentYear <= end) {
                    alerts.push({
                        type: 'peak-drinking',
                        severity: 'high',
                        message: `${bottle.details.name} (${bottle.details.vintage}) is at peak drinking window!`,
                        icon: 'star-circle'
                    });
                } else if (currentYear > end) {
                    alerts.push({
                        type: 'past-peak',
                        severity: 'low',
                        message: `${bottle.details.name} (${bottle.details.vintage}) may be past peak`,
                        icon: 'clock-alert'
                    });
                }
            }
        });

        // Check for high-value bottles
        const highValueBottles = bottles.filter(b => (b.details.price || 0) > 100);
        if (highValueBottles.length > 0) {
            alerts.push({
                type: 'high-value',
                severity: 'low',
                message: `You have ${highValueBottles.length} high-value bottle${highValueBottles.length > 1 ? 's' : ''} (>$100)`,
                icon: 'currency-usd'
            });
        }

        // Check collection size milestones
        const total = bottles.length;
        if (total >= 50) {
            alerts.push({
                type: 'milestone',
                severity: 'low',
                message: `Collection milestone: ${total} bottles!`,
                icon: 'trophy'
            });
        }

        return alerts;
    },

    /**
     * Get collection health score (0-100)
     */
    getCollectionHealth: async (bottles: Bottle[]): Promise<number> => {
        if (bottles.length === 0) return 0;

        let score = 50; // Base score

        // Diversity bonus (multiple types)
        const uniqueTypes = new Set(bottles.map(b => b.details.type)).size;
        if (uniqueTypes >= 4) score += 10;
        else if (uniqueTypes >= 3) score += 5;

        // Age diversity bonus
        const vintages = new Set(bottles.map(b => b.details.vintage)).size;
        if (vintages >= 5) score += 10;

        // Value bonus (investment potential)
        const avgPrice = bottles.reduce((sum, b) => sum + (b.details.price || 0), 0) / bottles.length;
        if (avgPrice >= 50) score += 10;

        // Storage efficiency (not too many in one location)
        const locations = new Set(bottles.map(b => `${b.location.row}-${b.location.col}`)).size;
        const efficiency = locations / bottles.length;
        if (efficiency > 0.5) score += 5;

        // Deduct for past-peak wines
        const now = new Date().getFullYear();
        const pastPeak = bottles.filter(b =>
            b.peakDrinkingWindow && now > b.peakDrinkingWindow.end
        ).length;
        score -= Math.min(pastPeak * 2, 10);

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Get collection health description
     */
    getHealthDescription: (score: number): string => {
        if (score >= 85) return 'Excellent! Your collection is well-balanced and diverse.';
        if (score >= 70) return 'Good. Your collection has good variety and potential.';
        if (score >= 50) return 'Fair. Consider adding more variety to your collection.';
        if (score >= 30) return 'Needs attention. Focus on diversifying your collection.';
        return 'Your collection needs improvement. Add more variety and check aging windows.';
    }
};

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
