# minFactory – Agent Instructions

## Allgemein

- Auf Deutsch antworten; Code, Kommentare und Bezeichner auf Englisch. Kurz, präzise, ergebnisorientiert.
- Rolle: Senior Fullstack Developer. Monorepo: `client/` (Angular), `server/` (NestJS).
- Vor Änderungen aktuellen Code, relevante Dokumentation und `agents-memory.md` prüfen; Code und geltende Anweisungen haben Vorrang vor Memory.
- Bestehende Struktur, Naming, Patterns und Grenzen wahren. Einfach, lesbar, wartbar und für Junior-Developer verständlich implementieren; kein Overengineering.
- Kleine Aufgaben (max. 2 Dateien, keine neuen Datenstrukturen, API-Änderungen oder Dependencies) direkt umsetzen. Nur angeforderten Umfang ändern; keine beiläufigen Refactorings oder Änderungen an generiertem Code.

## Architektur und Datenfluss

- Clean Architecture, Feature-Isolation und Abhängigkeitsgrenzen einhalten; Cross-Feature-Abhängigkeiten nur fachlich begründet.
- Domain Objects: Aggregate Roots und Value Objects. Fachliche Regeln, Invarianten und Zustandsübergänge möglichst dort kapseln; unabhängig von Angular, NestJS, HTTP, Socket.IO und Persistenz.
- Services orchestrieren Anwendungsfälle, Domain Objects und Repositories. Repositories kapseln externe Systeme und Datenzugriffe. Controller/Gateways bleiben schlanke Transportadapter; Components verantworten Darstellung und Benutzerinteraktion.
- Fachlichen Zustand nicht parallel in mehreren Schichten pflegen. Kein dupliziertes Business- oder Mapping-Verhalten. Abstraktionen nur für tatsächlich benötigte Verantwortlichkeiten.
- Transport- und Persistenzmodelle nicht als Domain Objects verwenden. Modellgrenzen: Backend `DTO ↔ Domain ↔ Entity`; Frontend `DTO ↔ Domain → ViewModel` (ViewModels optional). Modellkonvertierung in beide Richtungen ist zulässig; fachliche Zustandsänderungen erfolgen über explizite Anwendungsfälle, nicht durch bidirektionale UI-State-Synchronisation.

### Mapper

- Mapper nach Quellmodell/Verantwortlichkeit trennen: `DtoMapper` (DTO → Domain), `DomainMapper` (Domain → DTO/Entity/ViewModel/Payload/Event), `EntityMapper` (Entity → Domain). Im Frontend ohne Persistenz keine künstlichen Entities/EntityMapper.
- Mapper führen nur Konvertierungen aus; keine Geschäftsregeln, Zeit-/Zustandsentscheidungen, Seiteneffekte oder Datenzugriffe. Eingehende Teil-DTOs nicht mit erfundenen Domain-Daten auffüllen.
- Zusammengehörige Konvertierungen gleicher Richtung dürfen gebündelt werden; keine monolithischen Feature-Mapper. Nur notwendige Mapper; triviale Weitergaben nicht abstrahieren. Kein Mapping in Controllern, Services, Repositories oder Components duplizieren.
- Referenzen: `server/src/features/{minrps,minpoker}/mapper/`, `client/src/app/features/{minrps,minpoker}/mapper/`.

## Coding Conventions

- Bestehende Benennung und Dateistruktur fortführen; pro Quelldatei genau eine exportierte Klasse oder ein Enum.
- Geschweifte Klammern für `if`/`else`/Schleifen immer verwenden. Sichtbarkeit/Mutabilität restriktiv halten.
- Vorhandene Typen, Enums, Utilities, Fehler- und Logging-Patterns wiederverwenden; keine unnötigen Wrapper, Helper, Interfaces oder Services. Fehler nicht unbegründet unterdrücken.

## Frontend (Angular)

- Standalone Components, Feature-Struktur (Pages, Components, Services, Repositories, Models, Mapper, Mocks), Lazy-Routes, Feature-Root mit separatem HTML und Router-Outlet nach bestehendem Muster.
- Domain Models sind bei fachlicher Logik der zentrale Feature-State. Veränderbaren State bevorzugt im Service mit privaten `WritableSignal`s halten; öffentlich readonly Signals/`computed()` bereitstellen. Immutable Updates verwenden, um Signal-Änderungen zuverlässig sichtbar zu machen.
- Domain → ViewModel im Mapper; mittels `computed()` reaktiv ableiten. Einfache rein visuelle Werte direkt per `computed()` in der Component; ViewModels nur bei eigenem Darstellungsbedarf. Abgeleitete Werte nicht zusätzlich veränderbar speichern.
- Komponenten verändern Domain-/ViewModel-State nicht direkt. Benutzeraktionen über benannte Service-Methoden → Domain-Regeln → aktualisierten State; keine ViewModel → Domain-Rückkonvertierung. Formularentwürfe bleiben in Reactive Forms bis zur expliziten Aktion.
- API-Aufrufe über Feature-Repositories; generierte OpenAPI-Services nicht direkt aus Components aufrufen, wenn Repository vorhanden. Observables der generierten Services verwenden, bei Bedarf am Verbrauchsort in Signals umwandeln. DTOs an der Transportgrenze in Domain Models überführen, statt sie als Feature-State zu verwenden.
- Vorhandene Guards (`CanDeactivate` bei schützenswertem Zustand) und Reactive-Forms-Patterns nutzen.
- UI: neue Styles mit TailwindCSS statt SCSS; bestehende Shared Components (`min-`) und Patterns bevorzugen, neue nur bei tatsächlicher Wiederverwendung. Mobile First, WCAG 2.2 AA, Tastatur/Kontrast/ARIA, Loading/Success/Error/Empty States.

## Backend (NestJS)

- Constructor Injection; bestehende Module-, Controller-, Service-, Repository-, DTO- und Entity-Patterns. Feature-Provider im zuständigen Modul registrieren.
- REST, Socket.IO, Swagger/OpenAPI und vorhandene Fehlerkonventionen konsistent nutzen. DTO-Eingaben validieren; Fachvalidierung/Zustandsübergänge in Domain Objects statt Transportadaptern.
- Authentifizierung und Autorisierung serverseitig durchsetzen; Policies/Guards/Decorators wiederverwenden. Persistenz über Repositories; TypeORM-Entities strikt von Domain Objects trennen. Request-ID und datensparsames Logging nach bestehendem Pattern.

## Multiplayer

- Socket.IO über Feature-Repositories, Services und Gateways kapseln; Commands, Events und Transportmodelle von Domain Models trennen; eingehende Events mappen.
- Socket-Handler nur einmal registrieren, bei Disconnect/Destroy entfernen; für An-/Abmeldung identische Handler-Referenzen verwenden und Lifecycle beachten.
- Übermittelte Spieleridentitäten serverseitig gegen authentifizierte Socket-Identität prüfen, Multiplayer-Zustandsänderungen serverseitig validieren; bestehende Room-/Player-ID-Systeme verwenden.

## OpenAPI

- API aus Swagger/OpenAPI generieren; weder `client/openapi.json` noch `client/src/app/core/generated/` manuell bearbeiten.
- Bei API-Änderungen: (1) Backend-Dekoratoren aktualisieren, (2) Spezifikation vom laufenden Server unter `http://localhost:3000/openapi-json/` beziehen, (3) nach `client/openapi.json` übernehmen, (4) in `client/` `npm run api`, (5) Aufrufstellen/Tests aktualisieren. Wenn nicht möglich, dokumentieren; keine generierten Dateien von Hand nachbilden.
- Bestehende Operation-IDs, API-Decorators, Request-IDs und Fehlerantworten beibehalten.

## Tests und Verifikation

- Geänderte/neue Logik mit Unit-Tests abdecken: Frontend Jasmine/Karma/TestBed, Backend Jest/ggf. NestJS TestingModule. Bestehende zentrale Mocks im `mocks/`-Verzeichnis verwenden, keine Inline-Mocks; Spies/Mock-State zwischen Tests zurücksetzen.
- Tests mit `describe()`/`it()`, methodenbezogen `describe('methodName()')`; Erfolgs-, Fehler- und Grenzfälle sowie Domain-Invarianten/Übergänge prüfen. Socket-Registrierung/-Abmeldung und Lifecycle testen; Zeit/Zufall deterministisch; keine Flaky Tests.
- Keine zusätzlichen API-, Integrations-, Regressions- oder E2E-Tests ohne ausdrückliche Anforderung.
- Nach Änderungen betroffene Unit-Tests (`npm run test:ci` in `client/` bzw. `server/`), Linter und Prettier für geänderte Dateien ausführen; bei größeren Änderungen Build. `npm run check` führt `format:all` aus und verändert Dateien.
- Fehlgeschlagene Prüfungen beheben und erneut ausführen. Nicht ausführbare/nicht bestandene Prüfungen transparent nennen; nie erfolgreiche Verifikation behaupten ohne Durchführung.
- Abschluss: Anforderungen, Architekturgrenzen, Umfang, generierte Dateien, Tests, Lint, unnötige Abstraktionen und unbeabsichtigte Änderungen prüfen.

## Issues und Pull Requests

- Umsetzung am Issue und relevanter technischer Dokumentation ausrichten. Nach verifizierter Umsetzung die zutreffenden `Umsetzung`-Checkboxen selbstständig abhaken; bereits erledigte erhalten, ungeprüfte und CI/CD-Punkte offen lassen. Akzeptanzkriterien und sonstige Metadaten nicht versehentlich verändern. Issue-Pflege gehört zum Auftrag.
- Bei PR-Review alle offenen Threads prüfen, berechtigte Punkte umsetzen, testen und Änderungen veröffentlichen. Nur behobene oder nachvollziehbar geklärte Threads als `Resolved` markieren; bei Bedarf begründen/antworten. Ungeklärte offen lassen. Thread-Pflege gehört zum Auftrag.

## Agent Memory

- Gemeinsames Projektgedächtnis: `./AGENTS_MEMORY.md`; bei Code-, Test-, Architektur- und Workflow-Aufgaben zu Beginn prüfen, gegen aktuellen Code abgleichen.
- Nur belegte, nicht offensichtliche, langfristig nützliche Patterns/Erkenntnisse selbstständig ergänzen. Veraltetes korrigieren, Ähnliches bündeln; keine bereits in `AGENTS.md` geregelten Vorgaben duplizieren, keine temporären Protokolle oder Vermutungen. Memory nur bei begründetem Erkenntnisgewinn ändern.
