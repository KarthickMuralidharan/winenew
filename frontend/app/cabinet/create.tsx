import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, Appbar, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function CreateCabinetScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'cabinet',
    rows: '5',
    columns: '6',
    depth: '2'
  });

  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleCreate = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter a cabinet name');
      return;
    }

    const rows = parseInt(formData.rows);
    const cols = parseInt(formData.columns);
    const depth = parseInt(formData.depth);

    if (isNaN(rows) || isNaN(cols) || isNaN(depth) || rows < 1 || cols < 1 || depth < 1) {
      Alert.alert('Error', 'Please enter valid dimensions');
      return;
    }

    // Check limits for free version
    if (rows > 20 || cols > 10 || depth > 2) {
      Alert.alert(
        'Premium Feature', 
        'This dimension exceeds the free version limits (20x10x2). Upgrade to Premium for unlimited dimensions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Plans', onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Cabinet "${formData.name}" created successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateType = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Create Cabinet" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 16, fontWeight: 'bold' }}>
          New Cabinet Setup
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Basic Information
            </Text>

            <TextInput
              label="Cabinet Name *"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., My Wine Cabinet"
            />

            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
              Type
            </Text>
            <RadioButton.Group onValueChange={updateType} value={formData.type}>
              <View style={styles.radioRow}>
                <RadioButton value="cabinet" color="#8B4513" />
                <Text style={styles.radioLabel}>Wine Cabinet (Fridge-style)</Text>
              </View>
              <View style={styles.radioRow}>
                <RadioButton value="room" color="#8B4513" />
                <Text style={styles.radioLabel}>Wine Cellar (Walk-in)</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Dimensions
            </Text>

            <TextInput
              label="Rows (Vertical)"
              value={formData.rows}
              onChangeText={(text) => updateField('rows', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Columns (Horizontal)"
              value={formData.columns}
              onChangeText={(text) => updateField('columns', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              label="Depth (Rows)"
              value={formData.depth}
              onChangeText={(text) => updateField('depth', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Free Version Limits
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              • Max dimensions: 20 rows × 10 columns × 2 depth{'\n'}
              • Upgrade to Premium for unlimited dimensions{'\n'}
              • Locations are auto-coded (e.g., A01, A02, B01){'\n'}
              • You can create multiple cabinets in Premium
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Location Coding
            </Text>
            <Text variant="bodySmall" style={{ color: '#666', lineHeight: 18 }}>
              Locations will be automatically generated based on your dimensions. 
              For example, a 3x4 cabinet will have locations: A01, A02, A03, A04, B01, B02, etc.
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
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
            labelStyle={styles.createLabel}
          >
            Create Cabinet
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
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    color: '#333',
    fontSize: 16,
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
  createButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 16,
  },
  createLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
