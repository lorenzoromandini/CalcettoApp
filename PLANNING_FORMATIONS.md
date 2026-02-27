# Planning: Sistema Formazioni Multi-Team

## Descrizione
Sistema di creazione formazioni per partite calcetto con gestione di entrambi i team (casa e trasferta), selezione modulo dinamica, assegnazione giocatori con ricerca e ordinamento per ruolo.

---

## Requisiti Moduli Formazione

### 5v5 (5 giocatori + 1 portiere = 6 posizioni)
- 2-2: 1POR, 2DIF, 2CEN, 1ATT
- 2-1-1: 1POR, 2DIF, 1CEN, 1ATT, 1FUORI
- 3-1: 1POR, 3DIF, 1CEN, 1ATT
- 1-2-1: 1POR, 1DIF, 2CEN, 1ATT, 1FUORI

### 8v8 (8 giocatori + 1 portiere = 9 posizioni)
- 3-3-1: 1POR, 3DIF, 3CEN, 1ATT, 1FUORI
- 3-2-2: 1POR, 3DIF, 2CEN, 2ATT, 1FUORI
- 2-4-1: 1POR, 2DIF, 4CEN, 1ATT, 1FUORI
- 2-3-2: 1POR, 2DIF, 3CEN, 2ATT, 1FUORI

### 11v11 (11 giocatori + 1 portiere = 12 posizioni)
- 4-3-3: 1POR, 4DIF, 3CEN, 3ATT, 1FUORI
- 4-4-2: 1POR, 4DIF, 4CEN, 2ATT, 1FUORI
- 4-2-3-1: 1POR, 4DIF, 2CEN, 3ATT (trequartisti), 1ATT (punta), 1FUORI
- 4-3-1-2: 1POR, 4DIF, 3CEN, 1ATT (trequartista), 2ATT (punte), 1FUORI
- 3-4-3: 1POR, 3DIF, 4CEN, 3ATT, 1FUORI
- 3-5-2: 1POR, 3DIF, 5CEN, 2ATT, 1FUORI
- 3-4-1-2: 1POR, 3DIF, 4CEN, 1ATT (trequartista), 2ATT (punte), 1FUORI

Note: I moduli includono sempre 1 portiere. I numeri indicano i giocatori di movimento. La posizione "FUORI" indica giocatori disponibili ma non in campo (sostituti).

---

## Struttura File da Creare/Modificare

### 1. Configurazione Moduli
- **File**: `/lib/formations/formations-config.ts` (NUOVO)
- **Scopo**: Definizione di tutti i moduli con posizioni sul campo (coordinate x,y e ruolo generico)

### 2. Tipi TypeScript
- **File**: `/types/formations.ts` (NUOVO o modifica)
- **Scopo**: Tipi per FormationModule, PlayerAssignment, FormationStep

### 3. Componenti UI - Selezione Modulo
- **File**: `/components/formations/formation-module-selector.tsx` (NUOVO)
- **Scopo**: Card visuali per selezionare il modulo (grafica campo + posizioni)

### 4. Componenti UI - Campo Formazione
- **File**: `/components/formations/formation-field.tsx` (NUOVO)
- **Scopo**: Visualizzazione campo calcio con pulsanti "+" per ogni posizione

### 5. Componenti UI - Selezione Giocatori
- **File**: `/components/formations/player-selection-modal.tsx` (NUOVO)
- **Scopo**: 
  - Barra ricerca con debounce
  - Lista giocatori ordinata: primario → secondario → altri
  - Highlight ruolo posizione cliccata

### 6. Componenti UI - Step Formazioni
- **File**: `/app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx` (MODIFICA)
- **Scopo**: Pagina principale con stepper (Modulo → Team 1 → Team 2 → Recap)

### 7. Componenti UI - Recap Formazioni
- **File**: `/components/formations/formation-recap.tsx` (NUOVO)
- **Scopo**: Visualizzazione entrambe le formazioni con pulsanti modifica

### 8. Server Actions
- **File**: `/lib/actions/formations.ts` (MODIFICA)
- **Scopo**: 
  - `saveFormationWithPositions`
  - `getClubMembersWithRoles`

### 9. Database Layer
- **File**: `/lib/db/formations.ts` (MODIFICA)
- **Scopo**: Funzione per recupero membri con ordinamento per ruolo

### 10. Stato Client
- **File**: `/hooks/use-formation-builder.ts` (NUOVO)
- **Scopo**: Gestione stato formazione con persistenza temporanea

---

## Fasi Implementazione

### FASE 1: Configurazione e Tipi
**Obiettivo**: Definire struttura dati e moduli

**Task 1.1**: Creare `/lib/formations/formations-config.ts`
- Definire tipo `FormationModuleConfig`
- Mappare tutti i moduli 5v5, 8v8, 11v11
- Ogni modulo ha: id, nome, mode (5v5/8v8/11v11), posizioni[{x, y, role}]

**Task 1.2**: Aggiornare `/types/formations.ts` (o crearlo)
- `FormationBuilderState`: stato corrente builder
- `FormationStep`: 'module' | 'team1' | 'team2' | 'recap'
- `PlayerAssignment`: clubMemberId + positionIndex
- `TeamFormation`: modulo + array posizioni assegnate

**Task 1.3**: Verifica schema Prisma esistente
- Confermare che Formation supporta isHome flag
- Confermare che FormationPosition ha tutti i campi necessari

**Criterio Completamento**: Tipi pronti e configurazione moduli completa

---

### FASE 2: Server Actions e Database
**Obiettivo**: Preparare API per dati necessari

**Task 2.1**: Modificare `/lib/db/formations.ts`
- Aggiungere `getClubMembersWithRolePriority(clubId, targetRole)`
  - Ritorna membri ordinati: primario ruolo → secondario → altri
  - Include: id, nome, cognome, nickname, ruoli, numero maglia

**Task 2.2**: Aggiungere Server Action in `/lib/actions/formations.ts`
- `saveMatchFormations(matchId, team1Data, team2Data)`
  - Salva entrambe le formazioni in transazione
  - Crea Formation (isHome=true) + FormationPosition[]
  - Crea Formation (isHome=false) + FormationPosition[]

**Criterio Completamento**: Server Actions testabili da console

---

### FASE 3: Componente Selezione Modulo
**Obiettivo**: UI per scegliere il modulo

**Task 3.1**: Creare `/components/formations/formation-module-card.tsx`
- Props: moduleConfig, isSelected, onSelect
- Visualizza: campo miniatura con posizioni graficate
- Mostra nome modulo (es: "2-2", "4-3-3")

**Task 3.2**: Creare `/components/formations/formation-module-selector.tsx`
- Props: mode (5v5/8v8/11v11), selectedModule, onSelect
- Griglia di card per moduli disponibili della modalità
- Header con "Seleziona modulo tattico"
- Pulsante "Continua" (disabled se nessun modulo selezionato)

**Criterio Completamento**: Componente selezionabile in isolation

---

### FASE 4: Componente Campo e Selezione Giocatori
**Obiettivo**: Campo interattivo con assegnazione giocatori

**Task 4.1**: Creare `/components/formations/formation-position.tsx`
- Props: position (x,y,role), isOccupied, player?, onClick
- Stati: vuota ("+"), occupata (foto/nome giocatore), selected
- Visualizza ruolo generico (POR/DIF/CEN/ATT)

**Task 4.2**: Creare `/components/formations/formation-field.tsx`
- Props: moduleConfig, assignments, onPositionClick
- Sfondo campo calcio (verde con linee)
- Posizionamento assoluto delle posizioni in base a coordinate
- Layout responsive (mobile-first)

**Task 4.3**: Creare `/components/formations/player-selection-modal.tsx`
- Props: isOpen, onClose, clubId, targetRole, selectedPlayerId, onSelect, onSearch
- Header con "Seleziona giocatore" + icona X
- Barra ricerca: input con icona lente, debounce 300ms
- Lista giocatori:
  - Sezione "Ruolo primario [ROLE]" (se ci sono giocatori)
  - Sezione "Ruolo secondario [ROLE]" (se ci sono giocatori)
  - Sezione "Altri giocatori"
- Ogni riga: foto profilo, nome cognome, nickname (se presente), numero maglia
- Highlight giocatore già selezionato in altra posizione
- Pulsante "Conferma" / "Rimuovi" se posizione già occupata

**Task 4.4**: Implementare ricerca client-side
- Hook `usePlayerSearch(members, searchQuery)`
- Match su nome, cognome, nickname (case insensitive)
- Risultati aggiornati in tempo reale

**Criterio Completamento**: Campo interattivo con assegnazione funzionante

---

### FASE 5: Hook Gestione Stato
**Obiettivo**: Gestire stato complesso del builder

**Task 5.1**: Creare `/hooks/use-formation-builder.ts`
- Stato: step, selectedModule, team1Formation, team2Formation
- Metodi:
  - `selectModule(moduleId)`
  - `assignPlayer(team, positionIndex, clubMemberId)`
  - `removePlayer(team, positionIndex)`
  - `nextStep()`, `prevStep()`
  - `canProceed()`: valida se formazione completa
  - `saveFormations()`: chiama Server Action
- Persistenza temporanea (opzionale): localStorage per non perdere progresso

**Task 5.2**: Creare `/hooks/use-club-members-sorted.ts`
- Prende clubId e role opzionale
- Ritorna membri ordinati per priorità ruolo
- Include funzione filtro per ricerca

**Criterio Completamento**: Hook testabili con dati mock

---

### FASE 6: Pagina Formazione Principale
**Obiettivo**: Assemblare tutto nella pagina

**Task 6.1**: Modificare `/app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx`
- Layout con header "Crea formazioni"
- Stepper visivo: Modulo → Team 1 → Team 2 → Recap
- Switch step in base allo stato

**Task 6.2**: Integrare selezione modulo (Step 1)
- Mostra `FormationModuleSelector` con mode della partita
- Salva modulo selezionato nello stato
- Pulsante "Continua" → vai a Step 2

**Task 6.3**: Integrare formazione Team 1 (Step 2)
- Header "Team 1 - Formazione"
- Mostra `FormationField` con modulo selezionato
- Click su "+" → apre `PlayerSelectionModal`
- Pulsante "Passa al Team 2" (popup da basso)
- Validazione: tutte le posizioni devono essere occupate

**Task 6.4**: Integrare formazione Team 2 (Step 3)
- Header "Team 2 - Formazione"
- Stessa UI del Team 1
- Pulsante "Continua" (popup da basso)

**Task 6.5**: Integrare Recap (Step 4)
- Header "Riepilogo Formazioni"
- Layout side-by-side (o stacked su mobile)
- Sinistra: Team 1 con modulo e giocatori
- Destra: Team 2 con modulo e giocatori
- Icona matita su ogni formazione per modificare
- Pulsante "Conferma Creazione del Match" (principale)

**Criterio Completamente**: Pagina navigabile con tutti gli step

---

### FASE 7: Componente Recap e Modifica
**Obiettivo**: Visualizzazione e modifica post-creazione

**Task 7.1**: Creare `/components/formations/formation-summary.tsx`
- Props: formation, teamLabel ("Team 1"/"Team 2"), onEdit
- Visualizza:
  - Modulo tattico
  - Lista giocatori per ruolo (POR, DIF, CEN, ATT)
  - Formazione grafica miniatura
- Pulsante modifica (icona matita)

**Task 7.2**: Gestione modifica da recap
- Click matita → torna allo step corrispondente (2 o 3)
- Mantiene dati dell'altra formazione
- Dopo modifica, torna automaticamente al recap
- Pulsante "Continua" nel popup salta l'altro team

**Criterio Completamento**: Modifica da recap funzionante

---

### FASE 8: Salvataggio e Finalizzazione
**Obiettivo**: Persistere dati e completare flusso

**Task 8.1**: Implementare salvataggio
- Click "Conferma Creazione del Match"
- Chiama `saveMatchFormations` con entrambe le formazioni
- Transazione: crea entrambe o nessuna (atomicità)
- Loading state durante salvataggio

**Task 8.2**: Gestione errori
- Try-catch con messaggio errore
- Rollback stato in caso di errore
- Toast notification "Formazioni salvate" / "Errore nel salvataggio"

**Task 8.3**: Redirect post-salvataggio
- Successo → redirect a `/clubs/${clubId}/matches/${matchId}`
- Mostra partita con formazioni popolate
- Revalidate paths per aggiornare liste

**Criterio Completamento**: Flusso end-to-end funzionante

---

### FASE 9: Ottimizzazioni e UX
**Obiettivo**: Migliorare esperienza utente

**Task 9.1**: Responsive design
- Test mobile: selezione modulo, campo, modal player
- Layout orizzontale campo su tablet/desktop
- Modal player full-screen su mobile

**Task 9.2**: Animazioni
- Transizioni tra step (slide/fade)
- Highlight posizione al click
- Feedback assegnazione giocatore
- Loading skeletons

**Task 9.3**: Validazioni
- Non permettere stesso giocatore in più posizioni
- Blocca procedi se formazione incompleta
- Messaggi errore chiari in italiano

**Task 9.4**: Gestione back navigation
- Confirm dialog se dati non salvati
- Mantieni stato nel browser history

**Criterio Completamento**: UX fluida e professionale

---

### FASE 10: Testing e Integrazione
**Obiettivo**: Verificare tutto funzioni insieme

**Task 10.1**: Test flusso completo
- Crea partita → seleziona modulo → forma Team 1 → forma Team 2 → recap → salva
- Verifica dati nel database
- Verifica redirect corretto

**Task 10.2**: Test edge cases
- Giocatori insufficienti nel club
- Ricerca senza risultati
- Chiusura browser a metà processo
- Doppio click pulsanti

**Task 10.3**: Integrazione con sistema esistente
- Verifica che formazioni appaiano nella pagina match detail
- Verifica che si possa modificare formazione esistente
- Compatibilità con stato partita (solo SCHEDULED)

**Criterio Completamento**: Tutto funziona in produzione

---

## Note Implementative

### Coordinate Campo
- Sistema grid 9x7 (9 colonne, 7 righe)
- Coordinate: x=0-8, y=0-6
- Portiere sempre in y=6 (fondo campo)
- Centro campo: y=3

### Ruoli Generici sul Campo
- POR: Portiere (sempre presente)
- DIF: Difensore (posizioni difensive)
- CEN: Centrocampista (posizioni centrali)
- ATT: Attaccante (posizioni offensive)
- FUORI: Sostituto (non visibile sul campo)

### Ricerca Giocatori
- Match case-insensitive su: firstName, lastName, nickname
- Debounce 300ms per evitare troppi re-render
- Highlight caratteri matchati

### Stato Temporaneo
- Opzionale: salvare in localStorage `formation-builder-${matchId}`
- Pulire dopo salvataggio successo
- Offrire "Riprendi formazione" se dati presenti

---

## Checkpoint per /gsd planning

Dopo ogni fase, aggiornare questo file con:
1. ✅ Task completati
2. 🔄 Task in corso  
3. ❌ Task bloccati (con motivo)
4. File creati/modificati
5. Note tecniche importanti

**Comando per riprendere**: `/gsd planning [numero-fase]`

---

## File Chiave da Modificare (Riepilogo)

### Nuovi
- `/lib/formations/formations-config.ts`
- `/types/formations.ts` (se non esiste)
- `/components/formations/formation-module-card.tsx`
- `/components/formations/formation-module-selector.tsx`
- `/components/formations/formation-position.tsx`
- `/components/formations/formation-field.tsx`
- `/components/formations/player-selection-modal.tsx`
- `/components/formations/formation-summary.tsx`
- `/hooks/use-formation-builder.ts`
- `/hooks/use-club-members-sorted.ts`

### Modifiche
- `/lib/db/formations.ts`
- `/lib/actions/formations.ts`
- `/app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx`

---

## Dipendenze
- @radix-ui/react-dialog (per modal)
- @dnd-kit/core (già presente, per drag opzionale)
- lucide-react (già presente)

---

**Ultimo aggiornamento**: [DA AGGIORNARE]
**Fase corrente**: [DA AGGIORNARE]
**Prossima task**: [DA AGGIORNARE]