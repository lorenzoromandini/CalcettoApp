# Calcetto Manager

## What This Is

Una web app mobile-first per la gestione di partite di calcetto (5 vs 5) e calciotto (8 vs 8) tra amici o gruppi amatoriali. Gli utenti possono creare squadre, organizzare partite, registrare statistiche e pagelle post-partita, visualizzare classifiche e storici — tutto ottimizzato per l'uso da smartphone via browser.

## Core Value

Permettere a gruppi di amici di organizzare, giocare e tenere traccia delle loro partite di calcetto in modo semplice, divertente e social, con statistiche automatiche e pagelle condivise.

## Current Status

**Database Restructure:** ✅ COMPLETE (2026-02-25)
- Prisma schema completely rewritten
- All TypeScript errors resolved (~100+ fixed)
- Type naming standardized to camelCase
- Old models removed: Player, PlayerClub, MatchPlayer
- Features updated: formations, ratings, goals, clubs

## Requirements

### Validated

(None yet — ship to validate)

### Active - Database Restructure Complete

- [x] Database schema aligned with Prisma reference
- [x] TypeScript errors resolved (0 errors)
- [x] Property naming standardized (camelCase)
- [x] Club/ClubMember naming consistent
- [x] Formation system updated
- [x] Match and rating system updated
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

### Known Limitations

- **Email Verification** - Removed from schema (can be re-added)
- **RSVP System** - Stubbed out (not in current schema)
- **Goal Home/Away Categorization** - Disabled (clubId not in Goal model)
- **Invite Max Uses** - Removed from schema

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
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js with credentials
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks + server actions
- **Offline**: idb + Workbox (planned)
- **Mobile-first**: ottimizzato per schermi smartphone (Chrome/Safari)
- **Browser-based**: nessuna installazione nativa richiesta

### Key Features from User Vision
1. **Gestione Squadre**: Admin crea squadra (Club), aggiunge giocatori (ClubMember) con nome, cognome, soprannome, numero maglia, avatar. Ruoli multipli per giocatore. Sistema di inviti via link.
2. **Gestione Partite**: Scelta modalità (5vs5 o 8vs8), data, ora, location. Selezione modulo (1-2-1, 2-2, 3-3-1, ecc.). Formazioni drag-and-drop su campo virtuale.
3. **Durante la Partita**: Timer live, segnapunti goal/assist/cartellini, aggiornabile da arbitro/capitano.
4. **Post-Partita**: Statistiche dettagliate, pagelle con voti 1-10, commenti. Badge e gamification.
5. **Statistiche**: Profilo giocatore con storico, grafici evoluzione, dashboard globale con top player.
6. **Social**: Condivisione risultati su WhatsApp/Instagram, esportazione formazioni/statistiche.

## Constraints

- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, PostgreSQL, Prisma
- **Performance**: Caricamenti <2s, lazy loading immagini/statistiche
- **Scalabilità**: Supporta 5-20 giocatori per squadra, scalabile a community più grandi
- **Mobile-First**: Tutto deve funzionare fluidamente su browser smartphone
- **Accessibilità**: Tema dark/light, supporto multilingua (italiano/inglese)
- **Privacy**: GDPR compliant, protezione dati utenti

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prisma + PostgreSQL | Type-safe ORM, schema evolution, production-ready | ✅ Confirmed |
| Club/ClubMember naming | Clear domain language, matches AGENTS.md schema | ✅ Confirmed |
| camelCase properties | Matches Prisma Client output, consistent across codebase | ✅ Confirmed |
| Removed Player model | Simplified schema, data in ClubMember directly | ✅ Confirmed |
| Mobile-first design | Target principale è l'uso da smartphone durante/in prossimità delle partite | ✅ Confirmed |
| Web app vs native | Nessun download richiesto, accesso immediato via browser | ✅ Confirmed |

---
*Last updated: 2026-02-26 after database restructure completion*
