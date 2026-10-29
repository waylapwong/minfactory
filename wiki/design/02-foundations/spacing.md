# Spacing

## Definition

- Die Abstandsskala bildet eine gemeinsame Grundlage für minFactory und alle minApps.
- Abstände schaffen Lesbarkeit, Hierarchie und erkennbare Gruppierungen.
- Die Skala orientiert sich an Tailwind CSS 4; `1` entspricht `0,25rem` (bei 16px Root-Schriftgröße 4px).

## Spezifikation

| Tailwind-Wert | Abstand | Orientierung und Bestand im Client |
| --- | --- | --- |
| `0` | 0px | Abstand gezielt zurücksetzen, z. B. `m-0` |
| `0.5` | 2px | Sehr kompakte Details, z. B. Badges und Poker-Spielanzeigen |
| `1` | 4px | Kompakter Control-Innenabstand, z. B. Selects und Buttons |
| `1.5` | 6px | Kompakte Abstände, z. B. Poker-Spielanzeigen |
| `2` | 8px | Innenabstände und kompakte Elementabstände, z. B. Karten und Selects |
| `3` | 12px | Innenabstand von Bedienelementen, z. B. Toggle und Textarea |
| `4` | 16px | Innenabstand von Controls und Dialogen, z. B. Slider und Dialog |
| `5` | 20px | Gruppenabstand, z. B. Kalenderbereiche |
| `6` | 24px | Größere Gruppenabstände, z. B. Adventskalender |
| `8` | 32px | Großzügiger vertikaler Abstand, z. B. Lade- und Statusbereiche |
| `12` | 48px | Besonders großzügiger Abstand, z. B. Alert-Sektionen |

- Die Tabelle beschränkt neue UI auf die im aktuellen Client bereits verwendeten Werte; die Bestandsbeispiele sind keine verpflichtenden Zuordnungen.
- Die Dokumentation ändert bestehende Komponenten oder Abstände nicht automatisch.
- Die Werte gelten für Padding, Margin und Gap; Tailwind-Varianten wie `sm:` dürfen dieselbe Skala responsiv anpassen.

## Verwendung

| Einsatz | Orientierung |
| --- | --- |
| Innenabstand | Padding hält Inhalte von der Kante ihrer Fläche oder Komponente fern; kompakte Controls benötigen weniger, Karten und Dialoge mehr Innenabstand. |
| Elemente innerhalb einer Gruppe | `gap` am Flex- oder Grid-Container hält gleichrangige Elemente zusammen; kleine Werte für eng verbundene Inhalte, größere Werte für eigenständige Inhalte. |
| Gruppen und Sektionen | Größere `gap`- oder Padding-Werte trennen logische Gruppen und Sektionen deutlicher als einzelne Elemente. |
| Margin | Für Abstand außerhalb einer Komponente, wenn dieser nicht bereits durch den übergeordneten Layout-Container mit `gap` entsteht. |
| Responsive Abstände | Mobile-first mit einem Wert aus der Skala beginnen; an größeren Tailwind-Breakpoints nur erhöhen oder anpassen, wenn Platzangebot oder Layout es erfordern. |

- Abstände unterstützen visuelle Gruppierung: Eng zusammengehörige Inhalte liegen näher beieinander als voneinander unabhängige Gruppen.
- Für wiederholte Elemente desselben Containers `gap` statt einzelner Margins verwenden; damit bleibt der Abstand unabhängig von der Anzahl der Elemente konsistent.
- Padding und Margin beschreiben unterschiedliche Seiten einer Grenze: Padding liegt innerhalb, Margin außerhalb der Komponente.

## Regeln

- Für neue UI ausschließlich die Werte aus der Spezifikation verwenden; keine beliebigen Einzelabstände oder frei gewählten Pixelwerte ergänzen.
- `0` dient dem gezielten Zurücksetzen, nicht als zusätzlicher Abstand.
- Bei wiederholten Layouts und Gruppen Container-Abstände bevorzugen; Einzel-Margins nicht als Ersatz für ein konsistentes Layout einsetzen.
- Responsives Spacing bleibt innerhalb der Skala; Breakpoint-Varianten nur einsetzen, wenn sich der verfügbare Platz oder die Anordnung ändert.
- Abweichungen von der Skala sind auf begründete Sonderfälle zu beschränken, etwa wenn ein Fremd- oder Browser-Control feste Maße erfordert; sie dürfen keine neue allgemeine Stufe etablieren.
- Vorhandene Abstände außerhalb einer künftigen Vorgabe sind Bestand und müssen nicht allein wegen dieser Dokumentation angepasst werden.

[Zur Kapitelübersicht](README.md)
