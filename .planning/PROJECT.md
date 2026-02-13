# Calcetto Manager

## What This Is

Una web app mobile-first per la gestione di partite di calcetto (5 vs 5) e calciotto (8 vs 8) tra amici o gruppi amatoriali. Gli utenti possono creare squadre, organizzare partite, registrare statistiche e pagelle post-partita, visualizzare classifiche e storici — tutto ottimizzato per l'uso da smartphone via browser.

## Core Value

Permettere a gruppi di amici di organizzare, giocare e tenere traccia delle loro partite di calcetto in modo semplice, divertente e social, con statistiche automatiche e pagelle condivise.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Creazione e gestione squadre con ruoli e avatar
- [ ] Sistema di inviti via link condivisibile
- [ ] Creazione partite con scelta modalità (calcetto/calciotto)
- [ ] Selezione moduli e formazioni drag-and-drop
- [ ] Timer live e segnapunti in tempo reale durante le partite
- [ ] Registrazione statistiche post-partita (goal, assist, parate, cartellini)
- [ ] Sistema di pagelle e valutazioni giocatori
- [ ] Dashboard statistiche individuali e di squadra
- [ ] Classifiche e top player per categoria
- [ ] Esportazione dati in PDF/Excel
- [ ] Notifiche push per reminder e aggiornamenti
- [ ] Autenticazione con email/social login
- [ ] Supporto offline parziale via Service Workers

### Out of Scope

- **App nativa mobile** — Web app responsive è sufficiente, nessuna installazione richiesta
- **Video upload** — Solo foto highlights per ora, video richiede troppa banda/storage
- **Pagamenti/Premium** — v2 feature, non core per il lancio
- **Tornei e bracket automatici** — Complessità alta, rimandato a v2
- **Chat in tempo reale** — Può essere aggiunta in v2 con WebSockets
- **Versione desktop ottimizzata** — Mobile-first, desktop funzionale ma non ottimizzato
- **Supporto multi-sport** — Solo calcetto/calciotto per ora

## Context

### Target Users
- Gruppi di amici che giocano regolarmente a calcetto
- Squadre amatoriali che vogliono tenere traccia di statistiche
- Capitani/organizzatori che gestiscono formazioni e partite

### Technical Environment
- Mobile-first: ottimizzato per schermi smartphone (Chrome/Safari)
- Browser-based: nessuna installazione nativa richiesta
- Tecnologie consigliate: React/Vue.js frontend, Node.js + Express backend
- Database: MongoDB o Firebase per persistenza dati
- Responsive CSS: Tailwind o Bootstrap
- Push notifications via Web Push API
- Service Workers per supporto offline parziale

### Key Features from User Vision
1. **Gestione Squadre**: Admin crea squadra, aggiunge giocatori con nome, cognome, soprannome, numero maglia, avatar. Ruoli multipli per giocatore. Sistema di inviti via link.
2. **Gestione Partite**: Scelta modalità (5vs5 o 8vs8), data, ora, location. Selezione modulo (1-2-1, 2-2, 3-3-1, ecc.). Formazioni drag-and-drop su campo virtuale.
3. **Durante la Partita**: Timer live, segnapunti goal/assist/cartellini, aggiornabile da arbitro/capitano.
4. **Post-Partita**: Statistiche dettagliate, pagelle con voti 1-10, commenti. Badge e gamification.
5. **Statistiche**: Profilo giocatore con storico, grafici evoluzione, dashboard globale con top player.
6. **Social**: Condivisione risultati su WhatsApp/Instagram, esportazione formazioni/statistiche.

## Constraints

- **Tech Stack**: HTML5, CSS (Tailwind/Bootstrap), JavaScript (React/Vue), Node.js + Express, MongoDB/Firebase
- **Performance**: Caricamenti <2s, lazy loading immagini/statistiche
- **Scalabilità**: Supporta 5-20 giocatori per squadra, scalabile a community più grandi
- **Mobile-First**: Tutto deve funzionare fluidamente su browser smartphone
- **Accessibilità**: Tema dark/light, supporto multilingua (italiano/inglese)
- **Privacy**: GDPR compliant, protezione dati utenti

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first design | Target principale è l'uso da smartphone durante/in prossimità delle partite | — Pending |
| Web app vs native | Nessun download richiesto, accesso immediato via browser | — Pending |
| Firebase/MongoDB | Facilità di setup, real-time capabilities, scalabilità | — Pending |
| Drag-and-drop formazioni | UX intuitiva simile a fantacalcio | — Pending |

---
*Last updated: 2026-02-13 after initialization*
