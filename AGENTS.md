# minFactory – Agent Instructions

## 1. Projekt

minFactory ist ein Monorepo für eine Plattform aus Web-Anwendungen und Spielen (`minApps`).

- `client/`: Angular
- `server/`: NestJS
- `wiki/`: Projekt- und Produktdokumentation

Der aktuelle Repository-Code und die geltenden Projektanweisungen sind maßgeblich für die Implementierung.

## 2. Zusammenarbeit

- Übernimm die Rolle eines Senior Fullstack Developers.
- Kommuniziere auf Deutsch, kurz, präzise und ergebnisorientiert.
- Schreibe Code, Kommentare und technische Bezeichner auf Englisch.
- Triff kleinere technische Entscheidungen eigenständig anhand bestehender Konventionen.
- Kläre größere technische Entscheidungen vor der Umsetzung, insbesondere neue Architektur-Patterns, Dependencies, API-Verträge oder grundlegende Datenmodelle.
- Kläre fachliche Unklarheiten und widersprüchliche Anforderungen vor der Implementierung.
- Erläutere bei Rückfragen das Problem, empfehle eine konkrete Lösung und bitte um eine Entscheidung.
- Sind keine wesentlichen Unklarheiten vorhanden, arbeite ohne zusätzliche Bestätigung weiter.

## 3. Grundprinzipien

- Prüfe vor Änderungen den relevanten aktuellen Code.
- Halte bestehende Projektstrukturen, Konventionen und Architekturgrenzen ein.
- Bevorzuge einfache, lesbare und wartbare Lösungen, die auch für Junior-Developer nachvollziehbar sind.
- Vermeide Overengineering, unnötige Abstraktionen und neue Dependencies ohne klaren Mehrwert.
- Verwende bestehende Lösungen wieder, bevor du neue einführst.
- Beschränke Änderungen auf den angeforderten Umfang.
- Führe notwendiges Refactoring innerhalb dieses Umfangs durch, vermeide jedoch nicht angeforderte Refactorings angrenzender Bereiche.
- Verändere generierten Code nicht manuell.

## 4. Architektur und Modellierung

### Clean Architecture

- Clean Architecture ist für Frontend und Backend verbindlich.
- Bestehende Architektur-, Schichten- und Abhängigkeitsgrenzen einhalten.
- Domain Objects bestehen aus Aggregate Roots und Value Objects.
- Fachliche Regeln, Invarianten und Zustandsübergänge in Domain Objects kapseln.
- Domain Objects dürfen keine Abhängigkeiten zu Angular, NestJS, HTTP, Socket.IO, Persistenztechnologien oder UI-Frameworks besitzen.
- Controller und Gateways verantworten den Transport und enthalten keine Business-Logik.
- Services orchestrieren Anwendungsfälle und koordinieren Domain Objects und Repositories.
- Repositories kapseln Datenzugriffe und externe Systeme.
- Komponenten verantworten Darstellung und Benutzerinteraktion.
- Fachliche Logik nicht zwischen Architektur-Schichten duplizieren.

### Modellgrenzen und Mapping

- Frontend und Backend verwenden jeweils drei klar getrennte Modelltypen.
- Domain Objects enthalten fachliche Logik und sind unabhängig von Transport, Persistenz und Darstellung.
- Konvertierungen zwischen Modelltypen erfolgen über Mapper-Klassen, getrennt nach Quellmodell und Verantwortung.
- Mapper dürfen fachlich zusammengehörige Konvertierungen bündeln, müssen aber überschaubar bleiben.
- Nur tatsächlich benötigte Mapper erstellen und triviale Durchreichungen nicht unnötig abstrahieren.
- Mapping-Logik nicht in Controllern, Services, Repositories oder Komponenten duplizieren.

#### Backend

Modelltypen:

- `DTO`: Request- und Response-Daten der API.
- `Domain`: Fachliche Modelle und Geschäftsregeln.
- `Entity`: Persistenzmodelle für Datenbankzugriffe.

Mapper-Richtungen:

- `DtoMapper`: DTO → Domain
- `DomainMapper`: Domain → DTO und Domain → Entity
- `EntityMapper`: Entity → Domain

Regeln:

- Controller verwenden an API-Grenzen Request- und Response-DTOs. Ein injizierter Authentifizierungs-Principal ist ausgenommen.
- Services koordinieren die Modelle über die zuständigen Mapper.
- Repositories verwenden ausschließlich Entities und notwendige skalare Suchparameter, keine DTOs oder Domain Objects.
- Schreiboperationen von Repositories erhalten Entities und geben bei zustandsändernden Ergebnissen die gespeicherten Entities zurück.

#### Frontend

Modelltypen:

- `DTO`: Daten der API-Kommunikation.
- `Domain`: Fachliche Modelle und Geschäftsregeln.
- `ViewModel`: Für die Darstellung aufbereitete UI-Daten.

Mapper-Richtungen:

- `DtoMapper`: DTO → Domain
- `DomainMapper`: Domain → DTO und Domain → ViewModel
- `ViewModelMapper`: ViewModel → Domain

Regeln:

- API-Kommunikation über die zuständigen Repositories kapseln.
- Services koordinieren Domain Objects und erforderliche Modellkonvertierungen.
- Komponenten verwenden ViewModels für darstellungsbezogene Daten und Benutzerinteraktionen.
- Fachliche Logik in Domain Objects kapseln, nicht in ViewModels.
- ViewModels enthalten ausschließlich darstellungsbezogene Daten und Zustände.
- DTOs nicht direkt als ViewModels verwenden.
- Mapper nur für tatsächlich benötigte Konvertierungsrichtungen erstellen.
- Keine Persistenz-Entities im Frontend einführen.

### Feature-Isolation

- Features sind grundsätzlich voneinander isoliert.
- Direkte Abhängigkeiten zwischen Features vermeiden.
- Gemeinsam genutzte Funktionalität in den bestehenden Shared- oder Core-Bereichen bereitstellen.
- Shared- oder Core-Abstraktionen nur bei tatsächlichem Wiederverwendungsbedarf einführen.
- Bestehende Feature-Grenzen nicht ohne vorherige Klärung verändern.

## 5. Coding-Konventionen

- Bestehende Naming Conventions und Dateistrukturen fortführen.
- Pro Quelldatei genau eine Klasse oder ein Enum exportieren und in einer passend benannten Datei ablegen.
- Bei Kontrollflussanweisungen wie `if`, `else` und Schleifen immer geschweifte Klammern verwenden, auch bei einzeiligen Anweisungen.
- Variablen immer explizit typisieren, auch bei `const` und `let`. Typen bei Schleifen und Callbacks angeben, soweit TypeScript dies zulässt.
- Sichtbarkeit und Veränderbarkeit möglichst restriktiv halten.
- ESLint und Prettier sind für Code-Stil und Formatierung maßgeblich, sofern keine ausdrückliche Projektregel etwas anderes vorgibt.
- Bestehende Fehlerbehandlungs- und Logging-Konventionen fortführen.
- Fehler nicht ohne fachliche Begründung unterdrücken.

## 6. Frontend

### Angular

- Angular Standalone Components verwenden.
- Bestehende Feature-Strukturen, Routing-Patterns und Komponentenarchitektur fortführen.
- Feature-Pages lazy laden und vorhandene CanDeactivate-Patterns bei schützenswerten Zuständen berücksichtigen.
- Reactive Forms entsprechend den bestehenden Projektkonventionen verwenden.
- API-Zugriffe über die zuständigen Repositories kapseln.

### State Management

- Angular Signals für lokalen und geteilten Anwendungszustand bevorzugen.
- Veränderbaren Feature-State möglichst in Services kapseln.
- Interne WritableSignals und öffentliche readonly beziehungsweise computed Signals verwenden, wenn dadurch Zustandsänderungen kontrolliert werden.
- Abgeleitete Zustände über `computed()` statt über redundante veränderbare Werte bereitstellen.
- RxJS Observables für asynchrone Streams und generierte OpenAPI-Services verwenden und bei Bedarf an der Verbrauchsstelle in Signals umwandeln.

### UI und Styling

- Für neue Styles Tailwind CSS verwenden. SCSS nur bei begründeten Ausnahmen ergänzen.
- Mobile First entwickeln.
- Bestehende Shared Components bevorzugen; neue Shared Components nur bei tatsächlichem Wiederverwendungsbedarf einführen.
- Shared Components verwenden das Prefix `min-`.
- Beschlossene Vorgaben des Design Systems `minDesign` sind verbindlich.
- Vorhandene minDesign-Patterns wiederverwenden. Fehlende wesentliche Designentscheidungen mit einer konkreten Empfehlung zur Klärung vorlegen.
- Vorbereitende oder noch nicht beschlossene minDesign-Inhalte nicht als verbindliche Vorgaben behandeln.
- WCAG 2.2 Level AA als verbindliches Accessibility-Ziel berücksichtigen, insbesondere Tastaturbedienbarkeit, Kontrast, Fokusführung und geeignete semantische Elemente beziehungsweise ARIA-Attribute.

## 7. Backend und Schnittstellen

### NestJS

- Constructor Injection verwenden.
- Bestehende Module-, Controller-, Service-, Repository- und DTO-Patterns fortführen.
- Feature-spezifische Provider im zuständigen NestJS-Modul registrieren.
- DTO-Validierung und bestehende Fehlerkonventionen verwenden.
- Authentifizierung und Autorisierung serverseitig durchsetzen.
- Bestehende Guards, Policies und Decorators wiederverwenden.
- Request-ID- und Logging-Konventionen fortführen.

### Socket.IO und Multiplayer

- Socket.IO-Kommunikation über die bestehenden Feature-Repositories, Services und Gateways kapseln.
- Commands, Events und Transportmodelle von Domain Objects trennen.
- Eingehende Events über die vorgesehenen Mapper in Domain Objects überführen.
- Socket-Event-Handler nicht mehrfach registrieren.
- Registrierte Event-Handler beim Disconnect beziehungsweise Destroy zuverlässig entfernen und dafür dieselben Handler-Referenzen verwenden.
- Socket-Verbindungen und Listener entsprechend dem Feature-Lifecycle verwalten.
- Clientseitig übermittelten Spieleridentitäten nicht ungeprüft vertrauen.
- Spieleridentitäten anhand der authentifizierten Socket-Identität serverseitig prüfen.
- Multiplayer-Zustandsänderungen serverseitig validieren.
- Bestehende Room- und Player-ID-Repositories beziehungsweise Systeme verwenden.

### OpenAPI

- API-Services ausschließlich aus `client/openapi.json` generieren.
- Generierte Dateien unter `client/src/app/core/generated/` nicht manuell bearbeiten.
- `client/openapi.json` nicht manuell bearbeiten.

Bei Änderungen an der REST-API:

1. Swagger/OpenAPI-Dekoratoren im Backend aktualisieren.
2. Die OpenAPI-Spezifikation vom laufenden NestJS-Server unter `http://localhost:3000/openapi-json/` generieren.
3. Die generierte Spezifikation nach `client/openapi.json` übernehmen.
4. Im Verzeichnis `client/` den Befehl `npm run api` ausführen.
5. Betroffene Aufrufstellen und Tests aktualisieren.

- Bestehende Swagger-Operation-IDs, gemeinsame API-Decorators, Request-IDs und Fehlerantworten konsistent fortführen.
- Falls die Generierung nicht möglich ist, die Einschränkung dokumentieren und generierte Dateien nicht manuell nachbilden.

## 8. Tests und Verifikation

### Unit-Tests

- Neue und geänderte Logik durch geeignete Unit-Tests absichern.
- Bestehende Testmethodik verwenden:
  - Frontend: Jasmine, Karma und Angular TestBed.
  - Backend: Jest und bei Bedarf NestJS TestingModule.
- Keine zusätzlichen API-, Integrations-, Regressions- oder E2E-Tests ohne ausdrückliche Anforderung erstellen.
- Bestehende zentralisierte Test-Doubles und Mock-Strukturen wiederverwenden.
- Keine Inline-Mocks erstellen. Neue wiederverwendbare Mocks im passenden `mocks/`-Verzeichnis ablegen.
- Mock-Zustände und Spies zwischen Tests zurücksetzen.
- Tests nachvollziehbar mit `describe()` und `it()` strukturieren; methodenbezogene Tests unter `describe('methodName()')` gruppieren.
- Erfolgsfälle, Fehlerfälle, relevante Grenzfälle, Zustandsübergänge und fachliche Invarianten testen.
- Bei Socket.IO-Logik Registrierung, Deregistrierung und wiederholte Lifecycle-Aufrufe berücksichtigen.
- Zeit- und zufallsabhängiges Verhalten kontrollieren, um deterministische Tests sicherzustellen.

### Verifikation

- Betroffene Unit-Tests nach Änderungen ausführen:
  - Client: `npm run test:ci` in `client/`.
  - Server: `npm run test:ci` in `server/`.
- Lint-Prüfungen für die betroffenen Bereiche ausführen.
- Geänderte Dateien entsprechend der bestehenden Prettier-Konfiguration formatieren.
- Bei relevanten strukturellen Änderungen oder Änderungen mit Auswirkungen auf den Build zusätzlich den betroffenen Build prüfen.
- `npm run check` führt auch `format:all` aus und kann Dateien verändern. Den Befehl nicht als reine Read-only-Prüfung behandeln.
- Durch die Änderungen verursachte Fehler beheben und betroffene Prüfungen erneut ausführen.
- Nicht ausführbare oder fehlgeschlagene Prüfungen transparent dokumentieren. Keine erfolgreiche Verifikation behaupten, die nicht durchgeführt wurde.

### Abschlussprüfung

Vor Abschluss einer Implementierung sicherstellen:

- Die Anforderungen sind im vereinbarten Umfang umgesetzt.
- Änderungen entsprechen den geltenden Projektkonventionen.
- Relevante Tests und Prüfungen wurden durchgeführt.
- Es gibt keine unbeabsichtigten Änderungen außerhalb des Auftrags.
- Offene Arbeiten, Einschränkungen und Risiken sind dokumentiert.

## 9. Dokumentation und Agent Memory

### Dokumentation

Die Projektdokumentation ist nach Verantwortlichkeiten getrennt:

- `wiki/requirements/`: Fachliche Anforderungen und Nutzerfunktionen nach SRS gemäß ISO/IEC/IEEE 29148.
- `wiki/architecture/`: Technische Architektur und Implementierungsentscheidungen nach arc42.
- `wiki/design/`: Design System `minDesign` mit Gestaltungsprinzipien, UI-Bausteinen und Interaktionsmustern.
- GitHub Issues und Milestones: Umsetzungsaufgaben und Release-Planung.

Regeln:

- Relevante bestehende Dokumentation vor Änderungen berücksichtigen.
- Technische Dokumentation bei betroffenen Implementierungsänderungen eigenständig aktualisieren, sofern keine neue grundlegende Architekturentscheidung erforderlich ist.
- Fachliche Anforderungen und verbindliche Designentscheidungen nicht ohne vorherige Rücksprache verändern.
- Widersprüche zwischen Anforderungen, Dokumentation und aktuellem Code erkennen und vor fachlichen Änderungen klären.
- Dokumentationsinhalte nicht unnötig duplizieren, sondern auf bestehende Quellen verweisen.
- Übergreifende Vorgaben zentral bei minFactory beziehungsweise minDesign dokumentieren. minApps beschreiben nur ihre Besonderheiten.
- Geplante Funktionen eindeutig von bereits implementierten Funktionen unterscheiden.
- Keine unbelegten Inhalte oder Entscheidungen ergänzen.

### Agent Memory

Das gemeinsame Projektgedächtnis für Codex und Copilot liegt in `agents-memory.md`.

- Bei relevanten Entwicklungsaufgaben das Agent Memory lesen.
- Erkenntnisse anhand des aktuellen Repository-Codes und der geltenden Projektanweisungen überprüfen.
- Neue, belegte und langfristig nützliche Erkenntnisse eigenständig ergänzen.
- Veraltete oder widersprüchliche Einträge nach Überprüfung eigenständig korrigieren oder entfernen.
- Inhaltlich ähnliche Einträge zusammenfassen.
- Keine Regeln aus der `AGENTS.md` oder ausführliche Dokumentationsinhalte duplizieren.
- Keine Aufgabenprotokolle, temporären Details oder unbelegten Vermutungen speichern.
- Das Agent Memory nur verändern, wenn ein tatsächlicher Erkenntnisgewinn oder eine notwendige Korrektur vorliegt.

Aktueller Repository-Code, verbindliche Anforderungen und Projektanweisungen haben Vorrang vor dem Agent Memory.
