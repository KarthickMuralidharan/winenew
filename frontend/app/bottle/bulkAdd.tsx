import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function BulkAddScreen() {
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
    quantity: '1',
    locations: ''
  });

  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleBulkAdd = () => {
    if (!formData.name || !formData.vintage || !formData.winery) {
      Alert.alert('Error', 'Please fill in required fields (Name, Vintage, Winery)');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const locations = formData.locations.split(',').map(l => l.trim()).filter(l => l);
    if (locations.length === 0) {
      Alert.alert('Error', 'Please enter at least one location (comma-separated)');
      return;
    }

    if (locations.length !== quantity) {
      Alert.alert('Error', `You entered ${locations.length} locations but quantity is ${quantity}. These must match.`);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Added ${quantity} bottle(s) of "${formData.name}" to locations: ${locations.join(', ')}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Bulk Add Bottles" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 8, fontWeight: 'bold' }}>
          Add Multiple Bottles
        </Text>
        <Text style={{ color: '#666', marginBottom: 20 }}>
          Scan once, add multiple bottles to different locations
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Wine Information
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
              Details & Quantity
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
              label="Quantity *"
              value={formData.quantity}
              onChangeText={(text) => updateField('quantity', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Locations *
            </Text>

            <TextInput
              label="Enter locations (comma-separated)"
              value={formData.locations}
              onChangeText={(text) => updateField('locations', text)}
              mode="outlined"
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="e.g., A01, A02, B01, B02"
            />

            <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
              Enter exactly {formData.quantity || 1} location(s), separated by commas. 
              Example: A01, A02, A03
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Bulk Add Tips
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              • Perfect for adding the same wine to multiple locations{'\n'}
              • Ensure quantity matches number of locations{'\n'}
              • All bottles will have the same details{'\n'}
              • Great for cases or multiple purchases
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
            onPress={handleBulkAdd}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            labelStyle={styles.saveLabel}
          >
            Add Bottles
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
