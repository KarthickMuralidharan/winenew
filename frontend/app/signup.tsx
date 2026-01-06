import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        'Account created! You can now sign in.',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0' }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content title="Create Account" titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Create Account
            </Text>
            <Text style={styles.subtitle}>
              Start managing your wine collection
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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={handleSignIn}
              style={styles.linkButton}
              labelStyle={styles.linkLabel}
            >
              Already have an account? Sign In
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Mode</Text>
          <Text style={styles.demoText}>Create any account to continue</Text>
          <Text style={styles.demoText}>All data is stored locally</Text>
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
