// R. 4 — Short Citation Forms: id., supra, hereinafter

export function formatId(pinCite?: string): string {
  if (pinCite) return `Id. at ${pinCite}.`;
  return 'Id.';
}

export function formatSupra(
  author: string,
  noteNumber?: number,
  pinCite?: string
): string {
  const parts = [author, ', supra'];
  if (noteNumber) parts.push(` note ${noteNumber}`);
  if (pinCite) parts.push(`, at ${pinCite}`);
  parts.push('.');
  return parts.join('');
}

export function formatHereinafter(
  shortName: string,
  noteNumber?: number,
  pinCite?: string
): string {
  const parts = [shortName];
  if (noteNumber) parts.push(`, supra note ${noteNumber}`);
  if (pinCite) parts.push(`, at ${pinCite}`);
  parts.push('.');
  return parts.join('');
}
