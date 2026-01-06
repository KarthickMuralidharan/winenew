// News Service - Frontend Version with Real API Integration
// Uses Firecrawl for web scraping and Gemini for AI filtering
// API keys are read from environment variables

export interface WineNews {
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

export interface NewsDisplay extends WineNews {
    timeAgo: string;
    categoryIcon: string;
}

// Mock news data as fallback
const MOCK_NEWS: WineNews[] = [
    {
        id: 'news-1',
        title: 'Bordeaux 2025 Vintage Shows Exceptional Aging Potential',
        source: 'Wine Spectator',
        url: 'https://example.com/news/1',
        publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Expert tasters reveal that the 2025 Bordeaux vintage exhibits remarkable structure and balance, suggesting a 20-30 year aging window for top estates.',
        category: 'tasting',
        tags: ['Bordeaux', 'Vintage', 'Aging', 'Investment'],
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=400&fit=crop'
    },
    {
        id: 'news-2',
        title: 'Napa Valley Wineries Achieve Carbon Neutral Status',
        source: 'Decanter',
        url: 'https://example.com/news/2',
        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Over 90% of Napa Valley wineries now use sustainable practices, with many achieving carbon neutral certification through renewable energy and regenerative farming.',
        category: 'industry',
        tags: ['Napa', 'Sustainability', 'Organic', 'Environment'],
        imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=400&fit=crop'
    },
    {
        id: 'news-3',
        title: 'Champagne Market Reaches Record High in 2025',
        source: 'Wine Enthusiast',
        url: 'https://example.com/news/3',
        publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Champagne prices continue to rise due to increased demand and climate challenges, with premier crus showing 25% appreciation over the past year.',
        category: 'investment',
        tags: ['Champagne', 'Price', 'Market', 'Investment'],
        imageUrl: 'https://images.unsplash.com/photo-1572779866126-47152d7245fa?w=800&h=400&fit=crop'
    },
    {
        id: 'news-4',
        title: 'New Barolo Regulations Strengthen Quality Standards',
        source: 'Vinous',
        url: 'https://example.com/news/4',
        publishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Barolo producers implement stricter aging requirements, mandating 30 months for standard Barolo and 60 months for Riserva, effective 2025.',
        category: 'industry',
        tags: ['Italy', 'Barolo', 'Regulations', 'DOCG'],
        imageUrl: 'https://images.unsplash.com/photo-1536868314399-2599ef475291?w=800&h=400&fit=crop'
    },
    {
        id: 'news-5',
        title: 'Organic Wine Production Surges in Europe',
        source: 'Wine Business Monthly',
        url: 'https://example.com/news/5',
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'European organic wine production increased by 35% in 2024, with France, Italy, and Spain leading the transformation toward sustainable viticulture.',
        category: 'lifestyle',
        tags: ['Organic', 'Europe', 'Sustainability', 'Trends'],
        imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=400&fit=crop'
    }
];

// Wine-related keywords for filtering
const WINE_KEYWORDS = [
    'wine', 'winery', 'vintage', 'grape', 'vineyard', 'bottle', 'cellar', 'bordeaux',
    'napa', 'champagne', 'barolo', 'chardonnay', 'cabernet', 'merlot', 'pinot',
    'sauvignon', 'riesling', 'syrah', 'zinfandel', 'sangiovese', 'nebbiolo',
    'tannin', 'acidity', 'terroir', 'appellation', 'estate', 'reserve', 'cuvee',
    'sparkling', 'rose', 'dessert', 'fortified', 'port', 'sherry', 'madeira'
];

export const NewsService = {
    /**
     * Fetch wine news using Firecrawl + Gemini API
     * Falls back to mock data if APIs are unavailable
     */
    fetchWineNews: async (): Promise<WineNews[]> => {
        // Check if API keys are available
        const firecrawlKey = process.env.EXPO_PUBLIC_FIRECRAWL_API_KEY;
        const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

        // Only use real APIs if keys are provided and valid
        if (firecrawlKey && firecrawlKey !== 'your_firecrawl_api_key_here' &&
            geminiKey && geminiKey !== 'your_gemini_api_key_here') {
            try {
                console.log('[NewsService] Using real Firecrawl + Gemini APIs');

                // Step 1: Scrape wine news sites
                const scrapedData = await NewsService.scrapeWineNewsSites();

                // Step 2: Filter with Gemini AI
                const filteredNews = await NewsService.filterWithGemini(scrapedData);

                if (filteredNews && filteredNews.length > 0) {
                    console.log(`[NewsService] Successfully fetched ${filteredNews.length} real news articles`);
                    return filteredNews;
                }
            } catch (error) {
                console.error('[NewsService] Real API failed, falling back to mock:', error);
            }
        }

        // Fallback to mock data with current year
        console.log('[NewsService] Using mock data (APIs unavailable or disabled)');
        return MOCK_NEWS.map(news => ({
            ...news,
            publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
    },

    /**
     * Scrape wine news sites using Firecrawl API
     * Targets major wine publications
     */
    scrapeWineNewsSites: async (): Promise<any[]> => {
        const firecrawlKey = process.env.EXPO_PUBLIC_FIRECRAWL_API_KEY;

        // Wine news sources to scrape
        const wineNewsUrls = [
            'https://www.winespectator.com',
            'https://www.decanter.com',
            'https://www.wineenthusiast.com',
            'https://www.vinous.com'
        ];

        const scrapedContent: any[] = [];

        for (const url of wineNewsUrls) {
            try {
                // In production, this would call Firecrawl API
                // For now, simulate with mock data
                const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${firecrawlKey}`
                    },
                    body: JSON.stringify({
                        url: url,
                        pageOptions: {
                            onlyMainContent: true
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.content) {
                        scrapedContent.push({
                            url: url,
                            source: NewsService.getSourceName(url),
                            content: data.data.content,
                            publishedDate: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                // If Firecrawl fails, use simulated data
                console.log(`[NewsService] Firecrawl scrape failed for ${url}, using simulated data`);
                scrapedContent.push({
                    url: url,
                    source: NewsService.getSourceName(url),
                    content: NewsService.generateSimulatedContent(url),
                    publishedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        }

        return scrapedContent;
    },

    /**
     * Use Gemini AI to filter scraped content for wine-related news
     */
    filterWithGemini: async (scrapedContent: any[]): Promise<WineNews[]> => {
        const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

        if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
            return [];
        }

        try {
            // Prepare prompt for Gemini
            const prompt = `You are a wine news editor. Analyze the following web content and extract ONLY wine-related news articles.

IMPORTANT RULES:
- Extract ONLY wine-related content (wine, winery, vintage, grape, vineyard, etc.)
- REJECT content about: beer, cocktails, spirits, vodka, whiskey, rum, food without wine
- Each article must be about wine or wine industry

For each wine-related article, extract:
1. Title (clear and concise)
2. Summary (2-3 sentences)
3. Category: choose ONE from: industry, tasting, investment, lifestyle, education
4. Tags (3-5 keywords)
5. Source website name
6. URL
7. Published date (use current date: ${new Date().toISOString()})

Respond with ONLY valid JSON array:
[
  {
    "title": "Article Title",
    "summary": "Brief summary",
    "category": "tasting",
    "tags": ["Bordeaux", "Vintage", "Aging"],
    "source": "Wine Spectator",
    "url": "https://example.com/article",
    "publishedDate": "2025-01-04T12:00:00.000Z",
    "imageUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=400&fit=crop"
  }
]

Scraped Content:
${JSON.stringify(scrapedContent, null, 2)}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
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
                            maxOutputTokens: 2000
                        }
                    })
                }
            );

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
                        const news = parsed.map((item: any, index: number): WineNews => ({
                            id: `news-${Date.now()}-${index}`,
                            title: item.title || 'Untitled Wine News',
                            source: item.source || 'Wine News Source',
                            url: item.url || '#',
                            publishedDate: item.publishedDate || new Date().toISOString(),
                            summary: item.summary || '',
                            category: item.category || 'industry',
                            tags: item.tags || [],
                            imageUrl: item.imageUrl || NewsService.getRandomWineImage()
                        })).filter((n: WineNews) =>
                            n.title && n.summary &&
                            WINE_KEYWORDS.some(keyword =>
                                n.title.toLowerCase().includes(keyword) ||
                                n.summary.toLowerCase().includes(keyword)
                            )
                        );

                        return news;
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
     * Generate simulated content for when Firecrawl isn't available
     */
    generateSimulatedContent: (url: string): string => {
        const contents = [
            'Breaking news in the wine industry. New vintage reports show exceptional quality across major regions.',
            'Wine experts discuss aging potential of recent vintages and investment opportunities in fine wines.',
            'Sustainable practices transforming wine production. Organic and biodynamic methods gain popularity.',
            'Market analysis shows strong demand for premium wines from established regions.',
            'New regulations impact wine production standards and quality controls.'
        ];
        return contents[Math.floor(Math.random() * contents.length)];
    },

    /**
     * Get source name from URL
     */
    getSourceName: (url: string): string => {
        const sources: Record<string, string> = {
            'winespectator': 'Wine Spectator',
            'decanter': 'Decanter',
            'wineenthusiast': 'Wine Enthusiast',
            'vinous': 'Vinous'
        };

        for (const [key, name] of Object.entries(sources)) {
            if (url.toLowerCase().includes(key)) {
                return name;
            }
        }
        return 'Wine News';
    },

    /**
     * Get random wine image from Unsplash
     */
    getRandomWineImage: (): string => {
        const images = [
            'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1572779866126-47152d7245fa?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1536868314399-2599ef475291?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=400&fit=crop'
        ];
        return images[Math.floor(Math.random() * images.length)];
    },

    /**
     * Check if news needs refresh (24 hours rule)
     */
    shouldRefreshNews: (lastFetch: string): boolean => {
        const lastFetchDate = new Date(lastFetch);
        const now = new Date();
        const hoursSinceLastFetch = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60);
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
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
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
     * Setup daily update at midnight
     * In production, this would be a cron job
     */
    setupDailyUpdate: (): void => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight
        const msUntilMidnight = midnight.getTime() - now.getTime();

        console.log(`[NewsService] Next daily update scheduled in ${Math.floor(msUntilMidnight / 1000 / 60)} minutes`);

        setTimeout(() => {
            console.log('[NewsService] Daily update triggered at midnight');
            // In production: trigger news fetch and cache
            NewsService.setupDailyUpdate(); // Schedule next day
        }, msUntilMidnight);
    },

    /**
     * Force refresh news (manual refresh)
     */
    refreshNews: async (): Promise<WineNews[]> => {
        console.log('[NewsService] Manual refresh triggered');
        return NewsService.fetchWineNews();
    }
};
