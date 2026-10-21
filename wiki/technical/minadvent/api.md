# minAdvent | REST-API-Vertrag

> **Geplante API, nicht implementiert.** [Übersicht](minadvent-home.md). Pfade der authentifizierten Ersteller-Ressourcen sind Vorschläge; die drei Shared-Pfade sind fachlich vereinbart. DTO-Beispiele zeigen den fachlichen Kern.

## 1. Endpunkte

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

## 2. DTOs und Beispiel-Payloads

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
Mit `blocks: []` wird `EMPTY`. Wenn dadurch ab 25.12. das letzte FILLED verschwindet und ein OPENED vorhanden ist, zeigt der Client **vor dem Speichern** eine Abschlusswarnung; die Antwort darf `completed:true` enthalten. Die ValidationPipe plus fachliche Prüfung erzwingen Pflichtfelder und Grenzen (Titel/Name/Linktitel/Vouchertitel 100, Text sichtbare Zeichen 10000, Gutscheinbeschreibung 2000, gültige HTTP(S)-URL und Blockanzahl 0..10). Kein Nullposition, keine doppelte oder ausgelassene Position.

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

## 3. Fehlervertrag und Priorität

```json
{"statusCode":409,"code":"VERSION_CONFLICT","message":"Der Kalender wurde zwischenzeitlich geändert."}
```

| HTTP | Fachcode (Beispiel) | Fall |
| --- | --- | --- |
| 409 | `VERSION_CONFLICT` | Veraltete globale Version, auch bei OPENED und abgeschlossen; **Vorrang bei jedem PUT** |
| 409 | `CALENDAR_COMPLETED` | Inhalt/Metadaten/Türstatus bei aktuellem Versionswert nicht mehr änderbar |
| 409 | `DOOR_EMPTY` | Öffnen einer leeren Tür |
| 409 | `DOOR_NOT_YET_UNLOCKED` | Öffnen vor dem ausgewählten Dezembertag |
| 409 | `INVALID_CONTENT` | Fachliche Eingabe verletzt Block-/Längen-/Pflichtregeln |
| 403 | `FORBIDDEN` | Ersteller ohne Berechtigung (fremder Kalender) |
| 400 | `INVALID_REQUEST` | Struktureller Fehler, Tag außerhalb 1–24 |
| 404 | `SHARED_CALENDAR_UNAVAILABLE` | Ungültiger, widerrufener oder ersetzter Token, gelöschter Kalender |

Zugriffskontrolle und Tokenvalidität werden vorausgesetzt, bevor Informationen über die Ressource preisgegeben werden. **Bei vorhandenem Zugriff** prüft jeder PUT die erwartete Version vor sonstigen fachlichen Konflikten. `GET` ohne OPENED liefert keine Inhaltsblöcke (fachlicher 409, z. B. `DOOR_NOT_OPENED`). 403 ist ausdrücklich **Berechtigungen** vorbehalten, nicht fachlichen Sperren. Serverseitige Fehlerantworten dürfen keine Tokens, privaten Inhalte oder Existenzinformationen bei ungültigen Shared Links verraten.

## 4. Konflikt und atomare Mutationen

Bei `409 VERSION_CONFLICT`: Empfänger informiert; Übersicht erst nach ausdrücklicher Zustimmung nachladen. Wenn die angeklickte Tür inzwischen OPENED ist, deren Inhalt per **GET ohne Animation** abrufen; ist sie weiter FILLED, erst nach erneutem Klick PUT. **Keine automatischen PUT-Retries**. Bei Erstellerkonflikten Eingaben bis zur bestätigten Aktualisierung lokal bewahren. Jede Mutation liest Version, Abschluss und aktuellen Türzustand **innerhalb derselben synchronisierten DB-Transaktion**; erfolgreiche erste Öffnung erhöht Version genau einmal. Letzte Öffnung / letztes FILLED leeren kann `completed=true` auslösen, der auslösende Request bleibt erfolgreich. Ein Linkwiderruf darf gleichzeitig laufende PUTs nicht auf halb-gültigem Link fortsetzen.

Konkrete DTO-Klassennamen und die URL-Maximallänge sind an etablierte Repo-Konventionen anzupassen; für OpenAPI werden die vorgesehenen Felder und Fehlermodelle vollständig annotiert.
