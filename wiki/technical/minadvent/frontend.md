# minAdvent | Angular-Frontend

> **Soll-Konzept v1.0.0** · [Übersicht](minadvent-home.md)

## 1. Integration und Routen

Neues lazy geladenes Angular-Standalone-Feature unter `client/src/app/features/`, in `APP_ROUTES` registriert. Projekt nutzt Angular 20, Signals, Reactive Forms, zoneless Change Detection, TailwindCSS 4 sowie `min-`-Prefix für Shared Components; vorhandene Dialoge/Formular-/Loading-Komponenten bevorzugen. UI mobile-first, Tastaturzugänglichkeit, Kontrast und ARIA entsprechend WCAG 2.2 AA.

Beispielrouten: `/minadvent` (authentifizierte Erstellerverwaltung), `/minadvent/calendars/new`, `/minadvent/calendars/:id`, `/minadvent/shared/:token` (anonym). Die Tokenroute darf nicht mit Auth-Guard gesperrt werden. Routebezeichner können an bestehende Angular-Konventionen angepasst werden.

## 2. Ersteller-Ansichten

- **Verwaltung:** aktuelle Kalender zuerst, vergangene nach Jahr gruppiert; jeder Kalender zeigt Titel, Jahr, Veröffentlichungszustand und berechneten Abschluss.
- **Create-Form:** Titel/Empfängername (je max. 100 Zeichen) und **Pflichtfeld Kalenderjahr**, initial aktuelles Jahr, Vergangenheit/Zukunft erlaubt. Bei vergangenen Jahren deutlicher Hinweis auf möglichen unmittelbaren endgültigen Abschluss.
- **Editor:** 24er-Raster mit `EMPTY`, `FILLED`, `OPENED`, „X von 24 Türchen befüllt“ und geöffneter Gesamtzahl. Jahr nur lesbar, Titel und Empfängername getrennt speicherbar; pro Türchen 0–10 sortierbare gemischte Blöcke (Text-WYSIWYG fett/kursiv/Listen/Absätze, Link, Gutschein). Blöcke erhalten Position 1..N, nie 0/Lücken.
- **Speichern:** ein einzelner `PUT` speichert **alle** Blöcke einer Tür. Entwurfsdirty-State, Verlassenwarnung und Bestätigung vor Verwerfen. Führt das Entfernen des letzten `FILLED` bei mindestens einem `OPENED` nach dem 24.12. zum Abschluss, **vor PUT** explizit warnen. Bei der Warnung ist die lokale berechnete Prognose hilfreich, maßgeblich bleibt der Server.
- **Schließen:** nur der Ersteller, bis einschließlich 24.12. des Kalenderjahres; danach Button ausblenden, Server gibt trotzdem `409 DOOR_CLOSE_PERIOD_ENDED`. Bei erfolgreichem Schließen wieder FILLED, editierbar, erneut animierbare Erstöffnung.
- **Abgeschlossen:** endgültiger Nur-Lesen-Zustand für Inhalte/Metadaten/Status; **Freigabeaktionen und Löschen** bleiben aktiv.
- **Freigabe:** ausdrückliche Veröffentlichung (auch leere Kalender), Kopieren und natives Teilen des Links, Widerruf, Rotation und Wiederveröffentlichung; alter Link ab Widerruf/Erneuerung ungültig. Keine Erstellervorschau, kein spezieller Testmodus oder Duplizieren.
- **Löschen:** explizite Sicherheitsabfrage, danach Verwaltung aktualisieren.

## 3. Empfänger-Ansicht

- Anonymous Shared Link, keine Anmeldung. Vor 1.12. des **ausgewählten Jahres** nur Titel und Countdown; ab 1.12. dauerhaft 24-Türchen-Raster.
- Kalenderüberblick enthält nur Status und Version, **keine Inhalte**. Leer/gesperrt nicht öffnbar, zeitlich freigegebenes FILLED per `PUT` mit erwarteter globaler Version.
- Nach erfolgreichem Erstöffnungs-`PUT` (nur `firstOpened: true`) kurze dezente Animation und Inhaltsdialog. Geöffnetes Türchen wiederansehen immer mit **GET ohne Animation**; schließbarer Dialog ohne Vor/Zurück-Navigation, keine Fortschrittsanzeige und keine Reaktionen.
- Bei `409 VERSION_CONFLICT` zeigt UI Hinweis und lädt **erst nach ausdrücklicher Bestätigung** den Überblick neu. Tür inzwischen OPENED → GET; weiter FILLED → erneuter Klick erforderlich; kein stiller PUT-Retry. Trifft GET zwischenzeitlich auf wieder geschlossenes Türchen, keine alten Inhalte zeigen, Übersicht nach bestätigter Aktualisierung neu laden.
- Nach verlorener Öffnungsantwort oder Netzwerkausfall Zustand zunächst durch Übersicht feststellen; keine blinden Wiederholungen. `409`-Fehlercodes differenzieren fachliche Meldungen. Ungültige Links zeigen nur neutrale Nichtverfügbarkeit.

## 4. Technische Zustandsführung

Signals für kalenderlokalen Snapshot (`version`, `completed`, `published`, Türenstatus) und Lade-/Fehlerzustände; Reactive Forms für Entwürfe und Validierung. Aus OpenAPI generierte Services liefern bestehende RxJS Observables, bei Bedarf an der Konsumstelle in Signals umwandeln. Nach **jeder** bestätigten Mutation lokale globale Version aus Response übernehmen, nicht clientseitig schätzen; weder NgRx noch automatisches Polling oder automatische Netzwerk-Retries.

Bei Ersteller-409 lokale Entwürfe und Fokus erhalten, Dialog zur explizit bestätigten Aktualisierung/Verwerfung; nach Reload ggf. abgeschlossenen Schreibschutz darstellen. Normale Aktionen haben Loading, Success, Error und Empty States. Im Layout berücksichtigen, dass ein veröffentlichter Kalender parallel vom Empfänger geändert werden kann.

## 5. Client-Generierung

Backend-Dekoratoren bilden sämtliche DTOs, Auth-Schemata und Fehlerresponses in Swagger/OpenAPI ab (`server/src/main.ts` exponiert `/openapi-json`). Aktualisiertes JSON in `client/openapi.json` übernehmen und **`npm --prefix client run api`** ausführen; Dateien in `client/src/app/core/generated/` niemals manuell ändern. Diese Dokumentation erstellt keine Clients.
