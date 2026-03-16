/**
 * Helpers for parsing OCR text (e.g., receipt amounts) into usable values.
 *
 * These are intentionally small and defensive: OCR text is often noisy.
 */

/**
 * Converts a string like "$1,234.56" into a number (1234.56).
 * Returns null if the string cannot be parsed.
 */
export function parseCurrency(raw: string): number | null {
  if (raw == null) return null;

  const cleaned = raw
    .toString()
    .trim()
    // Remove currency symbols and common group separators
    .replace(/[$€£¥₹]/g, '')
    .replace(/[\s]/g, '')
    .replace(/,/g, '')
    // Sometimes OCR turns a period into a comma.
    // Keep only the first decimal point.
    .replace(/(\..*)\./g, '$1');

  if (cleaned === '') return null;

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

/**
 * Finds the first currency-looking value in a block of OCR text and returns it as a number.
 * Useful for receipts where you want to grab the first total/amount encountered.
 */
export function extractFirstCurrency(text: string): number | null {
  if (!text) return null;

  // Match patterns like $1,234.56 or 1,234.56 or 1234
  const match = text.match(/[$€£¥₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  return parseCurrency(match[0]);
}
