'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Hook per nascondere l'ID del club dall'URL visibile
 * Mostra solo /clubs o /clubs/sezione
 */
export function useHideClubId() {
  const params = useParams();
  const locale = params.locale as string;
  const clubId = params.clubId as string;
  
  useEffect(() => {
    if (typeof window !== 'undefined' && clubId) {
      // Ottieni il pathname corrente
      const pathname = window.location.pathname;
      
      // Estrai la sezione dopo l'ID del club (es. /roster, /matches, ecc.)
      const parts = pathname.split('/');
      const clubIdIndex = parts.findIndex(p => p === clubId);
      
      if (clubIdIndex !== -1) {
        // Ricostruisci l'URL visibile: /locale/clubs/sezione
        const sectionParts = parts.slice(clubIdIndex + 1);
        const section = sectionParts.length > 0 ? '/' + sectionParts.join('/') : '';
        const visibleUrl = `/${locale}/clubs${section}`;
        
        // Cambia l'URL visibile senza ricaricare
        window.history.replaceState({}, '', visibleUrl);
      }
    }
  }, [locale, clubId]);
}
