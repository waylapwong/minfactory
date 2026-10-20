# minSplit | Angular-Frontend und UI-Zustände

> **Soll-Konzept v1.0.0** · [Übersicht](minsplit-home.md) · [Fachliche Benutzerabläufe](../../business/3-mintools/minsplit/user-journeys.md)

## Architektur

Eigenständiges, lazy geladenes `client/src/app/features/minsplit/` mit Standalone-Pages, Feature-Services, `signal`/`computed` für Gruppen- und Zahlungsstände, Reactive Forms für Ersteller-/Ausgaben-/Umbuchungsdialoge. Bestehende Shared-Dialogkomponente, TailwindCSS und vorhandene Layout-/Auth-Patterns verwenden; kein NgRx oder eigener globaler Store. Datenzugriff über aus NestJS-OpenAPI generierten Angular-Client; Observables an Verbrauchsstelle in Signals/Zustand überführen. Ersteller-Routen sind geschützt, öffentliche `/shared/:token`-Route nicht.

## Ansichten

| Ort | Inhalt |
| --- | --- |
| Erstellergruppenübersicht | Eigene Gruppen in ACTIVE, SETTLING, CLOSED gruppiert; 3-Punkte-Löschen nach Eingabe des exakten Gruppennamens |
| **Übersicht** (Gruppentab) | **Ganz oben** lokal gemerkte aktive handelnde Person, wechselbar; gruppenphasenabhängige Diagramme und Aktionen |
| **Chronik** | Einzelereignisse neueste zuerst, dynamisch aktuelle Namen, Rename mit Alt-/Neuname, Storno/Neuverbuchung getrennt |
| **Teilnehmer** | Aktive Personen; Ersteller kann in ACTIVE hinzufügen/umbenennen/entfernen, in SETTLING umbenennen, in CLOSED nur lesen |
| **Einstellungen** | Nur beim authentifizierten Ersteller; Link kopieren/erneuern, irreversiblen Phasenwechsel mit Warnung auslösen, dauerhaft löschen |

**ACTIVE:** Kreisdiagramm der tatsächlich gezahlten gültigen Ausgaben pro **aktivem** Zahler, gesamte gültige Ausgaben in der Mitte, darunter unverbindliche Salden je Person ohne konkreten Empfänger. Ausgaben-Modal mit Titel, beliebigem aktivem Zahler und Betrag; Storno über zugehörige Aktion. Keine Ausgleichszahlungen.

**SETTLING:** Statt Kreisdiagramm **horizontale Saldenbalken ausschließlich aktiver Personen**, linke Seite `<0` („schuldet“), rechte Seite `>0` („erhält“), Mittelpunkt 0. Ausgeklammerte Rest-Cent gehören **nicht** in Saldenbalken; separat Hinweis je betroffenem Zahler und Betrag. Verrechenbare Gesamtausgaben als Geldbetrag separat anzeigen. Unterhalb unveränderlicher Zahlungsplan mit **allen** vorgeschlagenen Positionen, sichtbarem Status OFFEN/BEZAHLT, Anzahl und Fortschritt `confirmed/total` sowie „Ausgleichszahlung erfassen“ mit Auswahl genau einer offenen Zeile. Bestätigte Zahlungen stornierbar; nach jeder erfolgreichen Aktion neu dargestellte Salden. Keine neuen Ausgaben oder Teilnehmerwechsel.

**CLOSED:** Letzter Stand von Salden, Plan, Zahlungsstatus, Chronik und Teilnehmern schreibgeschützt. Offene Zahlungszeilen bleiben offen. Der Ersteller darf über administrative Einstellungen Link rotieren oder Gruppe löschen; kein fachlicher Statuswechsel mehr.

## Lokaler State und Konflikte

Die Personenauswahl speichert **Teilnehmer-ID pro Gruppe und Browser/Endgerät** lokal, nicht einen Anzeigenamen; ein beim erneuten Laden inaktiver Teilnehmer wird verworfen und die Person neu ausgewählt. Jeder mutierende Request nimmt den `expectedVersion` des zuletzt **erfolgreich geladenen/gespeicherten** Gruppenstands. Bei Erfolg Serverantwort mit neuer Version/Salden übernehmen, niemals lokal die Version schätzen.

Bei 409 aktuelle Daten **nicht automatisch über ungespeicherte Formulare legen**. Lokale Entwürfe behalten, verständlichen Dialog mit Aktion „Neu laden“ anzeigen; vor Verwerfen explizit bestätigen. Bei Netzwerkfehlern nicht blind erneut senden: Ausgang ist möglicherweise auf Server angekommen; aktuellen Stand manuell prüfen. Keine automatischen Retries oder WebSockets; andere Änderungen erscheinen beim Neuladen.

## Validierung/Barrierefreiheit

Reactive Forms mit Trim, Eindeutigkeit aktiver und entfernter Namensreserve (letztlich serverseitig maßgeblich), 20 Zeichen und Betrag in Euro mit maximal zwei Nachkommastellen. Client konvertiert Dezimalstring **ohne Float-Rundung** in Integer-Cent. Loading, Empty, Error und Success States. Mobile-first, Tastaturbedienung, semantische Beschriftung und WCAG 2.2 AA: Diagramme ergänzend mit Text-Salden/-Status darstellen, links/rechts nicht nur durch Farbe unterscheiden, `prefers-reduced-motion` beachten. Öffentliche Ansicht darf keinen globalen Auth-Guard voraussetzen.
