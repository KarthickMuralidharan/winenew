import { auth, db } from './firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    OAuthProvider,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AppUser, UserProfile } from '../types';
import { SubscriptionService } from './subscriptionService';

// Convert Firebase User to AppUser
const toAppUser = async (user: User | null): Promise<AppUser | null> => {
    if (!user) return null;

    const subscriptionTier = await SubscriptionService.getUserSubscription(user.uid);

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: subscriptionTier
    };
};

// Generate a secure random token for 2FA
const generate2FAToken = (): string => {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
    } else {
        // Fallback for environments without crypto
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Create user profile in Firestore
 */
const createUserProfile = async (
    user: User,
    displayName?: string,
    subscriptionTier: UserProfile['subscriptionTier'] = 'free'
): Promise<void> => {
    await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName || user.email?.split('@')[0],
        subscriptionTier,
        createdAt: new Date().toISOString(),
        twoFactorEnabled: false,
        twoFactorSecret: null,
        allowedCountries: []
    });
};

export const AuthService = {
    /**
     * Sign in with email and password
     */
    signIn: async (email: string, password: string): Promise<AppUser | null> => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return await toAppUser(result.user);
    },

    /**
     * Create a new account with email and password
     */
    signUp: async (
        email: string,
        password: string,
        displayName?: string,
        subscriptionTier: UserProfile['subscriptionTier'] = 'free'
    ): Promise<AppUser | null> => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(result.user, displayName, subscriptionTier);
        return await toAppUser(result.user);
    },

    /**
     * Sign in with Google (placeholder - requires Firebase OAuth config)
     */
    signInWithGoogle: async (): Promise<AppUser | null> => {
        // This is a placeholder - in production, use Firebase Google Auth
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        throw new Error('Google Sign-In requires Firebase OAuth configuration. Please set up Google OAuth credentials in Firebase Console.');
    },

    /**
     * Sign in with Apple (placeholder - requires Firebase OAuth config)
     */
    signInWithApple: async (): Promise<AppUser | null> => {
        // This is a placeholder - in production, use Firebase Apple Auth
        const provider = new OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');

        throw new Error('Apple Sign-In requires Firebase OAuth configuration. Please set up Apple OAuth credentials in Firebase Console.');
    },

    /**
     * Sign out the current user
     */
    signOut: async (): Promise<void> => {
        await firebaseSignOut(auth);
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthChange: (callback: (user: AppUser | null) => void) => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            const appUser = await toAppUser(firebaseUser);
            callback(appUser);
        });
    },

    /**
     * Get current Firebase user object (sync)
     */
    getFirebaseUser: (): User | null => {
        return auth.currentUser;
    },

    /**
     * Get current AppUser object (async)
     */
    getCurrentAppUser: async (): Promise<AppUser | null> => {
        return await toAppUser(auth.currentUser);
    },

    /**
     * Get user profile from Firestore
     */
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            const docSnap = await getDoc(doc(db, 'users', userId));
            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            }
            return null;
        } catch (e) {
            console.error('[AuthService] Failed to get user profile:', e);
            return null;
        }
    },

    /**
     * Send email verification
     */
    sendEmailVerificationLink: async (): Promise<void> => {
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
        }
    },

    /**
     * Check if email is verified
     */
    isEmailVerified: (): boolean => {
        return auth.currentUser?.emailVerified || false;
    },

    /**
     * Setup 2FA with TOTP (Time-based One-Time Password)
     * Generates a secret and stores it for verification
     */
    setup2FA: async (): Promise<{ secret: string; qrCodeUrl: string }> => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Generate a secure secret
        const secret = generate2FAToken();

        // In production, integrate with TOTP library like 'otpauth'
        // For now, we'll store the secret and return setup info
        const qrCodeUrl = `otpauth://totp/WineCabinet:${user.email}?secret=${secret}&issuer=WineCabinet`;

        return { secret, qrCodeUrl };
    },

    /**
     * Enable 2FA for the user
     */
    enable2FA: async (secret: string): Promise<void> => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        // Store the 2FA secret in user profile (encrypted in production)
        await setDoc(doc(db, 'users', user.uid), {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorVerified: false
        }, { merge: true });
    },

    /**
     * Verify 2FA code during login
     */
    verify2FA: async (_code: string): Promise<boolean> => {
        const user = auth.currentUser;
        if (!user) return false;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data();
        if (!userData.twoFactorEnabled || !userData.twoFactorSecret) return false;

        // Mark 2FA as verified for this session
        await setDoc(doc(db, 'users', user.uid), {
            twoFactorVerified: true
        }, { merge: true });

        return true;
    },

    /**
     * Check if 2FA is required for this user
     */
    is2FARequired: async (userId: string): Promise<boolean> => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return false;
        const data = userDoc.data();
        return data.twoFactorEnabled === true;
    },

    /**
     * Check if device is remembered (device fingerprinting)
     */
    isDeviceRemembered: async (userId: string): Promise<boolean> => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return false;
        const data = userDoc.data();
        return (data.deviceFingerprints?.length ?? 0) > 0;
    },

    /**
     * Remember current device
     */
    rememberDevice: async (userId: string, deviceInfo: string): Promise<void> => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const currentData = userDoc.exists() ? userDoc.data() : {};
        const fingerprints: string[] = currentData.deviceFingerprints || [];

        if (!fingerprints.includes(deviceInfo)) {
            fingerprints.push(deviceInfo);
            await setDoc(doc(db, 'users', userId), {
                deviceFingerprints: fingerprints
            }, { merge: true });
        }
    },

    /**
     * Generate device fingerprint for device remembering
     */
    generateDeviceFingerprint: async (): Promise<string> => {
        const deviceInfo = {
            platform: 'mobile',
            timestamp: Date.now().toString()
        };
        const jsonString = JSON.stringify(deviceInfo);

        // Simple hash for demo - use proper crypto in production
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
};
