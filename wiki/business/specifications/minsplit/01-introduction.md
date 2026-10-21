# 1. Einleitung

## minSplit | Fachliches Konzept

> **Geplanter Soll-Zustand v1.0.0**, keine Aussage über bereits implementierte Funktionen. Grundlage: [Issue #196](https://github.com/waylapwong/minfactory/issues/196). Die technische Spezifikation und Implementierung sind nicht Gegenstand dieser Dokumentation.

#### 1. Zweck

minSplit verwaltet gemeinsame Euro-Ausgaben einer Gruppe, verteilt den **verrechenbaren Anteil der gültigen Ausgaben** ohne individuelle Beteiligungen oder Gewichtungen gleichmäßig; nicht gleichmäßig teilbare Rest-Cent verbleiben beim jeweiligen Zahler und erstellt beim unwiderruflichen Start der Abrechnung einen festen Zahlungsplan. Ausgleichszahlungen werden außerhalb von minSplit tatsächlich ausgeführt und anschließend innerhalb der Gruppe einzeln als erledigt markiert. minSplit überweist kein Geld.

#### 2. Dokumentationsübersicht

- [Gruppen, Teilnehmer und Lebenszyklus](../../3-mintools/minsplit/group-lifecycle.md)
- [Ausgaben und Kostenverteilung](../../3-mintools/minsplit/expenses.md)
- [Schlussabrechnung und Ausgleichszahlungen](../../3-mintools/minsplit/settlement.md)
- [Benutzerabläufe, Ansichten und Grenzfälle](../../3-mintools/minsplit/user-journeys.md)

Alle Detailseiten gelten gemeinsam. Beträge werden fachlich in **ganzen Cent** betrachtet; Geldbeträge werden als Euro angezeigt.

#### 3. Rollen und Berechtigungen

| Rolle | Zugang | Befugnis |
| --- | --- | --- |
| Ersteller | minFactory-Account | Eigene Gruppen erstellen/verwalten, Teilnehmer pflegen, Links erneuern, Status wechseln und Gruppen löschen; ist stets aktiver Teilnehmer |
| Teilnehmer | Gemeinsamer geheimer Gruppenlink ohne Account | Aktive Person in der Übersicht wählen; in `AKTIV` jede Ausgabe erfassen/stornieren; in `IN ABRECHNUNG` jede vorgeschlagene Zahlung bestätigen/stornieren; Chronik/Übersicht lesen |
| Nicht berechtigte Person | Kein gültiger Link und kein Eigentümerrecht | Kein Zugriff |

Die ausgewählte handelnde Person ist eine **Selbstauskunft**, kein Identitätsbeweis und **keine** Berechtigung zur Gruppenadministration. Ein Linkinhaber darf grundsätzlich unter jeder auswählbaren aktiven Person handeln. Administrative Vorgänge erfordern stets den authentifizierten Ersteller.

#### 4. Gruppenphasen

`AKTIV → IN ABRECHNUNG → GESCHLOSSEN`. Beide Übergänge erfolgen ausschließlich mit ausdrücklicher Bestätigung durch den Ersteller und sind **unumkehrbar**. Die Berechnung und Fixierung des Zahlungsplans finden **einmalig** beim ersten Übergang statt. `GESCHLOSSEN` ist nur lesbar; unabhängig davon darf der Ersteller seine Gruppe nach besonders bestätigter Löschaktion dauerhaft löschen.

#### 5. Gestaltung und Umfang

Minimalistisch, mobile-first, verständliche leer-/fehler-/ladebezogene Zustände. Innerhalb einer Gruppe: **Übersicht**, **Chronik**, **Teilnehmer**, nur beim Ersteller zusätzlich **Einstellungen**. Die öffentliche Übersicht beginnt mit der lokal gemerkten, jederzeit wechselbaren Auswahl einer aktiven handelnden Person.

Kein Ausgaben-Editor (stattdessen Storno/Neuanlage), keine Teilzahlungen, keine Gewichte, Kategorien, Belegfotos, Bank- oder Zahlungsanbindung, kein PDF-/CSV-Export und keine Echtzeitverbindung. Änderungen anderer Personen werden beim erneuten Laden sichtbar.
