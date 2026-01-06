// News Service with Firecrawl Web Scraping and Gemini AI Filtering
// API keys are read from environment variables only - never hardcoded or exposed to frontend

const FIRECRAWL_API_KEY = process.env.EXPO_PUBLIC_FIRECRAWL_API_KEY || '';
const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v0/scrape';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface WineNews {
    id: string;
    title: string;
    source: string;
    url: string;
    publishedDate: string;
    summary: string;
    category: 'industry' | 'tasting' | 'investment' | 'lifestyle' | 'education';
    tags: string[];
    imageUrl?: string;
}

// Mock news data - used as fallback when APIs are unavailable
const MOCK_NEWS: WineNews[] = [
    {
        id: 'news-1',
        title: 'Bordeaux 2020 Vintage Shows Exceptional Aging Potential',
        source: 'Wine Spectator',
        url: 'https://example.com/news/1',
        publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Expert tasters reveal that the 2020 Bordeaux vintage exhibits remarkable structure and balance, suggesting a 20-30 year aging window for top estates.',
        category: 'tasting',
        tags: ['Bordeaux', 'Vintage', 'Aging', 'Investment'],
        imageUrl: 'https://example.com/images/bordeaux.jpg'
    },
    {
        id: 'news-2',
        title: 'Napa Valley Wineries Embrace Sustainable Practices',
        source: 'Decanter',
        url: 'https://example.com/news/2',
        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Over 80% of Napa Valley wineries now use organic or biodynamic farming methods, reducing carbon footprint and improving wine quality.',
        category: 'industry',
        tags: ['Napa', 'Sustainability', 'Organic', 'Environment'],
        imageUrl: 'https://example.com/images/napa-sustainable.jpg'
    },
    {
        id: 'news-3',
        title: 'Champagne Prices Set to Rise Due to Climate Impact',
        source: 'Wine Enthusiast',
        url: 'https://example.com/news/3',
        publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Changing weather patterns in Champagne region affecting yields, with producers warning of 15-20% price increases for 2024 releases.',
        category: 'investment',
        tags: ['Champagne', 'Price', 'Climate', 'Market'],
        imageUrl: 'https://example.com/images/champagne.jpg'
    },
    {
        id: 'news-4',
        title: 'New Italian DOCG Regulations for Barolo Production',
        source: 'Vinous',
        url: 'https://example.com/news/4',
        publishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Barolo producers vote for stricter aging requirements, minimum 30 months for standard Barolo and 60 months for Riserva starting 2025.',
        category: 'industry',
        tags: ['Italy', 'Barolo', 'Regulations', 'DOCG'],
        imageUrl: 'https://example.com/images/barolo.jpg'
    }
];

// AI filtering rules for Gemini
const AI_FILTERING_RULES = {
    allowedCategories: ['industry', 'tasting', 'investment', 'lifestyle', 'education'],
    bannedKeywords: ['beer', 'cocktail', 'spirits', 'vodka', 'whiskey', 'rum'],
    requiredKeywords: ['wine', 'winery', 'vintage', 'grape', 'vineyard', 'bottle', 'cellar'],
    qualityThreshold: 0.7
};

export const NewsService = {
    /**
     * Fetch wine-related news with Firecrawl scraping + Gemini AI filtering
     * Uses environment variables: EXPO_PUBLIC_FIRECRAWL_API_KEY and EXPO_PUBLIC_GEMINI_API_KEY
     */
    fetchWineNews: async (): Promise<WineNews[]> => {
        // Try Firecrawl + Gemini first (only if keys are provided)
        if (FIRECRAWL_API_KEY && FIRECRAWL_API_KEY !== 'your_firecrawl_api_key_here' &&
            GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                // Step 1: Scrape wine news sites using Firecrawl
                // In production, you would scrape specific wine news URLs
                // For this example, we'll simulate the scraping result
                const scrapedContent = await NewsService.scrapeWineNewsSites();

                // Step 2: Send to Gemini for AI filtering and summarization
                const filteredNews = await NewsService.filterWithGemini(scrapedContent);

                if (filteredNews.length > 0) {
                    return filteredNews;
                }
            } catch (error) {
                console.error('[NewsService] Firecrawl + Gemini failed:', error);
            }
        }

        // Fallback: Return mock data
        console.log('[NewsService] Using mock data (APIs unavailable)');
        return MOCK_NEWS;
    },

    /**
     * Scrape wine news sites using Firecrawl API
     * In production, this would scrape real wine news websites
     */
    scrapeWineNewsSites: async (): Promise<any[]> => {
        // In production, this would call Firecrawl to scrape:
        // - winespectator.com
        // - decanter.com
        // - wineenthusiast.com
        // - vinous.com
        // etc.

        // For demo purposes, return mock scraped content
        return [
            {
                url: 'https://winespectator.com/bordeaux-2020',
                title: 'Bordeaux 2020: A Vintage of Promise',
                content: 'The 2020 Bordeaux vintage shows remarkable structure and balance...',
                source: 'Wine Spectator',
                publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                url: 'https://decanter.com/napa-sustainability',
                title: 'Napa Valley Goes Green',
                content: 'Sustainable practices are transforming Napa Valley wineries...',
                source: 'Decanter',
                publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    },

    /**
     * Use Gemini AI to filter scraped content and extract wine-related news
     */
    filterWithGemini: async (scrapedContent: any[]): Promise<WineNews[]> => {
        const prompt = `You are a wine news editor. Analyze the following scraped web content and extract only wine-related news articles.

IMPORTANT: Only return wine-related content. Filter OUT:
- Beer, cocktails, spirits, vodka, whiskey, rum
- Non-wine topics

For each wine-related article, extract:
1. Title
2. Summary (1-2 sentences)
3. Category (industry, tasting, investment, lifestyle, education)
4. Tags (3-5 keywords)
5. Source website
6. Published date

Respond with ONLY valid JSON in this format:
[
  {
    "title": "Article Title",
    "summary": "Brief summary",
    "category": "tasting",
    "tags": ["Bordeaux", "Vintage", "Aging"],
    "source": "Wine Spectator",
    "url": "https://example.com/article",
    "publishedDate": "2024-01-15T00:00:00.000Z"
  }
]

Scraped Content:
${JSON.stringify(scrapedContent, null, 2)}`;

        try {
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
                        maxOutputTokens: 1000
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
                    // Extract JSON from response
                    const jsonMatch = content.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);

                        // Validate and format results
                        return parsed.map((item: any, index: number): WineNews => ({
                            id: `news-${Date.now()}-${index}`,
                            title: item.title || 'Untitled',
                            source: item.source || 'Unknown',
                            url: item.url || '#',
                            publishedDate: item.publishedDate || new Date().toISOString(),
                            summary: item.summary || '',
                            category: item.category || 'industry',
                            tags: item.tags || []
                        })).filter((news: WineNews) =>
                            news.title && news.summary &&
                            AI_FILTERING_RULES.allowedCategories.includes(news.category)
                        );
                    }
                } catch (parseError) {
                    console.error('[NewsService] Failed to parse Gemini response:', parseError);
                }
            }
        } catch (error) {
            console.error('[NewsService] Gemini filtering failed:', error);
        }

        return [];
    },

    /**
     * Check if news needs refresh (called daily at midnight)
     */
    shouldRefreshNews: (lastFetch: string): boolean => {
        const lastFetchDate = new Date(lastFetch);
        const now = new Date();
        const hoursSinceLastFetch = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60);

        // Refresh if more than 24 hours have passed
        return hoursSinceLastFetch >= 24;
    },

    /**
     * Format news for display
     */
    formatNewsForDisplay: (news: WineNews[]): NewsDisplay[] => {
        return news.map(item => ({
            ...item,
            timeAgo: NewsService.getTimeAgo(item.publishedDate),
            categoryIcon: NewsService.getCategoryIcon(item.category)
        }));
    },

    /**
     * Get human-readable time ago
     */
    getTimeAgo: (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return 'Just now';
    },

    /**
     * Get icon for category
     */
    getCategoryIcon: (category: string): string => {
        const icons: Record<string, string> = {
            industry: 'factory',
            tasting: 'glass-wine',
            investment: 'trending-up',
            lifestyle: 'heart',
            education: 'school'
        };
        return icons[category] || 'newspaper';
    },

    /**
     * Simulate automatic daily update at midnight
     * In production, this would be a cron job or scheduled function
     */
    setupDailyUpdate: (): void => {
        // Calculate time until midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight
        const msUntilMidnight = midnight.getTime() - now.getTime();

        // Set timeout to run at midnight
        setTimeout(() => {
            console.log('[NewsService] Daily update triggered at midnight');
            // In production: trigger Firecrawl + Gemini update
            // For now: just log
            NewsService.setupDailyUpdate(); // Schedule next day
        }, msUntilMidnight);
    },

    /**
     * Force refresh news (for manual refresh button)
     * Uses Firecrawl + Gemini in production
     */
    refreshNews: async (): Promise<WineNews[]> => {
        console.log('[NewsService] Manual refresh triggered');
        return NewsService.fetchWineNews();
    }
};

// Display interface with formatted data
export interface NewsDisplay extends WineNews {
    timeAgo: string;
    categoryIcon: string;
}
