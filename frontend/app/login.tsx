import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@wineapp.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateAccount = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0' }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content title="Sign In" titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Welcome Back
            </Text>
            <Text style={styles.subtitle}>
              Sign in to manage your wine collection
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={handleCreateAccount}
              style={styles.linkButton}
              labelStyle={styles.linkLabel}
            >
              Create Account
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          <Text style={styles.demoText}>Email: demo@wineapp.com</Text>
          <Text style={styles.demoText}>Password: 123456</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  title: {
    color: '#8B4513',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    fontSize: 14,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  linkButton: {
    marginTop: 8,
  },
  linkLabel: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  demoInfo: {
    marginTop: 24,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5DEB3',
    borderRadius: 12,
  },
  demoTitle: {
    color: '#8B4513',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    color: '#666',
    fontSize: 12,
  },
});
