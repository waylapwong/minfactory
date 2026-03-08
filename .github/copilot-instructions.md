# minFactory Workspace Guidelines

## Kommunikation

**Sprache:** Antworte auf Deutsch für alle Erklärungen, Diskussionen und Dokumentation. Code, Kommentare, Variablennamen und technische Bezeichner bleiben auf Englisch.

## Projektstruktur

Monorepo mit Client (Angular) und Server (NestJS) in separaten Verzeichnissen. Jedes verwaltet unabhängige Dependencies und Build-Prozesse.

```
client/          # Angular 20.3 Frontend
server/          # NestJS 11 Backend mit TypeORM
```

## Tech Stack

**Client:**
- Angular 20.3 mit Standalone Components (Zoneless Change Detection)
- Signal-basiertes State Management (keine RxJS Observables)
- TailwindCSS 4 für Styling
- Socket.io Client für WebSocket-Kommunikation
- OpenAPI auto-generierte API Services

**Server:**
- NestJS 11 mit TypeORM 0.3.27
- MariaDB Datenbank
- Socket.io für Echtzeit-Kommunikation (Namespace-basiert)
- Swagger/OpenAPI Dokumentation
- Jest für Testing

## Architecture

### Client Patterns ([example](client/src/app/features/minrps/services/minrps-singleplayer.service.ts))

**Feature Organization:**
```
features/<feature>/
  ├── components/        # Feature-specific UI components
  ├── pages/            # Route components
  ├── services/         # Business logic with Signal-based state
  ├── mapper/           # Transformations: domain ↔ DTO ↔ viewmodel
  ├── models/           # Domain models + ViewModels
  └── repositories/     # Data fetching
```

**State Management:**
- Use Angular Signals (`signal()`, `computed()`) for reactive state
- Services expose `Signal<T>` publicly; mutate via `WritableSignal` privately
- Global state in [ContextService](client/src/app/core/services/context.service.ts)
- **No NgRx/Akita** — services manage state directly

**Data Flow:**
```
API DTO → Domain Model → ViewModel → Component
(via mapper) → (via mapper) → (via signal)
```

### Server Patterns ([example](server/src/features/minrps/services/minrps-game.service.ts))

**Feature Organization:**
```
features/<feature>/
  ├── controllers/      # REST endpoints with @Controller
  ├── services/         # Business logic orchestration
  ├── repositories/     # TypeORM data access
  ├── gateways/         # WebSocket handlers @SubscribeMessage
  ├── mapper/           # Transformations: Entity ↔ Domain ↔ DTO
  ├── models/
  │   ├── entities/     # TypeORM entities
  │   ├── dtos/         # API contracts with class-validator
  │   ├── domains/      # Business objects
  │   ├── payloads/     # WebSocket event payloads
  │   └── enums/        # Type-safe constants
  └── systems/          # Complex business rules
```

**Data Flow:**
```
Entity (DB) → Domain (business) → DTO (API response)
(via mapper) → (via mapper)
```

**Layering:**
- Controllers/Gateways → Services → Repositories → TypeORM
- Mappers are static utility classes with pure functions
- Repositories throw `NotFoundException` for missing records

## Naming Conventions

**Client:**
- Files: `kebab-case` (e.g., `minrps-singleplayer.service.ts`)
- Services: `@Injectable({ providedIn: 'root' })` with `-service` suffix
- Auto-generated API: `-api.service` suffix (don't manually edit)
- Mappers: `*-mapper.ts` with static transformation methods

**Server:**
- Files: `kebab-case` matching NestJS conventions
- Decorators: Custom API decorators in [shared/decorators/](server/src/shared/decorators/) (`@API_200()`, `@API_404()`, etc.)
- WebSocket: Namespace enums + Command enums for message types
- Entities: `*Entity` suffix (e.g., `MinRpsGameEntity`)

## Build and Test Commands

Run from respective directories (`cd client/` or `cd server/`):

```bash
# Development
npm start           # Client: ng serve --open --watch
                    # Server: nest start --watch

# Build
npm run build       # Production builds

# Testing
npm test            # Watch mode with coverage
npm run test:ci     # Headless CI mode

# Linting
npm run lint        # ESLint with auto-fix

# Documentation
npm run gen:docs    # Compodoc → docs/ folder
```

**Client-specific:**
```bash
npm run gen:api     # Regenerate OpenAPI client from openapi.json
```

**Server-specific:**
```bash
npm run test:e2e    # End-to-end tests
```

## Code Style

### Client

**Use Signals, not Observables for state:**
```typescript
// ✅ Preferred
private readonly gameState = signal<GameState>(initialState);
readonly game = computed(() => this.gameState());

// ❌ Avoid for state management
private readonly gameState$ = new BehaviorSubject<GameState>(initialState);
```

**Always map between layers:**
```typescript
// ✅ Explicit transformations via mappers
const domain = DomainMapper.fromDto(apiResponse);
const viewModel = ViewmodelMapper.fromDomain(domain);

// ❌ Don't pass DTOs directly to templates
```

**Standalone components with lazy routes:**
- See [app.routes.ts](client/src/app/app.routes.ts) for feature routing
- No NgModules except auto-generated ApiModule

### Server

**Strict layer separation:**
```typescript
// ✅ Service uses mapper at boundaries
async findById(id: string): Promise<MinRpsGameDto> {
  const entity = await this.repository.findById(id);
  const domain = MinRpsDomainMapper.fromEntity(entity);
  return MinRpsDtoMapper.fromDomain(domain);
}

// ❌ Don't return entities from services
async findById(id: string): Promise<MinRpsGameEntity> {
  return this.repository.findById(id);
}
```

**WebSocket namespace isolation:**
```typescript
// ✅ Feature-scoped namespace
@WebSocketGateway({ namespace: Namespace.MinRps })

// ❌ Avoid global gateway without namespace
@WebSocketGateway()
```

**Custom decorators for Swagger:**
```typescript
// ✅ Use project decorators
@API_200(MinRpsGameDto)
@API_404()

// ❌ Don't manually configure each response
@ApiResponse({ status: 200, type: MinRpsGameDto })
@ApiResponse({ status: 404, description: 'Not found' })
```

## Common Patterns

### Mapper Pattern (Both Sides)

Central to the codebase — always transform data at boundaries:

**Client:** DTO → Domain → ViewModel  
**Server:** Entity → Domain → DTO

See [MinRpsDomainMapper](client/src/app/features/minrps/mapper/minrps-domain.mapper.ts) or [MinRpsDtoMapper](server/src/features/minrps/mapper/minrps-dto.mapper.ts) for examples.

### Testing

**Client:**
- Karma + Jasmine, coverage in `coverage/client/`
- Mock services colocated with implementations
- Example: [context.service.spec.ts](client/src/app/core/services/context.service.spec.ts)

**Server:**
- Jest, coverage excludes DTOs/entities/enums/decorators
- Mock repositories in `Test.createTestingModule()`
- Example: [minrps-game.service.spec.ts](server/src/features/minrps/services/minrps-game.service.spec.ts)

## Deployment

**Server to Heroku:**
```bash
git subtree push --prefix server heroku main
```

**CI:** Uses GitHub Actions with `HEROKU_GIT_URL` secret

## Key Files Reference

**Client Architecture:**
- [app.config.ts](client/src/app/app.config.ts) — Standalone app configuration
- [app.routes.ts](client/src/app/app.routes.ts) — Lazy-loaded feature routes
- [context.service.ts](client/src/app/core/services/context.service.ts) — Global state management

**Server Architecture:**
- [main.ts](server/src/main.ts) — App bootstrap with global pipes/interceptors
- [core.module.ts](server/src/core/core.module.ts) — Database & infrastructure
- [features.module.ts](server/src/features/features.module.ts) — Business logic modules

## Important Notes

- **OpenAPI contract:** Client API services auto-generated from `client/openapi.json` — don't manually edit files in `client/src/app/core/generated/`
- **Signal-first:** Client uses Angular Signals, not traditional RxJS state patterns
- **Mapper mandatory:** Never skip DTO/domain/entity transformations
- **Feature isolation:** Each feature is self-contained with its own services/models/mappers
