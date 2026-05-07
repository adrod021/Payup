// app/services/ocrService.ts

/**
 * HELPER FUNCTIONS (Logic from ocr.ts)
 * Strips symbols and extra formatting to turn a currency string into a valid number.
 */
export function parseCurrency(raw: string): number | null {
  if (raw == null) return null;

  const cleaned = raw
    .toString()
    .trim()
    // Removes currency symbols and spaces to leave only digits and decimals
    .replace(/[$€£¥₹]/g, '')
    .replace(/[\s]/g, '')
    .replace(/,/g, '')
    // Handles OCR errors where multiple periods might be detected
    .replace(/(\..*)\./g, '$1');

  if (cleaned === '') return null;

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

/**
 * Scans a block of text to find and return the first sequence that looks like a price.
 */
export function extractFirstCurrency(text: string): number | null {
  if (!text) return null;
  // Uses backslashes (\d, \s) so the engine recognizes digits and spaces
  const match = text.match(/[$€£¥₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  return parseCurrency(match[0]);
}

/**
 * CORE OCR SCANNING FUNCTION
 * This is the bridge between the camera image and the text.
 */
export const performOCR = async (imageUri: string): Promise<string> => {
  try {
    console.log("Starting OCR process for:", imageUri);
    
    // Simulate a 2-second processing delay for the UI loader
    await new Promise(resolve => setTimeout(resolve, 2000));

    /**
     * PROTOTYPE NOTE: 
     * When the team integrates the real Google ML Kit, 
     * this hardcoded string will be replaced by the actual detected text.
     */
    return "GROCERY STORE\nApples $4.50\nBread $2.00\nTotal $6.50"; 
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Could not read receipt");
  }
};