---
name: pr-review
description: 'Bearbeitet ausschließlich ungelöste Review-Threads eines GitHub-Pull-Requests, bewertet die Kommentare, implementiert erforderliche Änderungen, verifiziert und veröffentlicht diese und resolved anschließend die bearbeiteten Threads.'
user-invocable: true
---

# Pull-Request-Review

Befolge diesen Workflow, wenn Copilot oder Codex mit der Bearbeitung von Review-Kommentaren eines GitHub-Pull-Requests beauftragt wird.

Die `AGENTS.md` und die darin referenzierten Projektanweisungen sind für Architektur, Implementierung, Tests, Dokumentation und Verifikation verbindlich.

## 1. Pull Request analysieren

- Identifiziere den GitHub-Pull-Request. Frage nach, falls er nicht eindeutig bestimmbar ist.
- Lies die PR-Beschreibung, verknüpfte Issues und alle Review-Threads mit dem aktuellen Status `Unresolved` einschließlich ihrer bisherigen Diskussionen.
- Berücksichtige ausschließlich `Unresolved` Review-Threads. Bereits als `Resolved` markierte Threads vollständig von der Bearbeitung ausschließen, auch wenn deren Kommentare weiterhin sichtbar sind.
- Prüfe den aktuellen Diff und die betroffenen Codebereiche.
- Prüfe den Git-Status und arbeite auf dem bestehenden PR-Branch.
- Bewahre bestehende, nicht zum Review gehörende Änderungen.
- Falls keine ungelösten Review-Threads existieren, beende den Workflow ohne Änderungen.

## 2. Review-Kommentare bewerten

- Prüfe jeden ungelösten Review-Thread anhand des aktuellen Codes und der geltenden Projektanweisungen.
- Erkenne zusammengehörige Kommentare und vermeide redundante Änderungen.
- Unterscheide zwischen berechtigten Problemen, bereits behobenen Problemen und fachlich oder technisch unzutreffenden Kommentaren.
- Übernehme Vorschläge nicht ungeprüft, sondern bewerte ihre Auswirkungen auf Architektur, Verhalten und Wartbarkeit.
- Kläre wesentliche fachliche Unklarheiten und größere technische Entscheidungen vor der Implementierung mit dem Benutzer.
- Erläutere bei Rückfragen das Problem, empfehle eine konkrete Lösung und bitte um eine Entscheidung.
- Sind keine wesentlichen Fragen offen, fahre ohne zusätzliche Bestätigung fort.

## 3. Änderungen implementieren und verifizieren

- Prüfe vor der Bearbeitung eines Threads erneut dessen aktuellen Status. Bearbeite keine zwischenzeitlich als `Resolved` markierten Threads.
- Behebe berechtigte Review-Kommentare innerhalb des PR-Umfangs.
- Befolge die Implementierungs-, Test- und Dokumentationsvorgaben der `AGENTS.md`.
- Führe die vorgeschriebenen Prüfungen aus und behebe durch deine Änderungen verursachte Fehler.
- Führe die Abschlussprüfung gemäß `AGENTS.md` durch.
- Prüfe, ob alle bearbeiteten Kommentare durch die Änderungen vollständig adressiert wurden.
- Dokumentiere nicht ausführbare Prüfungen und verbleibende Einschränkungen.

## 4. Änderungen veröffentlichen

- Prüfe vor der Veröffentlichung erneut, welche Review-Threads noch `Unresolved` sind.
- Veröffentliche keine ausschließlich für zwischenzeitlich als `Resolved` markierte Threads vorgesehenen Änderungen. Bewahre dabei bereits bestehende oder anderweitig erforderliche Änderungen.
- Committe und pushe die verifizierten Änderungen auf den bestehenden PR-Branch.
- Erstelle keinen zusätzlichen Pull Request.
- Verändere den Draft- beziehungsweise Review-Status des Pull Requests nicht.
- Falls die Veröffentlichung nicht möglich ist, dokumentiere die Ursache und lasse die betroffenen Review-Threads offen.

## 5. Review-Threads abschließen

- Prüfe unmittelbar vor dem Resolven erneut den aktuellen Status jedes bearbeiteten Review-Threads.
- Markiere ausschließlich weiterhin `Unresolved` Review-Threads als `Resolved`, wenn das Problem nachweislich behoben oder fachlich beziehungsweise technisch nachvollziehbar geklärt wurde.
- Bei behobenen Problemen genügt das Resolven, sofern keine zusätzliche Erklärung erforderlich ist.
- Bei unzutreffenden oder bereits erledigten Kommentaren begründe die Entscheidung im Thread, bevor du ihn resolved.
- Lasse nicht behobene oder ungeklärte Threads offen.
- Bereits anderweitig als `Resolved` markierte Threads weder erneut bearbeiten noch kommentieren oder verändern.
- Verändere keine nicht betroffenen Review-Threads.

## Abschluss

Fasse die Ergebnisse knapp zusammen:

- Umgesetzte Änderungen und geklärte Review-Kommentare.
- Ergebnisse der Tests und Prüfungen.
- Anzahl der bearbeiteten und als `Resolved` markierten Review-Threads.
- Gegebenenfalls verbleibende offene Threads mit Begründung.
- Link zum aktualisierten Pull Request.
- Verbleibende Einschränkungen oder Blockierungen.

Stelle ausschließlich tatsächlich implementierte, verifizierte und veröffentlichte Änderungen als abgeschlossen dar.
