# minAdvent | Teststrategie und Architektur-Review

> **Geplanter Soll-Zustand v1.0.0** · [Übersicht](minadvent-home.md)

## 1. Testwerkzeuge und Umfang

Für v1.0.0 sind ausschließlich Unit-Tests vorgesehen: Backend mit Jest/ts-jest, Frontend mit Jasmine/Karma. Datenbankzugriffe, Guards, Zeitquellen und externe Dienste werden über wiederverwendbare Feature-Mocks ersetzt; keine API-, Integrations-, Datenbank-, E2E-, Last-, Security- oder Regressionstestläufe. Bestehende Mock-Verzeichnisse verwenden, keine Inline-Mocks. Die Produktivregeln bleiben serverseitig maßgeblich.

## 2. Fachliche und technische Szenarien

| Ausgangslage | Aktion | Erwartung / Ebene |
| --- | --- | --- |
| Kalenderanlage | Create mit vergangenen/aktuellen/zukünftigen Jahren | Pflichtfelder, Initialwerte und genau 24 EMPTY-Türen; Service-/Repository-Unit-Test mit Repository-/Transaction-Mock |
| Jahresgrenzen | Werte vor, innerhalb und nach dem erlaubten Jahrbereich | Gültige Jahre akzeptiert, ungültige Jahre abgelehnt; Service-Unit-Test |
| Jahr ändern | Update-Payload mit zusätzlichem `year` | Whitelist lehnt unbekanntes Feld ab; DTO-/ValidationPipe-Unit-Test |
| 24-Türen-Invariante | Fehler beim Speichern der Türen | Eine Transaktion umfasst Kalender und 24 Türen; Repository-Unit-Test mit gemocktem EntityManager |
| 0/10/11 Inhaltsblöcke und lückenhafte Positionen | Türchen speichern | Grenzen und Validierungsfehler; Service-Unit-Test mit Repository-Mock |
| Leerer oder gefährlicher Text/Link | Inhalte validieren und abbilden | Leere Werte und nicht erlaubte Inhalte werden abgelehnt/sicher behandelt; Validator-/Mapper-Unit-Test |
| Veröffentlichung, Widerruf und Rotation | Freigabezustände mit gemocktem Repository ändern | Tokenzustand, Versionsprüfung und neutrale Fehlercodes; Service-Unit-Tests |
| Datumsgrenzen in `Europe/Berlin` | Clock-Mock vor/nach Dezember- und Türchentaggrenzen | Countdown, Öffnungsfreigabe und Schließfrist entsprechen dem Kalenderjahr; Service-/Mapper-Unit-Tests |
| Öffnung und wiederholte PUTs | Status-/Versionskombinationen über Service-Mocks abbilden | OPENED idempotent ohne Versionszuwachs; veraltete Version immer 409; Service-Unit-Test |
| Abschluss | EMPTY/FILLED/OPENED-Verteilungen und Clock-Mock kombinieren | Abgeleiteter Abschluss, Sperren und erfolgreiche auslösende Mutation; Service-Unit-Test |
| Versionskonflikte | Zwei Aufrufe mit derselben erwarteten Version simulieren | Nur erfolgreiche Mutation verändert Version; stale requests erhalten 409; Service-Unit-Test |
| Ownership | Eigentümer und fremder Nutzer lesen/verändern Ressourcen | Eigene Kalender sichtbar, Fremdzugriff 403; Service-Unit-Test mit Repository-Mock |
| Shared-Link-Fehler | Ungültigen oder widerrufenen Token simulieren | Einheitlicher neutraler 404 ohne Daten; Service-Unit-Test |
| Kalenderlöschung | Gemockte Cascade-/Accountlösch-Responses | Zugehörige Daten werden im Domänenablauf entfernt; Service-Unit-Test |
| Migration | TypeORM `QueryRunner` mocken | Up-/Down-Anweisungen, Constraints und FK-Kaskade werden korrekt angefragt; Migration-Unit-Test |
| Formulare und UI-Zustände | Angular Forms mit Repository-Mock bedienen | Pflichtfelder, Grenzen, Loading/Success/Error/Empty und Tastaturfokus; Komponenten-Unit-Test |

## 3. Review der Architektur

- Repository-Konventionen: Angular Standalone/Signals, TailwindCSS, NestJS-Module, DTO/Domain/Entity-Mapper, TypeORM-Repositories, Firebase/minFactory-Guards, Swagger-Generierung.
- Fachliche Vollständigkeit: Jahreswahl, 24 Türen, 0–10 Blöcke, Uhrzeit, Freigabe, Bearbeitbarkeit, `ABGESCHLOSSEN`, löschen, keine Sondervorschau; Regeln als isolierte Service-Unit-Tests mit festen Eingaben und Mocks abbilden.
- Sicherheit: Token-Entropie, Widerruf/Rotation, Caching/Referrer/Logs, Sanitizing, Fremdeigentum und Kontolöschung durch gezielte Unit-Tests der jeweiligen Fachlogik abdecken.
- Transaktionen: Versions- und Abschlussregeln über Unit-Tests mit gemocktem TypeORM-Manager prüfen; keine echten Datenbank- oder Race-Testläufe voraussetzen.
- Fehlervertrag: 409 für Versionen/fachliche Regeln, 403 für Rechte, 400 für Formfehler, 404 für Shared Token, getrennte maschinenlesbare Codes.
- Keine vorgeschriebene unnötige Klassenstruktur und keine neuen Frameworks.

## 4. Konkret vor Umsetzung zu entscheiden

Die vertragliche HTTP-Semantik ist verbindlich; kleinere umsetzungsabhängige Details bleiben im späteren Implementierungsticket zu bestätigen: tatsächliche Ersteller-Routen/-DTO-Bezeichner, physische Block-Payload-Abbildung, genaue Rate-Limits, Rollout/DB_SYNCHRONIZE-Strategie und konkrete Account-Löschwiederaufnahme. Sie dürfen die beschriebenen Fachregeln nicht ändern. Dokumentations-PR implementiert keine Funktionalität.
