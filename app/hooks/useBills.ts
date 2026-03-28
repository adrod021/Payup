import { useEffect, useState } from 'react';
import { getBillSession } from '../services/firestore';
import type { BillSession } from '../types';

/**
 * useBillSession Hook
 * Fetches the details of a specific bill session from Firestore when provided a sessionId.
 */
export function useBillSession(sessionId: string) {
  const [session, setSession] = useState<BillSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Exit early if no sessionId is provided to avoid unnecessary API calls
    if (!sessionId) return;

    // Trigger the database service to fetch session data
    getBillSession(sessionId)
      .then((s: BillSession | null) => { 
        // Successfully retrieved the session or confirmed it doesn't exist
        setSession(s);
      })
      .catch((err: Error) => { 
        // Log the specific error message for debugging purposes
        console.error("Error loading bill:", err.message);
      })
      .finally(() => {
        // Ensure the loading spinner is turned off regardless of success or failure
        setLoading(false);
      });
  }, [sessionId]); // Re-run the effect if the user navigates to a different session

  return { session, loading };
}