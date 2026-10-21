# 3. Spezifische Anforderungen

## `minRPS` | Home

#### 1. Allgemeines

`minRPS` ist ein minimalistisches Schere-Stein-Papier-Spiel mit zwei Modi:

- **Singleplayer:** Eine Person spielt gegen den computergesteuerten `minRobo`.
- **Multiplayer:** Zwei Personen spielen in einem gemeinsamen, benannten Spiel gegeneinander. Weitere verbundene Personen können zuschauen.

Diese Dokumentation beschreibt ausschließlich den im Repository implementierten Ist-Zustand, keine geplanten Funktionen.

#### 2. Spielregeln

Pro Runde wählt jede spielende Partei genau eine der drei Gesten:

| Geste | Gewinnt gegen | Verliert gegen |
| --- | --- | --- |
| Stein | Schere | Papier |
| Papier | Stein | Schere |
| Schere | Papier | Stein |

Gleiche Gesten führen zum **Unentschieden**. Andernfalls gewinnt die Geste, die die gegnerische schlägt. Ein Ergebnis kann erst ermittelt werden, wenn **beide Spielerplätze belegt** und **beide Gesten gewählt** sind. Solange noch kein Ergebnis vorliegt, wird intern der Zustand `None` verwendet; mögliche abgeschlossene Ergebnisse sind Sieg von Spieler 1, Sieg von Spieler 2 oder Unentschieden.

#### 3. Spielauswahl und Navigation

Die minRPS-Startseite bietet die Aktionen **Singleplayer** und **Multiplayer**.

- **Singleplayer** öffnet direkt das Spiel gegen minRobo.
- **Multiplayer** öffnet zunächst die Spielübersicht; ein vorhandenes Spiel lässt sich über seine Karte öffnen.
- Das Verlassen einer Spielseite wird über einen Dialog **Spiel verlassen** bestätigt. **Abbrechen** hält die Person auf der Seite, **Verlassen** ermöglicht die Navigation.
- Multiplayer-Spiele können über ihre individuelle URL geteilt werden. Ein Button kopiert den Link und zeigt die Meldung **Link kopiert**.

#### 4. Singleplayer

1. Beim Aufruf wird ein neues Spiel begonnen und ein bisheriger Ergebnisverlauf für diese Ansicht zurückgesetzt.
2. Die Person wählt Stein, Papier oder Schere. Die Schaltfläche zum Spielen bleibt deaktiviert, solange keine Geste ausgewählt wurde.
3. Durch **Spiele Stein!**, **Spiele Papier!** oder **Spiele Schere!** wird die gewählte Geste übermittelt. Weitere Auswahlmöglichkeiten werden für die laufende Runde gesperrt.
4. `minRobo` wählt serverseitig zufällig eine der drei Gesten. Beide Gesten und das Ergebnis erscheinen in der Spielansicht.
5. Nach ungefähr **2 Sekunden** setzt die Anwendung die Spielzüge für eine neue Runde zurück; der Ergebnisverlauf bleibt innerhalb der laufenden Ansicht erhalten.

Die Ergebnisse werden in der Client-Anwendung als Verlauf der **letzten zehn abgeschlossenen Runden** gehalten. Zu Beginn einer neuen Singleplayer-Ansicht wird der Verlauf geleert; es handelt sich nicht um eine dauerhaft gespeicherte Spielstatistik.

#### 5. Multiplayer

##### 5.1 Spielübersicht und Verwaltung

Die Spielübersicht zeigt vorhandene Spiele mit **Name**, **belegten Spielerplätzen (von zwei)**, **Anzahl der Beobachter**, **Erstellungsdatum** und **Erstellungsuhrzeit**.

- Über **Neues Spiel** wird ein benanntes Spiel erstellt. Der Spielname muss **2 bis 16 Zeichen** lang sein.
- Über die Spielkarte wird die zugehörige Multiplayer-Ansicht geöffnet.
- Über **Spiel löschen** erscheint eine Sicherheitsabfrage mit **Löschen** und **Abbrechen**.
- Die Spielübersicht wird beim Öffnen vom Server geladen; neu angelegte Spiele werden in der Liste ergänzt.

Ein Spiel wird als Datensatz gespeichert. Die aktiven Verbindungen, Spielzüge und Zuschauer verwaltet der Server separat als **flüchtigen, laufenden Match-Zustand**. Spielname und laufende Spielrunde sind deshalb nicht gleichzusetzen.

##### 5.2 Rollen und Beitritt

Ein Multiplayer-Match hat **zwei Spielerplätze** (Spieler 1 und Spieler 2) und kann zusätzliche **Beobachter** haben.

1. Beim Öffnen der Multiplayer-Ansicht verbindet sich der Client mit dem Match und erhält eine Verbindungs-/Spielerkennung.
2. Die beitretende Person wird zunächst als **Beobachter** registriert.
3. Für einen freien Spielerplatz kann sie **Platz nehmen** auswählen, einen **Spielernamen** eingeben und mit **Beitreten** bestätigen. Für den Spielernamen sind **1 bis 16 Zeichen** erforderlich (reine Leerzeichen werden nicht angenommen).
4. Ein bereits belegter Spielerplatz kann nicht erneut besetzt werden. Beim Platznehmen wird die Person aus der Beobachterliste entfernt.
5. Ein Beobachter kann die beiden Spielerseiten sehen und freie Plätze übernehmen, aber selbst **keinen Spielzug abgeben**.

Der Server informiert die verbundenen Personen über Aktualisierungen des Match-Zustands. Ein Wechsel von einem besetzten Spielerplatz auf den anderen wird in der Benutzeroberfläche **nicht als eigene Aktion** angeboten: Ein Spielerplatz wird erst wieder frei, wenn die bisherige Person das Match verlässt bzw. die Verbindung getrennt wird. Ein Platzwechsel erfordert daher das Verlassen und erneute Beitreten.

##### 5.3 Rundenablauf

1. Beide Plätze werden besetzt. Ohne zwei spielende Personen gibt es kein abschließbares Rundenergebnis.
2. Jede Person wählt eine Geste und bestätigt sie über die entsprechende **Spiele …!**-Schaltfläche. Die eigene Auswahl kann für die laufende Runde nicht erneut über die Benutzeroberfläche bestätigt werden.
3. Solange erst eine Person gespielt hat, wird ihre Geste **vor der anderen Person und Beobachtern verborgen**. Die Oberfläche zeigt bis zur Auflösung unter anderem einen Platzhalter bzw. ein Schloss.
4. Sobald beide Spielzüge vorliegen, berechnet der Server Sieg, Niederlage oder Unentschieden, verteilt das Ergebnis an die Match-Teilnehmer und ergänzt die Ergebnishistorie.
5. Nach ungefähr **3 Sekunden** setzt der Server beide Gesten zurück. Die belegten Plätze und die bisherige Historie bleiben erhalten; eine neue Runde kann beginnen.

**Wichtig:** Es handelt sich um ein fortlaufendes Match ohne dokumentierten Zielpunktestand oder festgelegte Anzahl von Runden.

##### 5.4 Verlassen, Verbindungsabbruch und Sonderfälle

- Das Verlassen der Multiplayer-Seite wird bestätigt. Beim Verlassen oder Trennen der Verbindung entfernt der Server die jeweilige Person aus dem Match (als Spieler oder Beobachter).
- Verlässt eine spielende Person ihren Platz, wird dieser frei; die **beiden aktuellen Gesten und die Ergebnishistorie** werden zurückgesetzt.
- Ein bereits belegter Platz führt serverseitig zu einem fachlichen Regelfehler. Ein unbekanntes Match kann bei spielbezogenen Aktionen einen Fehler auslösen; die Oberfläche prüft beim Aufruf außerdem, ob der Spiel-Datensatz existiert, und navigiert andernfalls zur Übersicht.
- Aktive Match-Zustände werden im Speicher des Servers gehalten. Nach einem Serverneustart können aktive Plätze, Beobachter und der bisherige Verlauf verloren sein, obwohl der Spiel-Datensatz weiterhin existiert.
- Eine Wiederaufnahme desselben Spielerplatzes nach Neuverbinden wird nicht als dauerhaftes Identitäts-/Sitzungsmerkmal umgesetzt: Eine neue Verbindung erhält eine neue Spielerkennung und tritt zunächst als Beobachter bei.

#### 6. Ergebnishistorie

Beide Spielmodi zeigen **„Letzte Ergebnisse“** mit bis zu **zehn** Einträgen; vor dem ersten Ergebnis erscheint **„Noch keine Ergebnisse“**.

- **Singleplayer:** Der Verlauf besteht nur während der aktuellen Singleplayer-Ansicht und wird beim erneuten Start dieser Ansicht geleert.
- **Multiplayer:** Der Verlauf gehört zum laufenden **Match**, nicht dauerhaft zu einer bestimmten Kombination zweier Personen. Im Client werden Ergebnisse für die Perspektive des jeweiligen Spielerplatzes umgerechnet. Die Historie wird gelöscht, sobald einer der Spielerplätze frei wird.
- Ein noch nicht abgeschlossener Spielzug wird **nicht** als Ergebnis in den Verlauf aufgenommen. Sobald mehr als zehn Ergebnisse vorhanden sind, werden die ältesten verdrängt.

#### 7. Geltungsbereich und bekannte Einschränkungen

Diese Seite beschreibt beobachtbare Funktionen und fachlich relevante Grenzen der **bestehenden Implementierung**:

- Es gibt **keine** dokumentierte Rangliste, kein Nutzerkonto als Spielidentität und keinen dauerhaften Match-Ergebnisverlauf.
- Die Multiplayer-Ergebnishistorie ist **nicht** dauerhaft einer Spielerkombination zugeordnet; das ist eine bekannte Einschränkung des Ist-Zustands, keine Soll-Anforderung.
- Die Spielübersicht speichert Spiele unabhängig von den flüchtigen Match-Sitzungen.
- Der Schutz des Multiplayer-Spielzugs erfolgt in der Oberfläche über die Spielerrolle; die Backend-Verarbeitung prüft, ob die übergebene Spielerkennung einem der beiden Plätze entspricht. Diese Beschreibung behauptet **keine darüber hinausgehende sichere Benutzerautorisierung**.

#### 8. Referenzimplementierung

Für die Prüfung des dokumentierten Ist-Zustands:

- [Frontend – minRPS-Seiten und Dienste](../../../../client/src/app/features/minrps)
- [Backend – minRPS-Domain, Services, Controller und WebSocket-Gateway](../../../../server/src/features/minrps)

Die Dokumentation ist fachlich ausgerichtet. Die verlinkten Quellen dienen dem Abgleich, nicht als zusätzliche Funktionszusagen.
