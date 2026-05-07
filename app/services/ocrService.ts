/**
 * HELPER FUNCTIONS
 * Strips symbols and extra formatting to turn a currency string into a valid number.
 */
export function parseCurrency(raw: string): number | null {
  if (raw == null) return null;
  const cleaned = raw.toString().trim()
    .replace(/[$€£¥₹]/g, '')
    .replace(/[\s]/g, '')
    .replace(/,/g, '')
    .replace(/(\..*)\./g, '$1');
  if (cleaned === '') return null;
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Scans a block of text to find and return the first sequence that looks like a price.
 */
export function extractFirstCurrency(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[$€£¥₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
  return match ? parseCurrency(match[0]) : null;
}

/**
 * INTERFACE FOR UI
 * This matches what receipt.ts and index.tsx expect.
 */
export interface ScannedItem {
  id: string;
  name: string;
  price: number;
}

/**
 * CORE OCR SCANNING FUNCTION (PROTOTYPE VERSION)
 * Simulates a delay and returns structured data for the UI.
 */
export const performOCR = async (imageUri: string): Promise<ScannedItem[]> => {
  try {
    console.log("Starting Prototype OCR process for:", imageUri);
    
    // Simulate a 2-second processing delay for testing the Loading Spinner
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Prototype data with unique IDs
    return [
      { id: Math.random().toString(36).substring(7), name: "Apples", price: 4.50 },
      { id: Math.random().toString(36).substring(7), name: "Bread", price: 2.00 },
      { id: Math.random().toString(36).substring(7), name: "Milk", price: 3.25 },
      { id: Math.random().toString(36).substring(7), name: "Eggs", price: 5.00 }
    ];
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Could not read receipt");
  }
};