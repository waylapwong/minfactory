# 4. Lösungsstrategie

## minSplit | Architektur, Zustandslogik und Konsistenz

> **Soll-Konzept v1.0.0** · [Übersicht](README.md) · [Fachlicher Lebenszyklus](../../business/minsplit/03-specific-requirements.md)

#### Einordnung

Neues Feature `server/src/features/minsplit/` mit NestJS-Modul im bestehenden `FeaturesModule`, Domain-/Service-/Repository-Grenzen und richtungsgetrennten DTO-/Domain-/Entity-Mappern gemäß [AGENTS.md](../../../../AGENTS.md). `client/src/app/features/minsplit/` verwendet lazy geladene Angular Standalone-Seiten, Signals, Reactive Forms, Tailwind und Shared-Dialoge. Die bestehenden Firebase-/minFactory-Guards schützen Erstelleraktionen; öffentliche Linkzugriffe besitzen einen separaten Controller ohne Login-Guard. Business-Logik, Cent-Berechnung und Versionsprüfung liegen im Backend.

#### Gruppenphasen

| Von | Nach | Voraussetzungen und Wirkung |
| --- | --- | --- |
| ACTIVE | SETTLING | Nur Ersteller mit aktueller Gruppenversion; Warnung und Bestätigung im UI. Berechnet `T,r,V,q`, fixiert Ausgleichsplan und Rest-Cent-Anteile **einmalig**. Weitere Ausgaben-/Bestandsänderungen verboten, Umbenennen erlaubt. |
| SETTLING | CLOSED | Nur Ersteller mit aktueller Version; Warnung, zusätzlich bei offenen Zahlungen. Plan und offener Zahlungsstatus werden eingefroren, **auch wenn Zahlungen offen bleiben**. |
| CLOSED | – | Keine fachlichen Mutationen oder Rückkehr; Linkrotation und Löschung sind separate administrative Verwaltungsaktionen. |

In ACTIVE dürfen Linkinhaber Ausgaben erfassen/stornieren und Ersteller Teilnehmer pflegen; **keine** Abrechnungszahlungen. In SETTLING dürfen Linkinhaber genau vorgeschlagene Zahlungen bestätigen/stornieren, Ersteller zusätzlich umbenennen. Alle Zustände sind lesbar.

#### Globale Version und atomare Transaktionen

`group.version` beginnt nach Create bei **1**. Jeder **erfolgreiche tatsächlich zustandsändernde Request** verlangt `expectedVersion` und erhöht die Version **exakt einmal**. Dazu gehören Statuswechsel, Hinzufügen/Umbenennen/Entfernen, einzelne Ausgabenaktionen, Zahlungsbestätigung/-storno, Linkrotation und Löschung (bei Löschung keine fortbestehende Ressource/Version). Reine GETs und lokale Personenauswahl sind keine Mutationen. Fehlgeschlagene oder wegen fachlicher Konflikte abgelehnte Requests ändern nichts.

Einzelner transaktionaler Ablauf für alle Gruppenmutationen:
1. Anonymen Token bzw. authentifizierten Nutzer identifizieren; für Ersteller Owner-Berechtigung, für öffentliche Änderungen eine **aktive** handelnde Teilnehmer-ID prüfen.
2. Innerhalb **einer** MySQL/TypeORM-Transaktion die Gruppenzeile über `SELECT ... FOR UPDATE` sperren und Token/Eigentümerschaft erneut prüfen (besonders relevant bei Linkrotation).
3. **Zuerst `expectedVersion`** mit gespeicherter Version vergleichen, dann Status-, Ressourcen- und Geschäftsregeln; bei Konflikt Transaktion abbrechen.
4. Gesamte Änderung, zugehörige Einzel-Chronikereignisse und genau eine Versionsinkrementierung schreiben. Erst danach committen; erfolgreiche Response liefert neue Version.
5. Parallele Anfragen treffen nach dem Sperren auf die inzwischen aktualisierte Version und werden mit `409 VERSION_CONFLICT` abgelehnt, nicht stillschweigend wiederholt. Gesperrte/gelöschte Tokens ergeben neutralen 404.

**Teilnehmerentfernung:** Gruppe sperren; Mindestzahl und Ersatzvalidität prüfen; alle **gültigen** Ausgaben des Entfernten stabil sortiert laden; jedes Original stornieren und mit neuem `bookingSequence` für den Ersatz neu erfassen; jeweils gesonderte Chronik-Ereignisse erzeugen; Teilnehmer inaktiv setzen; Gruppen-Version **nur einmal** erhöhen. Bei irgendeinem Fehler vollständiger Rollback, niemals Teilübertragung. Die historischen Buchungen bleiben in der Chronik; die Verteilung wird über die nun aktiven Teilnehmer neu abgeleitet. Private Auslagen zwischen dem Entfernten und Ersatz werden nicht modelliert.

#### Rechnerische Domäne

Beträge ausschließlich als positive Ganzzahl in Cent und mit sicherem Integerbereich; **keine Gleitkommarechnung**, bei Überlauf Eingabe/Operation zurückweisen. In ACTIVE ergibt sich die vorläufige Ausgabe-/Saldendarstellung aus gültigen Ausgaben und aktiven Teilnehmern; endgültige Teilbarkeit/Reste sind erst in SETTLING bindend.

Final bei `ACTIVE → SETTLING`:
- `T = Σ amountCents` aller nicht stornierten Ausgaben; `n = #aktive Teilnehmer >= 2`.
- `r = T % n`, `V = T-r`, `q = V/n`.
- Vom zuletzt gebuchten gültigen Aufwand absteigend nach **gruppenweit eindeutiger** `bookingSequence` exakt `r` Cent abziehen; stornierte Buchungen überspringen. Der betroffene Zahler trägt diese Cent privat; Namen/Beträge für Hinweis erhalten.
- Für jede aktive Person `P_i = Σ(amountCents - ignoredCents)` ihrer gültigen Ausgaben, `S_i = P_i-q`, `ΣS_i=0`.
- Gläubiger (`S>0`) und Schuldner (`S<0`) separat nach **unveränderlicher Join-Sequence** sortieren. Wiederholt `min(offene Schuld, offene Forderung)` zwischen erstem Schuldner und Gläubiger als vorgeschlagene positive Zahlungen anlegen; ausgeglichene Personen aus der jeweiligen Verarbeitung entfernen. Keine Null-Zahlungen. Reihenfolge innerhalb der Listen erzeugt selbst bei gleich hohen Beträgen denselben Plan; **kein Anspruch auf mathematisch minimale Zahl der Überweisungen**.
- `S_i^{current}=S_i^{initial}+ΣconfirmedOutgoing_i-ΣconfirmedIncoming_i`. Stornierte Zahlungsbestätigungen ändern nur `confirmed` zurück, nicht die Vorschläge. Nach vollständigem Plan `S_i^{current}=0`.

#### Chronik

Jede erfolgreiche fachliche Änderung erzeugt ein oder mehrere **append-only** Ereignisse: Gruppe erstellt, Teilnehmer angelegt/umbenannt/entfernt, Ausgabe erfasst/storniert, die individuellen Umbuchungen, Statuswechsel, Zahlung bestätigt/storniert, Link erneuert. Für die Teilnehmerentfernung entstehen mehrere Ereignisse innerhalb derselben Transaktion mit gemeinsamer `operationId`, eindeutig geordnet durch `eventSequence`. Keine nachträglichen Änderungen historischer Ereignisse; Namensfelder werden beim Lesen über stabile Teilnehmer-IDs dynamisch aufgelöst. Beim Rename speichert das **Ereignis selbst** die alten und neuen Namen als historischen Sachverhalt. Alle Einträge neueste zuerst; Gruppenlöschung löscht auch Chronik. Änderungen der lokal gewählten Person und bloße Lesezugriffe werden nicht protokolliert.

#### Nebenläufigkeit und Betrieb

Keine WebSockets, kein Background-Recompute. Eigene Aktionen aktualisieren Client-State aus Serverantwort oder Refresh; fremde erst bei Neuladen. Fehler und Netzwerkunterbrechungen dürfen weder als Erfolg gelten noch automatisch doppelt schreiben. Vor manuellem Reload mit ungespeicherten Formulardaten Bestätigung verlangen.
