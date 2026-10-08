# Backend

## Runtime

- Use Node.js 24.15 or newer within the 24.x line.
- The application remains CommonJS. NestJS 12 packages are ESM-only, so Jest scripts enable Node's `--experimental-vm-modules` support.

## TypeScript

TypeScript 6 requires an explicit `rootDir`. The backend uses `.` to preserve the existing `dist/src` output layout.
