import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ScannedItem } from "./services/ocrService";

// saves extracted receipt items to the firestore session document
export async function saveReceiptScanToSession(
  sessionId: string, 
  scannedItems: ScannedItem[] 
) {
  const sessionRef = doc(db, "sessions", sessionId);

  // prepares items with empty selection arrays for participants
  const itemsForFirestore = scannedItems.map(item => ({
    id: item.id || Math.random().toString(36).substring(7),
    name: item.name,
    price: item.price,
    selectedBy: [],         
    selectedByUsername: []  
  }));

  try {
    // updates session status to trigger the move from lobby to billing
    await updateDoc(sessionRef, {
      items: itemsForFirestore,
      status: 'itemized',
      stage: 'setup' 
    });
  } catch (error) {
    console.error("database error:", error);
    throw error;
  }
}