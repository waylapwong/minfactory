# Projektgedächtnis

- MinPoker page-test doubles for `MinPokerGameService` must expose `myGamesVm` and `publicGamesVm` as Angular signals, matching the shared mock.
- Nest controller tests guarded by `AuthenticationGuard` must register it and `AuthenticationService` with the shared `AUTHENTICATION_GUARD_MOCK` and `AUTHENTICATION_SERVICE_MOCK`.
- Popover keyboard regression test: dispatch native Enter keydown followed by click and verify the popover remains pinned and visible; do not duplicate native button activation in key handlers.
- `min-select` requires `id`, `formControlInput`, and `options`; `label` and `placeholder` are optional. Options require `label`/`value` and may include `disabled`/`imageSrc`.
- Always use curly braces for `if`/`else` and similar control-flow statements, including single-line bodies.
- Export exactly one class or enum per source file; place each class and enum in its own convention-matched file.
- Always write unit tests for new or changed logic, following the established test and mock patterns of the neighboring minApps.
- Group unit tests under a nested `describe('methodName()')` matching the method being tested.
- Record durable repository-wide work instructions in this shared memory. After implementing a ticket, verify the result and check off only completed items under the issue's Tasks section; leave Acceptance Criteria for user review and keep unverified CI/CD checks open.
