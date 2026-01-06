import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebaseConfig';
import * as FileSystem from 'expo-file-system';

const storage = getStorage(app);

export const StorageService = {
    /**
     * Upload an image to Firebase Storage
     * @param uri - Local file URI from image picker
     * @param path - Storage path (e.g., 'bottles/user123/bottle456.jpg')
     * @returns Download URL of uploaded image
     */
    uploadImage: async (uri: string, path: string): Promise<string> => {
        try {
            // For web, we can use fetch directly
            // For native, we need to read the file as a blob
            const response = await fetch(uri);
            const blob = await response.blob();

            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('[StorageService] Upload failed:', error);
            throw error;
        }
    },

    /**
     * Upload bottle label image
     */
    uploadBottleLabel: async (userId: string, bottleId: string, uri: string): Promise<string> => {
        const path = `bottles/${userId}/${bottleId}/label.jpg`;
        return StorageService.uploadImage(uri, path);
    },

    /**
     * Upload bottle photo
     */
    uploadBottlePhoto: async (userId: string, bottleId: string, uri: string): Promise<string> => {
        const path = `bottles/${userId}/${bottleId}/photo.jpg`;
        return StorageService.uploadImage(uri, path);
    },

    /**
     * Generate a unique bottle ID for uploads before Firestore save
     */
    generateBottleId: (): string => {
        return `bottle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
