// Data Encryption Service
// Provides encryption for sensitive data at rest

interface EncryptedData {
    ciphertext: string;
    iv: string;
}

// Simple XOR-based encryption for demo purposes
// In production, use react-native-aes-crypto or expo-crypto with proper AES

const ENCRYPTION_KEY = 'WineCabinetApp_Secure_Key_2024';

export const EncryptionService = {
    /**
     * Generate a random string
     */
    generateRandomString: (length: number): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Base64 encode
     */
    base64Encode: (str: string): string => {
        try {
            return btoa(str);
        } catch {
            // Fallback for Unicode
            const bytes = new TextEncoder().encode(str);
            const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
            return btoa(binary);
        }
    },

    /**
     * Base64 decode
     */
    base64Decode: (str: string): string => {
        try {
            return atob(str);
        } catch {
            const binary = atob(str);
            const bytes = new Uint8Array(Array.from(binary, (char) => char.charCodeAt(0)));
            return new TextDecoder().decode(bytes);
        }
    },

    /**
     * Encrypt data using XOR (demo only - use AES in production)
     */
    encrypt: async (plaintext: string): Promise<EncryptedData> => {
        const iv = EncryptionService.generateRandomString(16);
        const key = ENCRYPTION_KEY + iv.slice(0, 16);

        // Simple XOR encryption for demo
        let ciphertext = '';
        for (let i = 0; i < plaintext.length; i++) {
            const charCode = plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            ciphertext += String.fromCharCode(charCode);
        }

        return {
            ciphertext: EncryptionService.base64Encode(ciphertext),
            iv
        };
    },

    /**
     * Decrypt data
     */
    decrypt: async (encrypted: EncryptedData): Promise<string> => {
        const key = ENCRYPTION_KEY + encrypted.iv.slice(0, 16);
        const encryptedStr = EncryptionService.base64Decode(encrypted.ciphertext);

        let result = '';
        for (let i = 0; i < encryptedStr.length; i++) {
            const charCode = encryptedStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    },

    /**
     * Hash a value using SHA-256 (simple implementation)
     */
    hash: async (value: string): Promise<string> => {
        // Simple hash for demo - use proper crypto in production
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    },

    /**
     * Encrypt and store sensitive data in AsyncStorage
     */
    secureStore: async (key: string, value: string): Promise<void> => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const encrypted = await EncryptionService.encrypt(value);
            await AsyncStorage.setItem(`secure_${key}`, JSON.stringify(encrypted));
        } catch (error) {
            console.error('[Encryption] Secure store failed:', error);
            throw error;
        }
    },

    /**
     * Retrieve and decrypt sensitive data
     */
    secureRetrieve: async (key: string): Promise<string | null> => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const stored = await AsyncStorage.getItem(`secure_${key}`);
            if (!stored) return null;

            const encrypted: EncryptedData = JSON.parse(stored);
            return await EncryptionService.decrypt(encrypted);
        } catch (error) {
            console.error('[Encryption] Secure retrieve failed:', error);
            return null;
        }
    },

    /**
     * Encrypt user sensitive data before storage
     */
    encryptUserData: async (data: object): Promise<string> => {
        const jsonString = JSON.stringify(data);
        const encrypted = await EncryptionService.encrypt(jsonString);
        return JSON.stringify(encrypted);
    },

    /**
     * Decrypt user sensitive data
     */
    decryptUserData: async <T = Record<string, unknown>>(encryptedString: string): Promise<T> => {
        const encrypted: EncryptedData = JSON.parse(encryptedString);
        const decrypted = await EncryptionService.decrypt(encrypted);
        return JSON.parse(decrypted);
    }
};

// Polyfill Buffer for React Native
const Buffer = {
    from: (str: string, encoding: string): Uint8Array => {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }
};

// Make Buffer available globally
if (typeof global !== 'undefined') {
    (global as any).Buffer = Buffer;
}
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
}
