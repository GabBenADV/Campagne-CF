# Documentazione tecnica — Modulo Campagne

Questa documentazione descrive la struttura generale del modulo campagne, con focus su architettura backend, frontend e regole principali di manutenzione. L'obiettivo è aiutare uno sviluppatore a capire rapidamente **dove intervenire** quando deve leggere, estendere o correggere una funzionalità.

---

# 1. Backend

## 1.1 Overview architetturale

Il backend del modulo campagne è organizzato per responsabilità. La logica non è concentrata in un unico file, ma distribuita tra API, servizi, repository, builder e helper.

Il flusso tipico è:

```txt
Frontend
  ↓
CampaignsApi.class.php
  ↓
Service
  ↓
Repository / Helper
  ↓
Builder
  ↓
Risposta JSON
```

In generale:

- le **API** ricevono la richiesta HTTP e delegano;
- i **Services** coordinano la logica applicativa;
- i **Repositories** leggono e scrivono dati;
- i **Builders** normalizzano le risposte;
- gli **Helpers** contengono logiche pure o riutilizzabili.

---

## 1.2 Alberatura backend rilevante

```txt
lib/
└── campaigns/
    ├── CampaignsApi.class.php
    │
    ├── services/
    │   ├── CampaignsReadService.php
    │   ├── CampaignClientsAttachService.php
    │   ├── CampaignPhaseWorkflowService.php
    │   ├── CampaignPhaseMainDocumentService.php
    │   ├── CampaignPhaseFilesService.php
    │   └── CampaignPhaseCommentsService.php
    │
    ├── repositories/
    │   ├── CampaignsReadRepository.php
    │   ├── CampaignClientsAttachRepository.php
    │   ├── CampaignPhaseWorkflowRepository.php
    │   ├── CampaignPhaseMainDocumentRepository.php
    │   ├── CampaignPhaseFilesRepository.php
    │   └── CampaignPhaseCommentsRepository.php
    │
    ├── builders/
    │   ├── CampaignsReadBuilder.php
    │   ├── CampaignClientsAttachBuilder.php
    │   ├── CampaignPhaseMainDocumentBuilder.php
    │   ├── CampaignPhaseFilesBuilder.php
    │   └── CampaignPhaseCommentsBuilder.php
    │
    └── helpers/
        ├── CampaignsHelpers.php
        ├── CampaignPhaseStates.php
        ├── CampaignClientVisibilityHelper.php
        ├── CampaignClientTodoHelper.php
        ├── CampaignClientsListHelper.php
        ├── CampaignClientCountersHelper.php
        ├── CampaignClientActiveCampaignsHelper.php
        └── CampaignClientAssociationHelper.php
```

Questa alberatura rappresenta i file più rilevanti emersi dal modulo. Alcuni nomi possono variare leggermente a seconda dello stato del repository.

---

## 1.3 API classes / endpoint

Le API sono il punto di ingresso delle chiamate frontend.

Esempio principale:

```txt
CampaignsApi.class.php
```

Responsabilità:

- leggere parametri da request;
- validare parametri minimi;
- chiamare il service corretto;
- restituire array/JSON al frontend;
- non contenere logica business complessa.

Esempi di endpoint del modulo:

```txt
getCampaigns
getCampaignClients
getCampaignClientPhases
searchAvailableCampaignClients
linkClientToCampaign
getCampaignClientAttachStats
submitPhaseForApproval
approvePhase
rejectPhase
completeCampaign
cancelCampaign
uploadMainDocument
deleteMainDocument
getPhaseComments
addPhaseComment
```

La regola pratica è: **se stai scrivendo logica business dentro l'API, probabilmente va spostata in un service**.

---

## 1.4 Services

I services coordinano la logica applicativa.

Esempi:

```txt
CampaignsReadService.php
CampaignClientsAttachService.php
CampaignPhaseWorkflowService.php
CampaignPhaseMainDocumentService.php
CampaignPhaseFilesService.php
CampaignPhaseCommentsService.php
```

Responsabilità:

- orchestrare più repository/helper;
- applicare permessi;
- decidere se un'azione è consentita;
- coordinare stati e transizioni;
- costruire la risposta finale tramite builder;
- mantenere la logica business fuori dalle API.

Esempio concreto: `CampaignPhaseWorkflowService` gestisce azioni come approvazione, rifiuto, completamento e annullamento campagna. Recupera la fase, verifica stato e permessi, aggiorna tramite repository e inserisce log operativi.

Altro esempio: `CampaignClientsAttachService` gestisce l'aggiunta/rimozione dei clienti da una campagna. Verifica permessi, controlla se il cliente è associabile, inserisce l'associazione e crea le fasi cliente.

La regola pratica è: **se una funzione deve decidere “si può fare questa cosa?”, deve stare nel service o in un helper dedicato richiamato dal service**.

---

## 1.5 Repositories

I repositories sono responsabili dell'accesso ai dati.

Esempi:

```txt
CampaignsReadRepository.php
CampaignClientsAttachRepository.php
CampaignPhaseWorkflowRepository.php
CampaignPhaseMainDocumentRepository.php
CampaignPhaseFilesRepository.php
CampaignPhaseCommentsRepository.php
```

Responsabilità:

- eseguire query SQL;
- leggere dati da `$db` o `$dbi`;
- inserire, aggiornare o cancellare record;
- non decidere regole business complesse;
- restituire dati grezzi o semi-strutturati al service.

Nel modulo sono presenti due connessioni importanti:

```txt
$db   → database applicativo / campagne
$dbi  → database intranet / anagrafiche utenti-clienti
```

Esempio: `CampaignClientsAttachRepository` legge i clienti disponibili da `cfweb_accounts`, verifica associazioni già presenti in `campaigns_clients`, e crea righe in `campaign_phases_client`.

La creazione delle fasi cliente usa già una posizione iniziale dinamica: le fasi precedenti alla posizione di partenza vengono marcate come `ACCEPTED`, mentre la fase di partenza viene marcata come `PENDING_SUBMISSION`.

Esempio dal workflow: `CampaignPhaseWorkflowRepository` contiene query per recuperare meta dati della fase cliente, aggiornare `campaign_phases_client`, inserire log e aggiornare `campaign_client_status`.

La regola pratica è: **un repository può sapere come leggere o scrivere, ma non dovrebbe decidere da solo il perché business di un'azione**.

---

## 1.6 Builders

I builders trasformano dati grezzi in risposte coerenti per il frontend.

Esempi:

```txt
CampaignsReadBuilder.php
CampaignClientsAttachBuilder.php
CampaignPhaseMainDocumentBuilder.php
CampaignPhaseFilesBuilder.php
CampaignPhaseCommentsBuilder.php
```

Responsabilità:

- normalizzare campi;
- convertire valori nulli;
- costruire URL file/immagini;
- adattare nomi campo database a nomi frontend;
- mantenere stabile la forma della risposta JSON.

Esempio:

```txt
database: fk_campaign_id, fk_client_id, phase_state
frontend: campaign_id, client_id, phase_state, permissions
```

Il builder è il posto giusto per evitare che il frontend dipenda direttamente dalla struttura SQL.

La regola pratica è: **se devi cambiare la forma della risposta, probabilmente devi guardare il builder**.

---

## 1.7 Helpers

Gli helpers contengono logiche riutilizzabili, pure o di supporto.

Esempi:

```txt
CampaignsHelpers.php
CampaignPhaseStates.php
CampaignClientVisibilityHelper.php
CampaignClientTodoHelper.php
CampaignClientsListHelper.php
CampaignClientCountersHelper.php
CampaignClientAssociationHelper.php
```

Responsabilità:

- normalizzare valori;
- costruire condizioni SQL riutilizzabili;
- calcolare stati o priorità;
- centralizzare regole comuni;
- evitare duplicazioni tra service/repository.

Esempi pratici:

- `CampaignPhaseStates` centralizza gli stati delle fasi.
- `CampaignClientVisibilityHelper` gestisce lo scope clienti in base a ruolo/territorio.
- `CampaignClientAssociationHelper` centralizza la condizione per considerare attiva un'associazione cliente-campagna.
- `CampaignClientsListHelper` applica filtri e ordinamenti sui clienti campagna.

La regola pratica è: **se una logica è riutilizzabile e non richiede stato applicativo complesso, può stare in un helper**.

---

## 1.8 Regole principali del modulo

### Visibilità e operatività sono separate

Vedere una campagna, un cliente o una fase non significa automaticamente poter operare.

```txt
visibilità → posso vedere il cliente/fase
operatività → posso approvare, respingere, caricare file, completare, annullare
```

Questa distinzione è importante per evitare che permessi di lettura diventino permessi di azione.

### Permessi basati su utente, ruolo e fase

I permessi derivano da più informazioni:

```txt
utente corrente
ruoli intranet
fasi a cui è ammesso
stato della fase
stato della campagna cliente
flag configurati sulla fase
super user
```

Esempi di flag fase:

```txt
enable_master_reloading
enable_process_outcome
enable_full_visibility
enable_rpv
enable_client_attach
```

`enable_client_attach` è il flag previsto per gestire l'aggiunta clienti tramite fase, evitando la vecchia logica hardcoded su posizione 1/2.

### Super user

Il super user ha una gestione speciale:

- può vedere più dati;
- può superare alcune restrizioni territoriali;
- può operare dove la logica lo consente;
- non dovrebbe però forzare regole business non previste se il service non lo consente esplicitamente.

La lista dei super user è centralizzata nel servizio permessi.

### Gestione fasi cliente

Ogni cliente associato a una campagna riceve righe in:

```txt
campaign_phases_client
```

La fase corrente viene determinata in base allo stato delle fasi.

Stati principali:

```txt
BLOCKED
PENDING_SUBMISSION
PENDING_APPROVAL
ACCEPTED
REJECTED
COMPLETED / CANCELLED a livello campagna-cliente
```

Quando un cliente viene aggiunto partendo da una posizione specifica:

```txt
fasi precedenti → ACCEPTED
fase di partenza → PENDING_SUBMISSION
fasi successive → BLOCKED/default
```

Questa regola è importante quando il permesso di aggiunta clienti viene dato a una fase successiva alla prima.

### Documento principale

Il documento principale è trasversale alla coppia:

```txt
campagna + cliente
```

Non è concettualmente legato solo alla singola fase, anche se può mantenere il riferimento storico alla fase da cui è stato caricato.

Questo consente alle fasi successive di lavorare sul documento corrente senza duplicare il file per ogni fase.

### Allegati e commenti

Gli allegati e i commenti sono legati alle fasi cliente, ma vengono mostrati e gestiti secondo regole di visibilità e permesso.

In particolare:

- i commenti mantengono l'autore tramite ID utente intranet;
- gli allegati possono essere trasversali rispetto alle fasi accessibili;
- le cancellazioni devono rispettare permessi specifici.

### Soft delete dei clienti associati

La rimozione di un cliente da una campagna non deve cancellare fisicamente la relazione.

La tabella:

```txt
campaigns_clients
```

usa campi come:

```txt
is_deleted
deleted_at
deleted_by
```

La logica di lettura deve quindi filtrare solo associazioni attive.

Questo evita perdita di storico e permette eventuali ripristini.

---

# 2. Frontend

## 2.1 Overview architetturale

Il frontend è sviluppato in React/TypeScript.

Il flusso principale è:

```txt
Componente React
  ↓
campaignsApi
  ↓
Backend endpoint
  ↓
Stato locale React
  ↓
Rendering lista / dettaglio / azioni
```

Il frontend riceve dal backend sia i dati sia i permessi operativi. La logica di sicurezza non deve essere duplicata lato frontend: React deve solo mostrare o nascondere azioni in base ai permessi ricevuti.

---

## 2.2 Alberatura frontend rilevante

```txt
src/
├── App.tsx
│
├── components/
│   ├── CampaignsList.tsx
│   ├── ClientsList.tsx
│   ├── PhasesList.tsx
│   ├── Panel.tsx
│   ├── PhaseDetail.tsx
│   ├── PhaseWorkflowActions.tsx
│   ├── CampaignClientAttach.tsx
│   ├── PhaseComments.tsx
│   ├── PhaseFiles.tsx
│   └── MainDocument*.tsx
│
├── services/
│   └── campaignsApi.ts
│
└── types/
    └── types.ts
```

Alcuni nomi possono variare, ma questa è la struttura logica principale del modulo.

---

## 2.3 Componenti principali

### `App.tsx`

Coordina lo stato globale della schermata:

- campagna selezionata;
- cliente selezionato;
- fase selezionata;
- refresh delle liste;
- apertura/chiusura pannelli.

È il punto in cui spesso si collegano liste e dettaglio.

### `CampaignsList.tsx`

Mostra l'elenco campagne.

Responsabilità tipiche:

- chiamare API elenco campagne;
- gestire ricerca/filtri;
- notificare la selezione della campagna.

### `ClientsList.tsx`

Mostra i clienti associati alla campagna.

Responsabilità tipiche:

- caricare clienti della campagna;
- applicare filtri;
- mostrare stato campagna-cliente;
- evidenziare clienti in todo;
- selezionare il cliente.

### `CampaignClientAttach.tsx`

Gestisce la ricerca e associazione di nuovi clienti alla campagna.

Il componente non decide i permessi: chiama `getCampaignClientAttachStats` e mostra il box solo se riceve:

```ts
can_attach_clients: true
```

Poi usa `searchAvailableCampaignClients` e `linkClientToCampaign`.

### `PhasesList.tsx`

Mostra le fasi del cliente selezionato.

Responsabilità tipiche:

- mostrare stato fase;
- indicare cosa è apribile;
- evidenziare fase corrente;
- aprire il dettaglio fase.

### `PhaseDetail.tsx`

Mostra il contenuto operativo della fase:

- documento principale;
- allegati;
- commenti;
- azioni disponibili;
- informazioni e stato.

### `PhaseWorkflowActions.tsx`

Contiene i pulsanti operativi del workflow:

```txt
invia in approvazione
approva
respingi
completa campagna
annulla campagna
```

Deve basarsi sui permessi ricevuti dal backend, per esempio:

```ts
phase.permissions.can_approve
phase.permissions.can_reject
phase.permissions.can_submit_for_approval
phase.permissions.can_complete_campaign
phase.permissions.can_cancel_campaign
```

---

## 2.4 Servizi API

Il file principale è:

```txt
services/campaignsApi.ts
```

Responsabilità:

- centralizzare le chiamate al backend;
- evitare `fetch` duplicati nei componenti;
- uniformare parametri e gestione risposta;
- permettere tipizzazione generica della risposta.

Esempio concettuale:

```ts
campaignsApi<CampaignClient[]>("getCampaignClients", {
  campaign_id: campaignId,
});
```

La regola pratica è: **i componenti non dovrebbero conoscere dettagli bassi della request HTTP**.

---

## 2.5 Tipizzazione

La tipizzazione è uno dei punti più importanti del frontend.

I tipi dovrebbero stare centralizzati in:

```txt
types/types.ts
```

o file equivalente.

Esempi di tipi utili:

```ts
Campaign
CampaignClient
CampaignPhase
CampaignPhasePermissions
CampaignAvailableClient
CampaignMainDocument
CampaignPhaseFile
CampaignPhaseComment
```

### Evitare tipi duplicati nei componenti

È meglio evitare definizioni locali come:

```ts
type Phase = {
  id: number;
  ...
}
```

dentro più componenti.

Meglio importare il tipo centralizzato:

```ts
import type { CampaignPhase } from "../types/types";
```

Questo evita disallineamenti quando cambia la risposta backend.

### Coerenza backend/frontend

Ogni campo restituito dal backend dovrebbe avere un tipo corrispondente.

Esempio:

```php
'can_attach_clients' => true
'available_clients_count' => 12
'start_phase_position' => 3
```

Dovrebbe corrispondere a:

```ts
type CampaignClientAttachStats = {
  can_attach_clients: boolean;
  available_clients_count: number;
  start_phase_position?: number | null;
};
```

La regola pratica è: **quando si aggiunge un campo alla risposta backend, aggiornare subito il tipo frontend**.

### Quando aggiungere un nuovo tipo

Aggiungere un nuovo tipo quando:

- la stessa struttura è usata in più componenti;
- la risposta API è stabile;
- il componente riceve oggetti complessi;
- una nuova funzionalità introduce permessi o stati dedicati.

Si può invece usare un tipo inline solo per risposte piccole e locali, ad esempio una risposta temporanea o molto specifica.

---

## 2.6 Flusso dati frontend

Flusso tipico:

```txt
1. Il componente riceve campaignId / clientId / phaseId
2. Chiama campaignsApi
3. Salva la risposta nello state React
4. Renderizza lista o dettaglio
5. L'utente esegue un'azione
6. Il frontend chiama l'endpoint relativo
7. Alla risposta positiva, aggiorna o ricarica i dati
```

Esempio:

```txt
se approvo una fase:
PhaseWorkflowActions
  ↓
approvePhase
  ↓
refresh fasi cliente
  ↓
refresh lista clienti/campagna se necessario
```

Il backend resta la fonte di verità per:

- permessi;
- stati;
- fase corrente;
- todo;
- visibilità;
- operatività.

Il frontend deve evitare di ricostruire queste regole in autonomia.

---

# 3. Linee guida per nuove modifiche

## Dove mettere cosa

### Nuovo endpoint

Modificare o aggiungere in:

```txt
CampaignsApi.class.php
```

ma delegare subito a un service.

### Nuova regola business

Mettere nel service relativo.

Esempi:

```txt
permesso workflow → CampaignPhaseWorkflowService
aggiunta clienti → CampaignClientsAttachService
documento principale → CampaignPhaseMainDocumentService
commenti → CampaignPhaseCommentsService
```

Se la regola è riutilizzabile, estrarla in helper.

### Nuova query

Mettere nel repository relativo.

Esempi:

```txt
query campagne/clienti/fasi → CampaignsReadRepository
query attach clienti → CampaignClientsAttachRepository
query workflow → CampaignPhaseWorkflowRepository
```

### Nuovo campo nella risposta

Aggiornare:

```txt
repository, se il campo arriva da DB
builder, se va esposto al frontend
types.ts, per tipizzare il frontend
componenti, solo se devono visualizzarlo/usarlo
```

### Nuovo permesso frontend

La regola deve essere calcolata backend.

Il frontend deve ricevere un campo tipo:

```ts
can_do_something: boolean
```

e limitarsi a mostrare/nascondere l'azione.

### Nuovo flag fase

Aggiornare:

```txt
database
repository di lettura/scrittura fasi
builder della fase
types frontend
form/componenti di configurazione fase
service che usa il flag
```

Esempio recente:

```txt
enable_client_attach
```

Serve per dire da quale fase un utente ammesso può aggiungere clienti alla campagna.

---

## Principio generale

Quando si aggiunge una funzionalità:

```txt
API → riceve e delega
Service → decide
Repository → legge/scrive
Builder → formatta
Helper → riusa logica comune
Frontend → mostra dati e azioni ricevute
Types → mantengono coerenza tra backend e UI
```

Questo mantiene il modulo più semplice da manutenere, riduce duplicazioni e rende più chiaro dove intervenire quando una regola cambia.
