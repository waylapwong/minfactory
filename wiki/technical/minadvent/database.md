# minAdvent | Datenmodell und Migrationen

> **Soll-Konzept v1.0.0** · [Übersicht](minadvent-home.md)

## 1. Relationales Modell (Vorschlag)

| Tabelle / Aggregat | Wichtige Spalten | Integrität |
| --- | --- | --- |
| `minadvent_calendars` | `id UUID PK`, `owner_id` (bestehende minFactory-User-Relation), `year INT NOT NULL`, `title VARCHAR(50)`, `recipient_name VARCHAR(50)`, `version INT/ BIGINT NOT NULL`, `is_published BOOL`, `active_token` nullable, `created_at`, `updated_at` | Owner-FK, Index (owner,year), maximal ein aktiver Token, Jahr nach Create unveränderlich |
| `minadvent_doors` | `id UUID PK`, `calendar_id FK`, `day INT`, `status ENUM/VARCHAR` | UNIQUE(calendar_id, day), CHECK day 1–24, pro Kalender genau 24 durch atomare Create-Transaktion |
| `minadvent_blocks` | `id UUID PK`, `door_id FK`, `position INT`, `type TEXT/LINK/VOUCHER`, typabhängige Nutzdaten (Titel VARCHAR(50), URL VARCHAR(50), Beschreibung VARCHAR(200), Text höchstens 500 sichtbare Zeichen) | UNIQUE(door_id, position), CHECK position >=1; 0–10 Gesamtzahl serverseitig validieren |

Die genaue physische Abbildung der Block-Nutzdaten (typabhängige Spalten oder JSON) ist nach bestehendem TypeORM-Modell zu wählen, nicht durch neue Abstraktionshierarchien zu verkomplizieren. `EMPTY` entspricht null Blöcken, `FILLED` mindestens einem Block, `OPENED` hält die Blöcke weiter vor. Der Vollständigkeitsinvariant zwischen Status und Anzahl sowie lückenlose Positionen werden **atomar im Service** geprüft; UNIQUE allein garantiert weder Lückenfreiheit noch die Maximalanzahl.

**Genau 24 Türen** entstehen zusammen mit dem Kalender in einer Transaktion. Bei Fehler wird alles zurückgerollt. Delete-Cascade: Kalender → Türchen → Blöcke; Accountlöschung entfernt sämtliche kalenderbezogenen Daten. Owner-FK an bestehende minFactory-Nutzeridentität anpassen, keine separate Empfängertabelle nötig.

Der Shared Token ist bewusst **im Klartext** gespeichert (vereinbarter Soll-Zustand, sicherheitssensibel). Er existiert nur, wenn veröffentlicht; bei Widerruf NULL, bei Neupublikation/Rotation atomar ersetzen. Ein einzelnes Tokenfeld am Kalender genügt: UNIQUE für nicht-null Token, keine Tokenhistorie nötig. `is_published` und Tokenpräsenz bleiben konsistent, idealerweise gemeinsame DB-/Service-Invariante.

## 2. Globale Version und Zeitfelder

`version` wird beim Erstellen initialisiert (z. B. 1), bei **jeder tatsächlich erfolgreichen Mutation einmal** inkrementiert: Titel/Empfänger, kompletter Türcheninhalt, Statusübergang, erste Öffnung, Veröffentlichungsaktionen. Kein eigener Versionswert für Türchen oder Link. Bloßer GET, erfolgreich wiederholter PUT auf OPENED mit **korrekter** Version oder aus Uhr/Status abgeleitetes `completed` verändern nichts. Explizites Löschen prüft die erwartete Version; nach Löschung existiert kein Objekt zum Inkrementieren.

`completed` ist **keine DB-Spalte**. Der Service berechnet innerhalb jeder schreibenden Transaktion nach Sperren des betroffenen Kalender-Aggregats:
```text
completed = berlinNow >= Dec 25 00:00(calendar.year)
         && EXISTS door.status = OPENED
         && NOT EXISTS door.status = FILLED
```
Die Abfrage des Türchenzustands findet in derselben Datenbanksnapshot-/Sperrstrategie wie die Mutation statt. Eine Statusänderung kann den Abschluss bewirken und wird noch erfolgreich abgeschlossen. Inhalts-/Metadatenänderungen scheitern mit `409 CALENDAR_COMPLETED`; der Ersteller darf ein `OPENED`-Türchen weiterhin schließen, wodurch der abgeleitete Abschluss aufgehoben wird. Linkoperationen und Delete bleiben ebenfalls erlaubt.

Zeitstempel `created_at` / `updated_at` UTC, keine einzelnen `openedAt`-Felder. Kalenderjahr ist ein fachliches Integerfeld und **kein** Datum, das beim Jahreswechsel geändert wird. Die lokale Berlin-Zeit wird zur Entscheidungszeit berechnet.

## 3. TypeORM-/MySQL-Migration

1. Als versionierte TypeORM-Migration die drei Tabellen, passenden FKs, Indizes, Constraints und Löschkaskaden anlegen; Schema nicht über `synchronize` ausliefern.
2. Bei der Einführung bestehende MySQL-TypeORM-Konfiguration prüfen. Falls `DB_SYNCHRONIZE` in Entwicklungsumgebungen genutzt wird, für kontrollierte Migrationen und **insbesondere Produktion** deaktivieren bzw. den Deploymentablauf verbindlich klären.
3. Up-/Down-Anweisungen, Constraints und Schutz unveränderter Tabellen mit Unit-Tests und gemocktem TypeORM-`QueryRunner` prüfen. Existierende Daten nicht implizit umschreiben.

4. FK-Löschkaskaden und die 24-Türchen-Transaktion ausschließlich mit Unit-Tests und gemocktem TypeORM-`QueryRunner`/`EntityManager` abdecken; echte MySQL-Testläufe sind für v1.0.0 nicht vorgesehen.
