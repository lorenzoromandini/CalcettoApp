# Resume - Feb 20, 2026

## Modifiche Team Hub

### 1. Impostazioni Squadra
- Aggiunte opzioni per modificare immagine, nome e descrizione squadra
- Tasto "Salva modifiche" con feedback visivo
- Zona pericolosa (eliminazione squadra) mantenuta in basso
- Rimosso "Invita membri" dalla pagina impostazioni

### 2. Invita Membri (Team Dashboard)
- Spostato nel team-dashboard come popup/dialog
- Cliccando "Genera invito" si apre direttamente un dialog con link condivisibile
- Possibilita di copiare il link negli appunti
- Possibilita di generare nuovo link

### 3. Fix Params Next.js 15
Pagine corrette per utilizzare `Promise<{ params }>`:
- `players/page.tsx`
- `players/create/page.tsx`
- `matches/page.tsx`
- `matches/create/page.tsx`
- `matches/[matchId]/page.tsx`
- `history/page.tsx`

### 4. Topbar
- Aggiunto tasto "Dashboard" quando si e dentro un team
- Prima non c'era modo di tornare alla dashboard principale

### 5. Tasto Indietro
- Fixato per tornare alla pagina del team invece che alla lista squadre
- Corretto in: `players-page-client.tsx`, `roster/page.tsx`

## File Modificati

- `app/[locale]/teams/[teamId]/settings/page.tsx` - Riscritta con form impostazioni
- `components/teams/team-dashboard.tsx` - Aggiunto dialog invito
- `components/navigation/header.tsx` - Aggiunto tasto dashboard
- `app/[locale]/teams/[teamId]/players/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/players/create/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/matches/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/matches/create/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/matches/[matchId]/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/history/page.tsx` - Fix params
- `app/[locale]/teams/[teamId]/players/players-page-client.tsx` - Fix back button
- `app/[locale]/teams/[teamId]/roster/page.tsx` - Fix back button e links
- `messages/it.json` - Aggiunte traduzioni per settings
