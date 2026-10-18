# minAdvent | Sicherheit und Datenschutz

> **Soll-Konzept v1.0.0** · [Übersicht](minadvent-home.md)

## 1. Authentifizierte Ersteller

Vorhandene Firebase Authentication und minFactory-Benutzerintegration nutzen. Ersteller-Routen registrieren die Guards in dieser Reihenfolge: `FirebaseGuard`, `MinFactoryUserGuard`, `AuthorizationGuard`. `FirebaseGuard` validiert den Bearer-Token und setzt `request.identity`; `MinFactoryUserGuard` löst daraus den minFactory-Domänenbenutzer auf, den `@User()` bereitstellt; `AuthorizationGuard` wertet die mit `@Can()` deklarierte Policy aus. Ressourcenabhängige Eigentümerprüfung erfolgt in Service/Policy mit der vorhandenen `AuthorizationService`-/`@Can()`-Architektur: nur eigene Kalender verwalten, fremder Kalender → **403** ohne Inhaltsfreigabe. Eigenschaftsprüfung ist bei Listen ebenso wichtig wie bei einzelnen Mutationen. Nicht dem vom Client gelieferten Owner vertrauen.

## 2. Öffentliche Empfängerlinks

Ein Kalender besitzt vor **ausdrücklicher Veröffentlichung keinen** Shared Token. Veröffentlichen erzeugt mit kryptografischem CSPRNG **mindestens 256 Bit Entropie**; pro Kalender höchstens ein aktiver Token. Fachlich bewusst gewählte Klartextspeicherung in der Datenbank erhöht den Schutzbedarf: Token nie in Logs, Tracing-Daten, Telemetrie oder Client-Fehlermeldungen schreiben; DB-Zugriff begrenzen, Backups schützen. Keine Tokenhistorie nötig.

Token steht im Browser-URL-Pfad und ist ein **Bearer Secret**: jeder Besitzer darf den persönlich adressierten Kalender sehen und verfügbare Türen öffnen. Empfängername ist kein Identitätsnachweis. Freigabe-Token nicht in Indexen, Sitemaps, Referer oder Analytics übertragen; `Referrer-Policy: no-referrer`, restriktive Cache-Header (`Cache-Control: no-store`) für geteilte Antworten, CSP und bestehendes Helmet beachten. Keine localStorage-Persistenz des Tokens. Externe Links mit `rel="noopener noreferrer"` öffnen. HTTPS voraussetzen.

Widerruf muss den Token **sofort atomar** invalidieren; Wiederveröffentlichung und Rotation erzeugen neue Secrets, auch bei ABGESCHLOSSEN, ohne Tür-/Inhaltsänderung. Alte Tokens liefern einheitlich **404** mit neutralem Text „Dieser Adventskalender ist nicht verfügbar.“ Keine Unterscheidung unbekannt/widerrufen/gelöscht, keine Existenzlecks. Empfängerzugriff niemals durch globalen Firebase-Guard blockieren.

## 3. Abwehrmaßnahmen und Eingaben

- Angemessene **Rate Limits** für Shared GET/PUT, tokenbasierte Brute-Force-Abwehr ohne neue unnötige Infrastruktur; ungültige Token gleich behandeln.
- Text-WYSIWYG nur erlaubte Grundformatierungen (Absätze, Listen, fett, kursiv); gefährliche HTML-Attribute, Eventhandler, Skripte und URLs herausfiltern. Serverseitig validieren/sanitizen und bei Darstellung sicher rendern; Angulars Standard-Sanitization nicht durch generelles Bypass-Trust aushebeln.
- Externe Links ausschließlich validierte `http:`/`https:`-URLs. Blockgrenzen/Pflichtfelder serverseitig durchsetzen; keine blind übernommene HTML-Quelle.
- Angemeldete Ersteller-CORS und anonyme Shared-Routen ohne unbeabsichtigte Cross-Origin-Ausweitung prüfen; Content- und Auth-Guards getrennt anwenden.
- Für PUTs und Linkänderungen globale Version und abgeleiteten Abschluss in **derselben DB-Transaktion** unter geeigneter Sperre prüfen. Token-Revoke und Öffnung dürfen nicht gleichzeitig beide mit veralteten Voraussetzungen durchgehen.

## 4. Accountlöschung

Vorhandenen Firebase/MySQL-Konto-Löschpfad prüfen und um die **vollständige** Entfernung sämtlicher Kalender, Türen, Inhaltsblöcke, Veröffentlichungstokens und Fortschrittszustände ergänzen. FK-Kaskaden gelten für MySQL, aber Accountlöschung über Firebase und MySQL ist nicht eine einzige verteilte ACID-Transaktion: Teilausfälle explizit im bestehenden Löschablauf behandeln (z. B. idempotente Wiederaufnahme gemäß vorhandenem Pattern), keine zusätzliche persistente Job-Tabelle erfinden. Alte Shared Links müssen nach erfolgreicher Entfernung sofort nicht mehr verfügbar sein. Keine Wiederherstellung oder Aufbewahrung von geöffneten Türchen nach Accountlöschung.

## 5. Sicherheits-Unit-Tests

Für v1.0.0 ausschließlich isolierte Unit-Tests mit Mocks vorsehen: fremder Kalenderzugriff und Owner-Filterung, ungültige Tokens ohne Existenzinformationen, Tokenrotation/Widerruf, validierte Inhalte, fehlende Token-/Inhaltsdaten in Logs oder Fehlerantworten sowie idempotente Accountlöschung bei simuliertem Teilausfall. HTTP-/Security-Integrationsläufe, Lasttests und Tests gegen echte Datenbanken sind nicht vorgesehen. Rate Limits, Referrer-/Cache-Header und CORS bleiben verbindliche Implementierungsanforderungen; ihre Konfiguration wird nicht als eigener Testlauf vorausgesetzt.
