# minAdvent | Teststrategie und Architektur-Review

> **Geplanter Soll-Zustand v1.0.0** · [Übersicht](minadvent-home.md)

## 1. Testwerkzeuge und Ebenen

Backend verwendet bestehendes Jest/ts-jest und Supertest, Frontend Jasmine/Karma mit ChromeHeadless. Nach Umsetzung `npm --prefix server run test:ci`, `npm --prefix client run test:ci` und passende `lint:ci`-Skripte ausführen. Transaktions-/Race-Tests gegen **echtes MySQL**, nicht nur In-Memory-Mocks. Vorhandene Mock-Verzeichnisse der Features verwenden; keine Inline-Mocks. Dokumentationsänderungen dieses Tickets führen keine Code-Tests aus.

## 2. Fachliche und technische Szenarien

| Ausgangslage | Aktion | Erwartung / Ebene |
| --- | --- | --- |
| Neuer Kalender | Mit Jahr in Vergangenheit/Zukunft anlegen | Genau 24 EMPTY, Jahr bleibt unveränderlich; API/DB/UI |
| Create-Form | Aktuelles Kalenderjahr anzeigen | Pflichtfeld mit Default; UI |
| Bestehender Kalender | Update versucht `year` zu ändern | Nicht im Update-DTO, strukturierte Ablehnung; API |
| Tür mit 0/10/11 Blöcken | PUT speichern | 0 und 10 erlaubt, 11 → 409 mit fachlichem Code; API/UI |
| Positionen 0, doppelt, Lücke oder unsortiert | PUT | Nur 1..N lückenlos gültig; 409; API/DB |
| Leerer formatierter Text | PUT | Fachlicher 409, keine Änderung; API |
| HTML mit Skript/Eventhandler/javascript:-Link | PUT/GET | Gefährliche Inhalte werden nicht ausgeführt; Sicherheits-/UI-Test |
| Kalender unveröffentlicht | Empfänger GET | Kein aktiver Token, keine Inhalte; API |
| Veröffentlichung leerer Kalender | PUT sharing | Erfolgreich, genau ein aktiver Token; API/DB |
| Widerruf, Re-Publish, Rotation | Shared GET alter/neuer Token | Alt 404 neutral, neu zulässig; Status erhalten; API |
| Vor 1. Dezember des Kalenderjahres | Shared GET/UI | Countdown, Raster nicht angezeigt; UI/Clock |
| 1. Dezember 00:00 Berlin und später | Shared GET/UI | Raster bleibt dauerhaft; UI/Clock |
| Tür 24 vor 24.12. 00:00 / danach | PUT öffnen | 409 DOOR_NOT_YET_UNLOCKED / Erfolg; API/Clock |
| 24.12. 23:59 / 25.12. 00:00 Berlin | Ersteller schließt OPENED | Erfolg / 409 DOOR_CLOSE_PERIOD_ENDED; Clock/API |
| Bereits OPENED mit korrekter Version | PUT erneut | 200, firstOpened=false, keine Versionserhöhung; API |
| Bereits OPENED mit alter Version | PUT erneut | **409 VERSION_CONFLICT**, keine Inhalte oder Mutation; API |
| Erstes FILLED mit alter Version | PUT | 409 VERSION_CONFLICT, kein Öffnen; API |
| Erfolgreicher Erst-PUT | Antwort | firstOpened=true, Inhalte, aktuelle Version; Animation; API/UI |
| Bereits OPENED | GET | Inhalt ohne Animation, Version unverändert; API/UI |
| Ersteller schließt zuvor OPENED | Empfänger GET aus altem Snapshot | Keine Inhalte/Seiteneffekt, anschließend aktualisieren; API/UI |
| Geschlossenes Türchen erneut geöffnet | PUT mit aktueller Version | firstOpened=true, Animation erneut; API/UI |
| Empfänger 409 VERSION_CONFLICT | Bestätigung der Aktualisierung | Erst dann Übersicht neu laden; OPENED GET, FILLED nur erneuter Klick PUT; UI |
| Server-PUT erfolgreich, Response verloren | Client mit alter Version erneut PUT | 409, danach bestätigtes Reload und GET ohne Animation; API/UI |
| Jahr vergangen, 24 EMPTY | Zustand ableiten | Nicht abgeschlossen, weiter editierbar; Clock/API |
| Jahr vergangen, 1 OPENED und 23 EMPTY | Zustand ableiten | ABGESCHLOSSEN, endgültige Sperre; Clock/API |
| Jahr vergangen, 1 OPENED, 1 FILLED | Letztes FILLED öffnen | PUT erfolgreich, completed=true, version +1, danach Sperre; DB/API |
| Jahr vergangen, 1 OPENED, 1 FILLED | Letztes FILLED leeren | UI warnt **vor** PUT, PUT erfolgreich, danach completed; UI/DB/API |
| Jahr vergangen | Kalenderjahr auswählen/editor öffnen | Warnhinweis vor möglichem sofortigem Abschluss; UI |
| 24.12. zu 25.12. | Zeitgeber vorspulen | Abschluss dynamisch ab 00:00, keine Cron-Aktion oder eigene Version; Clock |
| Ein Kalender, zwei Schreibaktionen mit alter Version | Parallel in echten DB-Transaktionen | Genau ein Gewinner, Verlierer 409, keine Teilmutation; MySQL |
| Letztes Öffnen vs. gleichzeitiges Befüllen | Parallel | Serielle Transaktionen; abgeschlossener Kalender kann nicht verändert werden; MySQL |
| Empfängeröffnung vs. Widerruf | Parallel | Erste gültige Mutation gewinnt; 409 bzw. neutraler 404; MySQL |
| Tokenrotation vs. Öffnung | Parallel | Kein alter Token nach Rotation, keine Zombie-Öffnung; MySQL |
| Unterschiedliche Türchen, gleiche alte Version | Beide PUT | Zweiter 409 trotz unterschiedlicher Tür; MySQL |
| Fremder Ersteller | Ändert/fetcht fremden Kalender | **403** ohne Datenfreigabe; Security/API |
| Ungültiger/widerrufener Token | GET/PUT | Einheitlicher **404**, keine Informationen über Kalender; Security |
| Konto wird gelöscht | Alle zugehörigen Daten | Keine verbliebenen Kalender/Türchen/Tokens; Integrations-Test |
| Firebase-Löschung scheitert partiell | Wiederaufnahme gemäß bestehendem Pattern | Kein dauerhaft zugänglicher verwaister Kalender; Integration |
| Migration in bestehender MySQL-DB | Up-/Rollback/Prüfung | Bestehende minApps unverändert; Migration |
| Mobile, Tastatur, Screenreader | Editor/Dialog/Shared UI bedienen | WCAG 2.2 AA, verständliche Zustände und Fehlermeldungen; Frontend |

## 3. Review der Architektur

- Repository-Konventionen: Angular Standalone/Signals, TailwindCSS, NestJS-Module, DTO/Domain/Entity-Mapper, TypeORM-Repositories, Firebase/minFactory-Guards, Swagger-Generierung.
- Fachliche Vollständigkeit: Jahreswahl, 24 Türen, 0–10 Blöcke, Uhrzeit, Publication, Bearbeitbarkeit, `ABGESCHLOSSEN`, löschen, keine Sondervorschau.
- Sicherheit: Token-Entropie, Revocation/Rotation, Caching/Referrer/Logs, Sanitizing, Fremdeigentum, Konto-Löschung.
- Transaktionen: genau eine globale Version, strict PUT inklusive OPENED, atomare Closure/Versionsprüfung und Sperre in echten MySQL-Races.
- Fehlervertrag: 409 für Versionen/fachliche Regeln, 403 für Rechte, 400 für Formfehler, 404 für Shared Token, getrennte maschinenlesbare Codes.
- Keine vorgeschriebene unnötige Klassenstruktur und keine neuen Frameworks.

## 4. Konkret vor Umsetzung zu entscheiden

Die vertragliche HTTP-Semantik ist verbindlich; kleinere umsetzungsabhängige Details bleiben im späteren Implementierungsticket zu bestätigen: URL-Maximallänge, tatsächliche Ersteller-Routen/-DTO-Bezeichner, physische Block-Payload-Abbildung, genaue Rate-Limits, Rollout/DB_SYNCHRONIZE-Strategie und konkrete Account-Löschwiederaufnahme. Sie dürfen die beschriebenen Fachregeln nicht ändern. Dokumentations-PR implementiert keine Funktionalität.
