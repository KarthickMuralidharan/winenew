import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Appbar, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MockFirebaseService } from '../utils/mockFirebaseService';
import { BottomNavBar } from '../components/BottomNavBar';

interface WineDetails {
    name: string;
    vintage: string;
    winery: string;
    type: string;
    country?: string;
    region?: string;
    grape?: string;
    price?: number;
    peakWindow?: { start: number; end: number };
    description?: string;
    pairingReason?: string;
    originInfo?: string;
}

export default function AdvisorScreen() {
    const router = useRouter();
    const [meal, setMeal] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<WineDetails[]>([]);
    const [collection, setCollection] = useState<any[]>([]);

    useEffect(() => {
        loadCollection();
    }, []);

    const loadCollection = async () => {
        try {
            const bottles = await MockFirebaseService.getCabinetBottles('demo-cabinet-1');
            setCollection(bottles);
        } catch (error) {
            console.error('Error loading collection:', error);
        }
    };

    // AI pairing logic with detailed wine information
    const generatePairings = (mealInput: string, bottles: any[]): WineDetails[] => {
        const meal = mealInput.toLowerCase();

        // Map collection bottles to detailed format
        const wineDatabase: WineDetails[] = bottles.map(b => ({
            name: b.details.name,
            vintage: b.details.vintage,
            winery: b.details.winery,
            type: b.details.type,
            country: b.details.country,
            region: b.details.region,
            grape: b.details.grape,
            price: b.details.price,
            peakWindow: b.peakDrinkingWindow,
            description: getWineDescription(b.details.type, b.details.region, b.details.vintage),
            originInfo: getOriginInfo(b.details.country, b.details.region, b.details.winery),
            pairingReason: ''
        }));

        // AI pairing logic
        const matchedWines: WineDetails[] = [];

        // Red wines for meat dishes
        if (meal.includes('steak') || meal.includes('beef') || meal.includes('lamb') || meal.includes('burger')) {
            const redWines = wineDatabase.filter(w => w.type === 'Red');
            redWines.forEach(wine => {
                matchedWines.push({
                    ...wine,
                    pairingReason: `The bold tannins and dark fruit notes in this ${wine.name} (${wine.vintage}) perfectly complement the richness and protein in ${meal}. The wine's structure cuts through the fat while enhancing the meat's flavors.`
                });
            });
        }

        // White wines for seafood/creamy dishes
        if (meal.includes('fish') || meal.includes('seafood') || meal.includes('chicken') || meal.includes('cream') || meal.includes('pasta')) {
            const whiteWines = wineDatabase.filter(w => w.type === 'White');
            whiteWines.forEach(wine => {
                matchedWines.push({
                    ...wine,
                    pairingReason: `This ${wine.name} (${wine.vintage}) offers bright acidity and ${wine.grape ? wine.grape + ' notes' : 'crisp flavors'} that balance the ${meal.includes('cream') ? 'richness' : 'delicacy'} of your dish. The wine's minerality enhances the ${meal.includes('seafood') ? 'seafood' : 'poultry'} flavors.`
                });
            });
        }

        // Sparkling for celebrations or fried foods
        if (meal.includes('celebration') || meal.includes('party') || meal.includes('fried') || meal.includes('champagne')) {
            const sparkling = wineDatabase.filter(w => w.type === 'Sparkling');
            sparkling.forEach(wine => {
                matchedWines.push({
                    ...wine,
                    pairingReason: `The effervescence and crisp acidity of this ${wine.name} cleanses the palate and adds a celebratory touch. Perfect for ${meal.includes('celebration') ? 'special occasions' : 'cutting through fried foods'}.`
                });
            });
        }

        // Rose for lighter meals
        if (meal.includes('salad') || meal.includes('light') || meal.includes('summer')) {
            const rose = wineDatabase.filter(w => w.type === 'Rose');
            rose.forEach(wine => {
                matchedWines.push({
                    ...wine,
                    pairingReason: `This ${wine.name} (${wine.vintage}) offers the perfect balance of fruit and acidity for lighter fare. Its refreshing character complements ${meal} without overpowering it.`
                });
            });
        }

        // If no specific matches, suggest based on general rules
        if (matchedWines.length === 0) {
            // Suggest red for heavy meals, white for light
            if (meal.includes('heavy') || meal.includes('rich') || meal.includes('spicy')) {
                const reds = wineDatabase.filter(w => w.type === 'Red');
                reds.slice(0, 2).forEach(wine => {
                    matchedWines.push({
                        ...wine,
                        pairingReason: `For a ${meal} meal, this ${wine.name} provides the body and intensity needed to stand up to bold flavors.`
                    });
                });
            } else {
                const whites = wineDatabase.filter(w => w.type === 'White');
                whites.slice(0, 2).forEach(wine => {
                    matchedWines.push({
                        ...wine,
                        pairingReason: `For ${meal}, this ${wine.name} offers a lighter touch that won't overwhelm your palate.`
                    });
                });
            }
        }

        return matchedWines.slice(0, 3); // Return top 3
    };

    const getWineDescription = (type: string, region?: string, vintage?: string): string => {
        const descriptions: Record<string, string> = {
            'Red': `A full-bodied red wine with notes of dark berries, cherry, and subtle oak. ${vintage ? 'Vintage ' + vintage + ' shows excellent aging potential.' : ''}`,
            'White': `A crisp white wine with citrus and tropical fruit notes. Balanced acidity makes it versatile with food.`,
            'Rose': `A dry rosé with fresh strawberry and floral notes. Perfect for warm weather and light meals.`,
            'Sparkling': `A sparkling wine with fine bubbles and bright acidity. Celebratory and refreshing.`,
            'Dessert': `A rich dessert wine with honey and dried fruit notes. Perfect for ending a meal.`
        };
        return descriptions[type] || 'A quality wine with unique characteristics.';
    };

    const getOriginInfo = (country?: string, region?: string, winery?: string): string => {
        const parts = [];
        if (winery) parts.push(`Produced by ${winery}`);
        if (region) parts.push(`from the ${region} region`);
        if (country) parts.push(`in ${country}`);
        return parts.join(' ') + '.';
    };

    const handleGetRecommendations = () => {
        if (!meal.trim()) {
            Alert.alert('Error', 'Please enter what you are eating');
            return;
        }

        if (collection.length === 0) {
            Alert.alert('No Collection', 'Please add some bottles to your cabinet first!');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const pairings = generatePairings(meal, collection);
            setRecommendations(pairings);
            setLoading(false);
        }, 1500);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
            <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                <Appbar.Content
                    title="AI Wine Advisor"
                    titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineSmall" style={styles.header}>
                    Smart Pairing AI
                </Text>
                <Text style={{ color: '#666', marginBottom: 20 }}>
                    Get personalized recommendations from your collection with detailed wine information
                </Text>

                {/* Input Section */}
                <Card style={styles.inputCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                            What are you eating or planning?
                        </Text>
                        <TextInput
                            mode="outlined"
                            placeholder="e.g., Grilled ribeye steak with herb butter, or celebration dinner"
                            value={meal}
                            onChangeText={setMeal}
                            multiline
                            numberOfLines={3}
                            style={{ backgroundColor: '#FFF' }}
                            theme={{ colors: { primary: '#8B4513' } }}
                        />
                        <Button
                            mode="contained"
                            onPress={handleGetRecommendations}
                            loading={loading}
                            disabled={loading}
                            style={{ marginTop: 12, backgroundColor: '#8B4513' }}
                            contentStyle={{ height: 48 }}
                            labelStyle={{ fontWeight: 'bold' }}
                        >
                            Get AI Recommendations
                        </Button>
                    </Card.Content>
                </Card>

                {/* Loading State */}
                {loading && (
                    <View style={{ alignItems: 'center', marginVertical: 20 }}>
                        <ActivityIndicator size="large" color="#8B4513" />
                        <Text style={{ color: '#8B4513', marginTop: 10, fontWeight: 'bold' }}>
                            Analyzing your collection...
                        </Text>
                        <Text style={{ color: '#666', marginTop: 4, fontSize: 12 }}>
                            Matching flavors, vintage, and food profiles
                        </Text>
                    </View>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <View>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            AI Recommendations
                        </Text>
                        {recommendations.map((wine, index) => (
                            <Card key={index} style={styles.recommendationCard}>
                                <Card.Content>
                                    {/* Header */}
                                    <View style={styles.wineHeader}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Avatar.Icon
                                                    size={28}
                                                    icon="bottle-wine"
                                                    style={{ backgroundColor: '#F5DEB3' }}
                                                    color="#8B4513"
                                                />
                                                <View>
                                                    <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                                        {wine.name}
                                                    </Text>
                                                    <Text variant="bodySmall" style={{ color: '#D2691E' }}>
                                                        {wine.winery} • {wine.vintage}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        {wine.price && (
                                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                                ${wine.price}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Tags */}
                                    <View style={styles.tagRow}>
                                        <Chip
                                            mode="outlined"
                                            compact
                                            textStyle={{ fontSize: 10 }}
                                            style={{ height: 22 }}
                                        >
                                            {wine.type}
                                        </Chip>
                                        {wine.country && (
                                            <Chip
                                                mode="outlined"
                                                compact
                                                textStyle={{ fontSize: 10 }}
                                                style={{ height: 22 }}
                                            >
                                                {wine.country}
                                            </Chip>
                                        )}
                                        {wine.region && (
                                            <Chip
                                                mode="outlined"
                                                compact
                                                textStyle={{ fontSize: 10 }}
                                                style={{ height: 22 }}
                                            >
                                                {wine.region}
                                            </Chip>
                                        )}
                                        {wine.grape && (
                                            <Chip
                                                mode="outlined"
                                                compact
                                                textStyle={{ fontSize: 10 }}
                                                style={{ height: 22 }}
                                            >
                                                {wine.grape}
                                            </Chip>
                                        )}
                                    </View>

                                    {/* Detailed Info */}
                                    <View style={styles.detailSection}>
                                        <Text variant="titleSmall" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 4 }}>
                                            Why it works:
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18, marginBottom: 12 }}>
                                            {wine.pairingReason}
                                        </Text>

                                        <Text variant="titleSmall" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 4 }}>
                                            Wine Profile:
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18, marginBottom: 12 }}>
                                            {wine.description}
                                        </Text>

                                        <Text variant="titleSmall" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 4 }}>
                                            Origin & History:
                                        </Text>
                                        <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18, marginBottom: 8 }}>
                                            {wine.originInfo}
                                        </Text>

                                        {wine.peakWindow && (
                                            <View style={styles.peakWindow}>
                                                <Text variant="bodySmall" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                                    Peak Drinking Window: {wine.peakWindow.start} - {wine.peakWindow.end}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: '#666', marginTop: 2 }}>
                                                    {new Date().getFullYear() >= wine.peakWindow.start && new Date().getFullYear() <= wine.peakWindow.end
                                                        ? 'At peak drinking window!'
                                                        : new Date().getFullYear() > wine.peakWindow.end
                                                            ? 'May be past peak'
                                                            : 'Not yet at peak'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Info Card */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
                            How the AI Works
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
                            The AI analyzes your meal description and matches it with wines from your collection based on:
                            {'\n'}• Wine type and body
                            {'\n'}• Flavor profiles and intensity
                            {'\n'}• Vintage and aging potential
                            {'\n'}• Regional characteristics
                            {'\n'}• Peak drinking windows
                            {'\n'}• Food pairing principles
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F0' },
    content: { padding: 16, paddingBottom: 120 },
    header: {
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: 18,
    },
    recommendationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    wineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    detailSection: {
        backgroundColor: '#FFF8F0',
        padding: 12,
        borderRadius: 16,
        marginTop: 8,
    },
    peakWindow: {
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 12,
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#F5DEB3',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
});

