import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import type { User as AppUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom profile data from firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Map data to our app user format
        const mappedUser: AppUser = {
          uid: firebaseUser.uid, // Match types.ts update
          email: userData?.email || firebaseUser.email || null,
          username: userData?.username || firebaseUser.displayName || 'Guest',
          phoneNumber: userData?.phoneNumber || null,
          signupMethod: userData?.signupMethod || (firebaseUser.email ? 'email' : 'phone'),
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