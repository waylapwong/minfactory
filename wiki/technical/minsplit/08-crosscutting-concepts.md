# 8. Querschnittliche Konzepte

## minSplit | Sicherheit, Zugriffe und Datenschutz

> **Soll-Konzept v1.0.0** · [Übersicht](../../minsplit/minsplit-home.md)

#### Authentifizierte Ersteller

Vorhandene Firebase-/minFactory-Integrationen verwenden: `FirebaseGuard`, `MinFactoryUserGuard`, `AuthorizationGuard`, vorhandene `@Can()`-/Policy- und `@User()`-Konventionen. Für jede Erstelleraktion (Create/List/Get, Teilnehmerverwaltung, Status, Rotation, Delete) eigene Gruppenzugehörigkeit anhand authentifizierter **minFactory-User-ID** serverseitig prüfen. Der Gruppen-Creator bleibt Teilnehmer und ist nicht entfernbar. Ein öffentlicher Link oder eine vom Client genannte handelnde Person **verleiht keine Eigentümerrechte**.

#### Shared Link als Bearer Secret

Beim Erstellen der Gruppe einen kryptografisch sicheren Token mit **mindestens 256 Bit Entropie** erzeugen; **genau einen** gültigen Token pro Gruppe. Den **aktuellen Token** wie bei der bestehenden minAdvent-Spezifikation in einer geschützten eindeutigen Datenbankspalte vorhalten, sodass der angemeldete Ersteller den bestehenden Link jederzeit wieder abrufen/kopieren kann. Das ist eine bewusst sicherheitssensible reversible Speicherung: DB-Berechtigungen und Backups besonders schützen. Nur der Ersteller darf den Token über authentifizierte Routen lesen; öffentliche Responses enthalten ihn nicht. Diese Details sind technische Sicherheitsentscheidungen, keine zusätzliche fachliche Zugangshürde.

Bei Rotation den bisher gespeicherten **Klartext-Token in `minsplit_groups.share_token` atomar durch einen neuen CSPRNG-Token ersetzen**, globale Version einmal erhöhen; nach Commit ist ausschließlich der neue Token gültig. Es existiert für v1.0.0 kein zusätzliches Token-Hash- oder Digest-Feld. Gleichzeitige Linkzugriffe/Rotationen werden im Gruppen-Transaktionskontext erneut geprüft. Öffentliche Antworten für ungültigen/rotierten/gelöschten Token: derselbe neutrale **404 GROUP_UNAVAILABLE**, ohne Gruppenexistenz zu verraten.

Token im Pfad ist geheim: HTTPS, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` für tokenbasierte Antworten, keine Indexierung, keine Token in Serverlogs, URL-Logging, Tracing, Analytics, Querystrings anderer Dienste oder Client-Fehlern. Client-Speicherung der **handelnden Teilnehmer-ID** ist erlaubt; das Geheimnis selbst nicht erneut in Local/SessionStorage ablegen. Externe URLs mit `noopener noreferrer`; vorhandene CORS-/Helmet/CSP-Regeln beibehalten. Client darf keine dritte Partei mit Token im Referer kontaktieren.

#### Bedrohungsmodell und Schutz

Linkbesitz berechtigt **alle** phasenabhängigen öffentlichen Aktionen. Die gewählte `actorParticipantId` muss zur Gruppe gehören und aktiv sein, ist aber **unverifiziert**; jeder Linkinhaber könnte jede aktive Identität auswählen. Die Chronik dokumentiert deshalb nur die *behauptete* handelnde Person, keinen beweissicheren Absender. Erstelleraktionen verwenden die authentifizierte Creator-ID, nicht die Personenauswahl. Einen einzelnen entfernten Benutzer allein durch Entfernen **nicht** vom Shared-Link-Zugriff aussperren; dazu ist Linkrotation für **alle** bisherigen Linkinhaber nötig.

**Rate Limiting neu einführen**, da derzeit kein bestehendes NestJS-Throttler-/Proxy-IP-Pattern vorausgesetzt werden kann: `@nestjs/throttler` in die NestJS-Anwendung integrieren und öffentliche GET-/Schreibendpunkte mit konfigurierbaren, getrennten Limits schützen. Die Client-IP ausschließlich aus der vom HTTP-Server ermittelten Remote-Adresse beziehungsweise aus Forwarded-Headern **nur bei explizit konfigurierten vertrauenswürdigen Reverse-Proxys** ableiten (`trust proxy` auf bekannte Proxy-Hops/Netze begrenzen, nicht pauschal allen Headern vertrauen). Am Eintrittsproxy untrusted `X-Forwarded-For`-Header bereinigen/überschreiben; andernfalls den Header ignorieren. Nur so lassen sich IP-Spoofing und das irrtümliche gemeinsame Limitieren aller Clients hinter demselben Proxy vermeiden. Limits für fehlgeschlagene Tokenzugriffe ebenso wie reguläre Zugriffe setzen; bei Überschreitung `429` und nach Möglichkeit `Retry-After` ausgeben. Token niemals im Klartext in Rate-Limit-Keys oder Logs verwenden; bei Bedarf nur einen nicht rückrechenbaren Digest mit serverseitigem Secret für tokenbezogene Limits benutzen. Für mehrere Serverinstanzen muss ein geteilter Throttling-Speicher vorgesehen werden; keine zusätzlichen Infrastrukturkomponenten für eine Einzelinstanz vorab verlangen. Alle Teilnehmer-IDs, Expense-/Settlement-IDs auf Gruppenzugehörigkeit kontrollieren; Verwechslungen gruppenübergreifender IDs abweisen. DTO-Whitelist, Servervalidierung für Namen, Beträge, Längen, Zustände und Versionen; nutzergenerierten Text sicher als Text rendern (keine HTML-Injektion). Loggen nur operationale Metadaten, Status-/Fehlercode, Request-ID/Laufzeit ohne Token, Beschreibungen, Teilnehmernamen und Geldhistorie.

#### Account- und Gruppenlöschung

Gruppenlöschung verlangt im UI ausdrückliche Bestätigung mit exaktem Gruppennamen; serverseitig in einer Transaktion Version, Owner und `confirmationName` überprüfen. Kinddaten (Participants, Expenses, Settlements, History und ggf. Remainder-Snapshots) samt Freigabetoken durch FK-Cascade bzw. gleichwertige Transaktionslöschung vollständig entfernen. Bei Löschung des minFactory-Accounts die verknüpften Gruppen in den bestehenden Löschablauf einbinden; Firebase/MySQL sind keine gemeinsame verteilte ACID-Transaktion, Teilausfälle entsprechend vorhandener Wiederaufnahme-/Idempotenzkonvention behandeln. Keine Archivierung nach endgültiger Löschung.

---

## minSplit | Unit-Tests und Review

> **Soll-Konzept v1.0.0** · [Übersicht](../../minsplit/minsplit-home.md) · [Fachliche Beispiele](../../../business/3-mintools/minsplit/expenses.md)

#### Teststrategie

Nur isolierte **Unit-Tests**, Backend mit bestehendem Jest/ts-jest, Frontend mit bestehenden Angular/Jasmine-/Karma-Mitteln; Repository, Guards, EntityManager/Transaktion, CSPRNG, Clock und API-Services über wiederverwendbare **separate Mocks**. Keine Inline-Mocks und keine für v1.0.0 geforderten API-, Integrations-, E2E-, realen DB-, Last- oder Regressionstests. Sicherheit und Nebenläufigkeitslogik im jeweiligen Service/Guard mit Mocks prüfen; keine zusätzliche Test-Infrastruktur einführen.

#### Prüffälle

| Bereich | Eingabe/Aktion | Erwartung |
| --- | --- | --- |
| Gruppenanlage | Creator + eine weitere Person | ACTIVE, Ersteller aktiv, 2 Personen, `version=1`, Join-Sequenzen 1/2, Link erzeugt |
| Gruppenanlage | Nur Creator | Abweisung, keine Gruppe |
| Eindeutige Namen | `" Anna "` und `"anna"` | Trim, case-insensitiv Konflikt; auch bei entferntem Datensatz reserviert |
| Umbenennen | Ben → Benjamin | Eigenes Rename-Ereignis alt/neu; historische Chronik zeigt aktuellen Namen |
| Gruppen-Version | Zwei Anfragen mit gleicher `expectedVersion` | Nur erste Änderung gewinnt, Version nur einmal erhöht; zweite 409 |
| Gruppenentfernung | Ben hat 2 gültige Ausgaben; Anna Ersatz | 2 Stornos + 2 neue Ausgaben + Entfernen mit je eigenem Event; **eine** Versionserhöhung; Betrag unverändert |
| Rollback | Zweite Ersatzbuchung schlägt fehl | Keine Entfernung/Storno/Neuanlage/Events persistieren |
| Mindestgröße | Bei 2 Aktiven einen entfernen | Abweisung; Ersteller nie entfernbar |
| Buchungsreihenfolge | Gleicher Zeitstempel bei verschiedenen Ausgaben | Streng aufsteigende eindeutige Buchungsnummer entscheidet, wer Rest trägt |
| Volle Teilbarkeit | Anna zahlt 600 Cent, 3 Aktive | `T=V=600`, `q=200`, `r=0`, Ben/Clemens zahlen je 200 an Anna |
| Rest-Cent | Anna 4 Cent, danach Ben 3 Cent, 5 Aktive | `T=7`, `V=5`, `q=1`, `r=2`; Ben trägt 2 Cent, berücksichtigt Ben 1 und Anna 4 |
| Weniger als Personen | Anna zahlt 3 Cent, 5 Aktive | `V=0`, `r=3`, keine Ausgleichszahlungen, Abrechnung trotzdem startbar |
| Storno | Anna 1000 Cent storniert, Ben 600 Cent gültig, 3 Aktive | `T=600`, `q=200`, Annas Storno bleibt sichtbar, nicht berücksichtigt |
| Deterministischer Plan | Join-Reihenfolge A,B,C,D; Salden `+5,+5,-5,-5` Cent | C→A 5 Cent, D→B 5 Cent, sonst nichts; reproduzierbar |
| Zahlung | Ein vorgeschlagener Transfer bestätigt | Status CONFIRMED, einmaliger Versionsanstieg, Salden Zahler +Betrag / Empfänger -Betrag |
| Zahlungsstorno | CONFIRMED → OPEN | Ein Chronikevent; Salden/Progress zurück, fixer Plan unverändert |
| Doppelbestätigung | Zwei konkurrierende Bestätigungen | Nur eine erfolgreich; andere 409, keine doppelten Events |
| Schließen mit offenem Plan | Ein Transfer offen, Status CLOSED | Nach UI-Warnung zulässig; Transfer offen und lesbar; danach keine Zahlungsänderung |
| Löschen | Falscher Bestätigungsname / richtige Angabe | Falscher Name: keine Löschung; richtig: alle abhängigen Daten/Token weg |
| Linkrotation | Zwei Versuche mit alter Version | Eine Rotation erfolgreich; alter Link sofort neutral 404, zweiter 409 |
| Sicherheitsmodell | Öffentlich `actorParticipantId` behauptet Creator | Keine administrativen Berechtigungen; aktive Actor-ID für Fachereignisse ausreichend |
| Frontend | 409 bei unsaved Form | Eingaben bleiben; Neuladen/Verwerfen nur bestätigt |
| Frontend | SETTLING mit 0 Zahlungen | 100% fachlicher Abschluss ohne Division durch 0 und ohne auswählbare Zahlungen |
| Frontend | CLOSED | Salden, Chronik, offene Zahlungen lesbar, keine Schreibaktionen |

#### Dokumentations-Review

- Fachliche Source of Truth vollständig geprüft: [Gruppen](../../../business/3-mintools/minsplit/group-lifecycle.md), [Ausgaben](../../../business/3-mintools/minsplit/expenses.md), [Abrechnung](../../../business/3-mintools/minsplit/settlement.md), [Benutzerabläufe](../../../business/3-mintools/minsplit/user-journeys.md).
- API-Authentifizierung und Swagger/Mapper-/Repository-Namensgebung anhand der aktuellen minFactory-Projektkonventionen ausrichten, nicht neue parallele Infrastruktur schaffen.
- Konsistenz: Rest-Cent werden nie in Ausgleichsplan/Salden aufgenommen; Ersatzbuchungen erhalten neue Sequenzen; nur aktive Personen erscheinen in Abrechnungsbalken; jeder bestätigte Plantransfer führt schließlich alle Salden auf null.
- Dokumentationsänderung umfasst keine lauffähige Feature-Implementierung; für einen Markdown-only-PR sind keine betroffenen ausführbaren Unit-Tests/Linter vorhanden.

#### Vor Implementierung am aktuellen Code konkretisieren

Die exakten Controller-/DTO-Namen und genutzten Auth-/Datenbank-Relationen, maximale Längen von Gruppenname/Beschreibung/Ausgabentitel, Tokenanzeige nach Hashspeicherung, physische Ablage des Remainder-Snapshots und die Transaktionsintegration in vorhandene Repositories sind auf Implementierungstickets zu übertragen. Diese Detailentscheidungen dürfen die in der fachlichen Dokumentation fixierten Regeln nicht ändern.
