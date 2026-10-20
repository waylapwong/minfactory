# minSplit | Datenmodell, Integrität und Migrationen

> **Soll-Konzept v1.0.0** · [Übersicht](minsplit-home.md)

## Relationales Modell

| Tabelle | Felder (fachlicher Kern) | Integrität |
| --- | --- | --- |
| `minsplit_groups` | `id UUID PK`, `creator_id FK` (minFactory-User), `name`, `description NULL`, `status ACTIVE/SETTLING/CLOSED`, `version BIGINT=1`, `share_token_hash UNIQUE`, `next_booking_sequence BIGINT=1`, `next_event_sequence BIGINT=1`, `created_at`, `updated_at` | Index `creator_id,status`; Tokenrotation atomar, genau ein gültiger Token je Gruppe |
| `minsplit_participants` | `id UUID PK`, `group_id FK`, `name VARCHAR(20)`, `normalized_name VARCHAR(20)`, `join_sequence BIGINT`, `is_active BOOL`, `is_creator BOOL` | UNIQUE(`group_id,normalized_name`), UNIQUE(`group_id,join_sequence`); entfernte Datensätze **behalten** (Namen reserviert, Referenzen gültig), Ersteller immer aktiv |
| `minsplit_expenses` | `id UUID PK`, `group_id FK`, `payer_id FK`, `title`, `amount_cents BIGINT`, `booking_sequence BIGINT`, `cancelled_at NULL`, `replacement_for_expense_id NULL`, `created_at` | `amount_cents > 0`, UNIQUE(`group_id,booking_sequence`); stornierte Buchungen bleiben für Chronik |
| `minsplit_settlements` | `id UUID PK`, `group_id FK`, `position INT`, `debtor_id FK`, `creditor_id FK`, `amount_cents BIGINT`, `is_confirmed BOOL` | UNIQUE(`group_id,position`), `amount_cents > 0`; Planzeilen nach Fixierung unveränderlich, **nur** Bezahlstatus schaltbar |
| `minsplit_history` | `id UUID PK`, `group_id FK`, `event_sequence BIGINT`, `operation_id UUID`, `actor_participant_id FK`, `event_type`, `subject_id`, `details JSON`, `created_at` | UNIQUE(`group_id,event_sequence`); append-only, niemals still ändern |

**Gruppensnapshot der Schlussabrechnung:** `total_cents`, `eligible_total_cents`, `remainder_cents`, `share_cents` in `minsplit_groups` nach Statusübergang unveränderlich speichern; die Restverteilung je Zahler in einer klar definierten `remainder_by_payer`-JSON-Struktur oder einer schlanken Kindtabelle persistieren, um die einmalige Berechnung unverändert wiedergeben zu können. Nur technische Snapshots, **keine** getrennt fortzuschreibenden aktuellen Salden. Für eine 0-Cent-Gruppe sind alle Summen null.

**Normalisierung:** `name.trim()` und anschließendes Unicode-casefolding bzw. eine äquivalente konsistente Groß-/Kleinschreibungs-Normalisierung in Service und DB-Unique-Index; die Anzeige nutzt den Originalnamen. Bei DB-Collation-unabhängigem Schlüssel muss dieselbe Normalisierung überall gelten. Namen bleiben nach Entfernung reserviert; Umbenennung auf einen Namen, den eine **andere** aktive oder entfernte Person besitzt, wird abgewiesen. Historische Actor- und Payer-FKs verweisen weiterhin auf ehemals aktive Personen; sie erscheinen trotzdem nicht im Live-Gruppendiagramm oder Zahlungsplan.

**Gruppeninterne Reihenfolge:** Der Ersteller erhält `join_sequence=1`, neue Teilnehmer monoton höhere Werte; Entfernung und Rename verändern sie nicht. Eine ebenfalls monotone `booking_sequence` legt bei gleichem Timestamp deterministisch den Rest-Cent-Träger fest; Stornos erhalten keine neue Buchungsnummer, Ersatzbuchungen dagegen **immer**. `event_sequence` ordnet auch viele Ereignisse derselben Transaktion zuverlässig. Alle Countervergabe unter Gruppenzeilensperre; keine Wiederverwendung.

**Kontrollen:** FK für Gruppenzugehörigkeit, positive Geldwerte, nichtnegative/fachlich korrekte Summen, `version >= 1`, eine Schließphase pro Gruppe, mindestens zwei aktive Personen: geeignete DB-Constraints soweit möglich, **gruppenübergreifende/aggregierte Invarianten im transaktionalen Service**. Bei Erstellerlöschung im bestehenden minFactory-Accountlöschpfad zugehörige Gruppen und deren Kinder vollständig entfernen. Den echten DB-User-FK an das vorhandene Modell anpassen.

## Historie und Änderungen

Chronikdatensätze speichern Referenz-IDs auf Akteur/Subjekt, nicht eine zweite, später widersprüchliche Anzeigenamensquelle. Für `PARTICIPANT_RENAMED` bleiben alter und neuer Name als **Ereignisdaten** unverändert, während andere Einträge den aktuellen Anzeigenamen auflösen. Bei `EXPENSE_CANCELLED` und `EXPENSE_CREATED` verweisen Eventdetails auf getrennte Expense-IDs und bei Ersatz auch aufeinander. Bei `PAYMENT_CONFIRMED`/`PAYMENT_CANCELLED` wird ausschließlich der aktuelle Zahlungsstatus verändert; die Chronik zeichnet jeden Wechsel neu auf. Events existieren, solange die Gruppe existiert; nach Löschung sind sie einschließlich Tokens vollständig entfernt.

## Migrationskonzept

Versionierte TypeORM-Migrationen mit Up/Down erstellen, ohne `synchronize` als Produktionsmigrationsweg. Indizes, FKs und passende Cascades von Gruppe zu Kindtabellen in einer kontrollierten DB-Migration vorsehen; Löschungen müssen atomar sein. Namentliche Begrenzungen, Unique-Constraints, offene Historienreferenzen und finanzielle Nichtnegativ-/Integerregeln sowohl im Service als auch dort, wo MySQL es unterstützt, absichern. Keine bestehende minApp-Tabelle umschreiben. UTC-Zeitstempel; keine fachliche Abhängigkeit von lokaler Zeitzone. Reale Migrationen sind **nicht** Teil dieses Dokumentationsauftrags.

## Offene physische Details für Implementierungstickets

Exakte User-FK-Spalte, konkrete MySQL-Kollation und vorhandenes Migrationen-Deployment an bestehendem Code ausrichten; Tokenhash und Rest-Cent-Snapshot können als einfache Spalten/JSON oder bei Bedarf als kleine separate Tabelle abgebildet werden. Keine zusätzliche Event-Sourcing-Infrastruktur: Die Chronik ist ein Audit-Read-Model, die Tabellen bleiben Source of Truth.
