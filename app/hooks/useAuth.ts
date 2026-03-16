import { useEffect, useState } from 'react';

import { getCurrentUser } from '@/app/services/auth';
import type { User } from '@/app/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
