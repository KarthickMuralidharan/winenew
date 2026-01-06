import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Modal } from 'react-native';
import { Text, Button, Card, Appbar, Avatar, Chip, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MockFirebaseService } from '../../utils/mockFirebaseService';
import { LogoService, LogoResult } from '../../utils/logoService';

export default function BottleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [bottle, setBottle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<LogoResult | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBottle();
  }, [id]);

  const loadLogo = async (winery: string, vintage?: string) => {
    try {
      const logoResult = await LogoService.getWineLogo(winery, vintage);
      setLogo(logoResult);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  };

  const loadBottle = async () => {
    setLoading(true);
    try {
      const bottleData = await MockFirebaseService.getBottle(id as string);
      if (!bottleData) {
        Alert.alert('Error', 'Bottle not found');
        router.back();
        return;
      }
      setBottle(bottleData);
      // Load logo for the winery
      loadLogo(bottleData.details.winery, bottleData.details.vintage);
    } catch (error) {
      console.error('Error loading bottle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDrink = () => {
    Alert.alert(
      'Drink Bottle',
      'Are you sure you want to mark this bottle as consumed? You can rate it afterwards.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Drink', onPress: () => {
          setRating('');
          setNotes('');
          setShowRatingModal(true);
        }}
      ]
    );
  };

  const handleRatingSubmit = () => {
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      Alert.alert('Invalid Rating', 'Please enter a rating between 1 and 10');
      return;
    }
    setShowRatingModal(false);
    setShowNotesModal(true);
  };

  const handleNotesSubmit = async () => {
    setShowNotesModal(false);
    await MockFirebaseService.consumeBottle(id as string, parseInt(rating), notes || undefined);
    Alert.alert('Enjoyed!', `You rated this wine ${rating}/10. Moved to history.`);
    router.back();
  };

  const handleSkipNotes = async () => {
    setShowNotesModal(false);
    await MockFirebaseService.consumeBottle(id as string, parseInt(rating), undefined);
    Alert.alert('Enjoyed!', `You rated this wine ${rating}/10. Moved to history.`);
    router.back();
  };

  const handleOpen = () => {
    Alert.alert(
      'Open Bottle',
      'IMPORTANT: Opening a bottle will permanently remove it from your cabinet. Once opened, it cannot be put back. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Bottle', style: 'destructive', onPress: async () => {
          await MockFirebaseService.openBottle(id as string);
          Alert.alert('Bottle Opened', 'The bottle has been removed from your cabinet and added to your opened bottles history.');
          router.back();
        }}
      ]
    );
  };

  const handleMove = () => {
    Alert.alert('Move Bottle', 'In full version, this would allow you to move the bottle to a different location.');
  };

  const handleEdit = () => {
    Alert.alert('Edit Bottle', 'In full version, this would open the edit screen.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bottle',
      'Are you sure you want to delete this bottle permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          // For demo, just remove from mock storage
          Alert.alert('Deleted', 'Bottle has been removed from your collection.');
          router.back();
        }}
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFF8F0' }]}>
        <Text>Loading bottle...</Text>
      </View>
    );
  }

  if (!bottle) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFF8F0' }]}>
        <Text>Bottle not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content
          title="Bottle Details"
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
        />
        <Appbar.Action icon="delete" color="#8B4513" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {logo && logo.logoUrl ? (
            <Image
              source={{ uri: logo.logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <Avatar.Icon
              size={64}
              icon="bottle-wine"
              style={{ backgroundColor: '#F5DEB3' }}
              color="#8B4513"
            />
          )}
          <View style={styles.headerText}>
            <Text variant="headlineMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {bottle.details.name}
            </Text>
            <Text variant="titleMedium" style={{ color: '#D2691E' }}>
              {bottle.details.winery}
            </Text>
            {logo && !logo.success && (
              <Text variant="bodySmall" style={{ color: '#999', fontSize: 10, fontStyle: 'italic' }}>
                Logo: {logo.source}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>VINTAGE</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {bottle.details.vintage}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>TYPE</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {bottle.details.type}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="labelMedium" style={{ color: '#666' }}>PRICE</Text>
            <Text variant="bodyLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
              ${bottle.details.price || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Details
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Country:</Text>
              <Text style={styles.value}>{bottle.details.country || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Region:</Text>
              <Text style={styles.value}>{bottle.details.region || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Grape:</Text>
              <Text style={styles.value}>{bottle.details.grape || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Volume:</Text>
              <Text style={styles.value}>{bottle.details.volume || 750}ml</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>Row {bottle.location.row}, Col {bottle.location.col}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Added:</Text>
              <Text style={styles.value}>{new Date(bottle.addedDate).toLocaleDateString()}</Text>
            </View>
            {bottle.peakDrinkingWindow && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Peak Window:</Text>
                <Text style={styles.value}>{bottle.peakDrinkingWindow.start} - {bottle.peakDrinkingWindow.end}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tags */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Tags
            </Text>
            <View style={styles.tagRow}>
              <Chip mode="outlined" style={styles.tag}>
                {bottle.details.type}
              </Chip>
              {bottle.details.country && (
                <Chip mode="outlined" style={styles.tag}>
                  {bottle.details.country}
                </Chip>
              )}
              {bottle.details.region && (
                <Chip mode="outlined" style={styles.tag}>
                  {bottle.details.region}
                </Chip>
              )}
              {bottle.details.grape && (
                <Chip mode="outlined" style={styles.tag}>
                  {bottle.details.grape}
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Actions
            </Text>
            <View style={styles.actionGrid}>
              <Button
                mode="contained"
                onPress={handleOpen}
                style={[styles.actionButton, { backgroundColor: '#D2691E' }]}
                labelStyle={styles.buttonLabel}
                icon="bottle-wine"
              >
                Open
              </Button>
              <Button
                mode="contained"
                onPress={handleDrink}
                style={[styles.actionButton, { backgroundColor: '#8B4513' }]}
                labelStyle={styles.buttonLabel}
                icon="glass-wine"
              >
                Drink
              </Button>
              <Button
                mode="outlined"
                onPress={handleMove}
                style={styles.outlineButton}
                labelStyle={styles.outlineLabel}
                icon="arrow-right-bold"
              >
                Move
              </Button>
              <Button
                mode="outlined"
                onPress={handleEdit}
                style={styles.outlineButton}
                labelStyle={styles.outlineLabel}
                icon="pencil"
              >
                Edit
              </Button>
            </View>
            <Text variant="bodySmall" style={{ color: '#666', marginTop: 8, fontStyle: 'italic' }}>
              Note: Open permanently removes from cabinet | Drink moves to history with rating
            </Text>
          </Card.Content>
        </Card>

        {/* Info */}
        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Storage Tips
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              Store horizontally in a cool, dark place at 12-14°C. Keep away from vibrations and strong odors.
              {bottle.peakDrinkingWindow && (
                ` Best consumed between ${bottle.peakDrinkingWindow.start}-${bottle.peakDrinkingWindow.end}.`
              )}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                Rate This Wine
              </Text>
              <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 16 }}>
                How would you rate this wine? (1-10)
              </Text>
              <TextInput
                mode="outlined"
                label="Rating (1-10)"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
                style={{ marginBottom: 16 }}
                theme={{ colors: { primary: '#8B4513' } }}
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowRatingModal(false)}
                  style={{ flex: 1, borderColor: '#8B4513' }}
                  labelStyle={{ color: '#8B4513' }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleRatingSubmit}
                  style={{ flex: 1, backgroundColor: '#8B4513', marginLeft: 8 }}
                  labelStyle={{ color: '#FFF' }}
                >
                  Next
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                Add Notes (Optional)
              </Text>
              <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 16 }}>
                Any tasting notes?
              </Text>
              <TextInput
                mode="outlined"
                label="Tasting Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={{ marginBottom: 16 }}
                theme={{ colors: { primary: '#8B4513' } }}
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={handleSkipNotes}
                  style={{ flex: 1, borderColor: '#8B4513' }}
                  labelStyle={{ color: '#8B4513' }}
                >
                  Skip
                </Button>
                <Button
                  mode="contained"
                  onPress={handleNotesSubmit}
                  style={{ flex: 1, backgroundColor: '#8B4513', marginLeft: 8 }}
                  labelStyle={{ color: '#FFF' }}
                >
                  Save
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  headerText: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F5F5F5',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  outlineButton: {
    flex: 1,
    borderColor: '#8B4513',
    borderRadius: 16,
  },
  outlineLabel: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
