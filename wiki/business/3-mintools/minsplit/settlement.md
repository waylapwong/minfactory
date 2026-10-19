# minSplit | Schlussabrechnung und Ausgleichszahlungen

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](minsplit-home.md)

## 1. Einmalig fixierter Zahlungsplan

Beim Übergang zu `IN ABRECHNUNG` wird aus den **berücksichtigten** Zahlbeträgen pro Person `P_i` und den gleichen Kostenanteilen `q` der Ausgangssaldo bestimmt: **`S_i = P_i - q`**. Positive Salden bedeuten „erhält Geld / zu viel ausgelegt“; negative „schuldet Geld / zu wenig getragen“. Weil `ΣP_i=V=nq`, gilt `ΣS_i=0`.

minSplit bildet einen **festen, deterministischen und möglichst überweisungsarmen** Zahlungsplan mit folgender verbindlicher Zuordnung: Schuldner (negative Ausgangssalden) und Gläubiger (positive Ausgangssalden) werden jeweils nach ihrer **unveränderlichen Beitrittsreihenfolge** sortiert (Ersteller zuerst, danach Reihenfolge des Hinzufügens; bei einer Umbenennung unverändert). Der erste Schuldner zahlt dem ersten Gläubiger den kleineren Betrag aus seiner noch offenen Schuld bzw. dessen noch offener Forderung. Anschließend wird jeder vollständig ausgeglichene Beteiligte übersprungen; dieser Schritt wird wiederholt, bis alle Salden null sind. Zahlungen von 0 Cent entfallen. Diese greedy Zuordnung nutzt nur direkte Transfers von Schuldnern an Gläubiger, liefert auch bei gleich hohen Salden immer denselben Plan und garantiert **nicht zwingend** die mathematisch minimale Anzahl von Überweisungen. Jede Planzeile enthält Zahler, Empfänger und exakten Betrag. **Nur** vorgeschlagene Ausgleichszahlungen dürfen verbucht werden; keine beliebigen Transfers, keine Teilzahlungen, keine automatische Banküberweisung.

## 2. Bestätigen und Stornieren

Während `IN ABRECHNUNG` darf jeder Linkinhaber nach Auswahl einer aktiven handelnden Person **jede** offene vorgeschlagene Ausgleichszahlung auswählen und **einzeln und vollständig** als durchgeführt bestätigen. Es ist keine Bestätigung des Empfängers nötig. Bestätigung ändert den Plan nicht, sondern markiert genau die Zahlung als erledigt und dokumentiert die Aktion in der Chronik. Eine bereits erledigte Zahlung kann nicht doppelt bestätigt werden.

Ebenso darf jeder Linkinhaber jede erledigte Ausgleichszahlung **einzeln stornieren**. Das Storno erzeugt ein neues Chronikereignis, setzt die betreffende Zahlung auf **offen** und macht ihren Einfluss auf den aktuellen Saldo rückgängig. Ursprung und Storno bleiben sichtbar; ein weiteres Bestätigen der wieder offenen Zahlung ist möglich. Der Zahlungsplan wird dabei **nicht neu berechnet**. Bei widersprüchlichen parallelen Eingaben darf nur eine gültige Zustandsänderung erfolgreich sein.

## 3. Aktueller Saldo und Visualisierung

Mit bestätigten Überweisungen wird der Ausgangssaldo aktualisiert: Beim Zahler steigt er um den bestätigten Betrag in Richtung null; beim Empfänger sinkt er um den Betrag in Richtung null. Stornierung kehrt dies um.

Im Tab **Übersicht** während `IN ABRECHNUNG` erscheinen **horizontale Saldenbalken für aktive Teilnehmer** um eine Nullmitte:
- **links**: negativer Saldo, Person schuldet noch Geld;
- **rechts**: positiver Saldo, Person erhält noch Geld;
- **null**: keine offene Forderung/Schuld.

Ausgeklammerte Rest-Cent gehen **nicht** in diese Balken ein. Darunter stehen der festgelegte Zahlungsplan mit **offen/erledigt-Markierung**, der **Fortschrittsbalken nach Anzahl** erledigter Zahlungen sowie eine Aktion zum Erfassen der Zahlung. Jede erfolgreiche Bestätigung/Stornierung aktualisiert Saldenbalken, Einträge und Fortschritt. Erledigte Einträge verschwinden nicht. Sind alle Zahlungen erledigt, sind sämtliche Salden null.

Wenn keine Zahlung nötig ist, steht „Keine Ausgleichszahlungen erforderlich“; es gibt keine auswählbare Zahlung. Der Fortschritt gilt als vollständig und ist verständlich ohne eine künstliche 0/0-Prozentrechnung darzustellen.

## 4. Ignorierter Betrag

Die Übersicht trennt **tatsächliche Gesamtausgaben** `T` und **verrechenbare Gesamtausgaben** `V`. Sind `r>0` Cent ignoriert, erscheint beispielsweise:

> 0,02 € können nicht gleichmäßig auf 5 Teilnehmer aufgeteilt werden und werden nicht durch Ausgleichszahlungen berücksichtigt. Ben trägt 0,02 € aus seiner zuletzt erfassten Ausgabe selbst.

Sind mehrere Zahler betroffen, werden ihre Namen und jeweiligen Beträge genannt. Diese Beträge werden nicht durch den Zahlungsplan ausgeglichen; deshalb erreichen die **Abrechnungssalden** nach allen vorgeschlagenen Zahlungen trotzdem null.

## 5. Endgültiger Abschluss

Der Ersteller darf `IN ABRECHNUNG → GESCHLOSSEN` **jederzeit** wählen. Eine ausdrücklich bestätigte Warnung erläutert die endgültige Schreibsperre; bei noch offenen Zahlungen wird deren Zahl und die verbleibende Verpflichtung zusätzlich gewarnt. Auch bei nicht ausgeglichenen Salden ist die Schließung erlaubt. Es bleiben letzte Balkenstände, Fortschritt, Zahlungsliste und Chronik **nur lesbar**; weder Zahlung noch Storno noch Umbenennung ist danach möglich.

## 6. Prüffälle

- Anna zahlt 15,00 €, Ben und Clemens je 0,00 € (3 Aktive): Jeder trägt 5,00 €; Ben → Anna 5,00 €, Clemens → Anna 5,00 €. Fortschritt 0/2 → 1/2 → 2/2; Salden aller drei danach null.
- Ben → Anna 5,00 € wurde bestätigt, dann von Clemens storniert: Die Zahlung ist erneut offen; der Fortschritt sinkt um eins, die Salden der beiden Betroffenen springen zurück; **beide Aktionen** bleiben in der Chronik.
- Gruppe mit 5 Teilnehmern, 0,03 € gültiger Ausgabe: `V=0`, `r=0,03 €`; keine Zahlung, Anzeige des ignorierten Betrags und seiner zahlenden Person; Statuswechsel und Schließen weiterhin möglich.
- Vorzeitig geschlossen bei 1/2 erledigten Zahlungen: Die offene Zahlung bleibt sichtbar und unerledigt; weitere Bestätigung oder Stornierung ist untersagt.
