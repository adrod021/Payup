import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ScannedItem } from "./services/ocrService";

export async function saveReceiptScanToSession(
  sessionId: string, 
  scannedItems: ScannedItem[] 
) {
  const sessionRef = doc(db, "sessions", sessionId);

  const itemsForFirestore = scannedItems.map(item => ({
    id: item.id || Math.random().toString(36).substring(7),
    name: item.name,
    price: item.price,
    selectedBy: [],         
    selectedByUsername: []  
  }));

  try {
    // We only save the TEXT data to Firestore (which is free)
    await updateDoc(sessionRef, {
      items: itemsForFirestore,
      status: 'itemized',
      stage: 'setup' 
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}