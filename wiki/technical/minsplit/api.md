# minSplit | REST-API und Fehlervertrag

> **Geplante Schnittstelle; nicht implementiert.** [Übersicht](minsplit-home.md). Pfade sind konsistente Implementierungsvorschläge und vor Umsetzung gegen die bestehende API-Namenskonvention zu prüfen.

## Endpunkte

| Methode | Pfad | Zugang | Wirkung |
| --- | --- | --- | --- |
| POST | `/minsplit/groups` | Login/Ersteller | Gruppe einschließlich Ersteller und weiteren Teilnehmern anlegen; `version=1`, geheimen Link erzeugen |
| GET | `/minsplit/groups` | Login/Ersteller | Ausschließlich eigene Gruppen, sortiert ACTIVE, SETTLING, CLOSED |
| GET | `/minsplit/groups/:id` | Login/Eigentümer | Eigene Gruppe inkl. Status, Version, Teilnehmer, Abrechnungssnapshot und ggf. Link |
| PUT | `/minsplit/groups/:id/sharing/token` | Login/Eigentümer | Neuen Token erzeugen; alter atomar ungültig |
| POST | `/minsplit/groups/:id/participants` | Login/Eigentümer | Aktiven Teilnehmer in ACTIVE hinzufügen |
| PUT | `/minsplit/groups/:id/participants/:participantId` | Login/Eigentümer | Teilnehmername in ACTIVE oder SETTLING ändern |
| DELETE | `/minsplit/groups/:id/participants/:participantId` | Login/Eigentümer | In ACTIVE entfernen; ggf. `replacementPayerId` und automatische Stornos/Neubuchungen |
| PUT | `/minsplit/groups/:id/status` | Login/Eigentümer | ACTIVE→SETTLING oder SETTLING→CLOSED |
| DELETE | `/minsplit/groups/:id` | Login/Eigentümer | Gesamte Gruppe samt Historie löschen |
| GET | `/minsplit/shared/:token` | Link | Gruppendetails, Version, Teilnehmer, Phasen-/Abrechnungsdaten, berechnete Salden |
| GET | `/minsplit/shared/:token/history` | Link | Chronik neueste zuerst, aktuelle Namen aufgelöst |
| POST | `/minsplit/shared/:token/expenses` | Link | Einzelne Ausgabe in ACTIVE erfassen |
| PUT | `/minsplit/shared/:token/expenses/:expenseId/cancellation` | Link | Einzelne Ausgabe in ACTIVE stornieren |
| PUT | `/minsplit/shared/:token/settlements/:paymentId/status` | Link | Vorgeschlagene Zahlung in SETTLING bestätigen bzw. stornieren |

Alle Mutationen **außer initialem POST** verlangen `expectedVersion` im Body. Bei DELETE ist ein JSON-Body mit `expectedVersion` und ggf. `replacementPayerId` vorgesehen. Da Clients/Proxies DELETE-Bodys nicht überall zuverlässig behandeln, darf die Implementierung dieselben Parameter alternativ auf einen expliziten Aktionsendpunkt mit POST legen; die Versionierung/Semantik bleiben identisch. **Für alle Änderungen existiert ein gemeinsamer Fehlervertrag.** Erfolg liefert die neue Gruppen-Version; Löschung liefert 204.

## DTO-Beispiele

`POST /minsplit/groups`:
```json
{"name":"Urlaub","description":"Sommerreise","creatorParticipantName":"Anna","participantNames":["Ben","Clemens"]}
```
Antwort: `{"id":"<uuid>","status":"ACTIVE","version":1,"shareUrl":"<secret-url>"}`.

`POST /minsplit/shared/:token/expenses`:
```json
{"expectedVersion":2,"actorParticipantId":"<anna-id>","payerParticipantId":"<ben-id>","title":"Restaurant","amountCents":2350}
```
Antwort: `{"expenseId":"<uuid>","bookingSequence":1,"version":3}`.

`DELETE /minsplit/groups/:id/participants/:participantId`:
```json
{"expectedVersion":4,"replacementPayerId":"<remaining-active-id>"}
```
Erfordert Ersatz nur bei gültigen Ausgaben des entfernten Zahlers. Erfolgsantwort enthält aktualisierte `version` und aktive Teilnehmer. Gesamte Umbuchung ist ein atomarer Vorgang.

`PUT /minsplit/groups/:id/status`:
```json
{"expectedVersion":8,"status":"SETTLING"}
```
Antwort enthält `version`, `status`, `settlement` mit `totalCents`, `eligibleTotalCents`, `remainderCents`, `shareCents`, `remainderByPayer`, unveränderlichen `payments` und initialen Salden. Wechsel zu CLOSED ist analog mit `status:"CLOSED"`; Hinweis auf offene Zahlungen muss **vor Request im UI** bestätigt werden.

`PUT /minsplit/shared/:token/settlements/:paymentId/status`:
```json
{"expectedVersion":11,"actorParticipantId":"<active-id>","status":"CONFIRMED"}
```
Zum Stornieren `"status":"OPEN"`. Statuswechsel nur aus jeweils anderer gültiger Ausgangslage. Response mit `version`, `payment.status` und aktualisierten Salden/Progress. Ein erneutes CONFIRMED auf CONFIRMED ist Konflikt, **keine** Doppelbestätigung.

`PUT /minsplit/groups/:id/sharing/token`:
```json
{"expectedVersion":12}
```
Antwort mit neuer `shareUrl` und `version`. Token nicht in öffentlichen Gruppenantworten anzeigen.

`DELETE /minsplit/groups/:id`:
```json
{"expectedVersion":13,"confirmationName":"Urlaub"}
```
`confirmationName` muss dem bestehenden Gruppennamen entsprechen (exakt nach der im UI angezeigten Zeichenfolge); zusätzlich UI-Warndialog, danach vollständiges Entfernen aller Daten.

## Validierung und Zugriff

Öffentliche schreibende Requests benötigen `actorParticipantId`, die nach Tokenprüfung zur **selben Gruppe** gehören und **aktiv** sein muss. Sie ist eine frei gewählte Selbstauskunft; `payerParticipantId` darf unabhängig davon jede aktive Person sein. Bei Erstelleroperationen kommt Actor aus der serverseitig zugeordneten **Ersteller-Teilnehmer-ID**, nie aus einem Client-Parameter.

Namen: `trim`, 1–20 Zeichen, case-insensitiv eindeutig einschließlich entfernter Person. Ausgaben: Titel als erforderlicher nichtleerer Text; `amountCents` positive sichere Ganzzahl. Höchstwerte für Gruppennamen, Beschreibung und Ausgabentitel: in einem Implementierungsticket konsistent mit den bestehenden Formulargrenzen festlegen (keine abweichende fachliche Grenze behaupten). Unbekannte Felder ablehnen; IDs/Fremdschlüssel nie ungeprüft übernehmen.

## Fehlervertrag

| HTTP | Fehlercode | Bedeutung |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Fehlende/ungültige Felder, Beträge, unzulässige Namen |
| 401 | AUTH_REQUIRED | Fehlende/ungültige Firebase-Authentifizierung auf Ersteller-Routen |
| 403 | FORBIDDEN | Nicht Eigentümer oder nicht autorisierte Aktion |
| 404 | GROUP_UNAVAILABLE | Ungültiger/rotierter/gelöschter Link (neutral, ohne Existenzdetails) |
| 404 | RESOURCE_NOT_FOUND | Ungültige Ressourcen-ID in gültiger Gruppe |
| 409 | VERSION_CONFLICT | Gespeicherte Version entspricht `expectedVersion` nicht |
| 409 | INVALID_GROUP_STATE | Aktion in verbotener Phase oder Rückwärtsübergang |
| 409 | INVALID_PARTICIPANT_REMOVAL | Ersteller-/Mindestzahl-/Ersatz-Regel verletzt |
| 409 | PAYMENT_STATE_CONFLICT | Zahlung schon im Zielstatus oder nicht vorgeschlagen |
| 429 | RATE_LIMITED | Zu viele öffentliche Requests, `Retry-After` |

Fehlerobjekt folgt dem bestehenden minFactory-Fehlermodell mit stabilem `code` und ggf. `requestId`; niemals Token, Gruppendaten oder Teilnehmernamen in neutralen Fehlermeldungen. Bei einem Versionskonflikt weder automatische Wiederholung noch Merge. Antworttypen und Swagger-Dekoratoren ermöglichen die Generierung des Angular-Clients aus `client/openapi.json`, ohne dessen generierte Dateien manuell zu ändern.
