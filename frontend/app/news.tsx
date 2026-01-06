import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Appbar, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { NewsService, NewsDisplay } from '../utils/newsService';
import { BottomNavBar } from '../components/BottomNavBar';

export default function NewsScreen() {
    const router = useRouter();
    const [news, setNews] = useState<NewsDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastFetch, setLastFetch] = useState<string | null>(null);

    useEffect(() => {
        loadNews();
        // Setup daily update (would run at midnight in production)
        NewsService.setupDailyUpdate();
    }, []);

    const loadNews = async (forceRefresh = false) => {
        setLoading(true);
        try {
            // Check if we need to refresh (24 hours rule)
            if (!forceRefresh && lastFetch) {
                const needsRefresh = NewsService.shouldRefreshNews(lastFetch);
                if (!needsRefresh) {
                    setLoading(false);
                    return;
                }
            }

            const newsData = await NewsService.fetchWineNews();
            const formatted = NewsService.formatNewsForDisplay(newsData);
            setNews(formatted);
            setLastFetch(new Date().toISOString());
        } catch (error) {
            console.error('Error loading news:', error);
            Alert.alert('Error', 'Failed to load news. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNews(true);
        setRefreshing(false);
    };

    const handleBack = () => {
        router.back();
    };

    const openArticle = (url: string) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Cannot open link', 'Please check your browser settings.');
            }
        });
    };

    const viewNewsDetail = (id: string) => {
        router.push(`/news/${id}`);
    };

    const getChipColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            industry: { bg: '#E3F2FD', text: '#1976D2' },
            tasting: { bg: '#F3E5F5', text: '#7B1FA2' },
            investment: { bg: '#E8F5E9', text: '#388E3C' },
            lifestyle: { bg: '#FFF3E0', text: '#F57C00' },
            education: { bg: '#FCE4EC', text: '#C2185B' }
        };
        return colors[category] || { bg: '#F5F5F5', text: '#666' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                <Appbar.Content
                    title="Wine News"
                    titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                />
                <Appbar.Action icon="refresh" color="#8B4513" onPress={onRefresh} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B4513']} />
                }
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Latest Wine News
                </Text>
                <Text style={{ color: '#666', marginBottom: 16 }}>
                    AI-filtered news from top wine sources (Updated daily at midnight)
                </Text>

                {loading && news.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8B4513" />
                        <Text style={{ color: '#8B4513', marginTop: 12 }}>
                            Loading news with AI filtering...
                        </Text>
                        <Text style={{ color: '#666', marginTop: 4, fontSize: 12 }}>
                            (Using Firecrawl + Gemini in production)
                        </Text>
                    </View>
                ) : news.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
                                No news available
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#999', textAlign: 'center', marginTop: 4 }}>
                                Pull to refresh or try again later
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    <>
                        {/* Info Banner */}
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
                                    These news articles are filtered by AI to show only wine-related content. In production, this uses Firecrawl for web scraping and Gemini for intelligent filtering.
                                </Text>
                            </Card.Content>
                        </Card>

                        {/* News List */}
                        {news.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => viewNewsDetail(item.id)}
                                activeOpacity={0.7}
                            >
                                <Card style={styles.newsCard}>
                                    {/* News Image */}
                                    {item.imageUrl && (
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={styles.newsImage}
                                            resizeMode="cover"
                                        />
                                    )}

                                    <Card.Content>
                                        <View style={styles.newsHeader}>
                                            <View style={styles.categoryContainer}>
                                                <View style={[
                                                    styles.categoryDot,
                                                    { backgroundColor: getChipColor(item.category).text }
                                                ]} />
                                                <Text style={[styles.categoryText, { color: getChipColor(item.category).text }]}>
                                                    {item.category.toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                                        </View>

                                        <Text variant="titleMedium" style={styles.newsTitle}>
                                            {item.title}
                                        </Text>

                                        <Text variant="bodySmall" style={styles.newsSummary}>
                                            {item.summary}
                                        </Text>

                                        <View style={styles.newsFooter}>
                                            <View style={styles.sourceContainer}>
                                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                                    {item.source}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: '#999', fontSize: 10 }}>
                                                    {formatDate(item.publishedDate)}
                                                </Text>
                                            </View>
                                            <Button
                                                mode="text"
                                                onPress={() => openArticle(item.url)}
                                                labelStyle={{ color: '#8B4513', fontWeight: 'bold', fontSize: 12 }}
                                                compact
                                            >
                                                Read More
                                            </Button>
                                        </View>

                                        {/* {item.tags && item.tags.length > 0 && (
                                            <View style={styles.tagContainer}>
                                                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                                                    <Chip
                                                        key={tagIndex}
                                                        mode="outlined"
                                                        compact
                                                        textStyle={{ fontSize: 10 }}
                                                        style={styles.tagChip}
                                                    >
                                                        {tag}
                                                    </Chip>
                                                ))}
                                            </View>
                                        )} */}
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))}

                        {/* Footer */}
                        <Card style={styles.footerCard}>
                            <Card.Content>
                                <Text variant="bodySmall" style={{ color: '#666', textAlign: 'center', lineHeight: 18 }}>
                                    News automatically updates every day at 12:00 AM using Firecrawl web scraping and Gemini AI filtering.
                                </Text>
                            </Card.Content>
                        </Card>
                    </>
                )}
            </ScrollView>
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F0',
    },
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    title: {
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 2,
    },
    infoCard: {
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
    },
    newsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    newsImage: {
        width: '100%',
        height: 160,
    },
    newsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    timeAgo: {
        fontSize: 11,
        color: '#999',
    },
    newsTitle: {
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 22,
    },
    newsSummary: {
        color: '#333',
        lineHeight: 18,
        marginBottom: 8,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: '#E0E0E0',
    },
    sourceContainer: {
        flex: 1,
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tagChip: {
        height: 24,
        borderRadius: 12,
    },
    footerCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 12,
        marginTop: 8,
    },
});
