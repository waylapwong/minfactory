# 3. Spezifische Anforderungen

## minAdvent | Kalender und Lebenszyklus

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](README.md)

#### 1. Erstellen und Kalenderjahr

Der Ersteller legt über ein Formular einen Kalender mit **Kalendertitel**, **Empfängername** und **Kalenderjahr** an. Das Jahr ist ein Pflichtfeld, mit dem aktuellen Jahr vorbelegt und darf bewusst in der Vergangenheit oder Zukunft liegen. Nach dem Anlegen ist es **unveränderlich**: Eine falsche Jahreswahl erfordert das Löschen und Neuanlegen des Kalenders. Titel und Empfängername können während der bearbeitbaren Lebensphase separat geändert werden. Pro Ersteller sind beliebig viele Kalender erlaubt, jeweils mit genau **24 Türchen (1–24)**. Alle beginnen leer.

Alle Regeln für Dezember und Türchen beziehen sich auf das **gewählte Kalenderjahr**, nicht automatisch auf das laufende Jahr; die relevante Zeitzone ist `Europe/Berlin`.

#### 2. Veröffentlichung und Link

- Ein Kalender ist anfangs **unveröffentlicht**. Vor dem ausdrücklichen Veröffentlichen existiert **kein Shared Link / Token**; die anonyme Empfängeransicht ist nicht erreichbar. Auch ein vollständig leerer oder teilweise befüllter Kalender darf veröffentlicht werden.
- Durch ausdrückliches Veröffentlichen entsteht ein ausreichend zufälliger **geheimer Shared Link**. Er kann kopiert oder über die native Teilen-Funktion weitergegeben werden. Linkbesitz, nicht der Empfängername, gewährt Zugriff; jeder Linkinhaber kann verfügbare Türchen öffnen. Keine öffentliche Kalenderliste oder Suchindexierung.
- **Widerrufen** macht den aktiven Link sofort ungültig, löscht aber weder Inhalte noch Öffnungsfortschritt. **Wiederveröffentlichen** erzeugt immer einen **neuen** Link; der alte bleibt ungültig. **Link erneuern** ersetzt den bisherigen Link atomar. Bei Versionskonflikt bleibt der alte Link gültig.
- Pro Kalender kann höchstens **ein aktiver Shared Link** existieren. Gelöschte, widerrufene, ersetzte oder ungültige Links zeigen neutral: „Dieser Adventskalender ist nicht verfügbar.“
- Die Veröffentlichung kann selbst bei **`ABGESCHLOSSEN`** weiter verwaltet werden: veröffentlichen, widerrufen, Link erneuern und erneut veröffentlichen bleiben erlaubt. Der Kalenderinhalt und der Öffnungsstatus ändern sich dabei niemals.
- Änderungen an der Freigabe erfordern die erwartete globale Kalender-Version und erhöhen diese nur bei tatsächlich erfolgreicher Zustandsänderung.

#### 3. Türchenzustände

| Zustand | Bedeutung | Zulässiger nächster Zustand |
| --- | --- | --- |
| `EMPTY` | Keine Inhaltsblöcke | Der Ersteller speichert mindestens einen gültigen Block → `FILLED`, solange nicht abgeschlossen. |
| `FILLED` | Inhalt vorhanden, noch nie seit dem letzten Schließen geöffnet | Empfänger öffnet ab dem jeweiligen Dezembertag → `OPENED`; Ersteller entfernt alle Blöcke → `EMPTY`, solange nicht abgeschlossen. |
| `OPENED` | Durch Empfänger geöffnet | Der Ersteller darf das Türchen jederzeit wieder auf `FILLED` schließen. |

`OPENED`-Türchen sind nicht editierbar. Schließen stellt `FILLED` wieder her; danach kann der Ersteller die Inhalte bearbeiten. Das gilt auch für abgeschlossene Kalender: Durch das Schließen wird der abgeleitete Abschluss aufgehoben. Die nächste erfolgreiche Erstöffnung zeigt erneut die kurze Animation. Nur eine Öffnung über den Shared Link setzt `OPENED`. Der Öffnungsstatus wird aufbewahrt, **keine Öffnungszeitpunkte**.

#### 4. Datumsregeln

- **Vor dem 1. Dezember, 00:00 Uhr** des Kalenderjahres: Der Empfänger sieht **nur Kalendertitel und Countdown**; noch kein Raster.
- **Ab dem 1. Dezember, 00:00 Uhr**: Das 24-Türchen-Raster bleibt dauerhaft sichtbar – auch am 25. Dezember und in späteren Jahren; ein Countdown kehrt nie zurück.
- Türchen `N` ist ab **N. Dezember, 00:00 Uhr** des Kalenderjahres zeitlich freigegeben. Leere Türchen bleiben dennoch nicht zu öffnen.
- Ein `FILLED`-Türchen kann auch nach Weihnachten, Jahre später, erstmals geöffnet werden, sofern der Kalender nicht bereits abgeschlossen ist (was bei verbliebenem `FILLED` ohnehin nicht zutrifft).
- Der Ersteller kann geöffnete Türchen unabhängig vom Kalenderjahr und Kalenderabschluss schließen; die globale Version wird dabei atomar erhöht.

#### 5. Endgültiger Abschluss

`ABGESCHLOSSEN` **ersetzt** einen früher vorgesehenen Archivstatus vollständig. Der Status wird bei relevanten Zugriffen **ohne eigenes persistiertes Statusfeld und ohne Hintergrundjob** aus dem gewählten Kalenderjahr, dem aktuellen Datum in `Europe/Berlin` und den Türchenzuständen bestimmt. Ein Ersteller kann den Abschluss durch Schließen eines geöffneten Türchens jederzeit wieder aufheben.

Ein Kalender ist genau dann `ABGESCHLOSSEN`, wenn **alle** Bedingungen zutreffen:

1. Der **24. Dezember des Kalenderjahres ist vollständig vergangen** (mindestens 25. Dezember, 00:00 Uhr).
2. **Mindestens ein** Türchen ist `OPENED`.
3. **Kein** Türchen ist `FILLED`.

`EMPTY` verhindert Abschluss nicht. **24 × `EMPTY`** bleibt unabgeschlossen und bearbeitbar. Kalender vergangener Jahre mit verbliebenem `FILLED` bleiben ebenfalls unabgeschlossen; ihre ungeöffneten Türchen können noch bearbeitet beziehungsweise geöffnet werden.

Sobald die Bedingungen erfüllt sind, tritt der Abschluss **sofort** ein – beispielsweise beim Übergang zum 25. Dezember, bei der **letzten erfolgreichen Empfängeröffnung** oder beim **Leeren des letzten `FILLED`-Türchens**, wenn bereits ein `OPENED` vorhanden ist. Vor dem Speichern, das durch Leeren den Abschluss auslöst, erhält der Ersteller einen ausdrücklichen Warnhinweis auf die Schreibsperre. Bei Wahl eines vergangenen Kalenderjahres und in dessen Bearbeitungsansicht erscheint ebenfalls eine deutliche Warnung vor einem möglichen sofortigen Abschluss durch letzte Öffnung oder Leeren. Der Abschluss kann durch Schließen eines `OPENED`-Türchens zurückgesetzt werden.

**Nach dem Abschluss gesperrt:** Titel, Empfängername und Inhaltsblöcke. Der Ersteller kann `OPENED` jederzeit auf `FILLED` zurücksetzen; dadurch wird der abgeleitete Abschluss aufgehoben und Bearbeitung wieder möglich. **Weiter erlaubt:** aktiven Shared Link ansehen, bereits geöffnete Inhalte beliebig oft ohne Animation lesen, veröffentlichen, Freigabe widerrufen, Link erneuern, neu veröffentlichen und Kalender endgültig löschen.

**Beispiele (Kalenderjahr 2022, betrachtet am 25.12.2022 oder später):**

| Türchenverteilung | Abschluss? | Konsequenz |
| --- | --- | --- |
| 24 EMPTY | Nein | Weiter bearbeiten. |
| 1 OPENED, 23 EMPTY | Ja | Endgültig schreibgeschützt. |
| 1 OPENED, 1 FILLED, 22 EMPTY | Nein | Letztes FILLED darf geöffnet oder geleert werden; danach Abschluss. |
| 24 OPENED | Ja | Alle geöffneten Türchen bleiben lesbar. |
| 24 FILLED | Nein | Ungeöffnete Türchen bleiben offen für Erstöffnungen. |
| 1 OPENED, 23 EMPTY **am 24.12.** | Nein | Automatischer Abschluss ab 25.12. 00:00 Uhr. |

Die reine Zeit- oder Statusableitung selbst verändert **keine globale Version**. Der zugrunde liegende erfolgreiche Öffnungs- oder Speichervorgang erhöht die Version dagegen einmal.

#### 6. Löschen

Eigene Kalender können unabhängig von Veröffentlichung, Kalenderjahr und Abschluss nach Sicherheitsabfrage **vollständig und unwiderruflich** gelöscht werden; aktive Shared Links funktionieren danach nicht mehr. Beim Löschen eines minFactory-Accounts werden sämtliche zugehörigen minAdvent-Kalender, Türchen, Inhalte, Freigabelinks und Öffnungsfortschritte entfernt. Es gibt keine Wiederherstellung oder Archivfunktion.

---

## minAdvent | Inhalte, Bearbeitung und Validierung

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](README.md)

#### 1. Bearbeitungsmodell

Die Erstelleransicht enthält genau 24 nummerierte Türchen mit sichtbar unterschiedlichen Zuständen `EMPTY`, `FILLED`, `OPENED` sowie „X von 24 Türchen befüllt“. Der Ersteller bearbeitet nur eigene, **noch nicht geöffnete** Türchen, solange der Kalender nicht `ABGESCHLOSSEN` ist. Ein geöffnetes Türchen kann jederzeit vom Ersteller geschlossen und danach neu bearbeitet werden; das gilt auch für abgeschlossene Kalender, deren abgeleiteter Abschluss durch das Schließen aufgehoben wird.

**Manuelles Speichern:** Der Ersteller speichert **jeweils ein ganzes Türchen** einschließlich aller Blöcke durch eine einzige ausdrückliche Aktion. Es gibt weder automatisches Speichern noch ein kalenderweites Sammelspeichern. Kalendertitel und Empfängername werden getrennt davon gespeichert. Werden ungespeicherte Änderungen verlassen, erscheint eine Warnung; insbesondere bei Versionskonflikten bleiben Eingaben zunächst lokal erhalten. Verwerfen und Neuladen benötigen eine ausdrückliche Bestätigung.

#### 2. Blöcke und Reihenfolge

Pro Türchen sind **0 bis maximal 10 Inhaltsblöcke insgesamt** zulässig, frei gemischt und sortierbar; die Grenze gilt nicht separat je Typ.

| Blocktyp | Felder | Zweck |
| --- | --- | --- |
| Text | Einfacher Text | Normales mehrzeiliges Textfeld ohne WYSIWYG-Formatierung. |
| Link | Titel, HTTP(S)-URL | Anklickbarer externer Inhalt. |
| Gutschein | Titel, Beschreibung | Titel und Beschreibung als normale Formularfelder; die Beschreibung ist wie beim Textblock ein mehrzeiliges Textfeld. Anzeige eines Gutscheins, **keine digitale Einlösung**. |

Blöcke werden innerhalb eines Türchens mit **fortlaufenden Positionen 1, 2, 3, …** gespeichert und in dieser Reihenfolge angezeigt. Es gibt keine Position 0, doppelte Positionen oder Lücken. Blöcke dürfen ohne zusätzliche Rückfrage entfernt werden. Wenn alle Blöcke entfernt und gespeichert sind, ist das Türchen `EMPTY` (gegebenenfalls führt genau das nach Weihnachten zum Abschluss; ein späteres Schließen eines geöffneten Türchens hebt ihn wieder auf).

#### 3. Pflichtfelder und Grenzen

| Inhalt | Regel |
| --- | --- |
| Kalendertitel | Erforderlich, höchstens **50 Zeichen** |
| Empfängername | Erforderlich, höchstens **50 Zeichen** |
| Kalenderjahr | Erforderlich, vorbelegt mit aktuellem Jahr; nach Erstellung unveränderlich |
| Textblock | Nicht leerer einfacher Text; höchstens **500 sichtbare Zeichen** |
| Linktitel | Erforderlich, höchstens **50 Zeichen** |
| Linkadresse | Erforderliche gültige **HTTP(S)-URL**, höchstens **50 Zeichen** |
| Gutscheintitel | Erforderlich, höchstens **50 Zeichen** |
| Gutscheinbeschreibung | Erforderlich, höchstens **200 Zeichen** |
| Blockanzahl | **0–10** insgesamt pro Türchen |
| Position | Lückenlose Ganzzahlen ab **1** |

Ein Inhalt, der nur aus Leerzeichen besteht, zählt als leer. Unvollständige Blöcke können nicht gespeichert werden; ein Türchen mit **null** Blöcken ist hingegen gültig. Das Frontend informiert verständlich über verletzte Grenzen; die fachliche Validierung wird serverseitig erneut durchgesetzt. Textinhalte werden als einfacher Text dargestellt und nicht als HTML interpretiert.

#### 4. Version und gleichzeitige Bearbeitung

Jeder Kalender besitzt **genau eine globale Version** für Stammdaten, alle 24 Türchen und die Freigabe. Es gibt weder Türchenversionen noch gesonderte Linkversionen. Eine tatsächliche erfolgreiche Änderung erhöht sie **genau einmal**: Türcheninhalte, Schließen, Titel/Empfängername, erstmalige Öffnung, Veröffentlichen, Widerrufen oder Erneuern des Links. Reiner Lesezugriff und die bloße Berechnung von `ABGESCHLOSSEN` erhöhen sie nicht.

Jeder zustandsändernde Request muss die **aktuelle erwartete globale Version** mitgeben. Die Version wird strikt auch bei einem wiederholten `PUT` auf ein bereits `OPENED`-Türchen geprüft: **veraltet → `409 VERSION_CONFLICT`**, selbst wenn dieselbe Tür inzwischen geöffnet ist oder der Kalender abgeschlossen wurde. Bei passender Version bleibt der wiederholte Öffnungs-`PUT` idempotent: `firstOpened: false`, keine zusätzliche Animation und keine neue Version.

Ein echter Versionskonflikt hat Vorrang vor sonstigen fachlichen Regelverletzungen, auch wenn unterschiedliche Türchen betroffen sind. Der Verlierer konkurrierender Änderungen erhält `409` ohne Teiländerung. Speichern, Öffnen, Schließen, Widerruf und Linkerneuerung werden konsistent atomar geordnet; globale Version und abgeleiteter Abschluss werden **innerhalb derselben synchronisierten Transaktion** geprüft. Der endgültige Abschluss darf durch parallele Schreibvorgänge nicht umgangen werden.

Beim Ersteller führt `409 VERSION_CONFLICT` zu einer verständlichen Meldung; lokale Entwürfe werden zunächst bewahrt. Erst nach ausdrücklicher Bestätigung wird neu geladen beziehungsweise verworfen. Ist der Kalender mittlerweile `ABGESCHLOSSEN`, sind direkte Inhaltsänderungen gesperrt; das Schließen eines `OPENED`-Türchens bleibt möglich und hebt den abgeleiteten Abschluss auf.

#### 5. Fachliche Fehler und Rückmeldungen

| Fehlerart | Status | Beispielcode / Verhalten |
| --- | --- | --- |
| Veraltete globale Version | **409** | `VERSION_CONFLICT`, Vorrang bei `PUT` |
| Fachliche Regelverletzung / Zustandskonflikt | **409** | `CALENDAR_COMPLETED`, `DOOR_EMPTY`, `DOOR_NOT_YET_UNLOCKED`, `DOOR_NOT_OPENED`, Inhalts- und Feldvalidierung |
| Unzureichende Berechtigung | **403** | Fremden Kalender bearbeiten |
| Formal fehlerhafter Request | **400** | Ungültige JSON-Struktur, Türchennummer außerhalb 1–24 |
| Ungültiger, ersetzter oder widerrufener Shared Link | **404** | Einheitlich: „Dieser Adventskalender ist nicht verfügbar.“ |

Jeder Fehler besitzt einen **stabilen maschinenlesbaren Code**, anhand dessen das Frontend eine passende Meldung zeigt. Der Status `403` ist Berechtigungsproblemen vorbehalten; fachliche Regeln werden nicht durch Einführung von `422` behandelt. Ungültige Tokens liefern keine Informationen über Existenz oder Fortschritt des Kalenders.

Die maximale URL-Länge beträgt fachlich und technisch **50 Zeichen**.

---

## minAdvent | Benutzerabläufe und Grenzfälle

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](README.md)

#### 1. Ersteller: Kalender anlegen und gestalten

1. Angemeldeter Ersteller legt mit Titel, Empfängername und Kalenderjahr einen neuen Kalender an. Kalenderjahr ist mit dem aktuellen Jahr vorbelegt; vergangene/zukünftige Jahre sind zulässig.
2. Kalender erscheint in der Verwaltung mit 24 leeren Türchen; der Ersteller befüllt beliebige Türen unabhängig von deren Dezemberdatum und speichert **jedes Türchen vollständig und separat**.
3. Der Ersteller verwendet bis zu zehn gemischte Inhaltsblöcke in 1-basierter Reihenfolge. Ein Türchen darf leer bleiben. Titel und Empfängername sind separat speicherbar; das Kalenderjahr bleibt unveränderlich.
4. Ersteller kann jederzeit ausdrücklich veröffentlichen, zurückziehen oder den Link erneuern; **Freigabeverwaltung bleibt nach Abschluss möglich**. Veröffentlichungsaktionen verändern keine Inhalte oder Öffnungszustände.
5. Bei Wahl eines Jahres in der Vergangenheit und in der anschließenden Bearbeitung weist die Oberfläche darauf hin, dass die letzte Öffnung oder das Leeren des letzten befüllten Türchens unmittelbar den Nur-Lesen-Abschluss auslösen kann. **Vor dem Speichern**, das das letzte `FILLED` entfernt und dadurch abschließt, erscheint eine gesonderte Warnung. Der Ersteller kann den Abschluss später durch Schließen eines `OPENED`-Türchens aufheben.

Die Erstelleransicht zeigt das 24er-Raster, die Zustände, „X von 24 Türchen befüllt“, den Öffnungsstand und die Freigabe. Es gibt **keinen Vorschauzugriff auf die Empfängeransicht aus der Erstelleroberfläche**. Wer die Empfängeransicht erproben möchte, verwendet einen gewöhnlichen Kalender und dessen freigegebenen Link; Testen umgeht weder die Datums- noch die Abschlussregeln.

#### 2. Empfänger: Countdown, Übersicht und Öffnung

1. Nur über einen **aktiven** Shared Link ist der Kalender zugänglich. Es ist keine Anmeldung erforderlich; jede Person mit dem Link hat dieselben Empfängerrechte.
2. Vor dem 1. Dezember des ausgewählten Jahres sieht der Empfänger **Kalendertitel und Countdown**, kein Raster.
3. Ab 1. Dezember des ausgewählten Jahres sieht der Empfänger **Kalendertitel und alle 24 Türchen**; ein Countdown erscheint nie wieder, auch bei Kalendern früherer Jahre.
4. Ein `FILLED`-Türchen wird am jeweiligen Dezembertag um 00:00 Uhr (`Europe/Berlin`) freigegeben. Der Empfänger klickt und löst die **erste Öffnung** aus. Der Server kontrolliert Status, Datum, gültigen Link und globale Version erneut, setzt `OPENED`, liefert Inhalte und `firstOpened: true`. Der Dialog zeigt eine **kurze dezente Animation**.
5. Bei `OPENED` wird der Inhalt über einen **rein lesenden Abruf** erneut angezeigt, ohne Animation und ohne Versionsänderung. Der Dialog kann geschlossen werden, hat aber keine Vor/Zurück-Türchen-Navigation.
6. `EMPTY` kann nicht geöffnet werden; zeitlich noch gesperrte `FILLED`-Türchen ebenfalls nicht. Empfänger sehen Statusunterschiede, aber **keinen Fortschrittszähler**, keinen Fortschrittsbalken und keine Reaktionsfunktion.

Der Kalenderüberblick enthält **nur Kalenderinformationen, globale Version und Türchenzustände**, keine Inhaltsblöcke. Ein lesender Detailabruf liefert Inhalt ausschließlich, wenn das Türchen bei der serverseitigen Prüfung **aktuell `OPENED`** ist. Wurde es zwischenzeitlich durch den Ersteller wieder geschlossen, darf der Abruf **keinen** Inhalt liefern und **keinen** Öffnungszustand ändern. Nach Aktualisierung kann der Empfänger es erneut öffnen; dies zählt wieder als Erstöffnung mit Animation.

#### 3. Empfänger: Versionskonflikt und Netzwerkausfall

**Beispiel:** Empfänger hat Version 15 geladen; Ersteller ändert zwischenzeitlich ein anderes Türchen auf Version 16. Der Empfänger versucht einen Öffnungs-`PUT` mit Version 15: **`409 VERSION_CONFLICT`** ohne Öffnung, auch wenn Versionänderung eine andere Tür betraf.

Das Frontend zeigt eine verständliche Meldung und aktualisiert den Überblick **erst nach ausdrücklicher Bestätigung**. Ist das angeklickte Türchen inzwischen `OPENED`, lädt das Frontend **per `GET`** seinen Inhalt und zeigt **keine Animation**. Steht es weiterhin auf `FILLED`, muss der Empfänger selbst erneut klicken; **kein automatischer zweiter `PUT`**, kein stilles Neuladen.

**Verlorene erfolgreiche Antwort:** Wird eine Erstöffnung serverseitig gespeichert, aber die Antwort geht verloren, kann die Client-Version veraltet sein. Ein erneut mit der alten Version gesendeter `PUT` liefert trotzdem strikt `409 VERSION_CONFLICT`, auch wenn die Tür bereits geöffnet und der Kalender inzwischen abgeschlossen ist. Nach bestätigter Übersicht-Aktualisierung wird die bereits geöffnete Tür **per `GET` ohne Animation** angezeigt. Nur die ursprünglich serverseitig erfolgreiche Öffnung erhöht die Version.

**Keine Internetverbindung, Lade- und Speicherfehler:** Verständliche, situationsspezifische Meldungen und manuell auslösbare erneute Versuche; lokale ungespeicherte Eingaben werden nicht ungefragt verworfen. In unklaren Öffnungssituationen wird zunächst der aktuelle Überblick abgefragt, statt blind denselben `PUT` zu wiederholen.

#### 4. Ersteller: schließen, Abschluss und Löschen

- Der Ersteller darf geöffnete Türchen jederzeit zurück nach `FILLED` setzen, auch bei veröffentlichten oder abgeschlossenen Kalendern. Das hebt einen abgeleiteten Abschluss auf und macht den Inhalt wieder editierbar. Ein späterer Empfänger-`PUT` kann es mit neuer Version nochmals öffnen und löst erneut eine Animation aus.
- Ein Kalender wird frühestens nach Ablauf seines 24. Dezember `ABGESCHLOSSEN`, wenn **mindestens eine Tür `OPENED`** und **keine `FILLED`** ist. Leere Türen verhindern den Abschluss nicht. Die letzte Türöffnung **oder** das Leeren des letzten befüllten Türchens kann den Abschluss auslösen; der Ersteller kann ihn später durch Schließen eines geöffneten Türchens wieder aufheben.
- Abschluss wirkt auf spätere Aktionen; **der auslösende erfolgreiche Vorgang wird regulär abgeschlossen** und liefert seine neuen Zustände bzw. Inhalte. Danach sind Inhalte, Titel und Empfänger unveränderlich. Der Ersteller kann weiterhin `OPENED`-Türchen schließen; das setzt den Status auf `FILLED`, hebt den abgeleiteten Abschluss auf und ermöglicht die Bearbeitung wieder. Veröffentlichungs-/Widerrufs-/Rotationsaktionen, Lesen bereits geöffneter Türchen und Löschen bleiben ebenfalls erlaubt.
- Löschen erfordert eine Sicherheitsbestätigung und entfernt alle zugehörigen Daten unwiderruflich. Nach Accountlöschung sind sämtliche Kalender und Freigaben weg.

#### 5. Konflikt-, Berechtigungs- und Zeitgrenzen

| Ausgangslage | Aktion | Erwartetes Ergebnis |
| --- | --- | --- |
| Version veraltet; Kalender inzwischen abgeschlossen | Ersteller speichert | **409 VERSION_CONFLICT hat Vorrang**, Entwurf bleibt lokal, erst nach bestätigter Aktualisierung nur lesbar. |
| Aktuelle Version; Kalender abgeschlossen | Ersteller bearbeitet Inhalt direkt | **409 CALENDAR_COMPLETED**, keine Änderung; zunächst kann ein geöffnetes Türchen geschlossen werden. |
| Aktuelle Version; leeres Türchen | Empfänger versucht Öffnen | **409 DOOR_EMPTY**, kein Inhalt, keine Zustandsänderung. |
| Aktuelle Version; Türchendatum noch nicht erreicht | Empfänger versucht Öffnen | **409 DOOR_NOT_YET_UNLOCKED**. |
| Beliebiges Datum, Kalender eventuell abgeschlossen | Ersteller schließt geöffnetes Türchen | Erlaubt bei passender Version; Abschlussstatus wird neu abgeleitet. |
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

#### 6. V1.0.0-Abgrenzung

Nicht vorgesehen sind Themes, individuelle Begrüßungen, Nutzerreaktionen, Empfängeraccounts, Vorschau-/Testsondermodus, digitale Gutscheineinlösung, Kalenderduplizierung, Öffnungszeitpunkte, automatisches Speichern, Sammelspeichern oder automatisches Konflikt-Merging. Die fachliche Dokumentation beschreibt ausschließlich das geplante Produktverhalten; sie implementiert keine Funktionalität.
