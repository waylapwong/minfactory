# Projektgedächtnis

- MinPoker page-test doubles for `MinPokerGameService` must expose `myGamesVm` and `publicGamesVm` as Angular signals, matching the shared mock.
- Nest controller tests guarded by `AuthenticationGuard` must register it and `AuthenticationService` with the shared `AUTHENTICATION_GUARD_MOCK` and `AUTHENTICATION_SERVICE_MOCK`.
- Popover keyboard regression test: dispatch native Enter keydown followed by click and verify the popover remains pinned and visible; do not duplicate native button activation in key handlers.
- `min-select` requires `id`, `formControlInput`, and `options`; `label` and `placeholder` are optional. Options require `label`/`value` and may include `disabled`/`imageSrc`.
- Prefer existing shared UI components (for example `min-input`, `min-button`, and `min-dialog`) for reusable controls; when no suitable shared component exists for a globally reusable HTML element, implement and use a shared component rather than duplicating markup.
- Always use curly braces for `if`/`else` and similar control-flow statements, including single-line bodies.
- Export exactly one class or enum per source file; place each class and enum in its own convention-matched file.
- Always write unit tests for new or changed logic, following the established test and mock patterns of the neighboring minApps.
- Group unit tests under a nested `describe('methodName()')` matching the method being tested.
- Feature root components should use a separate HTML template containing `<router-outlet>`, following the MinPoker and MinRps roots; avoid inline root templates.
- Record durable repository-wide work instructions in this shared memory. For each ticket, implement and verify the requested work, then check off only completed checkboxes under the issue's "Umsetzung" section; leave all acceptance criteria untouched for user review and keep unverified CI/CD checks open.
