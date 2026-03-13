# minFactory Workspace Guidelines

## Kommunikation

**Sprache:** Antworte auf Deutsch für alle Erklärungen, Diskussionen und Dokumentation. Code, Kommentare, Variablennamen und technische Bezeichner bleiben auf Englisch.

## Projektstruktur

Monorepo mit Client (Angular) und Server (NestJS) in separaten Verzeichnissen. Jedes verwaltet unabhängige Dependencies und Build-Prozesse.

```
client/          # Angular
server/          # NestJS
```

## Tech Stack

**Client:**
- Angular mit Standalone Components (Zoneless Change Detection)
- Signal-basiertes State Management (keine RxJS Observables)
- TailwindCSS für Styling
- Socket.io Client für WebSocket-Kommunikation
- OpenAPI auto-generierte API Services

**Server:**
- NestJS mit TypeORM
- MariaDB Datenbank
- Socket.io für Echtzeit-Kommunikation (Namespace-basiert)
- Swagger/OpenAPI Dokumentation
- Jest für Testing

## Namenskonventionen

**Client:**

| Typ | Dateiname | Klasse |
|-----|-----------|--------|
| Component | `minrps-card.component.ts` | `MinRpsCardComponent` |
| Page | `minrps-singleplayer.component.ts` | `MinRpsSingleplayerComponent` |
| Service | `minrps-game.service.ts` | `MinRpsGameService` |
| Repository | `minrps-game.repository.ts` | `MinRpsGameRepository` |
| Mapper | `minrps-viewmodel.mapper.ts` | `MinRpsViewmodelMapper` |
| Domain Model | `minrps-game.ts` | `MinRpsGame` |
| ViewModel | `minrps-singleplayer.viewmodel.ts` | `MinRpsSingleplayerViewModel` |
| Payload | `minrps-match-join.payload.ts` | `MinRpsMatchJoinPayload` |
| Enum | `minrps-match-command.enum.ts` | `MinRpsMatchCommand` |
| Guard | `leave-game.guard.ts` | `leaveGameGuard` |
| Routes | `minrps.routes.ts` | `MINRPS_ROUTES` |

- Shared Components: Selector-Präfix `min-` (z.B. `min-button`, `min-card`, `min-dialog`)
- Signals: `private readonly cached{Name}: WritableSignal<T>` / `public {name}: Signal<T>` (computed)
- Auto-generierte API: `-api.service` Suffix in `core/generated/` (nicht manuell bearbeiten)

**Server:**

| Typ | Dateiname | Klasse |
|-----|-----------|--------|
| Controller | `minrps-game.controller.ts` | `MinRpsGameController` |
| Service | `minrps-game.service.ts` | `MinRpsGameService` |
| Repository | `minrps-game.repository.ts` | `MinRpsGameRepository` |
| Gateway | `minrps.gateway.ts` | `MinRpsGateway` |
| Mapper | `minrps-domain.mapper.ts` | `MinRpsDomainMapper` |
| System | `minrps-room.system.ts` | `MinRpsRoomSystem` |
| Entity | `minrps-game.entity.ts` | `MinRpsGameEntity` |
| DTO | `minrps-create-game.dto.ts` | `MinRpsCreateGameDto` |
| Domain Model | `minrps-game.ts` | `MinRpsGame` |
| Payload | `minrps-match-join.payload.ts` | `MinRpsMatchJoinPayload` |
| Enum | `minrps-move.enum.ts` | `MinRpsMove` |
| Module | `minrps.module.ts` | `MinRpsModule` |

- Decorators: Custom API-Decorators in [shared/decorators/](server/src/shared/decorators/) (`@API_200()`, `@API_404()`, etc.)
- WebSocket: Namespace Enums + Command/Event Enums für Message-Types (z.B. `MinRpsMatchCommand`, `MinRpsMatchEvent`)

## Wichtige Hinweise

- **OpenAPI Contract:** Client API-Services auto-generiert aus `client/openapi.json` — keine manuellen Edits in `client/src/app/core/generated/`
- **Signal-First:** Client nutzt Angular Signals, keine traditionellen RxJS State Patterns
- **Mapper Pflicht:** Niemals DTO/Domain/Entity oder ViewModel/Domain/DTO Transformationen überspringen
- **Feature-Isolation:** Jedes Feature ist eigenständig mit eigenen Services/Models/Mappers
