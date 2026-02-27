'use client'

import { useEffect } from 'react'

interface HidePlayerUrlProps {
  clubId: string
  memberId: string
}

export function HidePlayerUrl({ clubId, memberId }: HidePlayerUrlProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Cambia l'URL visibile a /player senza ricaricare
      window.history.replaceState({ clubId, memberId }, '', '/player')
    }
  }, [clubId, memberId])

  return null
}
