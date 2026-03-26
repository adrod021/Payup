import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/auth';
import type { User as AppUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const firebaseUser = await getCurrentUser();
        
        if (firebaseUser) {
          // IMPLEMENTED: Mapping all required properties from Firebase to your AppUser type
          const mappedUser: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            // Logic: Use their Firebase name, or the part of the email before the '@', or 'Guest'
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
          };
          setUser(mappedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return { user, loading };
}