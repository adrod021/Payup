/**
 * Splits a total dollar amount equally among a list of people.
 * Handles cents accurately to avoid floating-point precision issues.
 *
 * @param totalDollars - The total amount to split (in dollars)
 * @param people - Array of person names/IDs
 * @returns Object with each person's share in dollars (string format)
 */
export function equalSplit(totalDollars: number, people: string[]): Record<string, string> {
  if (!Array.isArray(people) || people.length === 0) {
    throw new Error("people must be a non-empty array");
  }

  // Convert dollars to cents
  const totalCents = Math.round(totalDollars * 100);

  const n = people.length;
  const base = Math.floor(totalCents / n);
  const remainder = totalCents % n;

  const result: Record<string, number> = {};

  // Everyone gets the base amount
  for (let i = 0; i < n; i++) {
    result[people[i]] = base;
  }

  // Distribute the leftover cents
  for (let i = 0; i < remainder; i++) {
    result[people[i]] += 1;
  }

  // Convert cents back to dollars for output
  const resultDollars: Record<string, string> = {};
  for (const person of people) {
    resultDollars[person] = (result[person] / 100).toFixed(2);
  }

  return resultDollars;
}
