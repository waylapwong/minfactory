# minSplit | Technische Spezifikation v1.0.0

> **Geplanter Soll-Zustand; nicht als bereits implementiert zu verstehen.** Verbindliche Fachbasis: [minSplit fachlich](../../business/3-mintools/minsplit/minsplit-home.md) und die dort verlinkten Detailseiten. Dokumentationsauftrag: [#202](https://github.com/waylapwong/minfactory/issues/202). Der Produktumfang entspricht dem fachlich definierten Gesamtumfang, unabhängig von der späteren Aufteilung auf Entwicklungs-Milestones bis v0.5.0.

## Architekturentscheidungen

1. Eigenständiges `minsplit`-Feature in Angular und NestJS im bestehenden minFactory-Monorepo; kein neues Framework.
2. Firebase/minFactory-Login und Eigentümerprüfung nur für Ersteller-Routen; öffentliche Gruppen-Routen ausschließlich über einen geheimen gemeinsamen Link. Die gewählte handelnde Person ist **keine Authentifizierung**.
3. MySQL/TypeORM mit fünf Kernressourcen: Gruppe, Teilnehmer, Ausgabe, fixierte Ausgleichszahlung, **append-only Chronik**.
4. **Eine globale Gruppen-Version, initial 1**: jeder mutierende Request verlangt `expectedVersion`; ein erfolgreicher Vorgang erhöht sie **einmal**, auch wenn er mehrere Ausgaben und Chronikeinträge betrifft.
5. Alle Mutationen innerhalb einer zur Gruppe serialisierten DB-Transaktion; veraltete Version führt zu `409 VERSION_CONFLICT` ohne Nebeneffekt.
6. Statusautomat `ACTIVE → SETTLING → CLOSED`; Übergänge nur vorwärts. In `CLOSED` bleiben sämtliche fachlichen Daten unveränderlich; der Ersteller darf weiterhin den geheimen Link erneuern oder die Gruppe löschen.
7. Ausgaben werden ausschließlich in Integer-Cent gespeichert; Storno statt Editieren, fortlaufende **gruppenweit eindeutige Buchungsnummer**.
8. Beim Entfernen einer Person werden ihre gültigen Ausgaben **atomar storniert und auf einen verbleibenden Ersatz neu erfasst**; ehemalige Teilnehmer erhalten in minSplit keine weiteren Zahlungsansprüche.
9. Einmalige centgenaue Schlussabrechnung mit ausgenommenen Rest-Cent und nach Beitrittsreihenfolge deterministisch festgelegtem Zahlungsplan.
10. Die Chronik besteht aus unveränderlichen Einzelereignissen mit stabilen Referenzen; aktuelle Teilnehmernamen werden dynamisch angezeigt, Umbenennungen bleiben als Alt-/Neu-Ereignis erhalten.
11. Keine WebSockets/automatischen Retries; Swagger/OpenAPI erzeugt den Angular-Client, generierte Dateien nicht manuell anfassen.
12. Für diese Version **ausschließlich Unit-Tests** mit bestehenden Werkzeugen und Mocks.

## Kapitel

- [Architektur, Gruppenphasen und Transaktionen](architecture.md)
- [Datenbank, Integrität und Migrationen](database.md)
- [REST-API und Fehlervertrag](api.md)
- [Angular-Frontend und Visualisierungen](frontend.md)
- [Sicherheit, Freigabelinks und Datenschutz](security.md)
- [Unit-Tests, Rechenbeispiele und Review](testing.md)

**Nicht Bestandteil von #202:** Featurecode, echte Migrationen, generierte Clients oder API-/Integrations-/E2E-Tests.
