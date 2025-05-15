# Freelance Developer Workflow

Un'applicazione completa per la gestione del workflow di sviluppatori freelance. Permette di organizzare clienti, progetti, task e pagamenti in un'unica soluzione.

## Funzionalità

- **Gestione clienti**: Memorizza i dati di contatto dei clienti
- **Gestione progetti**: Organizza i progetti per cliente, stato e scadenza
- **Gestione task**: Tieni traccia delle attività quotidiane con priorità e scadenze
- **Gestione pagamenti**: Monitora le fatture e i pagamenti ricevuti
- **Dashboard**: Visualizza le statistiche e le attività importanti

## Tecnologie utilizzate

- **Frontend**: React, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Altri tools**: Zod per la validazione, TanStack Query per le chiamate API

## Requisiti

- Node.js 18+ (consigliato 20+)
- PostgreSQL 12+

## Installazione

1. Clona il repository:

```bash
git clone https://github.com/tuo-username/freelance-workflow.git
cd freelance-workflow
```

2. Installa le dipendenze:

```bash
npm install
```

3. Crea un file `.env` nella root del progetto (usa `.env.example` come riferimento):

```
DATABASE_URL=postgres://username:password@hostname:port/database_name
PGUSER=username
PGHOST=hostname
PGPASSWORD=password
PGDATABASE=database_name
PGPORT=5432
```

4. Inizializza il database:

```bash
npm run db:push
```

5. Popola il database con dati iniziali (opzionale):

```bash
npm run db:seed
```

6. Avvia l'applicazione in modalità sviluppo:

```bash
npm run dev
```

7. L'applicazione sarà disponibile all'indirizzo `http://localhost:5000`

## Migrazione da Replit

Se stai migrando questo progetto da Replit a un ambiente standard, segui questi passaggi:

1. **Configurazione Vite**: Rinomina il file `vite.config.js.example` in `vite.config.js` o `vite.config.ts` sostituendo quello esistente. Questa versione rimuove le dipendenze specifiche di Replit.

2. **Package.json**: Rinomina il file `package.json.example` in `package.json` sostituendo quello esistente. Questa versione rimuove dipendenze e configurazioni specifiche di Replit.

3. **Installa dipendenze**: Dopo aver sostituito i file di configurazione, esegui:
   ```bash
   npm install
   ```

4. **Variabili d'ambiente**: Assicurati di configurare tutte le variabili d'ambiente necessarie nel tuo file `.env` utilizzando `.env.example` come guida.

5. **Rimuovi file specifici di Replit**: Elimina eventuali file specifici di Replit come `.replit` e `replit.nix` se presenti.

## Sviluppo

Per contribuire al progetto:

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/amazing-feature`)
3. Commit delle tue modifiche (`git commit -m 'Aggiunta una feature incredibile'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito con licenza MIT.