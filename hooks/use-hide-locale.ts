import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Hook per rimuovere il prefisso locale dall'URL visibile
 * Mostra URL puliti senza /it o /en
 */
export function useHideLocale() {
  const params = useParams();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      // Rimuovi /it/ o /en/ dall'inizio dell'URL
      const cleanPath = pathname.replace(/^\/(it|en)\//, '/');
      
      // Se l'URL è cambiato, aggiornalo senza ricaricare
      if (cleanPath !== pathname) {
        const newUrl = cleanPath + search + hash;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [params]);
}
