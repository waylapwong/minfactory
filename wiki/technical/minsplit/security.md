# minSplit | Sicherheit, Zugriffe und Datenschutz

> **Soll-Konzept v1.0.0** · [Übersicht](minsplit-home.md)

## Authentifizierte Ersteller

Vorhandene Firebase-/minFactory-Integrationen verwenden: `FirebaseGuard`, `MinFactoryUserGuard`, `AuthorizationGuard`, vorhandene `@Can()`-/Policy- und `@User()`-Konventionen. Für jede Erstelleraktion (Create/List/Get, Teilnehmerverwaltung, Status, Rotation, Delete) eigene Gruppenzugehörigkeit anhand authentifizierter **minFactory-User-ID** serverseitig prüfen. Der Gruppen-Creator bleibt Teilnehmer und ist nicht entfernbar. Ein öffentlicher Link oder eine vom Client genannte handelnde Person **verleiht keine Eigentümerrechte**.

## Shared Link als Bearer Secret

Beim Erstellen der Gruppe einen kryptografisch sicheren Token mit **mindestens 256 Bit Entropie** erzeugen; **genau einen** gültigen Token pro Gruppe. Den **aktuellen Token** wie bei der bestehenden minAdvent-Spezifikation in einer geschützten eindeutigen Datenbankspalte vorhalten, sodass der angemeldete Ersteller den bestehenden Link jederzeit wieder abrufen/kopieren kann. Das ist eine bewusst sicherheitssensible reversible Speicherung: DB-Berechtigungen und Backups besonders schützen. Nur der Ersteller darf den Token über authentifizierte Routen lesen; öffentliche Responses enthalten ihn nicht. Diese Details sind technische Sicherheitsentscheidungen, keine zusätzliche fachliche Zugangshürde.

Bei Rotation den alten Hash **atomar** ersetzen, globale Version einmal erhöhen; erst nach Commit ist alter Link ungültig. Gleichzeitige Linkzugriffe/Rotationen werden im Gruppen-Transaktionskontext erneut geprüft. Öffentliche Antworten für ungültigen/rotierten/gelöschten Token: derselbe neutrale **404 GROUP_UNAVAILABLE**, ohne Gruppenexistenz zu verraten.

Token im Pfad ist geheim: HTTPS, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` für tokenbasierte Antworten, keine Indexierung, keine Token in Serverlogs, URL-Logging, Tracing, Analytics, Querystrings anderer Dienste oder Client-Fehlern. Client-Speicherung der **handelnden Teilnehmer-ID** ist erlaubt; das Geheimnis selbst nicht erneut in Local/SessionStorage ablegen. Externe URLs mit `noopener noreferrer`; vorhandene CORS-/Helmet/CSP-Regeln beibehalten. Client darf keine dritte Partei mit Token im Referer kontaktieren.

## Bedrohungsmodell und Schutz

Linkbesitz berechtigt **alle** phasenabhängigen öffentlichen Aktionen. Die gewählte `actorParticipantId` muss zur Gruppe gehören und aktiv sein, ist aber **unverifiziert**; jeder Linkinhaber könnte jede aktive Identität auswählen. Die Chronik dokumentiert deshalb nur die *behauptete* handelnde Person, keinen beweissicheren Absender. Erstelleraktionen verwenden die authentifizierte Creator-ID, nicht die Personenauswahl. Einen einzelnen entfernten Benutzer allein durch Entfernen **nicht** vom Shared-Link-Zugriff aussperren; dazu ist Linkrotation für **alle** bisherigen Linkinhaber nötig.

Rate Limiting nach bestehendem NestJS-Throttler-/Proxy-IP-Pattern für öffentliche Lesen/Schreiben und Token-Guessing; Token nicht in Rate-Limit-Keys im Klartext. Alle Teilnehmer-IDs, Expense-/Settlement-IDs auf Gruppenzugehörigkeit kontrollieren; Verwechslungen gruppenübergreifender IDs abweisen. DTO-Whitelist, Servervalidierung für Namen, Beträge, Längen, Zustände und Versionen; nutzergenerierten Text sicher als Text rendern (keine HTML-Injektion). Loggen nur operationale Metadaten, Status-/Fehlercode, Request-ID/Laufzeit ohne Token, Beschreibungen, Teilnehmernamen und Geldhistorie.

## Account- und Gruppenlöschung

Gruppenlöschung verlangt im UI ausdrückliche Bestätigung mit exaktem Gruppennamen; serverseitig in einer Transaktion Version, Owner und `confirmationName` überprüfen. Kinddaten (Participants, Expenses, Settlements, History und ggf. Remainder-Snapshots) samt Freigabetoken durch FK-Cascade bzw. gleichwertige Transaktionslöschung vollständig entfernen. Bei Löschung des minFactory-Accounts die verknüpften Gruppen in den bestehenden Löschablauf einbinden; Firebase/MySQL sind keine gemeinsame verteilte ACID-Transaktion, Teilausfälle entsprechend vorhandener Wiederaufnahme-/Idempotenzkonvention behandeln. Keine Archivierung nach endgültiger Löschung.
