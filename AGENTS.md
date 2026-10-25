# minFactory Codex Instructions

## Kommunikation

- Antworte auf Deutsch.
- Code, Kommentare, Variablennamen und technische Bezeichner bleiben Englisch.
- Antworte kurz, präzise und ergebnisorientiert.

## Projekt

Monorepo:

- `client/`: Angular
- `server/`: NestJS

## Rolle

Senior Fullstack Developer.

## Grundregeln

- Vor Änderungen den relevanten aktuellen Code prüfen.
- Bestehende Projektstruktur, Naming Conventions und Patterns fortführen.
- Einfache, lesbare und wartbare Lösungen bevorzugen.
- Kein Overengineering.
- Keine neuen Patterns oder Abstraktionen ohne klaren Mehrwert.
- Implementierungen sollen für Junior-Developer nachvollziehbar sein.
- Aufgaben, die maximal 2 Dateien betreffen und keine neue Datenstruktur, keine API-Änderung und keine neue Abhängigkeit erfordern, direkt umsetzen.
- Änderungen auf den angeforderten Umfang begrenzen.
- Keine unnötigen Refactorings benachbarter Bereiche durchführen.
- Keine Änderungen an generiertem Code.

## Architektur

- Bestehende Clean Architecture und Feature-Isolation beibehalten.
- Bestehende Verantwortlichkeiten und Abhängigkeitsgrenzen respektieren.
- Domain Objects bestehen aus Aggregate Roots und Value Objects.
- Fachliche Regeln, Invarianten und Zustandsübergänge möglichst in Domain Objects kapseln.
- Domain Objects dürfen keine Abhängigkeiten zu Angular, NestJS, HTTP, Socket.IO oder Persistenztechnologien besitzen.
- Controller und Gateways sind Transportadapter und enthalten keine unnötige Business-Logik.
- Services orchestrieren Anwendungsfälle und koordinieren Domain Objects und Repositories.
- Repositories kapseln externe Systeme und Datenzugriffe.
- REST-Controller sprechen an ihren API-Grenzen ausschließlich Request- und Response-DTOs; ein injizierter Authentifizierungs-Principal ist davon ausgenommen.
- Services koordinieren DTO-, Domain- und Entity-Modelle über die zuständigen Mapper und übergeben an Repositories keine DTOs oder Domain Objects.
- Repositories kennen ausschließlich Persistenz-Entities und notwendige skalare Suchparameter. Schreiboperationen erhalten Entities und geben bei zustandsändernden Ergebnissen die gespeicherten Entities zurück.
- Komponenten verantworten Darstellung und Benutzerinteraktion.
- Keine Business-Logik oder Mapping-Logik zwischen mehreren Schichten duplizieren.
- Neue Abstraktionen nur einführen, wenn sie eine tatsächlich benötigte Verantwortung trennen.
- Cross-Feature-Abhängigkeiten vermeiden, sofern keine fachliche Notwendigkeit besteht.

### Mapping

- Mapping bei neuen oder wesentlich angepassten Konvertierungen über getrennte Mapper-Klassen nach Quellmodell und Verantwortlichkeit umsetzen.
- Keine allumfassende Mapper-Klasse pro Feature erstellen.
- Mapper-Richtungen:
  - **DtoMapper:** DTO → Domain.
  - **DomainMapper:** Domain → DTO und Domain → Entity.
  - **EntityMapper:** Entity → Domain.
- Weitere ausgehende Konvertierungen, beispielsweise ViewModels, Payloads oder Events, bleiben nach Quellmodell zugeordnet.
- Mapper dürfen mehrere fachlich zusammengehörige Konvertierungen derselben Richtung bündeln, müssen aber überschaubar bleiben.
- Nur tatsächlich benötigte Mapper anlegen.
- Triviale Durchreichungen nicht unnötig abstrahieren.
- Mapping-Logik nicht in Controllern, Services, Repositories oder Angular-Komponenten duplizieren.
- Bestehende Clean-Architecture-, Feature- und Repository-Grenzen wahren.
- Diese Richtungsregel gilt für NestJS und analog für Angular-Modellgrenzen.
- Ohne Persistenz-Entities keinen künstlichen Entity-Layer oder EntityMapper im Frontend anlegen.

Referenzimplementierungen:

- `server/src/features/minrps/mapper/`
- `server/src/features/minpoker/mapper/`
- `client/src/app/features/minrps/mapper/`
- `client/src/app/features/minpoker/mapper/`

## Coding Conventions

- Bestehende Naming Conventions und Dateistrukturen übernehmen.
- Code und Bezeichner in Englisch schreiben.
- Für Kontrollflussanweisungen wie `if`, `else` und Schleifen immer geschweifte Klammern verwenden, auch bei einzeiligen Anweisungen.
- Pro Quelldatei genau eine Klasse oder ein Enum exportieren.
- Klassen und Enums in eigenen, passend benannten Dateien ablegen.
- Sichtbarkeit und Veränderbarkeit möglichst restriktiv halten.
- Bestehende Typen, Enums und Utilities wiederverwenden, statt parallele Definitionen anzulegen.
- Keine unnötigen Wrapper, Helper, Interfaces oder zusätzlichen Services erstellen.
- Bestehende Fehlerbehandlung und Logging-Konventionen fortführen.
- Fehler nicht ohne fachliche Begründung unterdrücken.

## Frontend

- Angular Standalone Components verwenden.
- Bestehende Feature-Struktur mit Pages, Components, Services, Repositories, Models, Mappern und Mocks fortführen.
- Angular Signals für lokalen und geteilten Anwendungszustand bevorzugen.
- Veränderbaren Feature-State möglichst in Services kapseln.
- Interne WritableSignals und öffentliche readonly Signals beziehungsweise computed Signals verwenden, wenn dadurch Zustandsänderungen kontrolliert werden können.
- Abgeleitete Werte über `computed()` statt über redundanten veränderbaren State bereitstellen.
- Bei generierten OpenAPI-Services RxJS Observables verwenden und sie bei Bedarf an der Verbrauchsstelle in Signals umwandeln.
- API-Zugriffe über bestehende Repositories kapseln.
- Angular-Komponenten sollen keine generierten API-Services direkt verwenden, wenn ein passendes Feature-Repository existiert.
- Für Formulare die bestehenden Angular-Reactive-Forms-Patterns fortführen.
- Feature-Pages nach bestehenden Routing-Patterns lazy laden.
- Bei laufenden Spielen oder schützenswerten Zuständen vorhandene CanDeactivate-Patterns berücksichtigen.
- Feature-Root-Components mit separaten HTML-Templates und Router-Outlets entsprechend bestehenden Patterns umsetzen.

### UI und Styling

- Für neue Styles TailwindCSS statt SCSS verwenden.
- Bestehende Komponenten und Styles im vorhandenen Muster fortführen.
- Bestehende Shared Components bevorzugen.
- Shared Components verwenden das Prefix `min-`.
- Wenn ein wiederverwendbares UI-Element fehlt, eine Shared Component nur dann ergänzen, wenn tatsächlicher Wiederverwendungsbedarf besteht.
- Keine unnötige Duplizierung wiederverwendbarer UI-Elemente.
- Mobile First entwickeln.
- WCAG 2.2 Level AA berücksichtigen.
- Tastaturbedienung, Kontrast und geeignete ARIA-Attribute beachten.
- Loading, Success, Error und Empty States berücksichtigen.

## Backend

- NestJS mit Constructor Injection verwenden.
- Bestehende Module-, Controller-, Service-, Repository-, DTO- und Entity-Patterns fortführen.
- Feature-spezifische Provider im zuständigen NestJS-Modul registrieren.
- REST APIs, Socket.IO und Swagger/OpenAPI konsistent mit dem bestehenden Code verwenden.
- Controller und Gateways möglichst schlank halten.
- Fachliche Validierung und Zustandsübergänge nicht unnötig in Transportadapter verlagern.
- DTO-Validierung und bestehende Fehlerkonventionen verwenden.
- Authentifizierung und Autorisierung serverseitig durchsetzen.
- Bestehende Policies, Guards und Decorators wiederverwenden.
- Persistenzzugriffe über Repositories kapseln.
- TypeORM-Entities nicht mit Domain Objects gleichsetzen.
- Bestehende Request-ID- und Logging-Konventionen fortführen.

## Multiplayer

- Socket.IO-Kommunikation über bestehende Feature-Repositories, Services und Gateways kapseln.
- Commands, Events und Transportmodelle von Domain Models trennen.
- Eingehende Events über die vorgesehenen Mapper in Domain Models überführen.
- Socket-Event-Handler nicht mehrfach registrieren.
- Beim Disconnect beziehungsweise Destroy registrierte Event-Handler zuverlässig entfernen.
- Für die Registrierung und Entfernung dieselben Handler-Referenzen verwenden.
- Socket-Verbindungen und Listener entsprechend dem Lifecycle der betreffenden Features verwalten.
- Clientseitig übermittelte Spieleridentitäten nicht ungeprüft vertrauen.
- Spieleridentitäten serverseitig gegen die authentifizierte Socket-Identität prüfen.
- Multiplayer-Zustandsänderungen serverseitig validieren.
- Bestehende Room- und Player-ID-Repositories beziehungsweise Systeme verwenden.

## OpenAPI

- API-Services werden aus `client/openapi.json` generiert.
- Keine manuellen Änderungen in `client/src/app/core/generated/`.
- `client/openapi.json` nicht manuell bearbeiten.
- Wenn sich die API ändert:
  1. Swagger/OpenAPI-Dekoratoren im Backend aktualisieren.
  2. Die OpenAPI-Spezifikation vom laufenden NestJS-Server unter `http://localhost:3000/openapi-json/` generieren.
  3. Die generierte Spezifikation nach `client/openapi.json` übernehmen.
  4. Im Verzeichnis `client/` den Befehl `npm run api` ausführen.
  5. Betroffene Aufrufstellen und Tests aktualisieren.
- Wenn die Generierung nicht möglich ist, dies ausdrücklich dokumentieren und keine generierten Dateien manuell nachbilden.
- Bestehende Swagger-Operation-IDs, gemeinsame API-Decorators, Request-IDs und Fehlerantworten konsistent fortführen.

## Testing

- Für neue oder geänderte Logik Unit-Tests ergänzen.
- Bestehende Testmethodik des jeweiligen Projekts verwenden:
  - Frontend: Jasmine, Karma und Angular TestBed.
  - Backend: Jest und bei Bedarf NestJS TestingModule.
- Bestehende Mock-Strukturen verwenden.
- Keine Inline-Mocks; bestehende zentralisierte Test-Doubles bevorzugen.
- Neue wiederverwendbare Mocks im passenden `mocks/`-Verzeichnis ablegen.
- Mock-Zustände und Spies zwischen Tests zurücksetzen.
- Tests nachvollziehbar mit `describe()` und `it()` strukturieren.
- Methodenbezogene Tests unter `describe('methodName()')` gruppieren.
- Erfolgsfälle, Fehlerfälle und relevante Grenzfälle testen.
- Zustandsübergänge und fachliche Invarianten gezielt prüfen.
- Bei Socket-Logik Registrierung, Deregistrierung und wiederholte Lifecycle-Aufrufe berücksichtigen.
- Zufalls- oder zeitabhängiges Verhalten für deterministische Tests kontrollieren.
- Flaky Tests und unnötige Abhängigkeiten von Ausführungsreihenfolgen vermeiden.
- Keine zusätzlichen API-, Integrations-, Regressions- oder E2E-Tests ohne ausdrückliche Anforderung einführen.

### Verifikation

- Nach Änderungen die betroffenen Unit-Tests ausführen.
- Die bestehenden npm-Skripte verwenden:
  - Client: `npm run test:ci` im Verzeichnis `client/`.
  - Server: `npm run test:ci` im Verzeichnis `server/`.
- Den Linter für geänderte Bereiche ausführen.
- Geänderte Dateien entsprechend der bestehenden Prettier-Konfiguration formatieren.
- `npm run check` führt auch `format:all` aus und kann Dateien verändern; den Befehl nicht als reine Read-only-Prüfung behandeln.
- Bei umfangreicheren Änderungen zusätzlich den betroffenen Build prüfen.
- Fehlgeschlagene Tests oder Lint-Prüfungen beheben und erneut ausführen.
- Falls Prüfungen nicht ausführbar sind, dies ausdrücklich angeben.
- Keine erfolgreiche Verifikation behaupten, wenn sie nicht durchgeführt wurde.

## Abschlussprüfung

Vor Abschluss einer Implementierung prüfen:

- Die Änderung erfüllt die angeforderten Anforderungen.
- Bestehende Architektur- und Feature-Grenzen bleiben gewahrt.
- Es wurden keine unnötigen Abstraktionen eingeführt.
- Generierter Code wurde nicht manuell verändert.
- Neue oder geänderte Logik ist angemessen durch Unit-Tests abgedeckt.
- Betroffene Tests und Lint-Prüfungen wurden ausgeführt.
- Es gibt keine unbeabsichtigten Änderungen außerhalb des Auftrags.
- Nicht ausgeführte Prüfungen und verbleibende Risiken werden transparent benannt.

## GitHub Issues

- Die Umsetzung an den Anforderungen und Akzeptanzkriterien des Issues ausrichten.
- Bestehende relevante technische Dokumentation berücksichtigen.
- Nach abgeschlossener Implementierung das GitHub-Issue eigenständig aktualisieren.
- Im Abschnitt `Umsetzung` alle tatsächlich abgeschlossenen und verifizierten Checkboxen von `[ ]` auf `[x]` setzen.
- Bereits abgehakte Punkte unverändert lassen.
- Nicht abgeschlossene oder nicht verifizierte Punkte offen lassen.
- Akzeptanzkriterien für die Prüfung durch den Auftraggeber unverändert lassen.
- Nicht verifizierte CI/CD-Prüfungen offen lassen.
- Keine nicht durchgeführten Arbeiten als abgeschlossen kennzeichnen.
- Andere Inhalte und Metadaten des Issues nicht unbeabsichtigt verändern.
- Die Aktualisierung des Issues ist Bestandteil des Implementierungsauftrags und benötigt keine gesonderte Aufforderung.

## GitHub Pull Requests

- Bei der Aufforderung, PR-Review-Kommentare abzuarbeiten, alle offenen Review-Threads des Pull Requests prüfen.
- Relevante Kommentare anhand des aktuellen Codes bewerten und erforderliche Änderungen umsetzen.
- Betroffene Tests und Prüfungen ausführen.
- Nach erfolgreicher Umsetzung und Veröffentlichung der Änderungen die zugehörigen Review-Threads eigenständig als `Resolved` markieren.
- Kommentare nur dann resolven, wenn die angesprochenen Probleme tatsächlich behoben oder nachvollziehbar geklärt wurden.
- Bei fachlich unzutreffenden oder bereits erledigten Kommentaren die Entscheidung begründen und den Thread anschließend resolven.
- Nicht behobene oder ungeklärte Review-Threads offen lassen.
- Auf Review-Kommentare bei Bedarf antworten, um die vorgenommenen Änderungen oder Entscheidungen zu dokumentieren.
- Das Resolven der bearbeiteten Review-Threads ist Bestandteil des Review-Auftrags und benötigt keine gesonderte Aufforderung.

## Agent Memory

Das gemeinsame Projektgedächtnis für Codex und Copilot liegt in `./agents-memory.md`.

Es bewahrt wiederkehrende Repository-Patterns, konkrete Implementierungsreferenzen und langfristig nützliche Erkenntnisse.

### Zu Aufgabenbeginn lesen

- Bei Aufgaben zu Code, Tests, Architektur oder Projektabläufen das Projektgedächtnis prüfen.
- Relevante Einträge mit dem aktuellen Repository-Code abgleichen.
- Aktueller Code und geltende Projektanweisungen haben Vorrang vor dem Gedächtnis.

### Beim Arbeiten beobachten

- Auf wiederkehrende Patterns und Coding-Konventionen achten.
- Nur Erkenntnisse übernehmen, die durch aktuellen Code, Tests oder mehrere passende Beispiele bestätigt sind.
- Einmalige Implementierungsentscheidungen nicht automatisch als allgemeine Konvention interpretieren.

### Selbstständig lernen

- Neue, nicht offensichtliche und langfristig nützliche Erkenntnisse eigenständig in `agents-memory.md` ergänzen.
- Keine ausdrückliche Bestätigung für eine begründete Memory-Aktualisierung einholen.
- Nur tatsächlich belegte Erkenntnisse speichern.

### Gedächtnis pflegen

- Veraltete oder widersprüchliche Einträge korrigieren oder entfernen.
- Inhaltlich ähnliche Einträge zusammenfassen.
- Keine Regeln duplizieren, die bereits eindeutig in `AGENTS.md` stehen.
- Keine Aufgabenprotokolle, temporären Details oder Vermutungen speichern.
- Einträge knapp, verständlich und möglichst unabhängig vom ursprünglichen Kontext formulieren.

`AGENTS_MEMORY.md` nur ändern, wenn ein belegter, dauerhaft nützlicher Erkenntnisgewinn oder eine notwendige Korrektur vorliegt.
