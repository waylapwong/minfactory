---
name: ticket-implementation
description: 'Verwenden, wenn ein GitHub-Issue oder Ticket in diesem Repository umgesetzt werden soll. Ticket, Referenzen und Abhängigkeiten prüfen, Unklarheiten klären, Änderungen implementieren und testen, erledigte Umsetzungsaufgaben abhaken und einen Draft-Pull-Request erstellen.'
user-invocable: true
---

# Ticket-Implementierung

Befolge diesen Workflow, wenn Copilot oder Codex mit der Umsetzung eines Tickets in diesem Repository beauftragt wird.

## 1. Ticket und Referenzen prüfen

- Identifiziere das GitHub-Issue anhand der Benutzeranfrage. Falls das Ticket nicht eindeutig identifizierbar ist, frage nach.
- Lies das vollständige Issue einschließlich Beschreibung, Aufgabenlisten, Akzeptanzkriterien, Kommentaren und relevanten Verknüpfungen.
- Lies alle relevanten referenzierten Anforderungen, Architektur- und Designdokumentationen, verwandten Issues und Codebereiche, bevor du die Umsetzung planst.
- Lies die `AGENTS.md` des Repositories sowie alle geltenden Projektanweisungen. Beachte deren Vorgaben zu Architektur, Implementierung, Tests, Formatierung und Verifizierung.
- Prüfe die `blocked by`-Beziehungen des Issues und stelle sicher, dass notwendige Abhängigkeiten abgeschlossen sind.
- Falls eine erforderliche Abhängigkeit noch nicht erfüllt ist, beginne nicht mit der davon abhängigen Implementierung. Melde die Blockierung.
- Vergleiche die Anforderungen des Tickets mit dem aktuellen Code und den bestehenden Tests, um Ausgangszustand und Umfang der Änderung zu verstehen.

## 2. Unklarheiten vor der Implementierung klären

- Identifiziere fehlende Entscheidungen, widersprüchliche Anforderungen, unklare Akzeptanzkriterien oder nicht zugängliche Referenzen, die die Umsetzung beeinflussen.
- Stelle gezielte und möglichst knappe Rückfragen, bevor du Änderungen implementierst, wenn wesentliche Unklarheiten bestehen.
- Triff keine unbegründeten Annahmen über das fachliche Verhalten und beginne keine Implementierung, solange wesentliche Fragen ungeklärt sind.
- Wenn keine wesentlichen Unklarheiten bestehen, fahre ohne zusätzliche Bestätigung fort.

## 3. Implementieren und testen

- Beschränke die Änderungen auf den Umfang des Tickets und halte bestehende Architektur, Konventionen und Zuständigkeiten ein.
- Bevorzuge die einfachste Lösung, die alle Akzeptanzkriterien erfüllt und zu den bestehenden Patterns passt.
- Verwende vorhandene Komponenten, Services, Hilfsfunktionen und Dependencies, bevor du neue Abstraktionen einführst.
- Vermeide nicht angeforderte Refactorings, spekulative Funktionalität und unnötige Dependencies.
- Ergänze oder aktualisiere gezielte Tests für das geänderte Verhalten einschließlich relevanter Randfälle und Fehlerzustände.
- Führe betroffene Tests sowie gegebenenfalls bestehende Regressionstests aus.
- Führe die erforderlichen Lint-, Formatierungs- und sonstigen Prüfungen gemäß `AGENTS.md` aus.
- Behebe durch deine Änderungen verursachte Fehler und wiederhole die betroffenen Prüfungen.
- Aktualisiere die betroffene technische Dokumentation, wenn sich Implementierungsdetails ändern.
- Ändere dokumentiertes fachliches Verhalten nicht eigenmächtig. Kläre Widersprüche zur fachlichen Dokumentation vor der Implementierung.
- Prüfe abschließend den gesamten Diff auf unnötige Änderungen, duplizierte Logik, fehlende Tests, inkonsistente Benennungen und Abweichungen von bestehenden Konventionen.
- Entferne temporären Code, Debugging-Artefakte und nicht zum Ticket gehörende Änderungen.
- Dokumentiere Prüfungen, die nicht ausgeführt werden konnten. Stelle nicht verifizierte Arbeiten nicht als abgeschlossen dar.

## 4. Issue aktualisieren

- Markiere im Abschnitt `Umsetzung` ausschließlich Aufgaben als erledigt, die tatsächlich implementiert und erfolgreich verifiziert wurden.
- Verändere keine Checkboxen im Abschnitt `Akzeptanzkriterien`. Diese bleiben für die Abnahme durch den Auftraggeber unverändert.
- Lasse nicht abgeschlossene oder nicht verifizierte Aufgaben offen.
- Falls die Implementierung unvollständig ist, dokumentiere die verbleibenden Arbeiten und lasse die entsprechenden Checkboxen unverändert.
- Stelle ein unvollständig umgesetztes Ticket nicht als abgeschlossen dar.
- Verändere keine anderen Inhalte oder Metadaten des Issues, sofern dies nicht ausdrücklich erforderlich ist.
- Aktualisiere das Issue erst nach der Implementierung und Verifizierung, unmittelbar vor der Erstellung des Draft-Pull-Requests.

## 5. Draft-Pull-Request erstellen

- Erstelle einen Draft-Pull-Request für die Implementierung und verknüpfe ihn mit dem Issue.
- Verwende das bestehende Pull-Request-Template des Repositories.
- Beschreibe die Änderungen, durchgeführten Prüfungen, gegebenenfalls offene Arbeiten und die Issue-Referenz möglichst knapp.
- Verwende `Closes #<issue-number>` in der Pull-Request-Beschreibung, damit GitHub das Issue beim Merge automatisch schließen kann.
- Belasse den Pull Request im Draft-Status. Markiere ihn nicht als bereit für das Review.
- Falls die Erstellung des Pull Requests durch fehlende Berechtigungen, nicht verfügbare GitHub-Werkzeuge oder andere externe Voraussetzungen verhindert wird, dokumentiere die Blockierung und stelle die vorhandenen Branch- beziehungsweise Pull-Request-Informationen bereit. Behaupte nicht, dass ein Pull Request erstellt wurde.

## Abschluss

Fasse die Ergebnisse knapp zusammen:

- Implementierte Änderungen und deren wesentliche Auswirkungen.
- Ausgeführte Tests und Prüfungen einschließlich fehlgeschlagener oder nicht ausführbarer Prüfungen.
- Aktualisierte Checkboxen im Abschnitt `Umsetzung` und gegebenenfalls verbleibende Aufgaben.
- Link zum Draft-Pull-Request.
- Verbleibende Blockierungen oder unvollständige Arbeiten.

Stelle ausschließlich tatsächlich implementierte und verifizierte Arbeiten als abgeschlossen dar.
