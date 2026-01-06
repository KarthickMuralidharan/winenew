import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function AddBottleScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    vintage: '',
    winery: '',
    country: '',
    region: '',
    type: 'Red',
    price: '',
    volume: '750',
    location: 'A01'
  });

  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (!formData.name || !formData.vintage || !formData.winery) {
      Alert.alert('Error', 'Please fill in required fields (Name, Vintage, Winery)');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Bottle "${formData.name}" added to your collection!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Add Bottle" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 16, fontWeight: 'bold' }}>
          Add New Bottle
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Basic Information
            </Text>

            <TextInput
              label="Wine Name *"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Vintage (Year) *"
              value={formData.vintage}
              onChangeText={(text) => updateField('vintage', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Winery *"
              value={formData.winery}
              onChangeText={(text) => updateField('winery', text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Country"
              value={formData.country}
              onChangeText={(text) => updateField('country', text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Region"
              value={formData.region}
              onChangeText={(text) => updateField('region', text)}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Details
            </Text>

            <TextInput
              label="Type"
              value={formData.type}
              onChangeText={(text) => updateField('type', text)}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Price ($)"
              value={formData.price}
              onChangeText={(text) => updateField('price', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Volume (ml)"
              value={formData.volume}
              onChangeText={(text) => updateField('volume', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Location Code"
              value={formData.location}
              onChangeText={(text) => updateField('location', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., A01, B02"
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Quick Tips
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              • Fields marked with * are required{'\n'}
              • Volume is stored in milliliters (750ml = standard bottle){'\n'}
              • Location code matches your cabinet grid (e.g., Row A, Col 01){'\n'}
              • You can add photos later in the full version
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.cancelButton}
            labelStyle={styles.cancelLabel}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            labelStyle={styles.saveLabel}
          >
            Save Bottle
          </Button>
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
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#8B4513',
    borderRadius: 16,
  },
  cancelLabel: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 16,
  },
  saveLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
