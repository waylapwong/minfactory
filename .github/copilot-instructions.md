# Copilot Instructions (minfactory)

## Architecture overview
- Monorepo with Angular client in [client/](client/) and NestJS server in [server/](server/).
- Server uses REST + WebSocket for minRPS: REST controllers in [server/src/features/minrps/controllers/minrps-game.controller.ts](server/src/features/minrps/controllers/minrps-game.controller.ts#L1-L81) and socket gateway in [server/src/features/minrps/gateways/minrps.gateway.ts](server/src/features/minrps/gateways/minrps.gateway.ts#L1-L90).
- Server layering is DTO -> Domain -> Entity, with mappers in [server/src/features/minrps/mapper/](server/src/features/minrps/mapper/) and repositories wrapping TypeORM in [server/src/features/minrps/repositories/minrps-game.repository.ts](server/src/features/minrps/repositories/minrps-game.repository.ts#L1-L33).
- Client routing is feature-based with lazy-loaded pages in [client/src/app/app.routes.ts](client/src/app/app.routes.ts#L1-L27) and [client/src/app/features/minrps/minrps.routes.ts](client/src/app/features/minrps/minrps.routes.ts#L1-L27).

## Generated API client
- Client API layer is generated from OpenAPI: config in [client/openapi.config.json](client/openapi.config.json) and spec in [client/openapi.json](client/openapi.json). Regenerate with `npm run gen:api` in client; output goes to [client/src/app/core/generated/](client/src/app/core/generated/). Do not hand-edit generated files.
- API base URL is injected via `BASE_PATH` in [client/src/app/app.config.ts](client/src/app/app.config.ts#L1-L18) using `ENVIRONMENT.API_BASE_PATH` from [client/src/environments/environment.dev.ts](client/src/environments/environment.dev.ts#L1-L4).

## Server conventions
- Controllers use custom Swagger decorators like `API_200` and `API_Param_ID` from [server/src/shared/decorators/](server/src/shared/decorators/) instead of raw `@ApiOkResponse` etc.
- Global validation/serialization is configured in [server/src/main.ts](server/src/main.ts#L1-L55): `ValidationPipe` with whitelist + forbidNonWhitelisted and `ClassSerializerInterceptor`.
- Database is configured via env vars in [server/src/core/core.module.ts](server/src/core/core.module.ts#L1-L19); expect `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_TYPE` (mariadb), and `DB_SYNCHRONIZE`.

## Client conventions
- Client services prefer repository wrappers that call generated API services with `firstValueFrom`, e.g. [client/src/app/features/minrps/repositories/minrps-game.repository.ts](client/src/app/features/minrps/repositories/minrps-game.repository.ts#L1-L23).
- State in feature services uses Angular signals (`signal`, `computed`) rather than RxJS subjects; see [client/src/app/features/minrps/services/minrps-game.service.ts](client/src/app/features/minrps/services/minrps-game.service.ts#L1-L43).
- WebSocket access uses `ngx-socket-io` with the minRPS namespace; see [client/src/app/features/minrps/services/minrps-socket.service.ts](client/src/app/features/minrps/services/minrps-socket.service.ts#L1-L18) and server namespace in [server/src/shared/enums/namespace.enum.ts](server/src/shared/enums/namespace.enum.ts#L1-L3).

## Common workflows
- Install: `npm install` in both `client` and `server` folders (see [README.md](README.md#L1-L23)).
- Dev servers: `npm start` in `client` and `server` (client uses `ng serve --open --watch`).
- Tests: `npm test` for each; server also has `npm run test:e2e` and `npm run test:ci`.
- Lint/format/docs: `npm run lint`, `npm run format` or `npm run format:all`, and `npm run gen:docs` in each package.
