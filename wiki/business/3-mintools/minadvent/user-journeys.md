# minAdvent | Benutzerabläufe und Grenzfälle

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](minadvent-home.md)

## 1. Ersteller: Kalender anlegen und gestalten

1. Angemeldeter Ersteller legt mit Titel, Empfängername und Kalenderjahr einen neuen Kalender an. Kalenderjahr ist mit dem aktuellen Jahr vorbelegt; vergangene/zukünftige Jahre sind zulässig.
2. Kalender erscheint in der Verwaltung mit 24 leeren Türchen; der Ersteller befüllt beliebige Türen unabhängig von deren Dezemberdatum und speichert **jedes Türchen vollständig und separat**.
3. Der Ersteller verwendet bis zu zehn gemischte Inhaltsblöcke in 1-basierter Reihenfolge. Ein Türchen darf leer bleiben. Titel und Empfängername sind separat speicherbar; das Kalenderjahr bleibt unveränderlich.
4. Ersteller kann jederzeit vor dem endgültigen Abschluss ausdrücklich veröffentlichen, zurückziehen oder Link erneuern; **Freigabeverwaltung bleibt nach Abschluss möglich**. Veröffentlichungsaktionen verändern keine Inhalte oder Öffnungszustände.
5. Bei Wahl eines Jahres in der Vergangenheit und in der anschließenden Bearbeitung weist die Oberfläche darauf hin, dass die letzte Öffnung oder das Leeren des letzten befüllten Türchens unmittelbar und irreversibel abschließen kann. **Vor dem Speichern**, das das letzte `FILLED` entfernt und dadurch abschließt, erscheint eine gesonderte Warnung.

Die Erstelleransicht zeigt das 24er-Raster, die Zustände, „X von 24 Türchen befüllt“, den Öffnungsstand und die Freigabe. Es gibt **keinen Vorschauzugriff auf die Empfängeransicht aus der Erstelleroberfläche**. Wer die Empfängeransicht erproben möchte, verwendet einen gewöhnlichen Kalender und dessen freigegebenen Link; Testen umgeht weder die Datums- noch die Abschlussregeln.

## 2. Empfänger: Countdown, Übersicht und Öffnung

1. Nur über einen **aktiven** Shared Link ist der Kalender zugänglich. Es ist keine Anmeldung erforderlich; jede Person mit dem Link hat dieselben Empfängerrechte.
2. Vor dem 1. Dezember des ausgewählten Jahres sieht der Empfänger **Kalendertitel und Countdown**, kein Raster.
3. Ab 1. Dezember des ausgewählten Jahres sieht der Empfänger **Kalendertitel und alle 24 Türchen**; ein Countdown erscheint nie wieder, auch bei Kalendern früherer Jahre.
4. Ein `FILLED`-Türchen wird am jeweiligen Dezembertag um 00:00 Uhr (`Europe/Berlin`) freigegeben. Der Empfänger klickt und löst die **erste Öffnung** aus. Der Server kontrolliert Status, Datum, gültigen Link und globale Version erneut, setzt `OPENED`, liefert Inhalte und `firstOpened: true`. Der Dialog zeigt eine **kurze dezente Animation**.
5. Bei `OPENED` wird der Inhalt über einen **rein lesenden Abruf** erneut angezeigt, ohne Animation und ohne Versionsänderung. Der Dialog kann geschlossen werden, hat aber keine Vor/Zurück-Türchen-Navigation.
6. `EMPTY` kann nicht geöffnet werden; zeitlich noch gesperrte `FILLED`-Türchen ebenfalls nicht. Empfänger sehen Statusunterschiede, aber **keinen Fortschrittszähler**, keinen Fortschrittsbalken und keine Reaktionsfunktion.

Der Kalenderüberblick enthält **nur Kalenderinformationen, globale Version und Türchenzustände**, keine Inhaltsblöcke. Ein lesender Detailabruf liefert Inhalt ausschließlich, wenn das Türchen bei der serverseitigen Prüfung **aktuell `OPENED`** ist. Wurde es zwischenzeitlich vor Ablauf des 24. Dezember durch den Ersteller wieder geschlossen, darf der Abruf **keinen** Inhalt liefern und **keinen** Öffnungszustand ändern. Nach Aktualisierung kann der Empfänger es erneut öffnen; dies zählt wieder als Erstöffnung mit Animation.

## 3. Empfänger: Versionskonflikt und Netzwerkausfall

**Beispiel:** Empfänger hat Version 15 geladen; Ersteller ändert zwischenzeitlich ein anderes Türchen auf Version 16. Der Empfänger versucht einen Öffnungs-`PUT` mit Version 15: **`409 VERSION_CONFLICT`** ohne Öffnung, auch wenn Versionänderung eine andere Tür betraf.

Das Frontend zeigt eine verständliche Meldung und aktualisiert den Überblick **erst nach ausdrücklicher Bestätigung**. Ist das angeklickte Türchen inzwischen `OPENED`, lädt das Frontend **per `GET`** seinen Inhalt und zeigt **keine Animation**. Steht es weiterhin auf `FILLED`, muss der Empfänger selbst erneut klicken; **kein automatischer zweiter `PUT`**, kein stilles Neuladen.

**Verlorene erfolgreiche Antwort:** Wird eine Erstöffnung serverseitig gespeichert, aber die Antwort geht verloren, kann die Client-Version veraltet sein. Ein erneut mit der alten Version gesendeter `PUT` liefert trotzdem strikt `409 VERSION_CONFLICT`, auch wenn die Tür bereits geöffnet und der Kalender inzwischen abgeschlossen ist. Nach bestätigter Übersicht-Aktualisierung wird die bereits geöffnete Tür **per `GET` ohne Animation** angezeigt. Nur die ursprünglich serverseitig erfolgreiche Öffnung erhöht die Version.

**Keine Internetverbindung, Lade- und Speicherfehler:** Verständliche, situationsspezifische Meldungen und manuell auslösbare erneute Versuche; lokale ungespeicherte Eingaben werden nicht ungefragt verworfen. In unklaren Öffnungssituationen wird zunächst der aktuelle Überblick abgefragt, statt blind denselben `PUT` zu wiederholen.

## 4. Ersteller: schließen, Abschluss und Löschen

- Der Ersteller darf ein geöffnetes Türchen **bis einschließlich 24. Dezember des Kalenderjahres** zurück nach `FILLED` setzen, selbst wenn der Kalender bereits veröffentlicht ist. Das macht den Inhalt wieder editierbar. Ein späterer Empfänger-`PUT` kann es mit neuer Version nochmals öffnen und löst erneut eine Animation aus.
- Ab dem **25. Dezember 00:00 Uhr** darf **kein** Türchen mehr geschlossen werden, auch bei noch nicht abgeschlossenem Kalender. Die UI blendet den Button aus; serverseitig folgt `409 DOOR_CLOSE_PERIOD_ENDED` ohne Seiteneffekt.
- Ein Kalender wird frühestens nach Ablauf seines 24. Dezember endgültig `ABGESCHLOSSEN`, wenn **mindestens eine Tür `OPENED`** und **keine `FILLED`** ist. Leere Türen verhindern den Abschluss nicht. Die letzte Türöffnung **oder** das Leeren des letzten befüllten Türchens kann den Abschluss auslösen.
- Abschluss wirkt unmittelbar auf spätere Aktionen; **der auslösende erfolgreiche Vorgang wird regulär abgeschlossen** und liefert seine neuen Zustände bzw. Inhalte. Danach sind Inhalte, Titel, Empfänger und Türchenzustände unveränderlich. Veröffentlichungs-/Widerrufs-/Rotationsaktionen, Lesen bereits geöffneter Türchen und Löschen bleiben erlaubt.
- Löschen erfordert eine Sicherheitsbestätigung und entfernt alle zugehörigen Daten unwiderruflich. Nach Accountlöschung sind sämtliche Kalender und Freigaben weg.

## 5. Konflikt-, Berechtigungs- und Zeitgrenzen

| Ausgangslage | Aktion | Erwartetes Ergebnis |
| --- | --- | --- |
| Version veraltet; Kalender inzwischen abgeschlossen | Ersteller speichert | **409 VERSION_CONFLICT hat Vorrang**, Entwurf bleibt lokal, erst nach bestätigter Aktualisierung nur lesbar. |
| Aktuelle Version; Kalender abgeschlossen | Ersteller bearbeitet Inhalt | **409 CALENDAR_COMPLETED**, keine Änderung. |
| Aktuelle Version; leeres Türchen | Empfänger versucht Öffnen | **409 DOOR_EMPTY**, kein Inhalt, keine Zustandsänderung. |
| Aktuelle Version; Türchendatum noch nicht erreicht | Empfänger versucht Öffnen | **409 DOOR_NOT_YET_UNLOCKED**. |
| 24. Dezember des Kalenderjahres, 23:59 | Ersteller schließt geöffnetes Türchen | Erlaubt bei passender Version. |
| 25. Dezember, 00:00 | Ersteller versucht Schließen | **409 DOOR_CLOSE_PERIOD_ENDED**, unverändert. |
| 25. Dezember, 00:00; 1 OPENED, 23 EMPTY | System bewertet Zustand | **ABGESCHLOSSEN**, ohne eigene Daten- oder Versionsänderung. |
| Kalender vergangenes Jahr, 24 EMPTY | Ersteller beginnt Befüllen | Weiter bearbeitbar, weil kein OPENED. |
| Kalender vergangenes Jahr, 1 OPENED, 1 FILLED | Ersteller leert letztes FILLED | Vorabwarnung; Speichern erfolgreich, danach sofort ABGESCHLOSSEN. |
| Kalender vergangenes Jahr, 1 OPENED, 1 FILLED | Empfänger öffnet letztes FILLED | Öffnen erfolgreich, `firstOpened: true`; danach abgeschlossen. |
| Empfänger-Öffnung und Ersteller-Speichern gleichzeitig | Beide nutzen dieselbe alte Version | Genau eine Änderung erfolgreich; andere erhält `409 VERSION_CONFLICT`, keine Teilmutation. |
| Linkwiderruf und Empfänger-Öffnung gleichzeitig | Gleichzeitige Requests | Erste erfolgreiche Änderung gewinnt: anderer Request 409 oder bei bereits invalidem Link neutrale Nicht-verfügbar-Meldung. |
| Andere Person verwaltet fremden Kalender | Mutation | **403 Forbidden**. |
| Ungültiger/widerrufener Shared Link | Lese- oder Öffnungszugriff | **404**, neutral „Dieser Adventskalender ist nicht verfügbar.“ |
| Aktive Freigabe, abgeschlossener Kalender | Widerruf/Rotation/Neuveröffentlichung | Erlaubt mit aktueller globaler Version; geöffnete Türchen bleiben lesbar, sofern Link aktiv. |

Die globale Versionsprüfung und die Abschlussregel werden bei schreibenden Requests **innerhalb derselben atomaren und synchronisierten Datenbanktransaktion** ermittelt. Fachliche und Versionsfehler verwenden `409` mit unterscheidbaren **maschinenlesbaren Fehlercodes**. `403` bezeichnet Berechtigungsmängel, `400` strukturell ungültige Requests, `404` ungültige Shared Links. Implementierungsspezifische Schritte und Payloads werden in [#176](https://github.com/waylapwong/minfactory/issues/176) dokumentiert.

## 6. V1.0.0-Abgrenzung

Nicht vorgesehen sind Themes, individuelle Begrüßungen, Nutzerreaktionen, Empfängeraccounts, Vorschau-/Testsondermodus, digitale Gutscheineinlösung, Kalenderduplizierung, Öffnungszeitpunkte, automatisches Speichern, Sammelspeichern oder automatisches Konflikt-Merging. Die fachliche Dokumentation beschreibt ausschließlich das geplante Produktverhalten; sie implementiert keine Funktionalität.
