# Shapes

## Definition

- Shapes beschreiben Eckenradien, Konturen und Schatten als gemeinsame Grundlage für minFactory und alle minApps.
- Sie unterstützen visuelle Hierarchie und Gruppierung; sie ersetzen weder Abstände noch eine klare Informationsstruktur.
- Die Spezifikation verwendet Standard-Utilities von Tailwind CSS 4. In `client/src/styles.scss` sind dafür keine eigenen Shape-Tokens definiert.

## Spezifikation

| Merkmal      | Zulässige Tailwind-Werte für neue UI                   | Orientierung                                                       |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Eckenradius  | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` | Kompakte Elemente bis größere Oberflächen                          |
| Rahmenstärke | `border`, `border-2`, `border-4`                       | Feine Kontur, zurückhaltende Abgrenzung oder bewusste Hervorhebung |
| Schatten     | `shadow-none`, `shadow-xl`, `shadow-2xl`               | Keine Erhebung, erkennbare Erhebung oder starke Hervorhebung       |
| Fokus-Kontur | `focus-visible:ring-2`, `focus-visible:outline-4`      | Tastaturfokus sichtbar von der Komponentenkontur absetzen          |

- Die Tabelle definiert Werte für neue UI; sie verlangt keine nachträgliche Vereinheitlichung bestehender Komponenten.
- `border-8` und `rounded-4xl` kommen vereinzelt in bestehenden Spielflächen vor und sind keine allgemeinen Werte für neue UI.

## Verwendung

| Oberfläche                     | Orientierung für neue UI                                                                         | Beobachteter Bestand                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Karten und größere Flächen     | `rounded-lg`; Kontur und Schatten nur zur nötigen Abgrenzung oder Erhebung einsetzen             | Shared Cards verwenden `rounded-lg border-4 shadow-2xl`; Spielkarten ebenfalls `border-4`                                          |
| Eingabefelder und Auswahl      | `rounded-md` oder `rounded-lg`; eine klare Kontur, Schatten nur bei erkennbarem Hierarchiebedarf | `min-input` und `min-select` verwenden `rounded-lg border-4 shadow-2xl`                                                            |
| Buttons und interaktive Karten | Einheitlicher Radius; Rahmen und Schatten passend zur visuellen Gewichtung wählen                | Shared Buttons verwenden `rounded-lg border-4 shadow-2xl`; Active und Disabled setzen den Schatten zurück                          |
| Badges und kompakte Elemente   | `rounded-sm` oder `rounded-md`; meist genügt eine feine Kontur                                   | Badges verwenden `rounded-md border-2`                                                                                             |
| Fokus                          | Eine sichtbare `focus-visible`-Kontur zusätzlich zur normalen Form vorsehen                      | Der Header verwendet `focus-visible:ring-2`; Form Controls häufig `focus-visible:ring-4`; weitere Seiten `focus-visible:outline-4` |
| Trennungen                     | Eine Linie (`border` oder `border-2`) statt einer zusätzlichen Karte mit Schatten verwenden      | Divider nutzen `border-t-2`; Hinweise teilweise eine einzelne Seitenkontur                                                         |

- Die Bestandsangaben beschreiben vorhandene Verwendung, nicht automatisch die Vorgabe für neue UI.
- Für Farben von Konturen und Fokuszuständen gelten die Werte und Kontrastregeln aus [Colors](colors.md).
- Diese Grundlagen legen nur die visuelle Form fest; Verhalten und Zustandsübergänge bleiben Aufgabe der jeweiligen Komponente.

## Regeln

- Für neue UI nur die in der Spezifikation aufgeführten allgemeinen Werte verwenden; abweichende oder beliebige Werte benötigen einen begründeten Sonderfall.
- Radien innerhalb zusammengehöriger Oberflächen konsistent halten und pro Element nicht mehrere konkurrierende Konturen oder Erhebungen stapeln.
- Rahmen sparsam einsetzen: `border` oder `border-2` für zurückhaltende Abgrenzungen, `border-4` nur als bewusstes Gestaltungsmittel für eine starke Kontur.
- Schatten nicht als Standard für jedes Element verwenden. `shadow-xl` oder `shadow-2xl` nur einsetzen, wenn eine Erhebung die Hierarchie tatsächlich unterstützt.
- Fokus muss unabhängig von Rahmen und Schatten klar erkennbar sein. `focus-visible:ring-2` oder `focus-visible:outline-4` mit mindestens 3:1 Kontrast zur angrenzenden Fläche verwenden; ein Schatten allein genügt nicht.
- Bestehende Komponenten müssen nicht allein wegen dieser Dokumentation umgestaltet werden.

[Zur Kapitelübersicht](README.md)
