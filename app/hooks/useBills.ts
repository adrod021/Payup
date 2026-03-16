import { useEffect, useState } from 'react';

import { getBillSession } from '@/app/services/firestore';
import type { BillSession } from '@/app/types';

export function useBillSession(sessionId: string) {
  const [session, setSession] = useState<BillSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillSession(sessionId)
      .then((s) => setSession(s))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session, loading };
}
