# 9. Architekturentscheidungen

## minAdvent | Technische Spezifikation v1.0.0

> **Geplanter Soll-Zustand, nicht implementiert.** Verbindliche Fachanforderungen: [minAdvent fachlich](../../../business/3-mintools/minadvent/minadvent-home.md), [#175](https://github.com/waylapwong/minfactory/issues/175). Auftrag: [#176](https://github.com/waylapwong/minfactory/issues/176). Der technische Entwurf ist Ausgangspunkt für spätere, getrennte Implementierungstickets.

#### Architekturentscheidungen

1. Eigenständiges Angular-Standalone-Feature und NestJS-Featuremodul, integriert in die vorhandene minFactory-Architektur.
2. Firebase/minFactory-Authentifizierung nur für Erstelleraktionen; öffentliche Empfänger-Routen werden ausschließlich durch den aktiven geheimen Link geschützt.
3. Genau 24 Türchen pro Kalender, `EMPTY`, `FILLED`, `OPENED`; höchstens zehn typübergreifende, 1-basiert geordnete Blöcke pro Türchen.
4. Ein beim Anlegen frei gewähltes, danach unveränderliches Kalenderjahr (Default aktuelles Jahr).
5. MySQL/TypeORM mit versionierten Migrationen; Entitäten und Repositories nach bestehenden Feature-Konventionen.
6. **Eine** globale Kalender-Version für alle Mutationen, keine zusätzlichen Türchen- oder Freigabeversionen.
7. Versionskontrolle und berechnete Abschlussbedingung werden atomar innerhalb derselben synchronisierten Transaktion geprüft.
8. `ABGESCHLOSSEN` ab 25.12. 00:00 Europe/Berlin, mindestens einem `OPENED`, keinem `FILLED`; ohne gespeichertes Abschlussfeld oder Cron.
9. Abschluss sperrt direkte Inhalts- und Metadatenänderungen, aber der Ersteller kann geöffnete Türchen jederzeit schließen; dadurch wird der abgeleitete Abschluss aufgehoben. Linkverwaltung, lesender Empfängerzugriff und Löschen bleiben ebenfalls erlaubt.
10. Shared Token frühestens bei ausdrücklicher Veröffentlichung, mindestens 256 Bit Zufall; Widerruf, Rotation und Wiederveröffentlichung sind atomar.
11. Ressourcenorientierte REST-Schnittstellen: `PUT` für Erstöffnung, `GET` ausschließlich für bereits geöffnete Inhalte; kein `/open` oder `/close`-Action-Endpunkt.
12. Strikte Version **für jeden PUT**, auch bereits `OPENED`: veraltet stets `409 VERSION_CONFLICT`; bei aktueller Version bleibt wiederholtes Öffnen idempotent.
13. `409` auch für fachliche Regelverletzungen, `403` für Berechtigungen, `400` für strukturelle Fehler, `404` neutral für ungültige Links; stabile maschinenlesbare Fehlercodes.
14. Angular Signals/Reactive Forms und aus Swagger generierter Client; kein NgRx, kein gesonderter Testmodus oder Erstellervorschau, keine automatischen PUT-Retries.
15. Zeitregeln über einen austauschbaren serverseitigen Zeitgeber mit `Europe/Berlin`, persistierte Zeitstempel in UTC.

#### Kapitel

- [Architektur und kritische Abläufe](../../minadvent/architecture.md)
- [Datenmodell und Migrationen](../../minadvent/database.md)
- [REST-API und Fehlervertrag](../../minadvent/api.md)
- [Angular-Frontend](../../minadvent/frontend.md)
- [Sicherheit und Datenschutz](../../minadvent/security.md)
- [Teststrategie und Architektur-Review](../../minadvent/testing.md)

**Nicht Gegenstand dieses Tickets:** Änderungen an Produktivcode, Datenbank oder generiertem Client. Die konkreten Bezeichner im technischen Entwurf sind Vorschläge, keine zwingend vorgegebenen Klassennamen.
