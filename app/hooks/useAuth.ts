import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Directly connects to the Firebase Auth instance
import type { User as AppUser } from '../types';


 // useAuth Hook - Provides a live listener that automatically updates the user state throughout the app whenever someone logs in, signs up, or logs out.
 
export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Set up the subscription to Firebase Authentication
    // This observer triggers immediately on mount and then every time the auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Transform the raw Firebase user object into our custom AppUser format
        const mappedUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          // Priority: 1. Firebase profile name, 2. Email prefix, 3. 'Guest' fallback
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
        };
        
        setUser(mappedUser);
      } else {
        // Clear the user state when no authenticated session is found
        setUser(null);
      }
      
      // Stop showing the initial loading state once we have a definitive answer from Firebase
      setLoading(false);
    });

    // 2. Memory Management
    // Unsubscribe from the listener when the component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, []); 

  return { user, loading };
}