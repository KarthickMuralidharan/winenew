import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Appbar, Avatar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';

const CONSUMED_HISTORY = [
  {
    id: 'history-1',
    name: 'Merlot Reserve',
    vintage: '2017',
    winery: 'Bordeaux Estates',
    consumeDate: '2024-11-15',
    rating: 8,
    notes: 'Perfect with lamb dinner',
    type: 'Red',
    price: 38
  },
  {
    id: 'history-2',
    name: 'Sauvignon Blanc',
    vintage: '2021',
    winery: 'Marlborough Estates',
    consumeDate: '2024-10-28',
    rating: 7,
    notes: 'Great summer wine',
    type: 'White',
    price: 28
  }
];

export default function HistoryScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(10 - rating);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Consumption History" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <FlatList
        data={CONSUMED_HISTORY}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 16, fontWeight: 'bold' }}>
              Your Wine Journey
            </Text>
            <Text style={{ color: '#666', marginBottom: 16 }}>
              Track all the wines you've enjoyed
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      {item.name}
                    </Text>
                    <Chip 
                      mode="outlined" 
                      compact 
                      textStyle={{ fontSize: 10 }}
                      style={{ height: 20 }}
                    >
                      {item.type}
                    </Chip>
                  </View>
                  
                  <Text variant="bodySmall" style={{ color: '#D2691E', marginBottom: 4 }}>
                    {item.winery} • {item.vintage}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text variant="bodyMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      Rating: {renderStars(item.rating)}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      ({item.rating}/10)
                    </Text>
                  </View>

                  {item.notes && (
                    <Text variant="bodySmall" style={{ color: '#333', fontStyle: 'italic', marginTop: 4 }}>
                      "{item.notes}"
                    </Text>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text variant="bodySmall" style={{ color: '#999' }}>
                      Consumed: {item.consumeDate}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      ${item.price}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                  <Avatar.Icon 
                    size={40} 
                    icon="glass-wine" 
                    style={{ backgroundColor: '#F5DEB3' }} 
                    color="#8B4513" 
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: '#999', textAlign: 'center' }}>
              No consumption history yet
            </Text>
            <Text variant="bodySmall" style={{ color: '#999', textAlign: 'center', marginTop: 4 }}>
              Start enjoying your wines to build your history
            </Text>
          </View>
        }
      />
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
    marginBottom: 12,
    elevation: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
