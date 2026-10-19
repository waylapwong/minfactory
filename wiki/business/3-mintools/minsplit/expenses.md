# minSplit | Ausgaben und Kostenverteilung

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](minsplit-home.md)

## 1. Erfassen und Stornieren

Während `AKTIV` kann jeder mit gültigem Gruppenlink **eine** Ausgabe im Modal-Dialog erfassen: **Titel**, **zahlende aktive Person** aus einer Liste und **positiver Euro-Betrag** mit höchstens zwei Nachkommastellen. Die zahlende Person darf von der aktuell als handelnd gewählten Person abweichen. Die Kosten betreffen **immer alle aktiven Teilnehmer gemeinsam**; keine individuellen Beteiligungen, Gewichte oder prozentualen Anteile. Jede Erfassung ist eine atomare Einzelaktion.

Ausgaben werden **nicht nachträglich bearbeitet oder gelöscht**, sondern in `AKTIV` einzeln storniert und gegebenenfalls als neue Ausgabe erfasst. Das Storno hebt die finanzielle Wirkung auf, lässt Ursprungsereignis und Storno in der Chronik stehen. Stornierte Ausgaben zählen weder zum aktuellen Gesamtbetrag noch zur endgültigen Verteilung. Anzeigen der Ausgaben/Chronik sind zeitlich **neueste zuerst**.

Bei Teilnehmerwechseln in `AKTIV` wird die aktuelle **vorläufige** Kostenverteilung über sämtliche noch gültigen Ausgaben und den nun aktiven Mitgliederbestand neu berechnet. Beim Entfernen eines zahlenden Teilnehmers gilt die gesonderte Übertragungsregel in [Gruppenlebenszyklus](group-lifecycle.md).

## 2. Finale Verteilung in Cent

Die verbindliche Berechnung erfolgt **genau einmal** beim Übergang von `AKTIV` nach `IN ABRECHNUNG`:

- `T`: Summe aller gültigen Ausgaben in **ganzen Cent**.
- `n`: Zahl der aktiven Teilnehmer einschließlich Ersteller, `n >= 2`.
- `r = T mod n`: nicht gleichmäßig teilbarer **Restbetrag**, `0 <= r < n`.
- `V = T - r`: **verrechenbare Gesamtausgaben**.
- `q = V / n`: **exakt gleicher Kostenanteil** je aktivem Teilnehmer.

Es gibt **keinen Rundungsvorteil** für den Ersteller oder für zahlende Personen. Für den Zahlungsplan zählt nur `V`; `r` wird weder umverteilt noch erstattet. Die tatsächlichen Ausgaben bleiben `T` und werden in der Historie unverändert gezeigt.

## 3. Wer trägt ignorierte Rest-Cent?

Die `r` Cent werden **vom Ende der chronologisch gültigen Ausgaben** rückwärts aus der Abrechnungsgrundlage herausgenommen. Reicht die jüngste gültige Ausgabe nicht aus, wird die nächste ältere ebenfalls teilweise bzw. ganz ausgenommen. Maßgeblich ist die **aufsteigende, gruppenweit eindeutige fortlaufende Buchungsnummer**, die jeder neu erfassten Ausgabe bei erfolgreicher Anlage dauerhaft zugeordnet wird. Die höchste Nummer ist die jüngste Ausgabe; damit ist die Reihenfolge auch bei exakt gleichem Erfassungszeitpunkt eindeutig. Stornierte Ausgaben werden übersprungen. Durch Ersatz neu angelegte Ausgaben erhalten **neue, höhere Buchungsnummern**; ihre stornierten Vorgänger zählen nicht mehr. Nummern werden weder wiederverwendet noch nach Stornos neu vergeben. Rest-Cent werden von gültigen Ausgaben mit der höchsten Buchungsnummer absteigend abgezogen.

Für jeden ursprünglichen Zahler ergibt sich daraus ein berücksichtigter gezahlter Betrag `P_i` und ggf. ignorierter Restanteil `R_i`; es gilt `Σ P_i = V` und `Σ R_i = r`. Ein ignorierter Rest verbleibt **bei der jeweiligen zahlenden Person** und wird **nicht** durch minSplit ausgeglichen. Auch wenn mehrere Personen betroffen sind, nennt der Hinweis alle mit ihrem jeweiligen Restbetrag.

Die vorläufige Berechnung in `AKTIV` ist eine unverbindliche Saldenvorschau; der **feste Zahlungsplan** entsteht erst beim Phasenübergang.

## 4. Prüffälle

| Fall | Gültige Ausgaben | Aktive Personen | Verrechenbar | Rest | Konsequenz |
| --- | --- | --- | --- | --- | --- |
| Voll teilbar | Anna 6,00 € | 3 | 6,00 € | 0,00 € | Jede Person trägt 2,00 € |
| Mehrere Zahler | Anna 0,04 €; Ben danach 0,03 € | 5 | 0,05 € | 0,02 € | Anna 0,04 € und Ben 0,01 € berücksichtigt; Ben trägt 0,02 € selbst |
| Kleinstbetrag | Anna 0,03 € | 5 | 0,00 € | 0,03 € | Kein Zahlungsplan, Anna trägt die 3 Cent selbst |
| Storno | Anna 10,00 € storniert; Ben 6,00 € gültig | 3 | 6,00 € | 0,00 € | Nur Bens 6,00 € zählen; Ursprungs- und Stornoereignis bleiben |
| Teilnehmerentfernung | Ben 9,00 €; Ben entfernt, Anna übernimmt | 2 verbleiben | 9,00 € | 0,00 € | Ben-Ausgabe storniert, Anna-Ausgabe neu angelegt; beide tragen 4,50 € |
| Leere Gruppe | Keine | 2 | 0,00 € | 0,00 € | Übergang zulässig, keine Ausgleichszahlungen |

Beispiel bei fünf Personen und insgesamt 0,06 €: `V=0,05 €`, `r=0,01 €`, pro Person `q=0,01 €`. Die Ausgabe am Ende der Chronologie trägt das eine ignorierte Cent; minSplit erstellt trotzdem Zahlungen für den verrechenbaren Anteil.
