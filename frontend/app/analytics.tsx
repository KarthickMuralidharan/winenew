import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function AnalyticsScreen() {
  const router = useRouter();

  const stats = {
    totalBottles: 2,
    totalValue: 80,
    avgPrice: 40,
    redWines: 1,
    whiteWines: 1,
    sparklingWines: 0,
    oldestVintage: 2018,
    newestVintage: 2020,
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Analytics" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 16, fontWeight: 'bold' }}>
          Collection Insights
        </Text>

        {/* Value Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Collection Value
            </Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                  ${stats.totalValue}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>Total Value</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                  ${stats.avgPrice}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>Avg Price</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold', fontSize: 24 }}>
                  {stats.totalBottles}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>Bottles</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Wine Types */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Wine Types
            </Text>
            <View style={styles.typeRow}>
              <View style={styles.typeItem}>
                <View style={[styles.typeBadge, { backgroundColor: '#DC143C' }]} />
                <Text variant="bodyMedium" style={{ color: '#333' }}>Red</Text>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {stats.redWines}
                </Text>
              </View>
              <View style={styles.typeItem}>
                <View style={[styles.typeBadge, { backgroundColor: '#F0E68C' }]} />
                <Text variant="bodyMedium" style={{ color: '#333' }}>White</Text>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {stats.whiteWines}
                </Text>
              </View>
              <View style={styles.typeItem}>
                <View style={[styles.typeBadge, { backgroundColor: '#FFB6C1' }]} />
                <Text variant="bodyMedium" style={{ color: '#333' }}>Sparkling</Text>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {stats.sparklingWines}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Vintage Range */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Vintage Range
            </Text>
            <View style={styles.vintageRow}>
              <View style={styles.vintageItem}>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {stats.oldestVintage}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>Oldest</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="bodyMedium" style={{ color: '#999' }}>→</Text>
              </View>
              <View style={styles.vintageItem}>
                <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  {stats.newestVintage}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666' }}>Newest</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Collection Health */}
        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Collection Health
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              Your collection is well-balanced with both red and white wines. 
              Consider adding sparkling wines for special occasions.
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.gridRow}>
          <Card style={[styles.gridCard, { flex: 1 }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                {stats.newestVintage - stats.oldestVintage}
              </Text>
              <Text variant="bodySmall" style={{ color: '#666', textAlign: 'center' }}>
                Year Span
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.gridCard, { flex: 1 }]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                {Math.round(stats.totalValue / stats.totalBottles)}
              </Text>
              <Text variant="bodySmall" style={{ color: '#666', textAlign: 'center' }}>
                Avg/Bottle
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  typeItem: {
    alignItems: 'center',
    gap: 4,
  },
  typeBadge: {
    width: 20,
    height: 20,
    borderRadius: 16,
  },
  vintageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  vintageItem: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
});
