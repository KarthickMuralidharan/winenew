import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserProfile } from '../types';

export const SubscriptionService = {
  /**
   * Get user's subscription tier from their profile
   */
  getUserSubscription: async (userId: string): Promise<UserProfile['subscriptionTier']> => {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const userProfile = docSnap.data() as UserProfile;
      return userProfile.subscriptionTier || 'free';
    }
    return 'free';
  },

  /**
   * Update user's subscription tier
   */
  updateUserSubscription: async (userId: string, tier: UserProfile['subscriptionTier']): Promise<void> => {
    await setDoc(doc(db, 'users', userId), {
      subscriptionTier: tier,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
};
