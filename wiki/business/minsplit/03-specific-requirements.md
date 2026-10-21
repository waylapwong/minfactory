# 3. Spezifische Anforderungen

## minSplit | Gruppen, Teilnehmer und Lebenszyklus

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](../../3-mintools/minsplit/minsplit-home.md)

#### 1. Anlage, Eigentum, Freigabe

Ein angemeldeter Ersteller legt beliebig viele unabhängige Gruppen mit **Gruppenname** und optionaler **Beschreibung** an. Er ist automatisch Mitglied, darf nicht entfernt werden und legt wenigstens eine weitere Person namentlich an. Die Gruppe hat stets **mindestens zwei aktive Teilnehmer**, auch nach einer Entfernung. Nur der Ersteller sieht seine Verwaltungsübersicht; dort erscheinen Gruppen nach Phase: `AKTIV`, `IN ABRECHNUNG`, `GESCHLOSSEN`.

Die Gruppe besitzt einen **geheimen gemeinsamen Freigabelink**. Wer ihn kennt, kann ohne Account die für die jeweilige Phase zulässigen nichtadministrativen Aktionen durchführen. Der Ersteller darf den Link erneuern: Der alte Link wird dadurch ungültig; Ausgaben, Teilnehmer, Zahlungen und Chronik bleiben unverändert. Ein ungültiger oder erneuerter Link gewährt keinen Zugriff. Die zuletzt im öffentlichen Gruppenüberblick ausgewählte **aktive** Person wird auf dem jeweiligen Gerät gemerkt und kann jederzeit gewechselt werden. Dies prüft keine echte Identität und ist kein Ersatz für Erstellerberechtigungen. Entfernte Teilnehmer können nicht mehr ausgewählt werden; technisch wird ihr Linkzugriff nicht individuell widerrufen, da alle denselben Link benutzen.

#### 2. Namen und Pflege

Nur der Ersteller kann:
- in `AKTIV` Teilnehmer hinzufügen, entfernen und umbenennen;
- in `IN ABRECHNUNG` Teilnehmer **nur umbenennen**;
- in `GESCHLOSSEN` keine Teilnehmerdaten ändern.

Ein Name wird an Anfang/Ende getrimmt, muss danach mindestens ein Zeichen enthalten und darf **höchstens 20 Zeichen** besitzen. Namen müssen innerhalb der Gruppe einschließlich **entfernter/historisch verwendeter Namen** eindeutig sein, ohne Unterscheidung von Groß-/Kleinschreibung. Ein vormals verwendeter Name wird durch Entfernen nicht frei. Nach einer Umbenennung verwenden auch ältere Chronikeinträge den **aktuellen Anzeigenamen** derselben Person; die Umbenennung selbst bleibt als eigenständiges Ereignis samt altem und neuem Namen nachvollziehbar.

#### 3. Teilnehmer entfernen und Ersatz bestimmen

Nur in `AKTIV`; Ersteller und vorletzter verbleibender Teilnehmer sind nicht entfernbar. Beim Entfernen einer Person, die aktuell gültige Ausgaben bezahlt hat, ist ein anderer **verbleibender aktiver Teilnehmer** als Ersatz-Zahler auszuwählen. Die Entfernung besteht fachlich aus **einer unteilbaren Gesamtaktion**:
1. Alle noch gültigen Ausgaben der entfernten Person jeweils einzeln stornieren.
2. Dieselben Ausgaben mit unverändertem Titel/Betrag und Ersatz als Zahler jeweils **neu anlegen**.
3. Die Person aus dem Teilnehmerbestand entfernen; danach alle gültigen Kosten rückwirkend gleichmäßig auf die verbleibenden Teilnehmer verteilen.
4. Jedes Storno, jede Neuanlage und die Entfernung als gesonderte Ereignisse in der Chronik aufführen; alle dieser Ereignisse benennen den handelnden Ersteller.

Die Gesamtausgabensumme verändert sich nicht. Frühere historische Chronikeinträge bleiben sichtbar, jedoch nicht die entfernte Person in der aktiven Teilnehmerliste oder den Diagrammen bzw. dem späteren Zahlungsplan. Eine Übernahme der Auslagen und etwaige private Erstattung zwischen der entfernten Person und ihrem Ersatz sind **außerhalb** von minSplit zu regeln. Scheitert ein Schritt, findet **keine Teilentfernung** statt. Bereits anderweitig stornierte Ausgaben werden nicht erneut übertragen.

#### 4. Zustände und erlaubte Aktionen

| Aktion | AKTIV | IN ABRECHNUNG | GESCHLOSSEN |
| --- | --- | --- | --- |
| Ausgaben einzeln erfassen/stornieren | Jeder Linkinhaber | Nein | Nein |
| Teilnehmer hinzufügen/entfernen | Nur Ersteller | Nein | Nein |
| Teilnehmer umbenennen | Nur Ersteller | Nur Ersteller | Nein |
| Ausgleichszahlungen bestätigen/stornieren | Nein | Jeder Linkinhaber | Nein |
| Übersicht, Chronik, Teilnehmer lesen | Ja | Ja | Ja |
| Freigabelink erneuern | Ersteller | Ersteller | Ersteller |
| Phase vorwärts wechseln | Nur Ersteller | Nur Ersteller | Nein |
| Dauerhaft löschen | Nur Ersteller | Nur Ersteller | Nur Ersteller |

Der Ersteller setzt `AKTIV → IN ABRECHNUNG` nach ausdrücklichem Warnhinweis, dass weder Ausgaben/Teilnehmerbestand verändert noch die Phase rückgängig gemacht werden können. Der Übergang berechnet und fixiert einmalig die endgültige Verteilung und den Zahlungsplan, auch bei **null Ausgaben** oder **null verrechenbarer Summe**.

Der Ersteller setzt `IN ABRECHNUNG → GESCHLOSSEN` nach ausdrücklicher Bestätigung der Unwiderruflichkeit und Schreibsperre. Sind Zahlungen noch offen, wird **zusätzlich ausdrücklich davor gewarnt**; dennoch ist Schließen erlaubt. Die letzte Ansicht und die Chronik bleiben lesbar.

#### 5. Löschung

Der Ersteller kann seine Gruppe in jeder Phase löschen, auch aus dem **Drei-Punkte-Menü** der Gruppenübersicht. Die Löschung verlangt einen Warnhinweis über den unwiederbringlichen Datenverlust **und die explizite Eingabe des Gruppennamens**. Danach sind Link und sämtliche Gruppendaten einschließlich Chronik unzugänglich und dauerhaft gelöscht. Die Regel „jede Aktion in der Chronik“ gilt nur für noch bestehende Gruppen.

---

## minSplit | Ausgaben und Kostenverteilung

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](../../3-mintools/minsplit/minsplit-home.md)

#### 1. Erfassen und Stornieren

Während `AKTIV` kann jeder mit gültigem Gruppenlink **eine** Ausgabe im Modal-Dialog erfassen: **Titel**, **zahlende aktive Person** aus einer Liste und **positiver Euro-Betrag** mit höchstens zwei Nachkommastellen. Die zahlende Person darf von der aktuell als handelnd gewählten Person abweichen. Die Kosten betreffen **immer alle aktiven Teilnehmer gemeinsam**; keine individuellen Beteiligungen, Gewichte oder prozentualen Anteile. Jede Erfassung ist eine atomare Einzelaktion.

Ausgaben werden **nicht nachträglich bearbeitet oder gelöscht**, sondern in `AKTIV` einzeln storniert und gegebenenfalls als neue Ausgabe erfasst. Das Storno hebt die finanzielle Wirkung auf, lässt Ursprungsereignis und Storno in der Chronik stehen. Stornierte Ausgaben zählen weder zum aktuellen Gesamtbetrag noch zur endgültigen Verteilung. Anzeigen der Ausgaben/Chronik sind zeitlich **neueste zuerst**.

Bei Teilnehmerwechseln in `AKTIV` wird die aktuelle **vorläufige** Kostenverteilung über sämtliche noch gültigen Ausgaben und den nun aktiven Mitgliederbestand neu berechnet. Beim Entfernen eines zahlenden Teilnehmers gilt die gesonderte Übertragungsregel in [Gruppenlebenszyklus](../../3-mintools/minsplit/group-lifecycle.md).

#### 2. Finale Verteilung in Cent

Die verbindliche Berechnung erfolgt **genau einmal** beim Übergang von `AKTIV` nach `IN ABRECHNUNG`:

- `T`: Summe aller gültigen Ausgaben in **ganzen Cent**.
- `n`: Zahl der aktiven Teilnehmer einschließlich Ersteller, `n >= 2`.
- `r = T mod n`: nicht gleichmäßig teilbarer **Restbetrag**, `0 <= r < n`.
- `V = T - r`: **verrechenbare Gesamtausgaben**.
- `q = V / n`: **exakt gleicher Kostenanteil** je aktivem Teilnehmer.

Es gibt **keinen Rundungsvorteil** für den Ersteller oder für zahlende Personen. Für den Zahlungsplan zählt nur `V`; `r` wird weder umverteilt noch erstattet. Die tatsächlichen Ausgaben bleiben `T` und werden in der Historie unverändert gezeigt.

#### 3. Wer trägt ignorierte Rest-Cent?

Die `r` Cent werden **vom Ende der chronologisch gültigen Ausgaben** rückwärts aus der Abrechnungsgrundlage herausgenommen. Reicht die jüngste gültige Ausgabe nicht aus, wird die nächste ältere ebenfalls teilweise bzw. ganz ausgenommen. Maßgeblich ist die **aufsteigende, gruppenweit eindeutige fortlaufende Buchungsnummer**, die jeder neu erfassten Ausgabe bei erfolgreicher Anlage dauerhaft zugeordnet wird. Die höchste Nummer ist die jüngste Ausgabe; damit ist die Reihenfolge auch bei exakt gleichem Erfassungszeitpunkt eindeutig. Stornierte Ausgaben werden übersprungen. Durch Ersatz neu angelegte Ausgaben erhalten **neue, höhere Buchungsnummern**; ihre stornierten Vorgänger zählen nicht mehr. Nummern werden weder wiederverwendet noch nach Stornos neu vergeben. Rest-Cent werden von gültigen Ausgaben mit der höchsten Buchungsnummer absteigend abgezogen.

Für jeden ursprünglichen Zahler ergibt sich daraus ein berücksichtigter gezahlter Betrag `P_i` und ggf. ignorierter Restanteil `R_i`; es gilt `Σ P_i = V` und `Σ R_i = r`. Ein ignorierter Rest verbleibt **bei der jeweiligen zahlenden Person** und wird **nicht** durch minSplit ausgeglichen. Auch wenn mehrere Personen betroffen sind, nennt der Hinweis alle mit ihrem jeweiligen Restbetrag.

Die vorläufige Berechnung in `AKTIV` ist eine unverbindliche Saldenvorschau; der **feste Zahlungsplan** entsteht erst beim Phasenübergang.

#### 4. Prüffälle

| Fall | Gültige Ausgaben | Aktive Personen | Verrechenbar | Rest | Konsequenz |
| --- | --- | --- | --- | --- | --- |
| Voll teilbar | Anna 6,00 € | 3 | 6,00 € | 0,00 € | Jede Person trägt 2,00 € |
| Mehrere Zahler | Anna 0,04 €; Ben danach 0,03 € | 5 | 0,05 € | 0,02 € | Anna 0,04 € und Ben 0,01 € berücksichtigt; Ben trägt 0,02 € selbst |
| Kleinstbetrag | Anna 0,03 € | 5 | 0,00 € | 0,03 € | Kein Zahlungsplan, Anna trägt die 3 Cent selbst |
| Storno | Anna 10,00 € storniert; Ben 6,00 € gültig | 3 | 6,00 € | 0,00 € | Nur Bens 6,00 € zählen; Ursprungs- und Stornoereignis bleiben |
| Teilnehmerentfernung | Ben 9,00 €; Ben entfernt, Anna übernimmt | 2 verbleiben | 9,00 € | 0,00 € | Ben-Ausgabe storniert, Anna-Ausgabe neu angelegt; beide tragen 4,50 € |
| Leere Gruppe | Keine | 2 | 0,00 € | 0,00 € | Übergang zulässig, keine Ausgleichszahlungen |

Beispiel bei fünf Personen und insgesamt 0,06 €: `V=0,05 €`, `r=0,01 €`, pro Person `q=0,01 €`. Die Ausgabe am Ende der Chronologie trägt das eine ignorierte Cent; minSplit erstellt trotzdem Zahlungen für den verrechenbaren Anteil.

---

## minSplit | Schlussabrechnung und Ausgleichszahlungen

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](../../3-mintools/minsplit/minsplit-home.md)

#### 1. Einmalig fixierter Zahlungsplan

Beim Übergang zu `IN ABRECHNUNG` wird aus den **berücksichtigten** Zahlbeträgen pro Person `P_i` und den gleichen Kostenanteilen `q` der Ausgangssaldo bestimmt: **`S_i = P_i - q`**. Positive Salden bedeuten „erhält Geld / zu viel ausgelegt“; negative „schuldet Geld / zu wenig getragen“. Weil `ΣP_i=V=nq`, gilt `ΣS_i=0`.

minSplit bildet einen **festen, deterministischen und möglichst überweisungsarmen** Zahlungsplan mit folgender verbindlicher Zuordnung: Schuldner (negative Ausgangssalden) und Gläubiger (positive Ausgangssalden) werden jeweils nach ihrer **unveränderlichen Beitrittsreihenfolge** sortiert (Ersteller zuerst, danach Reihenfolge des Hinzufügens; bei einer Umbenennung unverändert). Der erste Schuldner zahlt dem ersten Gläubiger den kleineren Betrag aus seiner noch offenen Schuld bzw. dessen noch offener Forderung. Anschließend wird jeder vollständig ausgeglichene Beteiligte übersprungen; dieser Schritt wird wiederholt, bis alle Salden null sind. Zahlungen von 0 Cent entfallen. Diese greedy Zuordnung nutzt nur direkte Transfers von Schuldnern an Gläubiger, liefert auch bei gleich hohen Salden immer denselben Plan und garantiert **nicht zwingend** die mathematisch minimale Anzahl von Überweisungen. Jede Planzeile enthält Zahler, Empfänger und exakten Betrag. **Nur** vorgeschlagene Ausgleichszahlungen dürfen verbucht werden; keine beliebigen Transfers, keine Teilzahlungen, keine automatische Banküberweisung.

#### 2. Bestätigen und Stornieren

Während `IN ABRECHNUNG` darf jeder Linkinhaber nach Auswahl einer aktiven handelnden Person **jede** offene vorgeschlagene Ausgleichszahlung auswählen und **einzeln und vollständig** als durchgeführt bestätigen. Es ist keine Bestätigung des Empfängers nötig. Bestätigung ändert den Plan nicht, sondern markiert genau die Zahlung als erledigt und dokumentiert die Aktion in der Chronik. Eine bereits erledigte Zahlung kann nicht doppelt bestätigt werden.

Ebenso darf jeder Linkinhaber jede erledigte Ausgleichszahlung **einzeln stornieren**. Das Storno erzeugt ein neues Chronikereignis, setzt die betreffende Zahlung auf **offen** und macht ihren Einfluss auf den aktuellen Saldo rückgängig. Ursprung und Storno bleiben sichtbar; ein weiteres Bestätigen der wieder offenen Zahlung ist möglich. Der Zahlungsplan wird dabei **nicht neu berechnet**. Bei widersprüchlichen parallelen Eingaben darf nur eine gültige Zustandsänderung erfolgreich sein.

#### 3. Aktueller Saldo und Visualisierung

Mit bestätigten Überweisungen wird der Ausgangssaldo aktualisiert: Beim Zahler steigt er um den bestätigten Betrag in Richtung null; beim Empfänger sinkt er um den Betrag in Richtung null. Stornierung kehrt dies um.

Im Tab **Übersicht** während `IN ABRECHNUNG` erscheinen **horizontale Saldenbalken für aktive Teilnehmer** um eine Nullmitte:
- **links**: negativer Saldo, Person schuldet noch Geld;
- **rechts**: positiver Saldo, Person erhält noch Geld;
- **null**: keine offene Forderung/Schuld.

Ausgeklammerte Rest-Cent gehen **nicht** in diese Balken ein. Darunter stehen der festgelegte Zahlungsplan mit **offen/erledigt-Markierung**, der **Fortschrittsbalken nach Anzahl** erledigter Zahlungen sowie eine Aktion zum Erfassen der Zahlung. Jede erfolgreiche Bestätigung/Stornierung aktualisiert Saldenbalken, Einträge und Fortschritt. Erledigte Einträge verschwinden nicht. Sind alle Zahlungen erledigt, sind sämtliche Salden null.

Wenn keine Zahlung nötig ist, steht „Keine Ausgleichszahlungen erforderlich“; es gibt keine auswählbare Zahlung. Der Fortschritt gilt als vollständig und ist verständlich ohne eine künstliche 0/0-Prozentrechnung darzustellen.

#### 4. Ignorierter Betrag

Die Übersicht trennt **tatsächliche Gesamtausgaben** `T` und **verrechenbare Gesamtausgaben** `V`. Sind `r>0` Cent ignoriert, erscheint beispielsweise:

> 0,02 € können nicht gleichmäßig auf 5 Teilnehmer aufgeteilt werden und werden nicht durch Ausgleichszahlungen berücksichtigt. Ben trägt 0,02 € aus seiner zuletzt erfassten Ausgabe selbst.

Sind mehrere Zahler betroffen, werden ihre Namen und jeweiligen Beträge genannt. Diese Beträge werden nicht durch den Zahlungsplan ausgeglichen; deshalb erreichen die **Abrechnungssalden** nach allen vorgeschlagenen Zahlungen trotzdem null.

#### 5. Endgültiger Abschluss

Der Ersteller darf `IN ABRECHNUNG → GESCHLOSSEN` **jederzeit** wählen. Eine ausdrücklich bestätigte Warnung erläutert die endgültige Schreibsperre; bei noch offenen Zahlungen wird deren Zahl und die verbleibende Verpflichtung zusätzlich gewarnt. Auch bei nicht ausgeglichenen Salden ist die Schließung erlaubt. Es bleiben letzte Balkenstände, Fortschritt, Zahlungsliste und Chronik **nur lesbar**; weder Zahlung noch Storno noch Umbenennung ist danach möglich.

#### 6. Prüffälle

- Anna zahlt 15,00 €, Ben und Clemens je 0,00 € (3 Aktive): Jeder trägt 5,00 €; Ben → Anna 5,00 €, Clemens → Anna 5,00 €. Fortschritt 0/2 → 1/2 → 2/2; Salden aller drei danach null.
- Ben → Anna 5,00 € wurde bestätigt, dann von Clemens storniert: Die Zahlung ist erneut offen; der Fortschritt sinkt um eins, die Salden der beiden Betroffenen springen zurück; **beide Aktionen** bleiben in der Chronik.
- Gruppe mit 5 Teilnehmern, 0,03 € gültiger Ausgabe: `V=0`, `r=0,03 €`; keine Zahlung, Anzeige des ignorierten Betrags und seiner zahlenden Person; Statuswechsel und Schließen weiterhin möglich.
- Vorzeitig geschlossen bei 1/2 erledigten Zahlungen: Die offene Zahlung bleibt sichtbar und unerledigt; weitere Bestätigung oder Stornierung ist untersagt.

---

## minSplit | Benutzerabläufe, Ansichten und Grenzfälle

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](../../3-mintools/minsplit/minsplit-home.md)

#### 1. Ersteller: Gruppe eröffnen und freigeben

1. Ersteller ist in minFactory angemeldet und legt Gruppe mit Namen und optionaler Beschreibung an; er gehört selbst zur Gruppe und gibt mindestens eine weitere eindeutige Person an.
2. Er sieht seine Gruppen nach `AKTIV`, `IN ABRECHNUNG`, `GESCHLOSSEN` gruppiert. Die Gruppe besitzt einen geheimen gemeinsamen Link, der kopiert/geteilt und bei Bedarf erneuert werden kann.
3. Der Linkinhaber öffnet die Gruppe ohne Account, wählt **ganz oben in der Übersicht** eine aktive Person als handelnden Namen; die Auswahl bleibt auf demselben Gerät gespeichert und kann gewechselt werden.

#### 2. Während AKTIV

1. Im Tab **Übersicht** stehen Kreisdiagramm mit **tatsächlich bezahlten gültigen Ausgaben pro aktivem Zahler** und Gesamtausgaben im Mittelpunkt, darunter **vorläufige Salden** je Person („erhält …“, „schuldet …“) sowie ein Button „Ausgabe erfassen“.
2. Button öffnet Modal-Dialog mit Titel, Zahlendem (aus aktiver Liste) und positivem Betrag in Euro. Bestätigen erzeugt genau eine Ausgabe mit Chronikeintrag „… von [handelnder Person]“.
3. Im Tab **Chronik** werden alle Einzelereignisse neueste zuerst angezeigt. Eine Ausgabe kann ausschließlich **storniert**, nicht editiert werden; das Storno ist ein eigenständiger Eintrag. Ggf. wird eine korrigierte Ausgabe anschließend **neu erfasst**.
4. Im Tab **Teilnehmer** darf nur der Ersteller hinzufügen, entfernen und umbenennen. Entfernen eines Zahlers erfordert vorher Auswahl des verbleibenden Ersatz-Zahlers und ausdrückliche Bestätigung; alle Umbuchungen werden einzeln protokolliert, aber die Entfernung erfolgt als eine unteilbare Gesamtaktion. Benutzernamen sind nach Trim nicht leer, maximal 20 Zeichen und über aktive/historisch entfernte Namen ohne Beachtung von Groß-/Kleinschreibung eindeutig.
5. Im nur für den Ersteller sichtbaren Tab **Einstellungen** führt „Abrechnung starten“ erst nach Bestätigung zum unwiderruflichen Statuswechsel. Ab diesem Moment können keine Ausgaben mehr erfasst oder Teilnehmer hinzugefügt/entfernt werden.

#### 3. Während IN ABRECHNUNG

1. Im Tab Übersicht zeigt die Anwendung **Saldenbalken nur für aktive Personen**: zu wenig getragen links, zu viel ausgelegt rechts, ausgeglichen in der Mitte. Dazu erscheinen **verrechenbare Gesamtausgaben** und ggf. separat die nicht verrechenbaren Rest-Cent mit Namen der betroffenen Zahler.
2. Unter den Balken stehen **alle** einmalig errechneten vorgeschlagenen Überweisungen mit Empfänger, Zahler, Betrag, Status (offen/erledigt) und Fortschrittsbalken auf Basis erledigter Anzahl.
3. Über „Ausgleichszahlung erfassen“ wählt der Linkinhaber eine der offenen Zahlungen; Bestätigen verbucht exakt **diese eine vollständige** Zahlung. Die Personenauswahl kennzeichnet den Handelnden unabhängig vom Zahler der Überweisung.
4. Jeder Linkinhaber kann eine erledigte Zahlung **einzeln stornieren**, womit sie wieder offen wird. Chronik, Balken und Fortschritt aktualisieren sich nach Erfolg; der ursprüngliche feste Plan bleibt bestehen.
5. Nur der Ersteller kann hier noch Teilnehmer **umbenennen**. Die Änderung wird protokolliert und in allen historischen Einträgen als aktueller Name angezeigt.
6. Der Ersteller kann im Einstellungs-Tab jederzeit nach bestätigter Warnung endgültig schließen; bei offenen Zahlungen mit zusätzlicher Warnung.

#### 4. GESCHLOSSEN, Löschen, Freigabe

Geschlossene Gruppen bleiben über ihren gültigen Link einsehbar (Übersicht, Chronik, Teilnehmer und Abrechnungsstand), aber **alle fachlichen Inhalte schreibgeschützt**. Freigabelinkverwaltung und **dauerhafte Löschung** bleiben dem angemeldeten Ersteller vorbehalten; sie ändern den gefrorenen Abrechnungsinhalt nicht. Eine Löschung verlangt Eingabe des Gruppennamens und vernichtet auch die Chronik. Nach Linkerneuerung oder Löschung darf ein alter Link keinen Zugriff mehr eröffnen.

#### 5. Chronikregeln

**Jede erfolgreiche fachliche Aktion** erscheint als eigenes Ereignis: Gruppe angelegt, Ausgabe erfasst, Ausgabe storniert, einzelne Umbuchungen bei Entfernung, Teilnehmer hinzugefügt/entfernt/umbenannt, Status gewechselt, Zahlung bestätigt/storniert, Freigabelink erneuert. Öffentliche Aktionen tragen den **aktuell ausgewählten handelnden Namen**, administrative Aktionen den **authentifizierten Ersteller** („… von Person XY“). Namensänderungen spiegeln in früheren Einträgen den aktuellen Namen wider; Umbenennungseinträge erhalten für die historische Nachvollziehbarkeit weiterhin die ursprüngliche **alt → neu** Information. Eine bloße Ansicht oder Auswahl der handelnden Person ist keine finanzielle Fachaktion.

#### 6. Fehler- und Sonderfälle

| Situation | Erwartetes Verhalten |
| --- | --- |
| Ungültiger/erneuerter Link | Neutraler Zugriffsfehler, keine Daten preisgeben |
| Name leer, >20 Zeichen, bereits verwendet (auch andere Großschreibung oder früher entfernter Name) | Verständlicher Validierungshinweis, keine Änderung |
| Ersteller oder vorletzten aktiven Teilnehmer entfernen | Aktion untersagt, bisherige Gruppe bleibt unverändert |
| Entfernung/Umbuchung scheitert | Keiner der Teilvorgänge wird übernommen |
| Ausgabe nicht positiv oder mehr als zwei Nachkommastellen | Keine Buchung, konkrete Eingabemeldung |
| Ausgabe nach Phasenwechsel erfassen/stornieren | Abweisung, aktueller Zustand anzeigen |
| Zahlungen vor Abrechnungsphase oder nach Schließen | Abweisung |
| Bereits bezahlte Zahlung erneut bestätigen bzw. offene Zahlung stornieren | Abweisung ohne Doppelbuchung |
| Zwei Personen ändern denselben Eintrag gleichzeitig | Nur eine gültige Aktion wird übernommen; keine stillschweigende Überschreibung, Benutzer kann neu laden |
| Andere Teilnehmer ändern die Gruppe | Sichtbar nach manuellem Neu-/Wiederladen; keine Echtzeitaktualisierung |
| Leere oder rechnerisch unverrechenbare Gruppe | Keine vorgeschlagenen Zahlungen, verständlicher Hinweis, Abschluss dennoch möglich |
| Gruppe mit offenen Zahlungen schließen | Zusätzliche ausdrückliche Warnung; nach Schließen keine weitere Buchung |
| Fehlgeschlagene Aktion/Netzwerkfehler | Verständliche Fehlermeldung, keine unbelegte Erfolgsmeldung; aktueller Stand kann erneut geladen werden |

Die Oberfläche ist mobile-first und minimalistisch; diese Seite legt ausschließlich das fachliche Verhalten fest, **keine** technische API-, Datenbank- oder Implementierungsarchitektur.
