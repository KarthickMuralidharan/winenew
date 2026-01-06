import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Appbar, Avatar, ProgressBar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MockFirebaseService } from '../utils/mockFirebaseService';
import { StockService } from '../utils/stockService';
import { ColorBreakdown, StockAlert } from '../types';
import { BottomNavBar } from '../components/BottomNavBar';

export default function StockScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [colorBreakdown, setColorBreakdown] = useState<ColorBreakdown[]>([]);
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [healthScore, setHealthScore] = useState<number>(0);
    const [healthDescription, setHealthDescription] = useState<string>('');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadStockData();
    }, []);

    const loadStockData = async () => {
        setLoading(true);
        try {
            const bottles = await MockFirebaseService.getCabinetBottles('demo-cabinet-1');

            // Color breakdown
            const colorData = await StockService.getColorBreakdown(bottles);
            setColorBreakdown(colorData);

            // Alerts
            const alertsData = await StockService.getStockAlerts(bottles);
            setAlerts(alertsData);

            // Health score
            const health = await StockService.getCollectionHealth(bottles);
            setHealthScore(health);
            setHealthDescription(StockService.getHealthDescription(health));

            // Stats
            const summary = await MockFirebaseService.getStockSummary('demo-user-123');
            setStats(summary);

        } catch (error) {
            console.error('Error loading stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStockData();
        setRefreshing(false);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                <Appbar.Content
                    title="Stock Dashboard"
                    titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                />
                <Appbar.Action icon="refresh" color="#8B4513" onPress={loadStockData} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B4513']} />
                }
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Collection Overview
                </Text>

                {/* Collection Health */}
                <Card style={styles.healthCard}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                Wine Collection  
                            </Text>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 20 }}>
                                {healthScore}/100
                            </Text>
                        </View>
                        <ProgressBar
                            progress={healthScore / 100}
                            color={healthScore >= 70 ? '#228B22' : healthScore >= 50 ? '#FFA500' : '#DC143C'}
                            style={{ height: 10, borderRadius: 12, marginBottom: 8 }}
                        />
                        <Text variant="bodyMedium" style={{ color: '#333', lineHeight: 20, marginTop: 10 }}>
                            {healthDescription}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Stats Summary */}
                {stats && (
                    <Card style={styles.statsCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Quick Stats
                            </Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Total Bottles</Text>
                                    <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                        {stats.totalBottles}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Total Value</Text>
                                    <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                        ${stats.totalValue}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Oldest</Text>
                                    <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                        {stats.oldestVintage || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Newest</Text>
                                    <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                        {stats.newestVintage || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Color Breakdown */}
                {colorBreakdown.length > 0 && (
                    <Card style={styles.colorCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Wine Type Distribution
                            </Text>

                            {/* Color bars */}
                            <View style={styles.colorBarContainer}>
                                {colorBreakdown.map((item, index) => (
                                    <View
                                        key={item.type}
                                        style={[
                                            styles.colorSegment,
                                            {
                                                flex: item.percentage,
                                                backgroundColor: item.color,
                                                borderLeftWidth: index > 0 ? 2 : 0,
                                                borderColor: '#FFF'
                                            }
                                        ]}
                                    >
                                        {item.percentage > 8 && (
                                            <Text style={[styles.colorLabel, { color: item.type === 'White' || item.type === 'Sparkling' ? '#8B4513' : '#FFF' }]}>
                                                {item.count}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>

                            {/* Detailed breakdown */}
                            <View style={styles.breakdownList}>
                                {colorBreakdown.map(item => (
                                    <View key={item.type} style={styles.breakdownItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                            <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#333' }}>
                                                {item.type}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: '#8B4513' }}>
                                                {item.count}
                                            </Text>
                                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                                {item.percentage}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Alerts */}
                {alerts.length > 0 && (
                    <Card style={styles.alertsCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Alerts & Insights
                            </Text>
                            {alerts.map((alert, index) => (
                                <View key={index} style={styles.alertItem}>
                                    <View style={[
                                        styles.alertIcon,
                                        {
                                            backgroundColor: alert.severity === 'high' ? '#DC143C' :
                                                           alert.severity === 'medium' ? '#FFA500' : '#87CEEB'
                                        }
                                    ]}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF' }}>
                                            {alert.severity === 'high' ? '!' : alert.severity === 'medium' ? '!' : 'i'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.alertText, { fontWeight: alert.severity === 'high' ? 'bold' : 'normal' }]}>
                                            {alert.message}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {/* Vintage Breakdown */}
                {stats && stats.byVintage && Object.keys(stats.byVintage).length > 0 && (
                    <Card style={styles.vintageCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Vintage Breakdown
                            </Text>
                            <View style={styles.vintageGrid}>
                                {Object.entries(stats.byVintage)
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .map(([vintage, count]) => (
                                        <View key={vintage} style={styles.vintageItem}>
                                            <Text variant="bodyMedium" style={{ color: '#666' }}>
                                                {vintage}
                                            </Text>
                                            <Chip
                                                mode="outlined"
                                                compact
                                                style={{ height: 34 }}
                                                textStyle={{ fontSize: 12, fontWeight: 'bold' }}
                                            >
                                                {count as number}
                                            </Chip>
                                        </View>
                                    ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Collection Tips */}
                <Card style={styles.tipsCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
                            Collection Tips
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
                            {healthScore >= 80 ? 'Excellent collection! Consider expanding into dessert wines.' :
                             healthScore >= 60 ? 'Good variety! Try adding some sparkling wines for celebrations.' :
                             healthScore >= 40 ? 'Your collection needs more diversity. Add different wine types.' :
                             'Start by adding at least 3 different wine types to build a balanced collection.'}
                        </Text>
                    </Card.Content>
                </Card>
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
        marginBottom: 16,
    },
    healthCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        marginTop: 38,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFF8F0',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    colorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    colorBarContainer: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    colorSegment: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    breakdownList: {
        gap: 8,
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 16,
    },
    alertsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 10,
        backgroundColor: '#FFF8F0',
        borderRadius: 16,
        marginBottom: 8,
    },
    alertIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        color: '#333',
    },
    vintageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    vintageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    vintageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F5F5',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    tipsCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
});
