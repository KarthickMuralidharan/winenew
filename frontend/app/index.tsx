import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleCreateAccount = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wine Cellar</Text>
        <Text style={styles.subtitle}>Your Digital Wine Cabinet</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Welcome</Text>
            <Text style={styles.cardText}>
              Manage your wine collection, track inventory, and get AI-powered pairing recommendations.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleGetStarted}
            style={styles.primaryButton}
            labelStyle={styles.buttonLabel}
          >
            Sign In
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCreateAccount}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
          >
            Create Account
          </Button>
        </View>

        <Text style={styles.demoText}>
          Demo Mode - No configuration required
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 6,
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  demoText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 16,
  },
});
