# 5. Bausteinsicht

## minAdvent | REST-API-Vertrag

> **Geplante API, nicht implementiert.** [Übersicht](README.md). Pfade der authentifizierten Ersteller-Ressourcen sind Vorschläge; die drei Shared-Pfade sind fachlich vereinbart. DTO-Beispiele zeigen den fachlichen Kern.

#### 1. Endpunkte

| Methode | Pfad | Authentifizierung | Verhalten |
| --- | --- | --- | --- |
| POST | `/minadvent/calendars` | Ersteller | Kalender anlegen, genau 24 EMPTY erzeugen; Jahr Pflichtfeld |
| GET | `/minadvent/calendars` | Ersteller | Nur eigene Kalender, aktuelle zuerst / vergangene gruppiert |
| GET | `/minadvent/calendars/:id` | Ersteller | Eigene Kalenderdetails mit Türenstatus, `version`, `completed` |
| PUT | `/minadvent/calendars/:id` | Ersteller | Nur `title`, `recipientName` und `expectedVersion`; Jahr nicht änderbar |
| PUT | `/minadvent/calendars/:id/doors/:day` | Ersteller | **Ein Türchen vollständig** ersetzen, 0–10 Blöcke |
| PUT | `/minadvent/calendars/:id/doors/:day/status` | Ersteller | Ressourcenorientierte Zustandsänderung `OPENED → FILLED` (ohne `/close`) |
| PUT | `/minadvent/calendars/:id/sharing` | Ersteller | Veröffentlichung oder Widerruf; globales CAS |
| PUT | `/minadvent/calendars/:id/sharing/token` | Ersteller | Tokenrotation, wenn veröffentlicht |
| DELETE | `/minadvent/calendars/:id` | Ersteller | Endgültig löschen nach UI-Sicherheitsbestätigung, erwartete Version |
| GET | `/minadvent/shared/:token` | Anonym + Token | Metadaten, Version und Türstatus, **keine Inhaltsblöcke** |
| GET | `/minadvent/shared/:token/doors/:day` | Anonym + Token | Inhalte ausschließlich falls **aktuell OPENED**, keine Mutation |
| PUT | `/minadvent/shared/:token/doors/:day` | Anonym + Token | Erste Öffnung, `expectedVersion`, bei Erfolg `firstOpened` |

Authentifizierte Ersteller-Routen verwenden vorhandene Firebase/minFactory-Guards und prüfen Eigentümerschaft **serverseitig**. Öffentliche Shared-Routen erfordern keinen Login. Erfolgsantworten mutierender Operationen enthalten aktuelle globale Version und abgeleiteten Abschlussstatus, sofern die Ressource danach existiert.

#### 2. DTOs und Beispiel-Payloads

Kalender erstellen (`year` ist Pflicht, im UI mit aktuellem Jahr vorbelegt):
```json
POST /minadvent/calendars
{"title":"Dein Advent","recipientName":"Alex","year":2026}
```
```json
{"id":"7c5a8069-5df0-46b1-a746-eb071986a6b4","title":"Dein Advent","recipientName":"Alex","year":2026,"version":1,"published":false,"completed":false,"doors":[{"day":1,"status":"EMPTY"}]}
```
Die `doors`-Liste enthält in echten Antworten **alle 24** Positionen (hier aus Platzgründen gekürzt). `year` ist **nie** Teil eines Update-DTOs. Beispiel separate Stammdatenaktualisierung:
```json
PUT /minadvent/calendars/:id
{"title":"Dein Dezember","recipientName":"Alex","expectedVersion":1}
```

Vollständiges Türchen speichern (Positionen 1-basiert, lückenlos, max. zehn Blöcke **insgesamt**):
```json
PUT /minadvent/calendars/:id/doors/3
{
  "expectedVersion": 2,
  "blocks": [
    {"position":1,"type":"TEXT","text":"<p>Schönen Dezember!</p>"},
    {"position":2,"type":"LINK","title":"Ein Lied","url":"https://example.org/song"},
    {"position":3,"type":"VOUCHER","title":"Kaffee","description":"Eine gemeinsame Kaffeepause"}
  ]
}
```
```json
{"day":3,"status":"FILLED","version":3,"completed":false}
```
Mit `blocks: []` wird `EMPTY`. Wenn dadurch ab 25.12. das letzte FILLED verschwindet und ein OPENED vorhanden ist, zeigt der Client **vor dem Speichern** eine Abschlusswarnung; die Antwort darf `completed:true` enthalten. Die ValidationPipe plus fachliche Prüfung erzwingen Pflichtfelder und Grenzen (Titel/Name/Linktitel/Vouchertitel jeweils höchstens 50 Zeichen, Text höchstens 500 sichtbare Zeichen, Gutscheinbeschreibung höchstens 200 Zeichen, gültige HTTP(S)-URL höchstens 50 Zeichen und Blockanzahl 0..10). Kein Nullposition, keine doppelte oder ausgelassene Position.

Schließen:
```json
PUT /minadvent/calendars/:id/doors/3/status
{"status":"FILLED","expectedVersion":3}
```
Schließen ist unabhängig vom Datum und Kalenderabschluss erlaubt, sofern Türchenstatus `OPENED` und globale Version aktuell sind. Die Mutation setzt `FILLED` und erhöht die Version atomar.

Veröffentlichen, Widerrufen, Erneuern:
```json
PUT /minadvent/calendars/:id/sharing
{"published":true,"expectedVersion":3}
```
```json
{"published":true,"sharedUrl":"https://<host>/minadvent/shared/<token>","version":4,"completed":false}
```
`published:false` widerruft; erneut `true` erzeugt immer neuen Token. `PUT /.../sharing/token` mit `{"expectedVersion":4}` ersetzt vorhandenen Token atomar. Das Beispielformat `sharedUrl` ist symbolisch; die tatsächliche Browserroute ist im Frontend festzulegen. Aus Sicherheitsgründen ist der Token nicht in Listen- oder Logging-Antworten enthalten, soweit nicht für Linkverwaltung erforderlich.

Shared-Kalender:
```json
GET /minadvent/shared/:token
{"title":"Dein Advent","recipientName":"Alex","year":2026,"version":4,"completed":false,"doors":[{"day":3,"status":"FILLED"}]}
```
Auch diese `doors`-Liste ist hier abgekürzt; reale Antwort enthält alle 24 **ohne Inhalte**.

Erstöffnung:
```json
PUT /minadvent/shared/:token/doors/3
{"expectedVersion":4}
```
```json
{"day":3,"status":"OPENED","version":5,"completed":false,"firstOpened":true,"blocks":[{"position":1,"type":"TEXT","text":"<p>Schönen Dezember!</p>"}]}
```
Bereits OPENED: bei **aktueller** Version `200`, `firstOpened:false` und dieselben Inhalte ohne Versionsänderung; bei **veralteter** Version ausnahmslos `409 VERSION_CONFLICT`, **kein** idempotenter Erfolg. Wiederansehen erfolgt über GET; GET liefert niemals Inhalt von FILLED/EMPTY.

#### 3. Fehlervertrag und Priorität

```json
{"statusCode":409,"code":"VERSION_CONFLICT","message":"Der Kalender wurde zwischenzeitlich geändert."}
```

| HTTP | Fachcode (Beispiel) | Fall |
| --- | --- | --- |
| 409 | `VERSION_CONFLICT` | Veraltete globale Version, auch bei OPENED und abgeschlossen; **Vorrang bei jedem PUT** |
| 409 | `CALENDAR_COMPLETED` | Inhalt/Metadaten/Türstatus nicht änderbar, außer OPENED-Türchen schließen |
| 409 | `DOOR_EMPTY` | Öffnen einer leeren Tür |
| 409 | `DOOR_NOT_YET_UNLOCKED` | Öffnen vor dem ausgewählten Dezembertag |
| 409 | `INVALID_CONTENT` | Fachliche Eingabe verletzt Block-/Längen-/Pflichtregeln |
| 403 | `FORBIDDEN` | Ersteller ohne Berechtigung (fremder Kalender) |
| 400 | `INVALID_REQUEST` | Struktureller Fehler, Tag außerhalb 1–24 |
| 404 | `SHARED_CALENDAR_UNAVAILABLE` | Ungültiger, widerrufener oder ersetzter Token, gelöschter Kalender |

Zugriffskontrolle und Tokenvalidität werden vorausgesetzt, bevor Informationen über die Ressource preisgegeben werden. **Bei vorhandenem Zugriff** prüft jeder PUT die erwartete Version vor sonstigen fachlichen Konflikten. `GET` ohne OPENED liefert keine Inhaltsblöcke (fachlicher 409, z. B. `DOOR_NOT_OPENED`). 403 ist ausdrücklich **Berechtigungen** vorbehalten, nicht fachlichen Sperren. Serverseitige Fehlerantworten dürfen keine Tokens, privaten Inhalte oder Existenzinformationen bei ungültigen Shared Links verraten.

#### 4. Konflikt und atomare Mutationen

Bei `409 VERSION_CONFLICT`: Empfänger informiert; Übersicht erst nach ausdrücklicher Zustimmung nachladen. Wenn die angeklickte Tür inzwischen OPENED ist, deren Inhalt per **GET ohne Animation** abrufen; ist sie weiter FILLED, erst nach erneutem Klick PUT. **Keine automatischen PUT-Retries**. Bei Erstellerkonflikten Eingaben bis zur bestätigten Aktualisierung lokal bewahren. Jede Mutation liest Version, Abschluss und aktuellen Türzustand **innerhalb derselben synchronisierten DB-Transaktion**; erfolgreiche erste Öffnung erhöht Version genau einmal. Letzte Öffnung / letztes FILLED leeren kann `completed=true` auslösen, der auslösende Request bleibt erfolgreich. Ein Linkwiderruf darf gleichzeitig laufende PUTs nicht auf halb-gültigem Link fortsetzen.

Konkrete DTO-Klassennamen sind an etablierte Repo-Konventionen anzupassen; für OpenAPI werden die vorgesehenen Felder und Fehlermodelle vollständig annotiert.

---

## minAdvent | Datenmodell und Migrationen

> **Soll-Konzept v1.0.0** · [Übersicht](README.md)

#### 1. Relationales Modell (Vorschlag)

| Tabelle / Aggregat | Wichtige Spalten | Integrität |
| --- | --- | --- |
| `minadvent_calendars` | `id UUID PK`, `owner_id` (bestehende minFactory-User-Relation), `year INT NOT NULL`, `title VARCHAR(50)`, `recipient_name VARCHAR(50)`, `version INT/ BIGINT NOT NULL`, `is_published BOOL`, `active_token` nullable, `created_at`, `updated_at` | Owner-FK, Index (owner,year), maximal ein aktiver Token, Jahr nach Create unveränderlich |
| `minadvent_doors` | `id UUID PK`, `calendar_id FK`, `day INT`, `status ENUM/VARCHAR` | UNIQUE(calendar_id, day), CHECK day 1–24, pro Kalender genau 24 durch atomare Create-Transaktion |
| `minadvent_blocks` | `id UUID PK`, `door_id FK`, `position INT`, `type TEXT/LINK/VOUCHER`, typabhängige Nutzdaten (Titel VARCHAR(50), URL VARCHAR(50), Beschreibung VARCHAR(200), Text höchstens 500 sichtbare Zeichen) | UNIQUE(door_id, position), CHECK position >=1; 0–10 Gesamtzahl serverseitig validieren |

Die genaue physische Abbildung der Block-Nutzdaten (typabhängige Spalten oder JSON) ist nach bestehendem TypeORM-Modell zu wählen, nicht durch neue Abstraktionshierarchien zu verkomplizieren. `EMPTY` entspricht null Blöcken, `FILLED` mindestens einem Block, `OPENED` hält die Blöcke weiter vor. Der Vollständigkeitsinvariant zwischen Status und Anzahl sowie lückenlose Positionen werden **atomar im Service** geprüft; UNIQUE allein garantiert weder Lückenfreiheit noch die Maximalanzahl.

**Genau 24 Türen** entstehen zusammen mit dem Kalender in einer Transaktion. Bei Fehler wird alles zurückgerollt. Delete-Cascade: Kalender → Türchen → Blöcke; Accountlöschung entfernt sämtliche kalenderbezogenen Daten. Owner-FK an bestehende minFactory-Nutzeridentität anpassen, keine separate Empfängertabelle nötig.

Der Shared Token ist bewusst **im Klartext** gespeichert (vereinbarter Soll-Zustand, sicherheitssensibel). Er existiert nur, wenn veröffentlicht; bei Widerruf NULL, bei Neupublikation/Rotation atomar ersetzen. Ein einzelnes Tokenfeld am Kalender genügt: UNIQUE für nicht-null Token, keine Tokenhistorie nötig. `is_published` und Tokenpräsenz bleiben konsistent, idealerweise gemeinsame DB-/Service-Invariante.

#### 2. Globale Version und Zeitfelder

`version` wird beim Erstellen initialisiert (z. B. 1), bei **jeder tatsächlich erfolgreichen Mutation einmal** inkrementiert: Titel/Empfänger, kompletter Türcheninhalt, Statusübergang, erste Öffnung, Veröffentlichungsaktionen. Kein eigener Versionswert für Türchen oder Link. Bloßer GET, erfolgreich wiederholter PUT auf OPENED mit **korrekter** Version oder aus Uhr/Status abgeleitetes `completed` verändern nichts. Explizites Löschen prüft die erwartete Version; nach Löschung existiert kein Objekt zum Inkrementieren.

`completed` ist **keine DB-Spalte**. Der Service berechnet innerhalb jeder schreibenden Transaktion nach Sperren des betroffenen Kalender-Aggregats:
```text
completed = berlinNow >= Dec 25 00:00(calendar.year)
         && EXISTS door.status = OPENED
         && NOT EXISTS door.status = FILLED
```
Die Abfrage des Türchenzustands findet in derselben Datenbanksnapshot-/Sperrstrategie wie die Mutation statt. Eine Statusänderung kann den Abschluss bewirken und wird noch erfolgreich abgeschlossen. Inhalts-/Metadatenänderungen scheitern mit `409 CALENDAR_COMPLETED`; der Ersteller darf ein `OPENED`-Türchen weiterhin schließen, wodurch der abgeleitete Abschluss aufgehoben wird. Linkoperationen und Delete bleiben ebenfalls erlaubt.

Zeitstempel `created_at` / `updated_at` UTC, keine einzelnen `openedAt`-Felder. Kalenderjahr ist ein fachliches Integerfeld und **kein** Datum, das beim Jahreswechsel geändert wird. Die lokale Berlin-Zeit wird zur Entscheidungszeit berechnet.

#### 3. TypeORM-/MySQL-Migration

1. Als versionierte TypeORM-Migration die drei Tabellen, passenden FKs, Indizes, Constraints und Löschkaskaden anlegen; Schema nicht über `synchronize` ausliefern.
2. Bei der Einführung bestehende MySQL-TypeORM-Konfiguration prüfen. Falls `DB_SYNCHRONIZE` in Entwicklungsumgebungen genutzt wird, für kontrollierte Migrationen und **insbesondere Produktion** deaktivieren bzw. den Deploymentablauf verbindlich klären.
3. Up-/Down-Anweisungen, Constraints und Schutz unveränderter Tabellen mit Unit-Tests und gemocktem TypeORM-`QueryRunner` prüfen. Existierende Daten nicht implizit umschreiben.

4. FK-Löschkaskaden und die 24-Türchen-Transaktion ausschließlich mit Unit-Tests und gemocktem TypeORM-`QueryRunner`/`EntityManager` abdecken; echte MySQL-Testläufe sind für v1.0.0 nicht vorgesehen.

---

## minAdvent | Angular-Frontend

> **Soll-Konzept v1.0.0** · [Übersicht](README.md)

#### 1. Integration und Routen

Neues lazy geladenes Angular-Standalone-Feature unter `client/src/app/features/`, in `APP_ROUTES` registriert. Projekt nutzt Angular 20, Signals, Reactive Forms, zoneless Change Detection, TailwindCSS 4 sowie `min-`-Prefix für Shared Components; vorhandene Dialoge/Formular-/Loading-Komponenten bevorzugen. UI mobile-first, Tastaturzugänglichkeit, Kontrast und ARIA entsprechend WCAG 2.2 AA.

Beispielrouten: `/minadvent` (authentifizierte Erstellerverwaltung), `/minadvent/calendars/new`, `/minadvent/calendars/:id`, `/minadvent/shared/:token` (anonym). Die Tokenroute darf nicht mit Auth-Guard gesperrt werden. Routebezeichner können an bestehende Angular-Konventionen angepasst werden.

#### 2. Ersteller-Ansichten

- **Verwaltung:** aktuelle Kalender zuerst, vergangene nach Jahr gruppiert; jeder Kalender zeigt Titel, Jahr, Veröffentlichungszustand und berechneten Abschluss.
- **Create-Form:** Titel/Empfängername (je max. 50 Zeichen) und **Pflichtfeld Kalenderjahr**, initial aktuelles Jahr, Vergangenheit/Zukunft erlaubt. Bei vergangenen Jahren deutlicher Hinweis auf möglichen unmittelbaren endgültigen Abschluss.
- **Editor:** 24er-Raster mit `EMPTY`, `FILLED`, `OPENED`, „X von 24 Türchen befüllt“ und geöffneter Gesamtzahl. Jahr nur lesbar, Titel und Empfängername getrennt speicherbar; pro Türchen 0–10 sortierbare gemischte Blöcke. Textblöcke (max. 500 sichtbare Zeichen) verwenden ein normales mehrzeiliges Textfeld ohne WYSIWYG-Werkzeuge. Die Gutscheinbeschreibung (max. 200 Zeichen) verwendet ebenfalls ein normales mehrzeiliges Textfeld. Titel und URL sind jeweils auf 50 Zeichen begrenzt. Blöcke erhalten Position 1..N, nie 0/Lücken.
- **Speichern:** ein einzelner `PUT` speichert **alle** Blöcke einer Tür. Entwurfsdirty-State, Verlassenwarnung und Bestätigung vor Verwerfen. Führt das Entfernen des letzten `FILLED` bei mindestens einem `OPENED` nach dem 24.12. zum Abschluss, **vor PUT** explizit warnen. Bei der Warnung ist die lokale berechnete Prognose hilfreich, maßgeblich bleibt der Server.
- **Schließen:** der Ersteller kann jedes `OPENED`-Türchen jederzeit schließen, auch bei abgeschlossenem Kalender. Bei Erfolg wird es `FILLED`, der Abschluss wird neu abgeleitet und die Inhalte werden wieder editierbar; erneutes Öffnen löst wieder die Erstöffnungsanimation aus.
- **Abgeschlossen:** Nur-Lesen-Zustand für Inhalte und Metadaten. Ein Ersteller kann ein `OPENED`-Türchen jederzeit schließen; dadurch wird der abgeleitete Abschluss aufgehoben. **Freigabeaktionen und Löschen** bleiben aktiv.
- **Freigabe:** ausdrückliche Veröffentlichung (auch leere Kalender), Kopieren und natives Teilen des Links, Widerruf, Rotation und Wiederveröffentlichung; alter Link ab Widerruf/Erneuerung ungültig. Keine Erstellervorschau, kein spezieller Testmodus oder Duplizieren.
- **Löschen:** explizite Sicherheitsabfrage, danach Verwaltung aktualisieren.

#### 3. Empfänger-Ansicht

- Anonymous Shared Link, keine Anmeldung. Vor 1.12. des **ausgewählten Jahres** nur Titel und Countdown; ab 1.12. dauerhaft 24-Türchen-Raster.
- Kalenderüberblick enthält nur Status und Version, **keine Inhalte**. Leer/gesperrt nicht öffnbar, zeitlich freigegebenes FILLED per `PUT` mit erwarteter globaler Version.
- Nach erfolgreichem Erstöffnungs-`PUT` (nur `firstOpened: true`) kurze dezente Animation und Inhaltsdialog. Geöffnetes Türchen wiederansehen immer mit **GET ohne Animation**; schließbarer Dialog ohne Vor/Zurück-Navigation, keine Fortschrittsanzeige und keine Reaktionen.
- Bei `409 VERSION_CONFLICT` zeigt UI Hinweis und lädt **erst nach ausdrücklicher Bestätigung** den Überblick neu. Tür inzwischen OPENED → GET; weiter FILLED → erneuter Klick erforderlich; kein stiller PUT-Retry. Trifft GET zwischenzeitlich auf wieder geschlossenes Türchen, keine alten Inhalte zeigen, Übersicht nach bestätigter Aktualisierung neu laden.
- Nach verlorener Öffnungsantwort oder Netzwerkausfall Zustand zunächst durch Übersicht feststellen; keine blinden Wiederholungen. `409`-Fehlercodes differenzieren fachliche Meldungen. Ungültige Links zeigen nur neutrale Nichtverfügbarkeit.

#### 4. Technische Zustandsführung

Signals für kalenderlokalen Snapshot (`version`, `completed`, `published`, Türenstatus) und Lade-/Fehlerzustände; Reactive Forms für Entwürfe und Validierung. Aus OpenAPI generierte Services liefern bestehende RxJS Observables, bei Bedarf an der Konsumstelle in Signals umwandeln. Nach **jeder** bestätigten Mutation lokale globale Version aus Response übernehmen, nicht clientseitig schätzen; weder NgRx noch automatisches Polling oder automatische Netzwerk-Retries.

Bei Ersteller-409 lokale Entwürfe und Fokus erhalten, Dialog zur explizit bestätigten Aktualisierung/Verwerfung; nach Reload ggf. abgeschlossenen Schreibschutz darstellen. Normale Aktionen haben Loading, Success, Error und Empty States. Im Layout berücksichtigen, dass ein veröffentlichter Kalender parallel vom Empfänger geändert werden kann.

#### 5. Client-Generierung

Backend-Dekoratoren bilden sämtliche DTOs, Auth-Schemata und Fehlerresponses in Swagger/OpenAPI ab (`server/src/main.ts` exponiert `/openapi-json`). Aktualisiertes JSON in `client/openapi.json` übernehmen und **`npm --prefix client run api`** ausführen; Dateien in `client/src/app/core/generated/` niemals manuell ändern. Diese Dokumentation erstellt keine Clients.
