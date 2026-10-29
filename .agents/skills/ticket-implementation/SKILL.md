---
name: ticket-implementation
description: 'Implementiert ein GitHub-Issue unter Berücksichtigung seiner Anforderungen, Referenzen und Abhängigkeiten, verifiziert die Änderungen, aktualisiert das Issue und erstellt einen Draft-Pull-Request.'
user-invocable: true
---

# Ticket-Implementierung

Befolge diesen Workflow, wenn Copilot oder Codex ein GitHub-Issue implementieren soll.

Die `AGENTS.md` und die darin referenzierten Projektanweisungen sind für Architektur, Implementierung, Tests, Dokumentation und Verifikation verbindlich.

## 1. Ticket analysieren

- Identifiziere das GitHub-Issue. Frage nach, falls es nicht eindeutig bestimmbar ist.
- Lies das vollständige Issue einschließlich Beschreibung, Akzeptanzkriterien, Umsetzung, Kommentaren und relevanten Referenzen.
- Prüfe verknüpfte Issues und `blocked by`-Abhängigkeiten. Kläre unerfüllte Voraussetzungen vor der Implementierung.
- Lies die geltenden Projektanweisungen und relevanten Dokumentationen.
- Prüfe den aktuellen Code und die bestehenden Tests.
- Prüfe den Git-Status, den aktuellen Branch und bereits vorhandene Pull Requests zum Issue.
- Falls bereits ein passender Pull Request existiert, verwende dessen Branch und Pull Request weiter.
- Verwende andernfalls einen geeigneten Arbeitsbranch.
- Bewahre bestehende, nicht zum Ticket gehörende Änderungen.

## 2. Unklarheiten klären

- Identifiziere wesentliche Unklarheiten, fehlende Entscheidungen und widersprüchliche Anforderungen.
- Kläre fachliche Fragen und größere technische Entscheidungen vor der Implementierung mit dem Benutzer.
- Erläutere bei Rückfragen das Problem, empfehle eine konkrete Lösung und bitte um eine Entscheidung.
- Triff kleinere technische Entscheidungen eigenständig anhand bestehender Projektkonventionen.
- Sind alle wesentlichen Fragen geklärt, fahre ohne zusätzliche Bestätigung fort.

## 3. Implementieren und verifizieren

- Implementiere die Anforderungen und Akzeptanzkriterien innerhalb des Ticketumfangs.
- Befolge die Implementierungs-, Test- und Dokumentationsvorgaben der `AGENTS.md`.
- Führe die vorgeschriebenen Prüfungen aus und behebe durch deine Änderungen verursachte Fehler.
- Führe die Abschlussprüfung gemäß `AGENTS.md` durch.
- Dokumentiere nicht ausführbare Prüfungen und verbleibende Einschränkungen.
- Stelle nicht verifizierte Arbeiten nicht als abgeschlossen dar.

## 4. Issue aktualisieren

- Markiere im Abschnitt `Umsetzung` ausschließlich tatsächlich abgeschlossene und verifizierte Aufgaben als erledigt.
- Lasse offene oder nicht verifizierte Aufgaben unverändert.
- Verändere die Checkboxen der `Akzeptanzkriterien` nicht. Sie bleiben für die Abnahme durch den Auftraggeber offen.
- Erhalte alle anderen Inhalte und Metadaten des Issues.
- Aktualisiere das Issue nach der Verifikation und vor der Veröffentlichung des Pull Requests.

## 5. Draft-Pull-Request erstellen oder aktualisieren

- Verwende einen bestehenden passenden Pull Request oder erstelle einen neuen Draft-Pull-Request.
- Erstelle keinen zusätzlichen Pull Request, wenn bereits ein passender existiert.
- Beachte das vorhandene Pull-Request-Template.
- Beschreibe die Änderungen, durchgeführten Prüfungen und gegebenenfalls offene Arbeiten.
- Verwende `Closes #<issue-number>` in der Pull-Request-Beschreibung, damit GitHub das Issue beim Merge automatisch schließen kann.
- Committe und pushe die Änderungen auf den zugehörigen Arbeitsbranch.
- Belasse einen bestehenden Pull Request in seinem bisherigen Draft- beziehungsweise Review-Status. Neue Pull Requests werden als Draft erstellt.
- Falls die Veröffentlichung nicht möglich ist, dokumentiere die Ursache und die verfügbaren Branch-Informationen.

## Abschluss

Fasse die Ergebnisse knapp zusammen:

- Implementierte Änderungen.
- Ergebnisse der Tests und Prüfungen.
- Aktualisierte und offene Umsetzungsaufgaben.
- Link zum Draft- beziehungsweise bestehenden Pull Request.
- Verbleibende Einschränkungen oder Blockierungen.

Behaupte keine erfolgreiche Durchführung nicht verifizierter Arbeitsschritte.
