import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Linking, Alert, TouchableOpacity } from 'react-native';
import { Text, Appbar, Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NewsService, WineNews } from '../../utils/newsService';
import { BottomNavBar } from '../../components/BottomNavBar';

export default function NewsDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [news, setNews] = useState<WineNews | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNewsDetail();
    }, [id]);

    const loadNewsDetail = async () => {
        setLoading(true);
        try {
            // Fetch all news and find the matching one
            const allNews = await NewsService.fetchWineNews();
            const foundNews = allNews.find(item => item.id === id);

            if (foundNews) {
                setNews(foundNews);
            } else {
                Alert.alert('Error', 'News article not found');
                router.back();
            }
        } catch (error) {
            console.error('Error loading news detail:', error);
            Alert.alert('Error', 'Failed to load news article');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const openFullArticle = () => {
        if (news?.url) {
            Linking.canOpenURL(news.url).then(supported => {
                if (supported) {
                    Linking.openURL(news.url);
                } else {
                    Alert.alert('Cannot open link', 'Please check your browser settings.');
                }
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                    <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                    <Appbar.Content title="Loading..." titleStyle={{ color: '#8B4513' }} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B4513" />
                    <Text style={{ color: '#8B4513', marginTop: 12 }}>Loading article...</Text>
                </View>
            </View>
        );
    }

    if (!news) {
        return (
            <View style={styles.container}>
                <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                    <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                    <Appbar.Content title="Error" titleStyle={{ color: '#8B4513' }} />
                </Appbar.Header>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Article not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                <Appbar.Content
                    title="News Detail"
                    titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header with category and date */}
                <View style={styles.header}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{news.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.dateText}>
                        {formatDate(news.publishedDate)}
                    </Text>
                </View>

                {/* News Image */}
                {news.imageUrl ? (
                    <Image
                        source={{ uri: news.imageUrl }}
                        style={styles.newsImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>Wine News</Text>
                    </View>
                )}

                {/* Title */}
                <Text style={styles.title}>{news.title}</Text>

                <Divider style={{ marginVertical: 12 }} />

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Summary</Text>
                    <Text style={styles.summaryText}>{news.summary}</Text>
                </View>

                {/* Source Info */}
                <View style={styles.sourceCard}>
                    <Text style={styles.sourceLabel}>Source</Text>
                    <Text style={styles.sourceText}>{news.source}</Text>
                    <Text style={styles.urlText}>{news.url}</Text>
                </View>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagsLabel}>Tags</Text>
                        <View style={styles.tagsContainer}>
                            {news.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    mode="outlined"
                                    style={styles.tagChip}
                                    textStyle={styles.tagText}
                                >
                                    {tag}
                                </Chip>
                            ))}
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={openFullArticle}
                        style={styles.primaryButton}
                        labelStyle={styles.buttonLabel}
                    >
                        Read Full Article
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={handleBack}
                        style={styles.secondaryButton}
                        labelStyle={styles.secondaryButtonLabel}
                    >
                        Back to News
                    </Button>
                </View>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#8B4513',
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#8B4513',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        color: '#666',
        fontSize: 12,
    },
    newsImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#D2691E',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    placeholderText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B4513',
        lineHeight: 32,
        marginBottom: 8,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    summaryText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    sourceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    sourceLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    sourceText: {
        fontSize: 16,
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    urlText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    tagsSection: {
        marginBottom: 16,
    },
    tagsLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        height: 28,
        borderRadius: 14,
    },
    tagText: {
        fontSize: 11,
    },
    buttonContainer: {
        gap: 8,
        marginTop: 8,
    },
    primaryButton: {
        backgroundColor: '#8B4513',
        borderRadius: 25,
        paddingVertical: 6,
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        borderColor: '#8B4513',
        borderRadius: 25,
        paddingVertical: 6,
    },
    secondaryButtonLabel: {
        color: '#8B4513',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
