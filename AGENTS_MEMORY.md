# minFactory Agent Memory

Gemeinsames Projektgedächtnis für Codex und Copilot.

Diese Datei enthält bestätigte, langfristig nützliche Repository-Patterns, konkrete Referenzimplementierungen und bekannte Stolperfallen.

Verbindliche Entwicklungsregeln stehen in `AGENTS.md`.

## Architektur

### Domain Models

- Model-Felder ohne Definite-Assignment-Assertion (`!`) deklarieren; im Client `strictPropertyInitialization: false` verwenden und normale Felddeklarationen beibehalten.
- `MinPokerGame` kapselt fachliche Zustandsübergänge und Invarianten wie Sitzplatzbelegung, Spielstart, Pausieren und Fortsetzen.
- Domain Models können über Konstruktoren mit `Partial<T>` initialisiert werden; bestehende Modelle wie `MinPokerGame` als Referenz verwenden.
- Fachliche Regelverletzungen werden in Domain-Methoden geprüft; `MinPokerGame` verwendet dafür `GameRuleException`.

### Backend-Struktur

- `MinPokerModule` registriert Controller, Gateway, Services, Repositories, Policy und Room-System als Feature-Provider.
- `MinPokerGamePolicy` kapselt die Autorisierung für das Löschen eines Spiels.
- `MinRpsRoomSystem` und `MinPokerRoomSystem` kapseln die Verwaltung von Socket-Rooms.
- `MinRpsGameRepository` kapselt TypeORM-Zugriffe und verwendet den zentralen `LoggerService`.
- `MinFactoryUserService` berücksichtigt doppelte Benutzerregistrierungen und unterscheidet bestehende Firebase-Identitäten von E-Mail-Konflikten.
- NestJS-Controller mit `AuthenticationGuard` benötigen in Unit-Tests die Registrierung des Guards und des AuthenticationService mit `AUTHENTICATION_GUARD_MOCK` und `AUTHENTICATION_SERVICE_MOCK`.

### REST und OpenAPI

- `MinRpsGameController` verwendet gemeinsame Swagger-Decorators aus `server/src/shared/decorators/`.
- API-Operationen erhalten explizite Swagger-Operation-IDs.
- REST-Controller verwenden bestehende Request-ID-Patterns mit `X-Request-Id`.
- UUID-Routenparameter werden im bestehenden Controller-Pattern über `ParseUUIDPipe` validiert.
- `MinRpsGameController` ist eine Referenz für gemeinsame API-Response- und Fehler-Decorators.
- Die OpenAPI-Spezifikation stammt vom Swagger-Endpunkt des laufenden NestJS-Servers; generierte API-Modelle und Services werden anschließend über das Client-Skript erzeugt.

## Frontend

### Struktur und Routing

- `MinRpsRoutes` und `MinPokerRoutes` definieren Feature-Pages mit `loadComponent`.
- Aktive Spielseiten verwenden den gemeinsamen `leaveGameGuard` aus `client/src/app/shared/guards/`.
- `MinPokerGameComponent` implementiert `CanLeaveGame` und verwaltet eine Bestätigung beim Verlassen eines Spiels.
- Feature-Root-Components wie `MinPokerComponent` und `MinRpsComponent` verwenden separate HTML-Templates mit `<router-outlet>` statt Inline-Root-Templates.

### State Management

- `MinRpsGameService` und `MinPokerMultiplayerService` halten internen Feature-State in WritableSignals.
- Öffentliche ViewModels werden aus internem State über `computed()` abgeleitet.
- `MinRpsGameService` verwendet Domain Models als internen Cache und stellt abgeleitete Overview-ViewModels bereit.
- `MinPokerMultiplayerService` kombiniert Match-State und Player-ID zu einem abgeleiteten Game-ViewModel.
- Bei Zustandsänderungen an Signal-basierten Objekten werden neue Objektinstanzen beziehungsweise aktualisierte Collections gesetzt, damit Änderungen zuverlässig sichtbar werden.
- `MinPokerGameService` stellt `myGamesVm` und `publicGamesVm` als Angular Signals bereit.

### API-Zugriff

- `MinFactoryUserRepository` kapselt den generierten `MinFactoryApiService`.
- Das Repository verwendet `firstValueFrom()` zur Umwandlung generierter API-Observables in Promise-basierte Repository-Methoden.
- `MinRpsGameService` verwendet `MinRpsDtoMapper` für DTO → Domain und `MinRpsDomainMapper` für Domain → ViewModel.
- `MinRpsGameService` behandelt bekannte HTTP-Fehler gezielt und reicht nicht behandelte Fehler weiter.

### Shared UI

- `min-select` benötigt `id`, `formControlInput` und `options`.
- Bei `min-select` sind `label` und `placeholder` optional.
- `SelectOption` benötigt `label` und `value`; optional sind `disabled` und `imageSrc`.
- Bestehende Shared Components wie `min-input`, `min-button`, `min-dialog` und `min-select` sind Referenzen für wiederverwendbare Form Controls.
- Für Popover-Tastaturtests native Enter-Keydown- und Click-Ereignisse in ihrer tatsächlichen Reihenfolge auslösen.
- Der Popover-Regressionstest prüft, dass das Popover nach Enter und anschließendem Click angeheftet und sichtbar bleibt.
- Native Button-Aktivierung nicht zusätzlich in Keyboard-Handlern duplizieren.

## Multiplayer

### Client

- `MinRpsSocketRepository` und `MinPokerSocketRepository` kapseln feature-spezifische Socket.IO-Verbindungen.
- `MinPokerMultiplayerService` setzt vor dem Verbinden den Authentication-Token in der Socket-Konfiguration.
- Der Multiplayer-Service verwendet eigene Methoden für Commands und verarbeitet eingehende Events über registrierte Handler.
- `MinPokerMultiplayerService` verwendet stabile Handler-Referenzen, damit `on()` und `off()` dieselben Funktionen verwenden.
- Der interne `isSubscribed`-Status verhindert doppelte Event-Subscriptions.
- `disconnect()` entfernt die registrierten Event-Handler vor dem Trennen der Verbindung.
- `MinPokerGameComponent` verbindet beim Initialisieren und trennt beim Destroy; die Spielsession wird über den Service verlassen.
- `MinPokerEventMapper` konvertiert eingehende Match-Events in Domain Models.
- Match-Commands und Match-Events verwenden getrennte Enums und Modellklassen.

### Server

- `MinPokerGateway` übernimmt Socket-Kommunikation und delegiert fachliche Aktionen an den Tournament-Service.
- `MinPokerTournamentService` verarbeitet Multiplayer-Commands und koordiniert Match-, Player-ID- und Room-Repositories.
- Socket-Spieleridentitäten werden der Verbindung serverseitig zugeordnet.
- `MinPokerTournamentService` prüft die übertragene Player-ID gegen die dem Socket zugeordnete Identität.
- Die Room-Systeme kapseln Join-, Leave- und Cleanup-Vorgänge für Socket-Rooms.
- `MinPokerGateway` versendet spielerspezifische Hand-Events gezielt statt an alle Spieler zu broadcasten.
- Match-Updates werden über die zugehörigen Socket-Rooms verteilt.

## Typisierung

- Bei Variablen immer explizite Typannotationen ergänzen, auch für `const` und `let`; Schleifenwerte bei Bedarf über typisierte Callbacks annotieren.

## Testing

### Allgemeine Patterns

- Unit-Tests liegen neben den getesteten Quelldateien als `*.spec.ts`.
- Test-Doubles liegen in den bestehenden feature-spezifischen beziehungsweise gemeinsamen `mocks/`-Verzeichnissen.
- Frontend-Mocks verwenden Jasmine-Spies; Backend-Mocks verwenden Jest-Mocks.
- Mutable Mock-Zustände und Spy-Aufrufhistorien vor Tests zurücksetzen, damit Tests unabhängig voneinander bleiben.
- Neue Tests an den benachbarten Tests derselben Schicht orientieren.

### Angular

- Angular-Tests verwenden `TestBed` und bei Component-Tests `ComponentFixture`.
- Viele bestehende Angular-Tests registrieren `provideZonelessChangeDetection()`.
- `MinRpsMultiplayerService.spec.ts` ist eine Referenz für Socket-Service-Tests mit zentralisiertem Repository-Mock.
- Diese Tests prüfen Connect, Disconnect, Event-Subscriptions, Unsubscriptions und ausgehende Commands.
- Mehrfache Connect- und Disconnect-Aufrufe werden ausdrücklich auf korrektes Subscription-Verhalten geprüft.
- MinPoker-Page-Test-Doubles für `MinPokerGameService` müssen `myGamesVm` und `publicGamesVm` als Angular Signals bereitstellen.
- Dafür das vorhandene `MINPOKER_GAME_SERVICE_MOCK` als Referenz verwenden.

### NestJS

- NestJS-Service-Tests verwenden bei Dependency Injection `Test.createTestingModule()`.
- Abhängigkeiten werden über die vorhandenen Mock-Provider registriert.
- `MinPokerTournamentService.spec.ts` ist eine Referenz für Service-Tests mit mehreren Repository- und System-Mocks.
- `MinPokerGame` ist eine Referenz für die Prüfung fachlicher Invarianten und Zustandsübergänge.
- Bei zufallsabhängiger Spiellogik gezielt kontrollierte Zufallswerte verwenden, beispielsweise über `jest.spyOn(Math, 'random')`.
- Probabilistische Tests möglichst vermeiden, weil sie unabhängig von fachlichen Fehlern fehlschlagen können.
- Gezielte Assertions für fachliche Ergebnisse sind gegenüber bloßen Existenzprüfungen zu bevorzugen.
- `jest.clearAllMocks()` beziehungsweise passende Mock-Reset-Mechanismen verwenden, wenn gemeinsame Mocks zwischen Tests wiederverwendet werden.

## Bekannte Stolperfallen

- Angular-Test-Doubles müssen dieselbe reaktive API wie ihre echten Services bereitstellen; ein gewöhnlicher Wert ersetzt kein Signal.
- Socket-Handler müssen mit derselben Funktionsreferenz deregistriert werden, mit der sie registriert wurden.
- Wiederholte Connect-Aufrufe dürfen keine doppelten Event-Subscriptions verursachen.
- Bei Component-Destroy müssen offene Leave-Confirmation-Promises beziehungsweise zugehörige Resolver berücksichtigt werden.
- Native Buttons lösen bei Keyboard-Aktivierung bereits Click-Ereignisse aus; zusätzliche manuelle Aktivierung kann doppelte Aktionen verursachen.
- Gemeinsame Mock-Objekte können Zustand zwischen Tests behalten und müssen entsprechend zurückgesetzt werden.
- OpenAPI-Artefakte müssen aus dem Backend generiert werden; manuelle Anpassungen können bei der nächsten Generierung verloren gehen.
- Der Befehl `npm run check` führt `format:all` aus und kann dadurch auch nicht auftragsbezogene Dateien formatieren.

## Pflegehinweise

- Neue Einträge nur bei bestätigtem und langfristig nützlichem Erkenntnisgewinn ergänzen.
- Konkrete Referenzimplementierungen bevorzugen.
- Allgemeine verbindliche Regeln gehören in `AGENTS.md`.
- Bereits dokumentierte Regeln hier nicht erneut formulieren.
- Veraltete Einträge korrigieren oder entfernen.
- Inhaltlich ähnliche Einträge zusammenfassen.
- Keine temporären Aufgabenstände, Debug-Protokolle oder Vermutungen speichern.
- Aktueller Repository-Code und geltende Projektanweisungen haben Vorrang.
