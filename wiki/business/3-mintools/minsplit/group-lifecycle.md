# minSplit | Gruppen, Teilnehmer und Lebenszyklus

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](minsplit-home.md)

## 1. Anlage, Eigentum, Freigabe

Ein angemeldeter Ersteller legt beliebig viele unabhängige Gruppen mit **Gruppenname** und optionaler **Beschreibung** an. Er ist automatisch Mitglied, darf nicht entfernt werden und legt wenigstens eine weitere Person namentlich an. Die Gruppe hat stets **mindestens zwei aktive Teilnehmer**, auch nach einer Entfernung. Nur der Ersteller sieht seine Verwaltungsübersicht; dort erscheinen Gruppen nach Phase: `AKTIV`, `IN ABRECHNUNG`, `GESCHLOSSEN`.

Die Gruppe besitzt einen **geheimen gemeinsamen Freigabelink**. Wer ihn kennt, kann ohne Account die für die jeweilige Phase zulässigen nichtadministrativen Aktionen durchführen. Der Ersteller darf den Link erneuern: Der alte Link wird dadurch ungültig; Ausgaben, Teilnehmer, Zahlungen und Chronik bleiben unverändert. Ein ungültiger oder erneuerter Link gewährt keinen Zugriff. Die zuletzt im öffentlichen Gruppenüberblick ausgewählte **aktive** Person wird auf dem jeweiligen Gerät gemerkt und kann jederzeit gewechselt werden. Dies prüft keine echte Identität und ist kein Ersatz für Erstellerberechtigungen. Entfernte Teilnehmer können nicht mehr ausgewählt werden; technisch wird ihr Linkzugriff nicht individuell widerrufen, da alle denselben Link benutzen.

## 2. Namen und Pflege

Nur der Ersteller kann:
- in `AKTIV` Teilnehmer hinzufügen, entfernen und umbenennen;
- in `IN ABRECHNUNG` Teilnehmer **nur umbenennen**;
- in `GESCHLOSSEN` keine Teilnehmerdaten ändern.

Ein Name wird an Anfang/Ende getrimmt, muss danach mindestens ein Zeichen enthalten und darf **höchstens 20 Zeichen** besitzen. Namen müssen innerhalb der Gruppe einschließlich **entfernter/historisch verwendeter Namen** eindeutig sein, ohne Unterscheidung von Groß-/Kleinschreibung. Ein vormals verwendeter Name wird durch Entfernen nicht frei. Nach einer Umbenennung verwenden auch ältere Chronikeinträge den **aktuellen Anzeigenamen** derselben Person; die Umbenennung selbst bleibt als eigenständiges Ereignis samt altem und neuem Namen nachvollziehbar.

## 3. Teilnehmer entfernen und Ersatz bestimmen

Nur in `AKTIV`; Ersteller und vorletzter verbleibender Teilnehmer sind nicht entfernbar. Beim Entfernen einer Person, die aktuell gültige Ausgaben bezahlt hat, ist ein anderer **verbleibender aktiver Teilnehmer** als Ersatz-Zahler auszuwählen. Die Entfernung besteht fachlich aus **einer unteilbaren Gesamtaktion**:
1. Alle noch gültigen Ausgaben der entfernten Person jeweils einzeln stornieren.
2. Dieselben Ausgaben mit unverändertem Titel/Betrag und Ersatz als Zahler jeweils **neu anlegen**.
3. Die Person aus dem Teilnehmerbestand entfernen; danach alle gültigen Kosten rückwirkend gleichmäßig auf die verbleibenden Teilnehmer verteilen.
4. Jedes Storno, jede Neuanlage und die Entfernung als gesonderte Ereignisse in der Chronik aufführen; alle dieser Ereignisse benennen den handelnden Ersteller.

Die Gesamtausgabensumme verändert sich nicht. Frühere historische Chronikeinträge bleiben sichtbar, jedoch nicht die entfernte Person in der aktiven Teilnehmerliste oder den Diagrammen bzw. dem späteren Zahlungsplan. Eine Übernahme der Auslagen und etwaige private Erstattung zwischen der entfernten Person und ihrem Ersatz sind **außerhalb** von minSplit zu regeln. Scheitert ein Schritt, findet **keine Teilentfernung** statt. Bereits anderweitig stornierte Ausgaben werden nicht erneut übertragen.

## 4. Zustände und erlaubte Aktionen

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

## 5. Löschung

Der Ersteller kann seine Gruppe in jeder Phase löschen, auch aus dem **Drei-Punkte-Menü** der Gruppenübersicht. Die Löschung verlangt einen Warnhinweis über den unwiederbringlichen Datenverlust **und die explizite Eingabe des Gruppennamens**. Danach sind Link und sämtliche Gruppendaten einschließlich Chronik unzugänglich und dauerhaft gelöscht. Die Regel „jede Aktion in der Chronik“ gilt nur für noch bestehende Gruppen.
