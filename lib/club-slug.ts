/**
 * Genera uno slug leggibile per un club
 * Formato: nome-del-club-id-corto
 * Esempio: "porcoddio-ladro-cmm3ub2z"
 */
export function generateClubSlug(name: string, clubId: string): string {
  // Prendi le prime 8 caratteri dell'ID
  const shortId = clubId.slice(0, 8);
  
  // Trasforma il nome in slug
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Sostituisci caratteri non alfanumerici con -
    .replace(/-+/g, '-') // Rimuovi trattini multipli
    .replace(/^-|-$/g, ''); // Rimuovi trattini iniziali/finali
  
  // Combina nome e ID breve
  return `${nameSlug}-${shortId}`;
}

/**
 * Estrae l'ID breve dallo slug
 * Restituisce le ultime 8 caratteri dello slug
 */
export function extractClubIdFromSlug(slug: string): string {
  // L'ID è sempre negli ultimi 8 caratteri dello slug
  const parts = slug.split('-');
  return parts[parts.length - 1];
}

/**
 * Trova un club dato uno slug
 * Cerca il club con l'ID che inizia con i caratteri estratti
 */
export async function findClubBySlug(slug: string): Promise<string | null> {
  const shortId = extractClubIdFromSlug(slug);
  
  // In un'applicazione reale, qui faresti una query al database
  // Per ora restituiamo solo l'ID breve
  return shortId;
}
