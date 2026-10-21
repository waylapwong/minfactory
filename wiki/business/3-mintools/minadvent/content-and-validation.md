# minAdvent | Inhalte, Bearbeitung und Validierung

> **Geplanter Soll-Zustand v1.0.0.** [Zur Übersicht](minadvent-home.md)

## 1. Bearbeitungsmodell

Die Erstelleransicht enthält genau 24 nummerierte Türchen mit sichtbar unterschiedlichen Zuständen `EMPTY`, `FILLED`, `OPENED` sowie „X von 24 Türchen befüllt“. Der Ersteller bearbeitet nur eigene, **noch nicht geöffnete** Türchen, solange der Kalender nicht `ABGESCHLOSSEN` ist. Ein geöffnetes Türchen kann jederzeit vom Ersteller geschlossen und danach neu bearbeitet werden; das gilt auch für abgeschlossene Kalender, deren abgeleiteter Abschluss durch das Schließen aufgehoben wird.

**Manuelles Speichern:** Der Ersteller speichert **jeweils ein ganzes Türchen** einschließlich aller Blöcke durch eine einzige ausdrückliche Aktion. Es gibt weder automatisches Speichern noch ein kalenderweites Sammelspeichern. Kalendertitel und Empfängername werden getrennt davon gespeichert. Werden ungespeicherte Änderungen verlassen, erscheint eine Warnung; insbesondere bei Versionskonflikten bleiben Eingaben zunächst lokal erhalten. Verwerfen und Neuladen benötigen eine ausdrückliche Bestätigung.

## 2. Blöcke und Reihenfolge

Pro Türchen sind **0 bis maximal 10 Inhaltsblöcke insgesamt** zulässig, frei gemischt und sortierbar; die Grenze gilt nicht separat je Typ.

| Blocktyp | Felder | Zweck |
| --- | --- | --- |
| Text | Einfacher Text | Normales mehrzeiliges Textfeld ohne WYSIWYG-Formatierung. |
| Link | Titel, HTTP(S)-URL | Anklickbarer externer Inhalt. |
| Gutschein | Titel, Beschreibung | Titel und Beschreibung als normale Formularfelder; die Beschreibung ist wie beim Textblock ein mehrzeiliges Textfeld. Anzeige eines Gutscheins, **keine digitale Einlösung**. |

Blöcke werden innerhalb eines Türchens mit **fortlaufenden Positionen 1, 2, 3, …** gespeichert und in dieser Reihenfolge angezeigt. Es gibt keine Position 0, doppelte Positionen oder Lücken. Blöcke dürfen ohne zusätzliche Rückfrage entfernt werden. Wenn alle Blöcke entfernt und gespeichert sind, ist das Türchen `EMPTY` (gegebenenfalls führt genau das nach Weihnachten zum Abschluss; ein späteres Schließen eines geöffneten Türchens hebt ihn wieder auf).

## 3. Pflichtfelder und Grenzen

| Inhalt | Regel |
| --- | --- |
| Kalendertitel | Erforderlich, höchstens **100 Zeichen** |
| Empfängername | Erforderlich, höchstens **100 Zeichen** |
| Kalenderjahr | Erforderlich, vorbelegt mit aktuellem Jahr; nach Erstellung unveränderlich |
| Textblock | Nicht leerer einfacher Text; höchstens **10.000 Zeichen** |
| Linktitel | Erforderlich, höchstens **100 Zeichen** |
| Linkadresse | Erforderliche gültige **HTTP(S)-URL**; eine konkrete technische Maximallänge wird vor Implementierung festgelegt |
| Gutscheintitel | Erforderlich, höchstens **100 Zeichen** |
| Gutscheinbeschreibung | Erforderlich, höchstens **2.000 Zeichen** |
| Blockanzahl | **0–10** insgesamt pro Türchen |
| Position | Lückenlose Ganzzahlen ab **1** |

Ein Inhalt, der nur aus Leerzeichen besteht, zählt als leer. Unvollständige Blöcke können nicht gespeichert werden; ein Türchen mit **null** Blöcken ist hingegen gültig. Das Frontend informiert verständlich über verletzte Grenzen; die fachliche Validierung wird serverseitig erneut durchgesetzt. Textinhalte werden als einfacher Text dargestellt und nicht als HTML interpretiert.

## 4. Version und gleichzeitige Bearbeitung

Jeder Kalender besitzt **genau eine globale Version** für Stammdaten, alle 24 Türchen und die Freigabe. Es gibt weder Türchenversionen noch gesonderte Linkversionen. Eine tatsächliche erfolgreiche Änderung erhöht sie **genau einmal**: Türcheninhalte, Schließen, Titel/Empfängername, erstmalige Öffnung, Veröffentlichen, Widerrufen oder Erneuern des Links. Reiner Lesezugriff und die bloße Berechnung von `ABGESCHLOSSEN` erhöhen sie nicht.

Jeder zustandsändernde Request muss die **aktuelle erwartete globale Version** mitgeben. Die Version wird strikt auch bei einem wiederholten `PUT` auf ein bereits `OPENED`-Türchen geprüft: **veraltet → `409 VERSION_CONFLICT`**, selbst wenn dieselbe Tür inzwischen geöffnet ist oder der Kalender abgeschlossen wurde. Bei passender Version bleibt der wiederholte Öffnungs-`PUT` idempotent: `firstOpened: false`, keine zusätzliche Animation und keine neue Version.

Ein echter Versionskonflikt hat Vorrang vor sonstigen fachlichen Regelverletzungen, auch wenn unterschiedliche Türchen betroffen sind. Der Verlierer konkurrierender Änderungen erhält `409` ohne Teiländerung. Speichern, Öffnen, Schließen, Widerruf und Linkerneuerung werden konsistent atomar geordnet; globale Version und abgeleiteter Abschluss werden **innerhalb derselben synchronisierten Transaktion** geprüft. Der endgültige Abschluss darf durch parallele Schreibvorgänge nicht umgangen werden.

Beim Ersteller führt `409 VERSION_CONFLICT` zu einer verständlichen Meldung; lokale Entwürfe werden zunächst bewahrt. Erst nach ausdrücklicher Bestätigung wird neu geladen beziehungsweise verworfen. Ist der Kalender mittlerweile `ABGESCHLOSSEN`, sind direkte Inhaltsänderungen gesperrt; das Schließen eines `OPENED`-Türchens bleibt möglich und hebt den abgeleiteten Abschluss auf.

## 5. Fachliche Fehler und Rückmeldungen

| Fehlerart | Status | Beispielcode / Verhalten |
| --- | --- | --- |
| Veraltete globale Version | **409** | `VERSION_CONFLICT`, Vorrang bei `PUT` |
| Fachliche Regelverletzung / Zustandskonflikt | **409** | `CALENDAR_COMPLETED`, `DOOR_EMPTY`, `DOOR_NOT_YET_UNLOCKED`, `DOOR_NOT_OPENED`, Inhalts- und Feldvalidierung |
| Unzureichende Berechtigung | **403** | Fremden Kalender bearbeiten |
| Formal fehlerhafter Request | **400** | Ungültige JSON-Struktur, Türchennummer außerhalb 1–24 |
| Ungültiger, ersetzter oder widerrufener Shared Link | **404** | Einheitlich: „Dieser Adventskalender ist nicht verfügbar.“ |

Jeder Fehler besitzt einen **stabilen maschinenlesbaren Code**, anhand dessen das Frontend eine passende Meldung zeigt. Der Status `403` ist Berechtigungsproblemen vorbehalten; fachliche Regeln werden nicht durch Einführung von `422` behandelt. Ungültige Tokens liefern keine Informationen über Existenz oder Fortschritt des Kalenders.

**Offener technischer Detailpunkt:** Die konkrete maximale URL-Länge gehört zur technischen Implementierungsspezifikation, nicht zu den bereits fachlich festgelegten Grenzen.
