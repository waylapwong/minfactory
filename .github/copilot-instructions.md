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

## Architektur

### Client Patterns ([Beispiel](client/src/app/features/minrps/services/minrps-singleplayer.service.ts))

**Feature-Organisation:**
```
features/<feature>/
  ├── components/        # Feature-spezifische UI-Komponenten
  ├── pages/            # Route-Komponenten
  ├── services/         # Business-Logik mit Signal-basiertem State
  ├── mapper/           # Transformationen: domain ↔ DTO ↔ viewmodel
  ├── models/           # Domain-Models + ViewModels
  └── repositories/     # Datenabruf
```

**State Management:**
- Verwende Angular Signals (`signal()`, `computed()`) für reaktiven State
- Services exponieren `Signal<T>` öffentlich; mutieren via `WritableSignal` privat
- Globaler State in [ContextService](client/src/app/core/services/context.service.ts)
- **Kein NgRx/Akita** — Services verwalten State direkt

**Datenfluss:**
```
API DTO → Domain Model → ViewModel → Component
(via mapper) → (via mapper) → (via signal)
```

### Server Patterns ([Beispiel](server/src/features/minrps/services/minrps-game.service.ts))

**Feature-Organisation:**
```
features/<feature>/
  ├── controllers/      # REST-Endpoints mit @Controller
  ├── services/         # Business-Logik Orchestrierung
  ├── repositories/     # TypeORM Datenzugriff
  ├── gateways/         # WebSocket-Handler @SubscribeMessage
  ├── mapper/           # Transformationen: Entity ↔ Domain ↔ DTO
  ├── models/
  │   ├── entities/     # TypeORM Entities
  │   ├── dtos/         # API-Contracts mit class-validator
  │   ├── domains/      # Business-Objekte
  │   ├── payloads/     # WebSocket Event-Payloads
  │   └── enums/        # Typsichere Konstanten
  └── systems/          # Komplexe Business-Rules
```

**Datenfluss:**
```
Entity (DB) → Domain (business) → DTO (API response)
(via mapper) → (via mapper)
```

**Layering:**
- Controllers/Gateways → Services → Repositories → TypeORM
- Mapper sind statische Utility-Klassen mit Pure Functions
- Repositories werfen `NotFoundException` bei fehlenden Records

## Namenskonventionen

**Client:**
- Dateien: `kebab-case` (z.B. `minrps-singleplayer.service.ts`)
- Services: `@Injectable({ providedIn: 'root' })` mit `-service` Suffix
- Auto-generierte API: `-api.service` Suffix (nicht manuell bearbeiten)
- Mapper: `*-mapper.ts` mit statischen Transformations-Methoden

**Server:**
- Dateien: `kebab-case` gemäß NestJS Konventionen
- Decorators: Custom API-Decorators in [shared/decorators/](server/src/shared/decorators/) (`@API_200()`, `@API_404()`, etc.)
- WebSocket: Namespace Enums + Command Enums für Message-Types
- Entities: `*Entity` Suffix (z.B. `MinRpsGameEntity`)

## Build- und Test-Befehle

Ausführen aus den jeweiligen Verzeichnissen (`cd client/` oder `cd server/`):

```bash
# Development
npm start           # Client: ng serve --open --watch
                    # Server: nest start --watch

# Build
npm run build       # Production Builds

# Testing
npm test            # Watch-Modus mit Coverage
npm run test:ci     # Headless CI-Modus

# Linting
npm run lint        # ESLint mit Auto-Fix

# Dokumentation
npm run gen:docs    # Compodoc → docs/ Ordner
```

**Client-spezifisch:**
```bash
npm run gen:api     # OpenAPI-Client neu generieren aus openapi.json
```

**Server-spezifisch:**
```bash
npm run test:e2e    # End-to-End Tests
```

## Code-Stil

### Client

**Verwende Signals, keine Observables für State:**
```typescript
// ✅ Bevorzugt
private readonly gameState = signal<GameState>(initialState);
readonly game = computed(() => this.gameState());

// ❌ Vermeiden für State Management
private readonly gameState$ = new BehaviorSubject<GameState>(initialState);
```

**Immer zwischen Layern mappen:**
```typescript
// ✅ Explizite Transformationen via Mapper
const domain = DomainMapper.fromDto(apiResponse);
const viewModel = ViewmodelMapper.fromDomain(domain);

// ❌ DTOs nicht direkt an Templates übergeben
```

**Standalone Components mit Lazy Routes:**
- Siehe [app.routes.ts](client/src/app/app.routes.ts) für Feature-Routing
- Keine NgModules außer auto-generiertem ApiModule

### Server

**Strikte Layer-Trennung:**
```typescript
// ✅ Service nutzt Mapper an Grenzen
async findById(id: string): Promise<MinRpsGameDto> {
  const entity = await this.repository.findById(id);
  const domain = MinRpsDomainMapper.fromEntity(entity);
  return MinRpsDtoMapper.fromDomain(domain);
}

// ❌ Entities nicht direkt aus Services zurückgeben
async findById(id: string): Promise<MinRpsGameEntity> {
  return this.repository.findById(id);
}
```

**WebSocket Namespace-Isolation:**
```typescript
// ✅ Feature-scoped Namespace
@WebSocketGateway({ namespace: Namespace.MinRps })

// ❌ Globales Gateway ohne Namespace vermeiden
@WebSocketGateway()
```

**Custom Decorators für Swagger:**
```typescript
// ✅ Projekt-Decorators verwenden
@API_200(MinRpsGameDto)
@API_404()

// ❌ Nicht manuell jede Response konfigurieren
@ApiResponse({ status: 200, type: MinRpsGameDto })
@ApiResponse({ status: 404, description: 'Not found' })
```

## Häufige Patterns

### Mapper-Pattern (Beide Seiten)

Zentral in der Codebase — transformiere Daten immer an Grenzen:

**Client:** DTO → Domain → ViewModel  
**Server:** Entity → Domain → DTO

Siehe [MinRpsDomainMapper](client/src/app/features/minrps/mapper/minrps-domain.mapper.ts) oder [MinRpsDtoMapper](server/src/features/minrps/mapper/minrps-dto.mapper.ts) für Beispiele.

### Testing

**Client:**
- Karma + Jasmine, Coverage in `coverage/client/`
- Mock-Services colocated mit Implementierungen
- Beispiel: [context.service.spec.ts](client/src/app/core/services/context.service.spec.ts)

**Server:**
- Jest, Coverage excludes DTOs/Entities/Enums/Decorators
- Mock-Repositories in `Test.createTestingModule()`
- Beispiel: [minrps-game.service.spec.ts](server/src/features/minrps/services/minrps-game.service.spec.ts)

## Deployment

**Server zu Heroku:**
```bash
git subtree push --prefix server heroku main
```

**CI:** Nutzt GitHub Actions mit `HEROKU_GIT_URL` Secret

## Wichtige Dateien

**Client-Architektur:**
- [app.config.ts](client/src/app/app.config.ts) — Standalone App-Konfiguration
- [app.routes.ts](client/src/app/app.routes.ts) — Lazy-loaded Feature-Routes
- [context.service.ts](client/src/app/core/services/context.service.ts) — Globales State Management

**Server-Architektur:**
- [main.ts](server/src/main.ts) — App-Bootstrap mit globalen Pipes/Interceptors
- [core.module.ts](server/src/core/core.module.ts) — Datenbank & Infrastruktur
- [features.module.ts](server/src/features/features.module.ts) — Business-Logik Module

## Wichtige Hinweise

- **OpenAPI Contract:** Client API-Services auto-generiert aus `client/openapi.json` — keine manuellen Edits in `client/src/app/core/generated/`
- **Signal-First:** Client nutzt Angular Signals, keine traditionellen RxJS State Patterns
- **Mapper Pflicht:** Niemals DTO/Domain/Entity Transformationen überspringen
- **Feature-Isolation:** Jedes Feature ist eigenständig mit eigenen Services/Models/Mappers
