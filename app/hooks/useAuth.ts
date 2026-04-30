import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import type { User as AppUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom profile data from firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        // Map data to our app user format
        const mappedUser: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          // Use 'username' from firestore, fallback to display name or email prefix
          displayName: userData?.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
          role: userData?.role || 'user', 
        };
        
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  return { 
    user, 
    loading, 
    isAdmin: user?.role === 'admin' 
  };
}