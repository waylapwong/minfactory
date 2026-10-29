# 5. Bausteinsicht

## minSplit | REST-API und Fehlervertrag

> **Geplante Schnittstelle; nicht implementiert.** [Übersicht](README.md). Pfade sind konsistente Implementierungsvorschläge und vor Umsetzung gegen die bestehende API-Namenskonvention zu prüfen.

#### Endpunkte

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

#### DTO-Beispiele

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

#### Validierung und Zugriff

Öffentliche schreibende Requests benötigen `actorParticipantId`, die nach Tokenprüfung zur **selben Gruppe** gehören und **aktiv** sein muss. Sie ist eine frei gewählte Selbstauskunft; `payerParticipantId` darf unabhängig davon jede aktive Person sein. Bei Erstelleroperationen kommt Actor aus der serverseitig zugeordneten **Ersteller-Teilnehmer-ID**, nie aus einem Client-Parameter.

Namen: `trim`, 1–20 Zeichen, case-insensitiv eindeutig einschließlich entfernter Person. Ausgaben: Titel als erforderlicher nichtleerer Text; `amountCents` positive sichere Ganzzahl. Höchstwerte für Gruppennamen, Beschreibung und Ausgabentitel: in einem Implementierungsticket konsistent mit den bestehenden Formulargrenzen festlegen (keine abweichende fachliche Grenze behaupten). Unbekannte Felder ablehnen; IDs/Fremdschlüssel nie ungeprüft übernehmen.

#### Fehlervertrag

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

---

## minSplit | Datenmodell, Integrität und Migrationen

> **Soll-Konzept v1.0.0** · [Übersicht](README.md)

#### Relationales Modell

| Tabelle | Felder (fachlicher Kern) | Integrität |
| --- | --- | --- |
| `minsplit_groups` | `id UUID PK`, `creator_id FK` (minFactory-User), `name`, `description NULL`, `status ACTIVE/SETTLING/CLOSED`, `version BIGINT=1`, `share_token UNIQUE`, `next_booking_sequence BIGINT=1`, `next_event_sequence BIGINT=1`, `created_at`, `updated_at` | Index `creator_id,status`; Tokenrotation atomar, genau ein gültiger Token je Gruppe |
| `minsplit_participants` | `id UUID PK`, `group_id FK`, `name VARCHAR(20)`, `normalized_name VARCHAR(20)`, `join_sequence BIGINT`, `is_active BOOL`, `is_creator BOOL` | UNIQUE(`group_id,normalized_name`), UNIQUE(`group_id,join_sequence`); entfernte Datensätze **behalten** (Namen reserviert, Referenzen gültig), Ersteller immer aktiv |
| `minsplit_expenses` | `id UUID PK`, `group_id FK`, `payer_id FK`, `title`, `amount_cents BIGINT`, `booking_sequence BIGINT`, `cancelled_at NULL`, `replacement_for_expense_id NULL`, `created_at` | `amount_cents > 0`, UNIQUE(`group_id,booking_sequence`); stornierte Buchungen bleiben für Chronik |
| `minsplit_settlements` | `id UUID PK`, `group_id FK`, `position INT`, `debtor_id FK`, `creditor_id FK`, `amount_cents BIGINT`, `is_confirmed BOOL` | UNIQUE(`group_id,position`), `amount_cents > 0`; Planzeilen nach Fixierung unveränderlich, **nur** Bezahlstatus schaltbar |
| `minsplit_history` | `id UUID PK`, `group_id FK`, `event_sequence BIGINT`, `operation_id UUID`, `actor_participant_id FK`, `event_type`, `subject_id`, `details JSON`, `created_at` | UNIQUE(`group_id,event_sequence`); append-only, niemals still ändern |

**Gruppensnapshot der Schlussabrechnung:** `total_cents`, `eligible_total_cents`, `remainder_cents`, `share_cents` in `minsplit_groups` nach Statusübergang unveränderlich speichern; die Restverteilung je Zahler in einer klar definierten `remainder_by_payer`-JSON-Struktur oder einer schlanken Kindtabelle persistieren, um die einmalige Berechnung unverändert wiedergeben zu können. Nur technische Snapshots, **keine** getrennt fortzuschreibenden aktuellen Salden. Für eine 0-Cent-Gruppe sind alle Summen null.

**Normalisierung:** `name.trim()` und anschließendes Unicode-casefolding bzw. eine äquivalente konsistente Groß-/Kleinschreibungs-Normalisierung in Service und DB-Unique-Index; die Anzeige nutzt den Originalnamen. Bei DB-Collation-unabhängigem Schlüssel muss dieselbe Normalisierung überall gelten. Namen bleiben nach Entfernung reserviert; Umbenennung auf einen Namen, den eine **andere** aktive oder entfernte Person besitzt, wird abgewiesen. Historische Actor- und Payer-FKs verweisen weiterhin auf ehemals aktive Personen; sie erscheinen trotzdem nicht im Live-Gruppendiagramm oder Zahlungsplan.

**Gruppeninterne Reihenfolge:** Der Ersteller erhält `join_sequence=1`, neue Teilnehmer monoton höhere Werte; Entfernung und Rename verändern sie nicht. Eine ebenfalls monotone `booking_sequence` legt bei gleichem Timestamp deterministisch den Rest-Cent-Träger fest; Stornos erhalten keine neue Buchungsnummer, Ersatzbuchungen dagegen **immer**. `event_sequence` ordnet auch viele Ereignisse derselben Transaktion zuverlässig. Alle Countervergabe unter Gruppenzeilensperre; keine Wiederverwendung.

**Kontrollen:** FK für Gruppenzugehörigkeit, positive Geldwerte, nichtnegative/fachlich korrekte Summen, `version >= 1`, eine Schließphase pro Gruppe, mindestens zwei aktive Personen: geeignete DB-Constraints soweit möglich, **gruppenübergreifende/aggregierte Invarianten im transaktionalen Service**. Bei Erstellerlöschung im bestehenden minFactory-Accountlöschpfad zugehörige Gruppen und deren Kinder vollständig entfernen. Den echten DB-User-FK an das vorhandene Modell anpassen.

#### Historie und Änderungen

Chronikdatensätze speichern Referenz-IDs auf Akteur/Subjekt, nicht eine zweite, später widersprüchliche Anzeigenamensquelle. Für `PARTICIPANT_RENAMED` bleiben alter und neuer Name als **Ereignisdaten** unverändert, während andere Einträge den aktuellen Anzeigenamen auflösen. Bei `EXPENSE_CANCELLED` und `EXPENSE_CREATED` verweisen Eventdetails auf getrennte Expense-IDs und bei Ersatz auch aufeinander. Bei `PAYMENT_CONFIRMED`/`PAYMENT_CANCELLED` wird ausschließlich der aktuelle Zahlungsstatus verändert; die Chronik zeichnet jeden Wechsel neu auf. Events existieren, solange die Gruppe existiert; nach Löschung sind sie einschließlich Tokens vollständig entfernt.

#### Migrationskonzept

Versionierte TypeORM-Migrationen mit Up/Down erstellen, ohne `synchronize` als Produktionsmigrationsweg. Indizes, FKs und passende Cascades von Gruppe zu Kindtabellen in einer kontrollierten DB-Migration vorsehen; Löschungen müssen atomar sein. Namentliche Begrenzungen, Unique-Constraints, offene Historienreferenzen und finanzielle Nichtnegativ-/Integerregeln sowohl im Service als auch dort, wo MySQL es unterstützt, absichern. Keine bestehende minApp-Tabelle umschreiben. UTC-Zeitstempel; keine fachliche Abhängigkeit von lokaler Zeitzone. Reale Migrationen sind **nicht** Teil dieses Dokumentationsauftrags.

#### Offene physische Details für Implementierungstickets

Exakte User-FK-Spalte, konkrete MySQL-Kollation und vorhandenes Migrationen-Deployment an bestehendem Code ausrichten; Die Freigabetoken-Spalte erlaubt dem berechtigten Ersteller das erneute Kopieren des aktuell gültigen Links; Rest-Cent-Snapshots können als einfache Spalten/JSON oder bei Bedarf als kleine separate Tabelle abgebildet werden. Keine zusätzliche Event-Sourcing-Infrastruktur: Die Chronik ist ein Audit-Read-Model, die Tabellen bleiben Source of Truth.

---

## minSplit | Angular-Frontend und UI-Zustände

> **Soll-Konzept v1.0.0** · [Übersicht](README.md) · [Fachliche Benutzerabläufe](../../requirements/minsplit/03-specific-requirements.md)

#### Architektur

Eigenständiges, lazy geladenes `client/src/app/features/minsplit/` mit Standalone-Pages, Feature-Services, `signal`/`computed` für Gruppen- und Zahlungsstände, Reactive Forms für Ersteller-/Ausgaben-/Umbuchungsdialoge. Bestehende Shared-Dialogkomponente, TailwindCSS und vorhandene Layout-/Auth-Patterns verwenden; kein NgRx oder eigener globaler Store. Datenzugriff über aus NestJS-OpenAPI generierten Angular-Client; Observables an Verbrauchsstelle in Signals/Zustand überführen. Ersteller-Routen sind geschützt, öffentliche `/shared/:token`-Route nicht.

#### Ansichten

| Ort | Inhalt |
| --- | --- |
| Erstellergruppenübersicht | Eigene Gruppen in ACTIVE, SETTLING, CLOSED gruppiert; 3-Punkte-Löschen nach Eingabe des exakten Gruppennamens |
| **Übersicht** (Gruppentab) | **Ganz oben** lokal gemerkte aktive handelnde Person, wechselbar; gruppenphasenabhängige Diagramme und Aktionen |
| **Chronik** | Einzelereignisse neueste zuerst, dynamisch aktuelle Namen, Rename mit Alt-/Neuname, Storno/Neuverbuchung getrennt |
| **Teilnehmer** | Aktive Personen; Ersteller kann in ACTIVE hinzufügen/umbenennen/entfernen, in SETTLING umbenennen, in CLOSED nur lesen |
| **Einstellungen** | Nur beim authentifizierten Ersteller; Link kopieren/erneuern, irreversiblen Phasenwechsel mit Warnung auslösen, dauerhaft löschen |

**ACTIVE:** Kreisdiagramm der tatsächlich gezahlten gültigen Ausgaben pro **aktivem** Zahler, gesamte gültige Ausgaben in der Mitte, darunter unverbindliche Salden je Person ohne konkreten Empfänger. Ausgaben-Modal mit Titel, beliebigem aktivem Zahler und Betrag; Storno über zugehörige Aktion. Keine Ausgleichszahlungen.

**SETTLING:** Statt Kreisdiagramm **horizontale Saldenbalken ausschließlich aktiver Personen**, linke Seite `<0` („schuldet“), rechte Seite `>0` („erhält“), Mittelpunkt 0. Ausgeklammerte Rest-Cent gehören **nicht** in Saldenbalken; separat Hinweis je betroffenem Zahler und Betrag. Verrechenbare Gesamtausgaben als Geldbetrag separat anzeigen. Unterhalb unveränderlicher Zahlungsplan mit **allen** vorgeschlagenen Positionen, sichtbarem Status OFFEN/BEZAHLT, Anzahl und Fortschritt `confirmed/total` sowie „Ausgleichszahlung erfassen“ mit Auswahl genau einer offenen Zeile. Bestätigte Zahlungen stornierbar; nach jeder erfolgreichen Aktion neu dargestellte Salden. Keine neuen Ausgaben oder Teilnehmerwechsel.

**CLOSED:** Letzter Stand von Salden, Plan, Zahlungsstatus, Chronik und Teilnehmern schreibgeschützt. Offene Zahlungszeilen bleiben offen. Der Ersteller darf über administrative Einstellungen Link rotieren oder Gruppe löschen; kein fachlicher Statuswechsel mehr.

#### Lokaler State und Konflikte

Die Personenauswahl speichert **Teilnehmer-ID pro Gruppe und Browser/Endgerät** lokal, nicht einen Anzeigenamen; ein beim erneuten Laden inaktiver Teilnehmer wird verworfen und die Person neu ausgewählt. Jeder mutierende Request nimmt den `expectedVersion` des zuletzt **erfolgreich geladenen/gespeicherten** Gruppenstands. Bei Erfolg Serverantwort mit neuer Version/Salden übernehmen, niemals lokal die Version schätzen.

Bei 409 aktuelle Daten **nicht automatisch über ungespeicherte Formulare legen**. Lokale Entwürfe behalten, verständlichen Dialog mit Aktion „Neu laden“ anzeigen; vor Verwerfen explizit bestätigen. Bei Netzwerkfehlern nicht blind erneut senden: Ausgang ist möglicherweise auf Server angekommen; aktuellen Stand manuell prüfen. Keine automatischen Retries oder WebSockets; andere Änderungen erscheinen beim Neuladen.

#### Validierung/Barrierefreiheit

Reactive Forms mit Trim, Eindeutigkeit aktiver und entfernter Namensreserve (letztlich serverseitig maßgeblich), 20 Zeichen und Betrag in Euro mit maximal zwei Nachkommastellen. Client konvertiert Dezimalstring **ohne Float-Rundung** in Integer-Cent. Loading, Empty, Error und Success States. Mobile-first, Tastaturbedienung, semantische Beschriftung und WCAG 2.2 AA: Diagramme ergänzend mit Text-Salden/-Status darstellen, links/rechts nicht nur durch Farbe unterscheiden, `prefers-reduced-motion` beachten. Öffentliche Ansicht darf keinen globalen Auth-Guard voraussetzen.
