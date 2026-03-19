## Firebase

Firebase wird im Frontend nur fuer Authentication verwendet.

Die Konfiguration liegt in den Environment-Dateien:
- `src/environments/environment.ts`
- `src/environments/environment.dev.ts`

Vor dem Start muessen die Platzhalter in `FIREBASE_CONFIG` mit den echten Werten aus dem Firebase-Projekt ersetzt werden.

Der Frontend-Client sendet den Firebase ID Token bei Backend-Requests automatisch im Standard-Header `Authorization: Bearer <token>` mit.
