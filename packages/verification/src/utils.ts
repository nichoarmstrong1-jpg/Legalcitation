/**
 * Check if two case names share at least one meaningful party name.
 * Used to guard against verification providers returning unrelated cases
 * that happen to share the same reporter citation.
 */
export function caseNamesOverlap(userCaseName: string, resultCaseName: string): boolean {
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z\s]/g, '');

  const STOP_WORDS = new Set(['in', 're', 'the', 'of', 'ex', 'parte', 'matter', 'estate', 'guardianship']);

  const extractParties = (name: string): string[] => {
    const parts = normalize(name).split(/\s+v\s+/);
    return parts
      .map(p => {
        const words = p.trim().split(/\s+/).filter(w => !STOP_WORDS.has(w));
        return words[0] || '';
      })
      .filter(Boolean);
  };

  const userParties = extractParties(userCaseName);
  const resultParties = extractParties(resultCaseName);

  // If we can't extract party names from either side, allow the result (can't determine)
  if (userParties.length === 0 || resultParties.length === 0) return true;

  return userParties.some(up =>
    resultParties.some(rp => up.includes(rp) || rp.includes(up))
  );
}
