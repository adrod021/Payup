// helper to strip symbols and format currency strings into numbers
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

// finds and returns the first price-like sequence in a text block
export function extractFirstCurrency(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[$€£¥₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
  return match ? parseCurrency(match[0]) : null;
}

// interface to keep scanned data consistent with the ui
export interface ScannedItem {
  id: string;
  name: string;
  price: number;
}

// mock function to simulate ocr processing delay and test loading states
export const performOCR = async (imageUri: string): Promise<ScannedItem[]> => {
  try {
    console.log("starting prototype ocr for:", imageUri);
    
    // 2-second delay to test the loading spinner
    await new Promise(resolve => setTimeout(resolve, 2000));

    // returns static data until google ml kit is integrated
    return [
      { id: Math.random().toString(36).substring(7), name: "Apples", price: 4.50 },
      { id: Math.random().toString(36).substring(7), name: "Bread", price: 2.00 },
      { id: Math.random().toString(36).substring(7), name: "Milk", price: 3.25 },
      { id: Math.random().toString(36).substring(7), name: "Eggs", price: 5.00 }
    ];
  } catch (error) {
    console.error("ocr error:", error);
    throw new Error("could not read receipt");
  }
};