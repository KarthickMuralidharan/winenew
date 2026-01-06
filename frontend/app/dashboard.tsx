import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Button, Card, Appbar, FAB, Avatar, Chip, ProgressBar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MockFirebaseService } from '../utils/mockFirebaseService';
import { StockService } from '../utils/stockService';
import { ColorBreakdown, StockAlert, DashboardStats } from '../types';
import { BottomNavBar } from '../components/BottomNavBar';

export default function DashboardScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [stats, setStats] = useState<DashboardStats>({
        totalBottles: 0,
        totalValue: 0,
        cabinets: 1,
        byType: {}
    });
    const [colorBreakdown, setColorBreakdown] = useState<ColorBreakdown[]>([]);
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [healthScore, setHealthScore] = useState<number>(0);
    const [healthDescription, setHealthDescription] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Get stock summary
            const summary = await MockFirebaseService.getStockSummary('demo-user-123');

            setStats({
                totalBottles: summary.totalBottles,
                totalValue: summary.totalValue,
                cabinets: 1,
                byType: summary.byType
            });

            // Get color breakdown
            const bottles = await MockFirebaseService.getCabinetBottles('demo-cabinet-1');
            const colorData = await StockService.getColorBreakdown(bottles);
            setColorBreakdown(colorData);

            // Get alerts
            const alertsData = await StockService.getStockAlerts(bottles);
            setAlerts(alertsData);

            // Get health score
            const health = await StockService.getCollectionHealth(bottles);
            setHealthScore(health);
            setHealthDescription(StockService.getHealthDescription(health));

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleViewCabinet = () => {
        router.push('/cabinet/demo-cabinet-1');
    };

    const handleAdvisor = () => {
        router.push('/advisor');
    };

    const handleAnalytics = () => {
        router.push('/analytics');
    };

    const handleHistory = () => {
        router.push('/history');
    };

    const handleSettings = () => {
        router.push('/settings');
    };

    const handleAddBottle = () => {
        router.push('/bottle/add');
    };

    const handleScan = () => {
        router.push('/scan');
    };

    const handleStock = () => {
        router.push('/stock');
    };

    const handleNews = () => {
        router.push('/news');
    };

    const handleCreateCabinet = () => {
        router.push('/cabinet/create');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.background, elevation: 2 }}>
                <Appbar.Content
                    title="Dashboard"
                    titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
                />
                <Appbar.Action icon="refresh" color={theme.colors.primary} onPress={loadDashboardData} />
                <Appbar.Action icon="cog" color={theme.colors.primary} onPress={handleSettings} />
            </Appbar.Header>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B4513']} />
                }
            >
                <Text variant="headlineSmall" style={styles.welcome}>
                    Welcome to Your Cellar
                </Text>

                {/* Main Stats Cards */}
                <View style={styles.statsRow}>
                    <Card style={[styles.statCard, { flex: 1 }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                                {stats.totalBottles}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                Bottles
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={[styles.statCard, { flex: 1 }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                                ${stats.totalValue}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                Value
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={[styles.statCard, { flex: 1 }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                                {stats.cabinets}
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                Cabinets
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Collection Health */}
                <Card style={styles.healthCard}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                Wine Collections 
                            </Text>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                {healthScore}/100
                            </Text>
                        </View>
                        <ProgressBar
                            progress={healthScore / 100}
                            color={healthScore >= 70 ? '#228B22' : healthScore >= 50 ? '#FFA500' : '#DC143C'}
                            style={{ height: 8, borderRadius: 12 }}
                        />
                        <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
                            {healthDescription}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Color Breakdown */}
                {colorBreakdown.length > 0 && (
                    <Card style={styles.colorCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Stock by Color
                            </Text>
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
                                        {item.percentage > 10 && (
                                            <Text style={[styles.colorLabel, { color: item.type === 'White' || item.type === 'Sparkling' ? '#8B4513' : '#FFF' }]}>
                                                {item.count}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                            <View style={styles.colorLegend}>
                                {colorBreakdown.map(item => (
                                    <View key={item.type} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText}>{item.type}: {item.percentage}%</Text>
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
                                Alerts & Recommendations
                            </Text>
                            {alerts.slice(0, 3).map((alert, index) => (
                                <View key={index} style={styles.alertItem}>
                                    <Avatar.Icon
                                        size={24}
                                        icon={alert.icon}
                                        style={{
                                            backgroundColor: alert.severity === 'high' ? '#DC143C' :
                                                              alert.severity === 'medium' ? '#FFA500' : '#87CEEB'
                                        }}
                                        color="#FFF"
                                    />
                                    <Text style={[styles.alertText, { color: '#333' }]}>
                                        {alert.message}
                                    </Text>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card style={styles.actionCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                            Quick Actions
                        </Text>
                        <View style={styles.actionGrid}>
                            <Button
                                mode="contained"
                                onPress={handleViewCabinet}
                                style={[styles.actionButton, { backgroundColor: '#8B4513' }]}
                                labelStyle={styles.buttonLabel}
                                icon="view-grid"
                            >
                                Cabinet
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleScan}
                                style={[styles.actionButton, { backgroundColor: '#D2691E' }]}
                                labelStyle={styles.buttonLabel}
                                icon="camera"
                            >
                                Scan
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleAddBottle}
                                style={[styles.actionButton, { backgroundColor: '#228B22' }]}
                                labelStyle={styles.buttonLabel}
                                icon="plus"
                            >
                                Add
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleAdvisor}
                                style={[styles.actionButton, { backgroundColor: '#9370DB' }]}
                                labelStyle={styles.buttonLabel}
                                icon="robot"
                            >
                                AI
                            </Button>
                        </View>
                        <View style={[styles.actionGrid, { marginTop: 8 }]}>
                            <Button
                                mode="outlined"
                                onPress={handleStock}
                                style={styles.outlineButton}
                                labelStyle={styles.outlineLabel}
                                icon="chart-bar"
                            >
                                Stock
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handleNews}
                                style={styles.outlineButton}
                                labelStyle={styles.outlineLabel}
                                icon="newspaper"
                            >
                                News
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handleHistory}
                                style={styles.outlineButton}
                                labelStyle={styles.outlineLabel}
                                icon="history"
                            >
                                History
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handleAnalytics}
                                style={styles.outlineButton}
                                labelStyle={styles.outlineLabel}
                                icon="chart-pie"
                            >
                                Analytics
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* Info Card */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
                            Demo Mode Active
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666', lineHeight: 18 }}>
                            All data is stored locally on your device. No cloud sync is required.
                            Upgrade to Premium for multi-device sync and real AI features.
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: '#8B4513' }]}
                onPress={handleAddBottle}
                label="Add Bottle"
                color="#FFF"
            />
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    welcome: {
        fontWeight: 'bold',
        marginBottom: 16,
        fontSize: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statCard: {
        borderRadius: 50,
        elevation: 2,
    },
    healthCard: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    colorCard: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    colorBarContainer: {
        flexDirection: 'row',
        height: 40,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    colorSegment: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorLabel: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    colorLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 12,
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },
    alertsCard: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
        padding: 12,
        borderRadius: 50,
    },
    alertText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    actionCard: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 50,
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    outlineButton: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 50,
        paddingVertical: 4,
    },
    outlineLabel: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    infoCard: {
        borderRadius: 50,
        padding: 20,
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 80, // Position above bottom navbar (navbar height ~60px + padding)
        elevation: 4,
    },
});
