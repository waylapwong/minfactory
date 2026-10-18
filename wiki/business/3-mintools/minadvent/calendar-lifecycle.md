# minAdvent | Kalender und Lebenszyklus

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](minadvent-home.md)

## 1. Erstellen und Kalenderjahr

Der Ersteller legt über ein Formular einen Kalender mit **Kalendertitel**, **Empfängername** und **Kalenderjahr** an. Das Jahr ist ein Pflichtfeld, mit dem aktuellen Jahr vorbelegt und darf bewusst in der Vergangenheit oder Zukunft liegen. Nach dem Anlegen ist es **unveränderlich**: Eine falsche Jahreswahl erfordert das Löschen und Neuanlegen des Kalenders. Titel und Empfängername können während der bearbeitbaren Lebensphase separat geändert werden. Pro Ersteller sind beliebig viele Kalender erlaubt, jeweils mit genau **24 Türchen (1–24)**. Alle beginnen leer.

Alle Regeln für Dezember und Türchen beziehen sich auf das **gewählte Kalenderjahr**, nicht automatisch auf das laufende Jahr; die relevante Zeitzone ist `Europe/Berlin`.

## 2. Veröffentlichung und Link

- Ein Kalender ist anfangs **unveröffentlicht**. Vor dem ausdrücklichen Veröffentlichen existiert **kein Shared Link / Token**; die anonyme Empfängeransicht ist nicht erreichbar. Auch ein vollständig leerer oder teilweise befüllter Kalender darf veröffentlicht werden.
- Durch ausdrückliches Veröffentlichen entsteht ein ausreichend zufälliger **geheimer Shared Link**. Er kann kopiert oder über die native Teilen-Funktion weitergegeben werden. Linkbesitz, nicht der Empfängername, gewährt Zugriff; jeder Linkinhaber kann verfügbare Türchen öffnen. Keine öffentliche Kalenderliste oder Suchindexierung.
- **Widerrufen** macht den aktiven Link sofort ungültig, löscht aber weder Inhalte noch Öffnungsfortschritt. **Wiederveröffentlichen** erzeugt immer einen **neuen** Link; der alte bleibt ungültig. **Link erneuern** ersetzt den bisherigen Link atomar. Bei Versionskonflikt bleibt der alte Link gültig.
- Pro Kalender kann höchstens **ein aktiver Shared Link** existieren. Gelöschte, widerrufene, ersetzte oder ungültige Links zeigen neutral: „Dieser Adventskalender ist nicht verfügbar.“
- Die Veröffentlichung kann selbst bei **`ABGESCHLOSSEN`** weiter verwaltet werden: veröffentlichen, widerrufen, Link erneuern und erneut veröffentlichen bleiben erlaubt. Der Kalenderinhalt und der Öffnungsstatus ändern sich dabei niemals.
- Änderungen an der Freigabe erfordern die erwartete globale Kalender-Version und erhöhen diese nur bei tatsächlich erfolgreicher Zustandsänderung.

## 3. Türchenzustände

| Zustand | Bedeutung | Zulässiger nächster Zustand |
| --- | --- | --- |
| `EMPTY` | Keine Inhaltsblöcke | Der Ersteller speichert mindestens einen gültigen Block → `FILLED`, solange nicht abgeschlossen. |
| `FILLED` | Inhalt vorhanden, noch nie seit dem letzten Schließen geöffnet | Empfänger öffnet ab dem jeweiligen Dezembertag → `OPENED`; Ersteller entfernt alle Blöcke → `EMPTY`, solange nicht abgeschlossen. |
| `OPENED` | Durch Empfänger geöffnet | Nur der Ersteller darf bis **einschließlich 24. Dezember des Kalenderjahres** wieder auf `FILLED` schließen. Danach nie mehr. |

`OPENED`-Türchen sind nicht editierbar. Ein erlaubtes Schließen stellt `FILLED` wieder her; erst dann kann der Ersteller die Inhalte bearbeiten. Die nächste erfolgreiche Erstöffnung zeigt erneut die kurze Animation. Nur eine Öffnung über den Shared Link setzt `OPENED`. Der Öffnungsstatus wird aufbewahrt, **keine Öffnungszeitpunkte**.

## 4. Datumsregeln

- **Vor dem 1. Dezember, 00:00 Uhr** des Kalenderjahres: Der Empfänger sieht **nur Kalendertitel und Countdown**; noch kein Raster.
- **Ab dem 1. Dezember, 00:00 Uhr**: Das 24-Türchen-Raster bleibt dauerhaft sichtbar – auch am 25. Dezember und in späteren Jahren; ein Countdown kehrt nie zurück.
- Türchen `N` ist ab **N. Dezember, 00:00 Uhr** des Kalenderjahres zeitlich freigegeben. Leere Türchen bleiben dennoch nicht zu öffnen.
- Ein `FILLED`-Türchen kann auch nach Weihnachten, Jahre später, erstmals geöffnet werden, sofern der Kalender nicht bereits abgeschlossen ist (was bei verbliebenem `FILLED` ohnehin nicht zutrifft).
- Ein Schließversuch ab **25. Dezember, 00:00 Uhr** wird selbst bei noch unabgeschlossenem Kalender verweigert (fachlicher `409`, keine Mutation oder Versionsänderung).

## 5. Endgültiger Abschluss

`ABGESCHLOSSEN` **ersetzt** einen früher vorgesehenen Archivstatus vollständig. Der Status wird bei relevanten Zugriffen **ohne eigenes persistiertes Statusfeld und ohne Hintergrundjob** aus dem gewählten Kalenderjahr, dem aktuellen Datum in `Europe/Berlin` und den Türchenzuständen bestimmt.

Ein Kalender ist genau dann `ABGESCHLOSSEN`, wenn **alle** Bedingungen zutreffen:

1. Der **24. Dezember des Kalenderjahres ist vollständig vergangen** (mindestens 25. Dezember, 00:00 Uhr).
2. **Mindestens ein** Türchen ist `OPENED`.
3. **Kein** Türchen ist `FILLED`.

`EMPTY` verhindert Abschluss nicht. **24 × `EMPTY`** bleibt unabgeschlossen und bearbeitbar. Kalender vergangener Jahre mit verbliebenem `FILLED` bleiben ebenfalls unabgeschlossen; ihre ungeöffneten Türchen können noch bearbeitet beziehungsweise geöffnet werden.

Sobald die Bedingungen erfüllt sind, tritt der Abschluss **sofort und endgültig** ein – beispielsweise beim Übergang zum 25. Dezember, bei der **letzten erfolgreichen Empfängeröffnung** oder beim **Leeren des letzten `FILLED`-Türchens**, wenn bereits ein `OPENED` vorhanden ist. Vor dem Speichern, das durch Leeren den Abschluss auslöst, erhält der Ersteller einen ausdrücklichen Warnhinweis auf die unumkehrbare Sperre. Bei Wahl eines vergangenen Kalenderjahres und in dessen Bearbeitungsansicht erscheint ebenfalls eine deutliche Warnung vor einem möglichen sofortigen Abschluss durch letzte Öffnung oder Leeren.

**Nach dem Abschluss gesperrt:** Titel, Empfängername, Inhaltsblöcke und alle Türchenzustände; kein Zurücksetzen, Schließen oder Nachbefüllen. **Weiter erlaubt:** aktiven Shared Link ansehen, bereits geöffnete Inhalte beliebig oft ohne Animation lesen, veröffentlichen, Freigabe widerrufen, Link erneuern, neu veröffentlichen und Kalender endgültig löschen.

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

## 6. Löschen

Eigene Kalender können unabhängig von Veröffentlichung, Kalenderjahr und Abschluss nach Sicherheitsabfrage **vollständig und unwiderruflich** gelöscht werden; aktive Shared Links funktionieren danach nicht mehr. Beim Löschen eines minFactory-Accounts werden sämtliche zugehörigen minAdvent-Kalender, Türchen, Inhalte, Freigabelinks und Öffnungsfortschritte entfernt. Es gibt keine Wiederherstellung oder Archivfunktion.
