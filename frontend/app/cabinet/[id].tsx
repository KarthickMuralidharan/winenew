import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, Appbar, FAB, Avatar, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MockFirebaseService } from '../../utils/mockFirebaseService';
import { ShelfRackGrid } from '../../components/ShelfRackGrid';
import { BottomNavBar } from '../../components/BottomNavBar';

export default function CabinetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cabinet, setCabinet] = useState<any>(null);
  const [bottles, setBottles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCabinetData();
  }, [id]);

  const loadCabinetData = async () => {
    setLoading(true);
    try {
      // Load cabinet details
      const cabinetData = await MockFirebaseService.getCabinet(id as string);
      if (!cabinetData) {
        Alert.alert('Error', 'Cabinet not found');
        router.back();
        return;
      }
      setCabinet(cabinetData);

      // Load bottles
      const bottlesData = await MockFirebaseService.getCabinetBottles(id as string);
      setBottles(bottlesData);
    } catch (error) {
      console.error('Error loading cabinet:', error);
      Alert.alert('Error', 'Failed to load cabinet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBottle = () => {
    router.push('/bottle/add');
  };

  const handleViewBottle = (bottleId: string) => {
    router.push(`/bottle/${bottleId}`);
  };

  const handleCellPress = (row: number, col: number, bottle?: any) => {
    if (bottle) {
      handleViewBottle(bottle.id);
    } else {
      Alert.alert(
        'Empty Cell',
        `Location Row ${row}, Column ${col} is empty. Add a bottle here?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Bottle', onPress: handleAddBottle }
        ]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFF8F0' }]}>
        <Text>Loading cabinet...</Text>
      </View>
    );
  }

  if (!cabinet) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFF8F0' }]}>
        <Text>Cabinet not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content
          title={cabinet.name}
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
        />
        <Appbar.Action
          icon="plus"
          color="#8B4513"
          onPress={handleAddBottle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cabinet Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>TYPE</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {cabinet.type === 'room' ? 'Walk-in Cellar' : 'Wine Cabinet'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>DIMENSIONS</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {cabinet.dimensions.rows}x{cabinet.dimensions.columns}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>BOTTLES</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {bottles.length}
            </Text>
          </View>
        </View>

        {/* Shelf/Rack Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridHeader}>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              Visual Storage Layout
            </Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>
              Click any cell to view or add bottle
            </Text>
          </View>

          <ShelfRackGrid
            rows={cabinet.dimensions.rows}
            columns={cabinet.dimensions.columns}
            bottles={bottles}
            onCellPress={handleCellPress}
            showLabels={true}
          />
        </View>

        {/* Bottles List */}
        <View style={styles.listContainer}>
          <Text variant="titleMedium" style={{ color: '#8B4513', marginBottom: 12, fontWeight: 'bold' }}>
            Bottle Inventory
          </Text>
          {bottles.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={{ color: '#666', textAlign: 'center' }}>
                  No bottles in this cabinet yet
                </Text>
                <Text variant="bodySmall" style={{ color: '#999', textAlign: 'center', marginTop: 4 }}>
                  Add your first bottle to get started
                </Text>
              </Card.Content>
            </Card>
          ) : (
            bottles.map(item => (
              <Card
                key={item.id}
                style={styles.card}
                onPress={() => handleViewBottle(item.id)}
              >
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                            {item.details.name}
                          </Text>
                          <Text variant="bodySmall" style={{ color: '#D2691E' }}>
                            {item.details.winery} • {item.details.vintage}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        <Chip
                          mode="outlined"
                          compact
                          textStyle={{ fontSize: 10 }}
                          style={{  paddingHorizontal: 4 }}
                        >
                          {item.details.type}
                        </Chip>
                        {item.details.country && (
                          <Chip
                            mode="outlined"
                            compact
                            textStyle={{ fontSize: 10 }}
                            style={{ paddingHorizontal: 4 }}
                          >
                            {item.details.country}
                          </Chip>
                        )}
                        {item.details.region && (
                          <Chip
                            mode="outlined"
                            compact
                            textStyle={{ fontSize: 10 }}
                            style={{ paddingHorizontal: 4 }}
                          >
                            {item.details.region}
                          </Chip>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text variant="bodySmall" style={{ color: '#999' }}>
                          Loc: R{item.location.row}, C{item.location.col}
                        </Text>
                        {item.details.price && (
                          <Text variant="bodyMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                            ${item.details.price}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 120 },
  infoRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#F5DEB3',
    borderRadius: 12,
    marginBottom: 16
  },
  infoItem: { flex: 1, alignItems: 'center' },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16
  },
  gridHeader: {
    marginBottom: 12,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    backgroundColor: '#FFFFFF'
  },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, elevation: 4 }
});
