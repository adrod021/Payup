// Helper functions for turning messy OCR text into usable numbers
// These are defensive because scanned text often contains errors or noise

// Strips symbols and extra formatting to turn a currency string into a valid number
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

// Scans a block of text to find and return the first sequence that looks like a price
export function extractFirstCurrency(text: string): number | null {
  if (!text) return null;

  // Uses backslashes (\d, \s) so the engine recognizes digits and spaces
  const match = text.match(/[$€£¥₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  return parseCurrency(match[0]);
}