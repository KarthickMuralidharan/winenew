import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Appbar, ActivityIndicator, TextInput, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CameraService } from '../utils/cameraService';
import { WineLabelData } from '../types';
import { BottomNavBar } from '../components/BottomNavBar';

export default function ScanScreen() {
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'camera' | 'manual' | null>(null);
    const [scannedData, setScannedData] = useState<WineLabelData | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [aiEnhanced, setAiEnhanced] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(true); // Demo mode

    // Manual entry form state (using string for price to work with TextInput)
    const [formData, setFormData] = useState<Omit<WineLabelData, 'price'> & { price?: string }>({
        name: '',
        winery: '',
        vintage: '',
        country: '',
        region: '',
        grape: '',
        price: '',
        alcohol: '',
        volume: '750ml'
    });

    const handleBack = () => {
        router.back();
    };

    const handleCheckPermission = async () => {
        const permission = await CameraService.checkPermission();
        if (!permission.granted) {
            const request = await CameraService.requestPermission();
            setPermissionGranted(request.granted);
            if (!request.granted) {
                Alert.alert('Permission Required', 'Camera permission is required to scan bottles.');
                return false;
            }
        }
        return true;
    };

    const handleStartScan = async () => {
        const hasPermission = await handleCheckPermission();
        if (!hasPermission) return;

        setScanning(true);
        setShowCamera(true);

        // Simulate camera opening and scanning
        setTimeout(async () => {
            try {
                // Try OCR first
                const ocrResult = await CameraService.scanLabelOCR();

                if (ocrResult.success && ocrResult.data) {
                    setScannedData(ocrResult.data);
                    setAiEnhanced(false);
                    Alert.alert('Success', 'Label detected! Review and confirm details.');
                } else {
                    // Try barcode
                    const barcodeResult = await CameraService.scanBarcode();
                    if (barcodeResult.success && barcodeResult.data) {
                        setScannedData(barcodeResult.data);
                        setAiEnhanced(false);
                        Alert.alert('Success', 'Barcode scanned! Review and confirm details.');
                    } else {
                        Alert.alert('Scan Failed', 'Could not detect bottle. Please use manual entry.');
                        setScanMode('manual');
                    }
                }
            } catch (error) {
                console.error('Scan error:', error);
                Alert.alert('Error', 'Scanning failed. Please try manual entry.');
                setScanMode('manual');
            } finally {
                setScanning(false);
                setShowCamera(false);
            }
        }, 2500);
    };

    const handleAIEnhance = async () => {
        if (!scannedData) return;

        setScanning(true);
        try {
            const enhanced = await CameraService.aiEnhanceData(scannedData);
            setScannedData(enhanced);
            setAiEnhanced(true);
            Alert.alert('AI Enhanced', 'Missing details have been filled in using AI!');
        } catch (error) {
            console.error('AI enhancement error:', error);
        } finally {
            setScanning(false);
        }
    };

    const handleSaveToCabinet = async () => {
        if (!scannedData) return;

        // Validate data
        const validation = CameraService.validateScanData(scannedData);
        if (!validation.valid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return;
        }

        // In production: save to Firebase
        // For demo: show success and navigate
        Alert.alert(
            'Add to Cabinet',
            `Add "${scannedData.name}" (${scannedData.vintage}) to your cabinet?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Alert.alert('Success', 'Bottle added to your cabinet!');
                        router.back();
                    }
                }
            ]
        );
    };

    const handleManualEntry = () => {
        setScanMode('manual');
        setScannedData(null);
    };

    const handleManualSubmit = () => {
        // Convert form data to WineLabelData format (price string to number)
        const wineData: WineLabelData = {
            ...formData,
            price: formData.price ? parseFloat(formData.price) || undefined : undefined
        };
        
        const validation = CameraService.validateScanData(wineData);
        if (!validation.valid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return;
        }

        setScannedData(wineData);
        Alert.alert('Success', 'Manual entry saved! Review and add to cabinet.');
    };

    const handleReset = () => {
        setScanMode(null);
        setScannedData(null);
        setAiEnhanced(false);
        setFormData({
            name: '',
            winery: '',
            vintage: '',
            country: '',
            region: '',
            grape: '',
            price: '' as string,
            alcohol: '',
            volume: '750ml'
        });
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#FFF8F0', elevation: 2 }}>
                <Appbar.BackAction onPress={handleBack} color="#8B4513" />
                <Appbar.Content
                    title="Scan Bottle"
                    titleStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                />
                {scanMode && (
                    <Appbar.Action icon="refresh" color="#8B4513" onPress={handleReset} />
                )}
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineSmall" style={styles.title}>
                    AI Bottle Scanner
                </Text>
                <Text style={{ color: '#666', marginBottom: 20 }}>
                    Use camera to scan labels or barcodes, or enter manually
                </Text>

                {/* Mode Selection */}
                {!scanMode && (
                    <View style={styles.modeContainer}>
                        <Card style={styles.modeCard} onPress={() => setScanMode('camera')}>
                            <Card.Content style={{ alignItems: 'center' }}>
                                <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 4 }}>
                                    Camera Scan
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#666', textAlign: 'center', marginTop: 4 }}>
                                    OCR + Barcode + AI Recognition
                                </Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.modeCard} onPress={handleManualEntry}>
                            <Card.Content style={{ alignItems: 'center' }}>
                                <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 4 }}>
                                    Manual Entry
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#666', textAlign: 'center', marginTop: 4 }}>
                                    Enter bottle details manually
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>
                )}

                {/* Camera Mode */}
                {scanMode === 'camera' && !scannedData && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Camera Active
                            </Text>

                            {showCamera ? (
                                <View style={styles.cameraActive}>
                                    <ActivityIndicator size="large" color="#8B4513" />
                                    <Text style={{ color: '#8B4513', marginTop: 12, fontWeight: 'bold' }}>
                                        Scanning...
                                    </Text>
                                    <Text style={{ color: '#666', marginTop: 4, fontSize: 12 }}>
                                        Position bottle label in view
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    <Text style={{ color: '#666', marginBottom: 12 }}>
                                        Ready to scan. Point camera at wine label or barcode.
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleStartScan}
                                        loading={scanning}
                                        disabled={scanning}
                                        style={{ backgroundColor: '#8B4513' }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    >
                                        Start Camera Scan
                                    </Button>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                )}

                {/* Scanned Results */}
                {scannedData && (
                    <View>
                        <Card style={[styles.card, { backgroundColor: aiEnhanced ? '#E8F5E9' : '#FFF' }]}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                        Scanned Details
                                    </Text>
                                    {aiEnhanced && (
                                        <Chip mode="outlined" compact style={{ height: 20 }}>
                                            AI Enhanced
                                        </Chip>
                                    )}
                                </View>

                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Name:</Text>
                                    <Text style={styles.value}>{scannedData.name || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Vintage:</Text>
                                    <Text style={styles.value}>{scannedData.vintage || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Winery:</Text>
                                    <Text style={styles.value}>{scannedData.winery || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Region:</Text>
                                    <Text style={styles.value}>{scannedData.region || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Country:</Text>
                                    <Text style={styles.value}>{scannedData.country || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Grape:</Text>
                                    <Text style={styles.value}>{scannedData.grape || 'N/A'}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.label}>Price:</Text>
                                    <Text style={styles.value}>{scannedData.price ? `$${scannedData.price}` : 'N/A'}</Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    {!aiEnhanced && (
                                        <Button
                                            mode="outlined"
                                            onPress={handleAIEnhance}
                                            loading={scanning}
                                            style={{ flex: 1, borderColor: '#8B4513' }}
                                            labelStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                                        >
                                            AI Enhance
                                        </Button>
                                    )}
                                    <Button
                                        mode="contained"
                                        onPress={handleSaveToCabinet}
                                        style={{ flex: 1, backgroundColor: '#228B22' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
                                    >
                                        Add to Cabinet
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.card, { backgroundColor: '#FFF8F0' }]}>
                            <Card.Content>
                                <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
                                    Need to Edit?
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12 }}>
                                    You can edit any field before adding to your cabinet
                                </Text>
                                <Button
                                    mode="outlined"
                                    onPress={() => setScanMode('manual')}
                                    style={{ borderColor: '#8B4513' }}
                                    labelStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                                >
                                    Edit Details
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>
                )}

                {/* Manual Entry Form */}
                {scanMode === 'manual' && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 12 }}>
                                Manual Entry
                            </Text>

                            <TextInput
                                mode="outlined"
                                label="Wine Name *"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                            />

                            <TextInput
                                mode="outlined"
                                label="Winery *"
                                value={formData.winery}
                                onChangeText={(text) => setFormData({ ...formData, winery: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                            />

                            <TextInput
                                mode="outlined"
                                label="Vintage *"
                                value={formData.vintage}
                                onChangeText={(text) => setFormData({ ...formData, vintage: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                                keyboardType="numeric"
                            />

                            <TextInput
                                mode="outlined"
                                label="Country"
                                value={formData.country}
                                onChangeText={(text) => setFormData({ ...formData, country: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                            />

                            <TextInput
                                mode="outlined"
                                label="Region"
                                value={formData.region}
                                onChangeText={(text) => setFormData({ ...formData, region: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                            />

                            <TextInput
                                mode="outlined"
                                label="Grape Variety"
                                value={formData.grape}
                                onChangeText={(text) => setFormData({ ...formData, grape: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                            />

                            <TextInput
                                mode="outlined"
                                label="Price"
                                value={formData.price || ''}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                style={styles.input}
                                theme={{ colors: { primary: '#8B4513' } }}
                                keyboardType="numeric"
                            />

                            <View style={styles.manualActions}>
                                <Button
                                    mode="outlined"
                                    onPress={handleManualSubmit}
                                    style={{ flex: 1, borderColor: '#8B4513' }}
                                    labelStyle={{ color: '#8B4513', fontWeight: 'bold' }}
                                >
                                    Save Entry
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => setScanMode('camera')}
                                    style={{ flex: 1, backgroundColor: '#D2691E' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
                                >
                                    Try Camera
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Tips */}
                <Card style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 8 }}>
                            Scanning Tips
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666', lineHeight: 18 }}>
                            • Ensure good lighting for best results{'\n'}
                            • Hold camera steady over the label{'\n'}
                            • Barcode scanning is most accurate{'\n'}
                            • OCR works best with clear, printed text{'\n'}
                            • AI can fill in missing details automatically{'\n'}
                            • You can always edit before saving
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>
            <BottomNavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F0',
    },
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    title: {
        color: '#8B4513',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    modeCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 2,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cameraActive: {
        height: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8B4513',
        borderStyle: 'dashed',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingVertical: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
    },
    label: {
        color: '#666',
        fontWeight: 'bold',
        flex: 1,
    },
    value: {
        color: '#8B4513',
        fontWeight: 'bold',
        flex: 2,
        textAlign: 'right',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFF',
    },
    manualActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
});
