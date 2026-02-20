/**
 * Canonical court ID map — maps court parenthetical strings to
 * normalized court identifiers. Ported from Free Law Project's courts-db.
 */

export const COURT_ID_MAP: Map<string, string> = new Map([
  // U.S. Supreme Court (no parenthetical needed when using U.S./S. Ct./L. Ed.)
  ['Supreme Court', 'scotus'],

  // Federal Circuit Courts
  ['1st Cir.', 'ca1'],
  ['2d Cir.', 'ca2'],
  ['3d Cir.', 'ca3'],
  ['4th Cir.', 'ca4'],
  ['5th Cir.', 'ca5'],
  ['6th Cir.', 'ca6'],
  ['7th Cir.', 'ca7'],
  ['8th Cir.', 'ca8'],
  ['9th Cir.', 'ca9'],
  ['10th Cir.', 'ca10'],
  ['11th Cir.', 'ca11'],
  ['D.C. Cir.', 'cadc'],
  ['Fed. Cir.', 'cafc'],

  // Federal District Courts (select)
  ['D. Mass.', 'mad'],
  ['D. Conn.', 'ctd'],
  ['D.N.J.', 'njd'],
  ['E.D.N.Y.', 'nyed'],
  ['S.D.N.Y.', 'nysd'],
  ['N.D.N.Y.', 'nynd'],
  ['W.D.N.Y.', 'nywd'],
  ['E.D. Pa.', 'paed'],
  ['W.D. Pa.', 'pawd'],
  ['M.D. Pa.', 'pamd'],
  ['D. Del.', 'ded'],
  ['D. Md.', 'mdd'],
  ['E.D. Va.', 'vaed'],
  ['W.D. Va.', 'vawd'],
  ['D.D.C.', 'dcd'],
  ['N.D. Ill.', 'ilnd'],
  ['C.D. Ill.', 'ilcd'],
  ['S.D. Ill.', 'ilsd'],
  ['N.D. Ind.', 'innd'],
  ['S.D. Ind.', 'insd'],
  ['E.D. Mich.', 'mied'],
  ['W.D. Mich.', 'miwd'],
  ['N.D. Ohio', 'ohnd'],
  ['S.D. Ohio', 'ohsd'],
  ['E.D. Wis.', 'wied'],
  ['W.D. Wis.', 'wiwd'],
  ['D. Minn.', 'mnd'],
  ['N.D. Iowa', 'iand'],
  ['S.D. Iowa', 'iasd'],
  ['E.D. Mo.', 'moed'],
  ['W.D. Mo.', 'mowd'],
  ['D. Neb.', 'ned'],
  ['D. Kan.', 'ksd'],
  ['N.D. Tex.', 'txnd'],
  ['S.D. Tex.', 'txsd'],
  ['E.D. Tex.', 'txed'],
  ['W.D. Tex.', 'txwd'],
  ['E.D. La.', 'laed'],
  ['M.D. La.', 'lamd'],
  ['W.D. La.', 'lawd'],
  ['N.D. Miss.', 'msnd'],
  ['S.D. Miss.', 'mssd'],
  ['N.D. Ala.', 'alnd'],
  ['M.D. Ala.', 'almd'],
  ['S.D. Ala.', 'alsd'],
  ['N.D. Fla.', 'flnd'],
  ['M.D. Fla.', 'flmd'],
  ['S.D. Fla.', 'flsd'],
  ['N.D. Ga.', 'gand'],
  ['M.D. Ga.', 'gamd'],
  ['S.D. Ga.', 'gasd'],
  ['D. Colo.', 'cod'],
  ['D. Utah', 'utd'],
  ['D. Wyo.', 'wyd'],
  ['D. Mont.', 'mtd'],
  ['D. Idaho', 'idd'],
  ['D.N.M.', 'nmd'],
  ['D. Ariz.', 'azd'],
  ['D. Nev.', 'nvd'],
  ['N.D. Cal.', 'cand'],
  ['C.D. Cal.', 'cacd'],
  ['S.D. Cal.', 'casd'],
  ['E.D. Cal.', 'caed'],
  ['D. Or.', 'ord'],
  ['W.D. Wash.', 'wawd'],
  ['E.D. Wash.', 'waed'],
  ['D. Alaska', 'akd'],
  ['D. Haw.', 'hid'],

  // Bankruptcy Courts (select)
  ['Bankr. S.D.N.Y.', 'nysb'],
  ['Bankr. E.D.N.Y.', 'nyeb'],
  ['Bankr. D. Del.', 'deb'],

  // Specialty Federal Courts
  ['Ct. Cl.', 'uscfc'],
  ['Fed. Cl.', 'uscfc'],
  ['Ct. Int\'l Trade', 'cit'],
  ['Tax Ct.', 'tax'],
  ['C.A.A.F.', 'armfor'],
  ['Vet. App.', 'cavc'],

  // State Supreme Courts
  ['Pa.', 'pa'],
  ['Pa.Super.', 'pasuperct'],
  ['Pa. Super.', 'pasuperct'],
  ['Pa. Commw.', 'pacommwct'],
  ['N.J.', 'nj'],
  ['N.J. Super.', 'njsuperctappdiv'],
  ['Ga.', 'ga'],
  ['Ga. App.', 'gactapp'],
]);

/**
 * Normalize a raw court string from a citation parenthetical to a canonical ID.
 * Returns the canonical ID if found, otherwise returns the raw string.
 */
export function normalizeCourtId(rawCourt: string): string {
  const trimmed = rawCourt.trim();

  // Try exact match first
  const exactMatch = COURT_ID_MAP.get(trimmed);
  if (exactMatch) return exactMatch;

  // Try startsWith match (handles "4th Cir. 2007" → "4th Cir.")
  for (const [pattern, id] of COURT_ID_MAP) {
    if (trimmed.startsWith(pattern)) return id;
  }

  return trimmed;
}
