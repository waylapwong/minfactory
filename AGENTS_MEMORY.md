# minFactory Agent Memory

Gemeinsames Projektgedächtnis für Codex und Copilot mit bestätigten Referenzimplementierungen und langfristig relevanten Stolperfallen.

Verbindliche Entwicklungsregeln stehen in `AGENTS.md`. Alle Referenzen sind vor ihrer Verwendung anhand des aktuellen Repository-Codes zu überprüfen.

## 1. Architektur

### Domain Objects

- `MinPokerGame` ist eine Referenz für Aggregate Roots mit fachlichen Zustandsübergängen und Invarianten, insbesondere Sitzplatzbelegung, Spielstart, Pausieren und Fortsetzen.
- `MinPokerGame` zeigt die Initialisierung von Domain Objects über Konstruktoren mit `Partial<T>` und die Prüfung fachlicher Regelverletzungen über `GameRuleException`.

### Schichtentrennung und Mapping

- `MinAdventCalendarService` ist eine Backend-Referenz für die Trennung von DTOs, Domain Objects und Entities sowie die Koordination der zugehörigen Mapper.
- `MinRpsGameService` ist eine Frontend-Referenz für DTO → Domain über `MinRpsDtoMapper` und Domain → ViewModel über `MinRpsDomainMapper`.

## 2. Frontend

### Struktur und Routing

- `MinRpsRoutes` und `MinPokerRoutes` sind Referenzen für Feature-Routing mit `loadComponent`.
- `MinPokerGameComponent` zeigt die Verwendung von `CanLeaveGame` und des gemeinsamen `leaveGameGuard` aus `client/src/app/shared/guards/` für eine Bestätigung beim Verlassen eines Spiels.
- `MinPokerComponent` und `MinRpsComponent` sind Referenzen für Feature-Root-Components mit separaten HTML-Templates und `<router-outlet>`.

### State Management

- `MinRpsGameService` verwendet Domain Objects als internen Cache und stellt abgeleitete Overview-ViewModels über Angular Signals bereit.
- `MinPokerMultiplayerService` kombiniert Match-State und Player-ID über `computed()` zu einem Game-ViewModel.
- `MinPokerGameService` stellt `myGamesVm` und `publicGamesVm` als Angular Signals bereit.

### API-Zugriff

- `MinFactoryUserRepository` kapselt den generierten `MinFactoryApiService` und verwendet `firstValueFrom()` für Promise-basierte Repository-Methoden.
- `MinRpsGameService` behandelt bekannte HTTP-Fehler gezielt und reicht nicht behandelte Fehler weiter.

### Shared UI

- `min-input`, `min-button`, `min-dialog` und `min-select` dienen als Referenzen für wiederverwendbare Form Controls.

## 3. Backend

### Feature-Struktur

- `MinPokerModule` ist eine Referenz für die Registrierung von Controllern, Gateways, Services, Repositories, Policies und Room-Systemen als Feature-Provider.
- `MinPokerGamePolicy` ist eine Referenz für die Autorisierung des Löschens eines Spiels.
- `MinRpsGameRepository` ist eine Referenz für TypeORM-Zugriffe mit dem zentralen `LoggerService`.

### Authentifizierung und Validierung

- `MinFactoryUserService` behandelt doppelte Registrierungen und unterscheidet bestehende Firebase-Identitäten von E-Mail-Konflikten.
- `MinRpsGameController` ist eine Referenz für gemeinsame Swagger-Decorators aus `server/src/shared/decorators/`, API-Fehlerantworten und die Verwendung von Request-IDs.
- Bestehende Controller-Implementierungen verwenden `ParseUUIDPipe` zur Validierung von UUID-Routenparametern.

## 4. Multiplayer

### Client

- `MinRpsSocketRepository` und `MinPokerSocketRepository` sind Referenzen für Feature-spezifische Socket.IO-Verbindungen.
- `MinPokerMultiplayerService` setzt den Authentication-Token vor dem Verbinden, verarbeitet Commands und Events und verwaltet Event-Subscriptions über stabile Handler-Referenzen sowie einen internen `isSubscribed`-Status.
- `MinPokerGameComponent` verwaltet den Verbindungs-Lifecycle. Die Spielsession wird über den zugehörigen Service verlassen.
- `MinPokerEventMapper` ist eine Referenz für die Konvertierung eingehender Match-Events in Domain Objects.
- Bestehende Multiplayer-Implementierungen verwenden getrennte Enums und Modellklassen für Match-Commands und Match-Events.

### Server

- `MinPokerGateway` delegiert fachliche Aktionen an `MinPokerTournamentService` und versendet spielerspezifische Hand-Events gezielt an die jeweiligen Empfänger.
- `MinPokerTournamentService` koordiniert Multiplayer-Commands, Match-Repositories, Player-IDs und Room-Systeme.
- `MinRpsRoomSystem` und `MinPokerRoomSystem` sind Referenzen für Join-, Leave- und Cleanup-Vorgänge von Socket-Rooms.
- `MinPokerTournamentService` prüft die vom Client übertragene Player-ID gegen die serverseitig zugeordnete Socket-Identität.

## 5. Testing

### Allgemeine Referenzen

- Unit-Tests liegen neben den getesteten Quelldateien als `*.spec.ts`.
- Test-Doubles befinden sich in bestehenden Feature-spezifischen oder gemeinsamen `mocks/`-Verzeichnissen.
- Frontend-Mocks verwenden Jasmine-Spies, Backend-Mocks Jest-Mocks.

### Angular

- Bestehende Angular-Tests verwenden `TestBed`, bei Component-Tests `ComponentFixture` und häufig `provideZonelessChangeDetection()`.
- `MinRpsMultiplayerService.spec.ts` ist eine Referenz für Socket-Service-Tests mit zentralisiertem Repository-Mock, insbesondere für Connect, Disconnect, Event-Subscriptions und Commands.
- MinPoker-Page-Tests verwenden `MINPOKER_GAME_SERVICE_MOCK` als Referenz für Test-Doubles mit den Signals `myGamesVm` und `publicGamesVm`.

### NestJS

- `MinPokerTournamentService.spec.ts` ist eine Referenz für Service-Tests mit mehreren Repository- und System-Mocks.
- `MinPokerGame` ist eine Referenz für Unit-Tests fachlicher Invarianten und Zustandsübergänge.
- Controller-Tests mit `AuthenticationGuard` benötigen die entsprechenden Mock-Provider `AUTHENTICATION_GUARD_MOCK` und `AUTHENTICATION_SERVICE_MOCK`.
- Für zufallsabhängige Spiellogik werden kontrollierte Zufallswerte verwendet, beispielsweise über `jest.spyOn(Math, 'random')`.

## 6. Bekannte Stolperfallen

- **Angular Signals:** Änderungen an Objekten innerhalb von Signals müssen über neue Objektinstanzen beziehungsweise aktualisierte Collections sichtbar gemacht werden. Ein gewöhnlicher Wert ersetzt in Test-Doubles kein Signal.
- **Socket-Lifecycle:** Der interne `isSubscribed`-Status des `MinPokerMultiplayerService` verhindert doppelte Subscriptions bei wiederholten Verbindungsaufrufen.
- **Spiel verlassen:** Bei der Zerstörung von `MinPokerGameComponent` müssen gegebenenfalls offene Leave-Confirmation-Promises beziehungsweise deren Resolver berücksichtigt werden.
- **Native Button-Aktivierung:** Enter kann auf nativen Buttons bereits ein Click-Ereignis auslösen. Zusätzliche Aktivierung im Keyboard-Handler kann doppelte Aktionen verursachen.
- **Popover-Tests:** Die tatsächliche Reihenfolge von Enter-Keydown und anschließendem Click ist relevant. Der bestehende Regressionstest prüft, dass das Popover danach sichtbar und angeheftet bleibt.
