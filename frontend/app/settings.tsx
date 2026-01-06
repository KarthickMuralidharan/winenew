import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Appbar, Button, Avatar, Switch, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../store/themeStore';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleBack = () => {
    router.back();
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your bottles and cabinets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'All data has been cleared.');
        }}
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export will be prepared and downloaded shortly.');
  };

  const handleSubscription = () => {
    router.push('/subscription');
  };

  const handleScan = () => {
    router.push('/scan');
  };

  const handleBulkAdd = () => {
    router.push('/bottle/bulkAdd');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background, elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color={theme.colors.primary} />
        <Appbar.Content
          title="Settings"
          titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Theme Toggle */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar.Icon
                  size={28}
                  icon={isDarkMode ? 'weather-night' : 'white-balance-sunny'}
                  style={{ backgroundColor: theme.colors.primary }}
                  color={theme.colors.surface}
                />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Data Management
        </Text>

        {/* Data Management */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 12 }}>
              Manage Your Data
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={handleExportData}
                style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
                labelStyle={[styles.outlineLabel, { color: theme.colors.primary }]}
              >
                Export Data
              </Button>
              <Button
                mode="outlined"
                onPress={handleClearData}
                style={[styles.outlineButton, { borderColor: '#DC143C' }]}
                labelStyle={[styles.outlineLabel, { color: '#DC143C' }]}
              >
                Clear All Data
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Features
        </Text>

        {/* Features */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 12 }}>
              Advanced Features
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleScan}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.buttonLabel}
                icon="camera"
              >
                Scan Bottle
              </Button>
              <Button
                mode="contained"
                onPress={handleBulkAdd}
                style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                labelStyle={styles.buttonLabel}
                icon="plus-multiple"
              >
                Bulk Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Subscription */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar.Icon
                size={32}
                icon="crown"
                style={{ backgroundColor: theme.colors.primary }}
                color={theme.colors.surface}
              />
              <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Subscription
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
              Upgrade to Premium for AI features, multi-cabinet support, and cloud sync.
            </Text>
            <Button
              mode="contained"
              onPress={handleSubscription}
              style={{ backgroundColor: theme.colors.primary, borderRadius: 50 }}
              labelStyle={{ fontWeight: 'bold', color: theme.colors.surface }}
            >
              View Plans
            </Button>
          </Card.Content>
        </Card>

        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Information
        </Text>

        {/* App Info */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 8 }}>
              About Wine Cabinet App
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}>
              Version 1.0.0
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18, marginTop: 4 }}>
              A digital twin for your wine collection. Track inventory, get AI pairing recommendations, and manage your cellar with real-time insights.
            </Text>
          </Card.Content>
        </Card>

        {/* Demo Info */}
        <Card style={[styles.card, { borderRadius: 50, backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 8 }}>
              Demo Mode
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface, lineHeight: 18 }}>
              All data is stored locally on your device. No cloud sync is active. This is a fully functional demo of the Wine Cabinet App with real AI integration when API keys are provided.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 16,
    marginTop: 24,
  },
  card: {
    padding: 20,
    marginBottom: 8,
    elevation: 2,
  },
  buttonGroup: {
    gap: 8,
  },
  outlineButton: {
    borderRadius: 50,
    paddingVertical: 4,
  },
  outlineLabel: {
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 50,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
