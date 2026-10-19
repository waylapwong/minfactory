# minSplit | Benutzerabläufe, Ansichten und Grenzfälle

> Geplanter fachlicher Soll-Zustand v1.0.0. [Zur Übersicht](minsplit-home.md)

## 1. Ersteller: Gruppe eröffnen und freigeben

1. Ersteller ist in minFactory angemeldet und legt Gruppe mit Namen und optionaler Beschreibung an; er gehört selbst zur Gruppe und gibt mindestens eine weitere eindeutige Person an.
2. Er sieht seine Gruppen nach `AKTIV`, `IN ABRECHNUNG`, `GESCHLOSSEN` gruppiert. Die Gruppe besitzt einen geheimen gemeinsamen Link, der kopiert/geteilt und bei Bedarf erneuert werden kann.
3. Der Linkinhaber öffnet die Gruppe ohne Account, wählt **ganz oben in der Übersicht** eine aktive Person als handelnden Namen; die Auswahl bleibt auf demselben Gerät gespeichert und kann gewechselt werden.

## 2. Während AKTIV

1. Im Tab **Übersicht** stehen Kreisdiagramm mit **tatsächlich bezahlten gültigen Ausgaben pro aktivem Zahler** und Gesamtausgaben im Mittelpunkt, darunter **vorläufige Salden** je Person („erhält …“, „schuldet …“) sowie ein Button „Ausgabe erfassen“.
2. Button öffnet Modal-Dialog mit Titel, Zahlendem (aus aktiver Liste) und positivem Betrag in Euro. Bestätigen erzeugt genau eine Ausgabe mit Chronikeintrag „… von [handelnder Person]“.
3. Im Tab **Chronik** werden alle Einzelereignisse neueste zuerst angezeigt. Eine Ausgabe kann ausschließlich **storniert**, nicht editiert werden; das Storno ist ein eigenständiger Eintrag. Ggf. wird eine korrigierte Ausgabe anschließend **neu erfasst**.
4. Im Tab **Teilnehmer** darf nur der Ersteller hinzufügen, entfernen und umbenennen. Entfernen eines Zahlers erfordert vorher Auswahl des verbleibenden Ersatz-Zahlers und ausdrückliche Bestätigung; alle Umbuchungen werden einzeln protokolliert, aber die Entfernung erfolgt als eine unteilbare Gesamtaktion. Benutzernamen sind nach Trim nicht leer, maximal 20 Zeichen und über aktive/historisch entfernte Namen ohne Beachtung von Groß-/Kleinschreibung eindeutig.
5. Im nur für den Ersteller sichtbaren Tab **Einstellungen** führt „Abrechnung starten“ erst nach Bestätigung zum unwiderruflichen Statuswechsel. Ab diesem Moment können keine Ausgaben mehr erfasst oder Teilnehmer hinzugefügt/entfernt werden.

## 3. Während IN ABRECHNUNG

1. Im Tab Übersicht zeigt die Anwendung **Saldenbalken nur für aktive Personen**: zu wenig getragen links, zu viel ausgelegt rechts, ausgeglichen in der Mitte. Dazu erscheinen **verrechenbare Gesamtausgaben** und ggf. separat die nicht verrechenbaren Rest-Cent mit Namen der betroffenen Zahler.
2. Unter den Balken stehen **alle** einmalig errechneten vorgeschlagenen Überweisungen mit Empfänger, Zahler, Betrag, Status (offen/erledigt) und Fortschrittsbalken auf Basis erledigter Anzahl.
3. Über „Ausgleichszahlung erfassen“ wählt der Linkinhaber eine der offenen Zahlungen; Bestätigen verbucht exakt **diese eine vollständige** Zahlung. Die Personenauswahl kennzeichnet den Handelnden unabhängig vom Zahler der Überweisung.
4. Jeder Linkinhaber kann eine erledigte Zahlung **einzeln stornieren**, womit sie wieder offen wird. Chronik, Balken und Fortschritt aktualisieren sich nach Erfolg; der ursprüngliche feste Plan bleibt bestehen.
5. Nur der Ersteller kann hier noch Teilnehmer **umbenennen**. Die Änderung wird protokolliert und in allen historischen Einträgen als aktueller Name angezeigt.
6. Der Ersteller kann im Einstellungs-Tab jederzeit nach bestätigter Warnung endgültig schließen; bei offenen Zahlungen mit zusätzlicher Warnung.

## 4. GESCHLOSSEN, Löschen, Freigabe

Geschlossene Gruppen bleiben über ihren gültigen Link einsehbar (Übersicht, Chronik, Teilnehmer und Abrechnungsstand), aber **alle fachlichen Inhalte schreibgeschützt**. Freigabelinkverwaltung und **dauerhafte Löschung** bleiben dem angemeldeten Ersteller vorbehalten; sie ändern den gefrorenen Abrechnungsinhalt nicht. Eine Löschung verlangt Eingabe des Gruppennamens und vernichtet auch die Chronik. Nach Linkerneuerung oder Löschung darf ein alter Link keinen Zugriff mehr eröffnen.

## 5. Chronikregeln

**Jede erfolgreiche fachliche Aktion** erscheint als eigenes Ereignis: Gruppe angelegt, Ausgabe erfasst, Ausgabe storniert, einzelne Umbuchungen bei Entfernung, Teilnehmer hinzugefügt/entfernt/umbenannt, Status gewechselt, Zahlung bestätigt/storniert, Freigabelink erneuert. Öffentliche Aktionen tragen den **aktuell ausgewählten handelnden Namen**, administrative Aktionen den **authentifizierten Ersteller** („… von Person XY“). Namensänderungen spiegeln in früheren Einträgen den aktuellen Namen wider; Umbenennungseinträge erhalten für die historische Nachvollziehbarkeit weiterhin die ursprüngliche **alt → neu** Information. Eine bloße Ansicht oder Auswahl der handelnden Person ist keine finanzielle Fachaktion.

## 6. Fehler- und Sonderfälle

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
