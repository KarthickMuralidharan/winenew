import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Appbar, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SubscriptionScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSubscribe = (plan: string, price: string) => {
    Alert.alert(
      'Subscribe to ' + plan,
      `You selected ${plan} plan at ${price}. This is a demo - no actual payment will be processed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => {
          Alert.alert('Success', `You have subscribed to the ${plan} plan!`);
          router.back();
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF8F0' }]}>
      <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
        <Appbar.BackAction onPress={handleBack} color="#8B4513" />
        <Appbar.Content 
          title="Subscription Plans" 
          titleStyle={{ color: '#8B4513', fontWeight: 'bold' }} 
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: '#8B4513', marginBottom: 8, fontWeight: 'bold' }}>
          Choose Your Plan
        </Text>
        <Text style={{ color: '#666', marginBottom: 20 }}>
          Upgrade to unlock premium features and AI capabilities
        </Text>

        {/* Free Plan */}
        <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#999' }]}>
          <Card.Content>
            <View style={styles.planHeader}>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                Free
              </Text>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                $0
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12, marginTop: 4 }}>
              Perfect for getting started
            </Text>

            <View style={styles.featureList}>
              <Text style={styles.feature}>✓ 1 Cabinet</Text>
              <Text style={styles.feature}>✓ Max 20 rows × 10 cols × 2 deep</Text>
              <Text style={styles.feature}>✓ Manual bottle entry</Text>
              <Text style={styles.feature}>✓ Basic visualization</Text>
              <Text style={styles.feature}>✗ AI Features</Text>
              <Text style={styles.feature}>✗ Cloud Sync</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => handleSubscribe('Free', '$0')}
              style={{ marginTop: 12, borderColor: '#8B4513' }}
              labelStyle={{ color: '#8B4513', fontWeight: 'bold' }}
            >
              Current Plan
            </Button>
          </Card.Content>
        </Card>

        {/* Premium Plan */}
        <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#8B4513', backgroundColor: '#FFF8F0' }]}>
          <Card.Content>
            <View style={styles.planHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                  Premium
                </Text>
                <Avatar.Icon size={24} icon="crown" style={{ backgroundColor: '#8B4513' }} color="#FFF" />
              </View>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                $9.99
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12, marginTop: 4 }}>
              Per month - Best value
            </Text>

            <View style={styles.featureList}>
              <Text style={styles.feature}>✓ Up to 4 Cabinets</Text>
              <Text style={styles.feature}>✓ Unlimited dimensions</Text>
              <Text style={styles.feature}>✓ AI Food Pairing</Text>
              <Text style={styles.feature}>✓ Shelf Life Advisor</Text>
              <Text style={styles.feature}>✓ Cloud Sync & Backup</Text>
              <Text style={styles.feature}>✓ Priority Support</Text>
            </View>

            <Button
              mode="contained"
              onPress={() => handleSubscribe('Premium', '$9.99/month')}
              style={{ marginTop: 12, backgroundColor: '#8B4513' }}
              labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
            >
              Upgrade to Premium
            </Button>
          </Card.Content>
        </Card>

        {/* Professional Plan */}
        <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#D2691E' }]}>
          <Card.Content>
            <View style={styles.planHeader}>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                Professional
              </Text>
              <Text variant="titleLarge" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                $29.99
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12, marginTop: 4 }}>
              Per month - For serious collectors
            </Text>

            <View style={styles.featureList}>
              <Text style={styles.feature}>✓ Unlimited Cabinets & Cellars</Text>
              <Text style={styles.feature}>✓ Complex cellar logic</Text>
              <Text style={styles.feature}>✓ Advanced Analytics</Text>
              <Text style={styles.feature}>✓ Bulk Management</Text>
              <Text style={styles.feature}>✓ Multi-user Access</Text>
              <Text style={styles.feature}>✓ API Access</Text>
            </View>

            <Button
              mode="contained"
              onPress={() => handleSubscribe('Professional', '$29.99/month')}
              style={{ marginTop: 12, backgroundColor: '#D2691E' }}
              labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
            >
              Go Professional
            </Button>
          </Card.Content>
        </Card>

        {/* Comparison Table */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
              Feature Comparison
            </Text>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Cabinets</Text>
              <Text style={styles.comparisonValue}>1</Text>
              <Text style={styles.comparisonValue}>4</Text>
              <Text style={styles.comparisonValue}>∞</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>AI Features</Text>
              <Text style={styles.comparisonValue}>✗</Text>
              <Text style={styles.comparisonValue}>✓</Text>
              <Text style={styles.comparisonValue}>✓</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Cloud Sync</Text>
              <Text style={styles.comparisonValue}>✗</Text>
              <Text style={styles.comparisonValue}>✓</Text>
              <Text style={styles.comparisonValue}>✓</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Analytics</Text>
              <Text style={styles.comparisonValue}>Basic</Text>
              <Text style={styles.comparisonValue}>Basic</Text>
              <Text style={styles.comparisonValue}>Advanced</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Info */}
        <Card style={[styles.card, { backgroundColor: '#F5DEB3' }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
              Demo Mode
            </Text>
            <Text variant="bodySmall" style={{ color: '#333', lineHeight: 18 }}>
              This is a demo version. All subscription actions are simulated. 
              In the production version, payments would be processed securely through Stripe or similar.
            </Text>
          </Card.Content>
        </Card>
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureList: {
    gap: 4,
  },
  feature: {
    color: '#333',
    fontSize: 14,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  comparisonFeature: {
    flex: 2,
    color: '#666',
    fontWeight: 'bold',
  },
  comparisonValue: {
    flex: 1,
    color: '#8B4513',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
