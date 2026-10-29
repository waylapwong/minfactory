# 8. Querschnittliche Konzepte

## minAdvent | Sicherheit und Datenschutz

> **Soll-Konzept v1.0.0** · [Übersicht](README.md)

#### 1. Authentifizierte Ersteller

Vorhandene Firebase Authentication und minFactory-Benutzerintegration nutzen. Ersteller-Routen registrieren die Guards in dieser Reihenfolge: `FirebaseGuard`, `MinFactoryUserGuard`, `AuthorizationGuard`. `FirebaseGuard` validiert den Bearer-Token und setzt `request.identity`; `MinFactoryUserGuard` löst daraus den minFactory-Domänenbenutzer auf, den `@User()` bereitstellt; `AuthorizationGuard` wertet die mit `@Can()` deklarierte Policy aus. Ressourcenabhängige Eigentümerprüfung erfolgt in Service/Policy mit der vorhandenen `AuthorizationService`-/`@Can()`-Architektur: nur eigene Kalender verwalten, fremder Kalender → **403** ohne Inhaltsfreigabe. Eigenschaftsprüfung ist bei Listen ebenso wichtig wie bei einzelnen Mutationen. Nicht dem vom Client gelieferten Owner vertrauen.

#### 2. Öffentliche Empfängerlinks

Ein Kalender besitzt vor **ausdrücklicher Veröffentlichung keinen** Shared Token. Veröffentlichen erzeugt mit kryptografischem CSPRNG **mindestens 256 Bit Entropie**; pro Kalender höchstens ein aktiver Token. Fachlich bewusst gewählte Klartextspeicherung in der Datenbank erhöht den Schutzbedarf: Token nie in Logs, Tracing-Daten, Telemetrie oder Client-Fehlermeldungen schreiben; DB-Zugriff begrenzen, Backups schützen. Keine Tokenhistorie nötig.

Token steht im Browser-URL-Pfad und ist ein **Bearer Secret**: jeder Besitzer darf den persönlich adressierten Kalender sehen und verfügbare Türen öffnen. Empfängername ist kein Identitätsnachweis. Freigabe-Token nicht in Indexen, Sitemaps, Referer oder Analytics übertragen; `Referrer-Policy: no-referrer`, restriktive Cache-Header (`Cache-Control: no-store`) für geteilte Antworten, CSP und bestehendes Helmet beachten. Keine localStorage-Persistenz des Tokens. Externe Links mit `rel="noopener noreferrer"` öffnen. HTTPS voraussetzen.

Widerruf muss den Token **sofort atomar** invalidieren; Wiederveröffentlichung und Rotation erzeugen neue Secrets, auch bei ABGESCHLOSSEN, ohne Tür-/Inhaltsänderung. Alte Tokens liefern einheitlich **404** mit neutralem Text „Dieser Adventskalender ist nicht verfügbar.“ Keine Unterscheidung unbekannt/widerrufen/gelöscht, keine Existenzlecks. Empfängerzugriff niemals durch globalen Firebase-Guard blockieren.

#### 3. Abwehrmaßnahmen und Eingaben

- Angemessene **Rate Limits** für Shared GET/PUT, tokenbasierte Brute-Force-Abwehr ohne neue unnötige Infrastruktur; ungültige Token gleich behandeln.
- Text- und Gutscheinbeschreibungen sind einfacher Text, kein WYSIWYG- oder beliebiger HTML-Inhalt. Inhalte bei der Darstellung als Text behandeln; Angulars Standard-Sanitization nicht durch generelles Bypass-Trust aushebeln.
- Externe Links ausschließlich validierte `http:`/`https:`-URLs. Blockgrenzen/Pflichtfelder serverseitig durchsetzen; keine blind übernommene HTML-Quelle.
- Angemeldete Ersteller-CORS und anonyme Shared-Routen ohne unbeabsichtigte Cross-Origin-Ausweitung prüfen; Content- und Auth-Guards getrennt anwenden.
- Für PUTs und Linkänderungen globale Version und abgeleiteten Abschluss in **derselben DB-Transaktion** unter geeigneter Sperre prüfen. Token-Revoke und Öffnung dürfen nicht gleichzeitig beide mit veralteten Voraussetzungen durchgehen.

#### 4. Accountlöschung

Vorhandenen Firebase/MySQL-Konto-Löschpfad prüfen und um die **vollständige** Entfernung sämtlicher Kalender, Türen, Inhaltsblöcke, Veröffentlichungstokens und Fortschrittszustände ergänzen. FK-Kaskaden gelten für MySQL, aber Accountlöschung über Firebase und MySQL ist nicht eine einzige verteilte ACID-Transaktion: Teilausfälle explizit im bestehenden Löschablauf behandeln (z. B. idempotente Wiederaufnahme gemäß vorhandenem Pattern), keine zusätzliche persistente Job-Tabelle erfinden. Alte Shared Links müssen nach erfolgreicher Entfernung sofort nicht mehr verfügbar sein. Keine Wiederherstellung oder Aufbewahrung von geöffneten Türchen nach Accountlöschung.

#### 5. Sicherheits-Unit-Tests

Für v1.0.0 ausschließlich isolierte Unit-Tests mit Mocks vorsehen: fremder Kalenderzugriff und Owner-Filterung, ungültige Tokens ohne Existenzinformationen, Tokenrotation/Widerruf, validierte Inhalte, fehlende Token-/Inhaltsdaten in Logs oder Fehlerantworten sowie idempotente Accountlöschung bei simuliertem Teilausfall. HTTP-/Security-Integrationsläufe, Lasttests und Tests gegen echte Datenbanken sind nicht vorgesehen. Rate Limits, Referrer-/Cache-Header und CORS bleiben verbindliche Implementierungsanforderungen; ihre Konfiguration wird nicht als eigener Testlauf vorausgesetzt.

---

## minAdvent | Teststrategie und Architektur-Review

> **Geplanter Soll-Zustand v1.0.0** · [Übersicht](README.md)

#### 1. Testwerkzeuge und Umfang

Für v1.0.0 sind ausschließlich Unit-Tests vorgesehen: Backend mit Jest/ts-jest, Frontend mit Jasmine/Karma. Datenbankzugriffe, Guards, Zeitquellen und externe Dienste werden über wiederverwendbare Feature-Mocks ersetzt; keine API-, Integrations-, Datenbank-, E2E-, Last-, Security- oder Regressionstestläufe. Bestehende Mock-Verzeichnisse verwenden, keine Inline-Mocks. Die Produktivregeln bleiben serverseitig maßgeblich.

#### 2. Fachliche und technische Szenarien

| Ausgangslage | Aktion | Erwartung / Ebene |
| --- | --- | --- |
| Kalenderanlage | Create mit vergangenen/aktuellen/zukünftigen Jahren | Pflichtfelder, Initialwerte und genau 24 EMPTY-Türen; Service-/Repository-Unit-Test mit Repository-/Transaction-Mock |
| Jahresgrenzen | Werte vor, innerhalb und nach dem erlaubten Jahrbereich | Gültige Jahre akzeptiert, ungültige Jahre abgelehnt; Service-Unit-Test |
| Jahr ändern | Update-Payload mit zusätzlichem `year` | Whitelist lehnt unbekanntes Feld ab; DTO-/ValidationPipe-Unit-Test |
| 24-Türen-Invariante | Fehler beim Speichern der Türen | Eine Transaktion umfasst Kalender und 24 Türen; Repository-Unit-Test mit gemocktem EntityManager |
| 0/10/11 Inhaltsblöcke und lückenhafte Positionen | Türchen speichern | Grenzen und Validierungsfehler; Service-Unit-Test mit Repository-Mock |
| Leerer oder gefährlicher Text/Link | Inhalte validieren und abbilden | Leere Werte und nicht erlaubte Inhalte werden abgelehnt/sicher behandelt; Validator-/Mapper-Unit-Test |
| Veröffentlichung, Widerruf und Rotation | Freigabezustände mit gemocktem Repository ändern | Tokenzustand, Versionsprüfung und neutrale Fehlercodes; Service-Unit-Tests |
| Datumsgrenzen in `Europe/Berlin` | Clock-Mock vor/nach Dezember- und Türchentaggrenzen | Countdown, Öffnungsfreigabe und Schließfrist entsprechen dem Kalenderjahr; Service-/Mapper-Unit-Tests |
| Öffnung und wiederholte PUTs | Status-/Versionskombinationen über Service-Mocks abbilden | OPENED idempotent ohne Versionszuwachs; veraltete Version immer 409; Service-Unit-Test |
| Abschluss | EMPTY/FILLED/OPENED-Verteilungen und Clock-Mock kombinieren | Abgeleiteter Abschluss, Sperren und erfolgreiche auslösende Mutation; Service-Unit-Test |
| Versionskonflikte | Zwei Aufrufe mit derselben erwarteten Version simulieren | Nur erfolgreiche Mutation verändert Version; stale requests erhalten 409; Service-Unit-Test |
| Ownership | Eigentümer und fremder Nutzer lesen/verändern Ressourcen | Eigene Kalender sichtbar, Fremdzugriff 403; Service-Unit-Test mit Repository-Mock |
| Shared-Link-Fehler | Ungültigen oder widerrufenen Token simulieren | Einheitlicher neutraler 404 ohne Daten; Service-Unit-Test |
| Kalenderlöschung | Gemockte Cascade-/Accountlösch-Responses | Zugehörige Daten werden im Domänenablauf entfernt; Service-Unit-Test |
| Migration | TypeORM `QueryRunner` mocken | Up-/Down-Anweisungen, Constraints und FK-Kaskade werden korrekt angefragt; Migration-Unit-Test |
| Formulare und UI-Zustände | Angular Forms mit Repository-Mock bedienen | Pflichtfelder, Grenzen, Loading/Success/Error/Empty und Tastaturfokus; Komponenten-Unit-Test |

#### 3. Review der Architektur

- Repository-Konventionen: Angular Standalone/Signals, TailwindCSS, NestJS-Module, DTO/Domain/Entity-Mapper, TypeORM-Repositories, Firebase/minFactory-Guards, Swagger-Generierung.
- Fachliche Vollständigkeit: Jahreswahl, 24 Türen, 0–10 Blöcke, Uhrzeit, Freigabe, Bearbeitbarkeit, `ABGESCHLOSSEN`, löschen, keine Sondervorschau; Regeln als isolierte Service-Unit-Tests mit festen Eingaben und Mocks abbilden.
- Sicherheit: Token-Entropie, Widerruf/Rotation, Caching/Referrer/Logs, Sanitizing, Fremdeigentum und Kontolöschung durch gezielte Unit-Tests der jeweiligen Fachlogik abdecken.
- Transaktionen: Versions- und Abschlussregeln über Unit-Tests mit gemocktem TypeORM-Manager prüfen; keine echten Datenbank- oder Race-Testläufe voraussetzen.
- Fehlervertrag: 409 für Versionen/fachliche Regeln, 403 für Rechte, 400 für Formfehler, 404 für Shared Token, getrennte maschinenlesbare Codes.
- Keine vorgeschriebene unnötige Klassenstruktur und keine neuen Frameworks.

#### 4. Konkret vor Umsetzung zu entscheiden

Die vertragliche HTTP-Semantik ist verbindlich; kleinere umsetzungsabhängige Details bleiben im späteren Implementierungsticket zu bestätigen: tatsächliche Ersteller-Routen/-DTO-Bezeichner, physische Block-Payload-Abbildung, genaue Rate-Limits, Rollout/DB_SYNCHRONIZE-Strategie und konkrete Account-Löschwiederaufnahme. Sie dürfen die beschriebenen Fachregeln nicht ändern. Dokumentations-PR implementiert keine Funktionalität.
