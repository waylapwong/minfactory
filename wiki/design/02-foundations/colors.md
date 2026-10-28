# Colors

## Definition

- Die Farbpalette bildet eine gemeinsame Grundlage für minFactory und alle minApps.
- Farben unterstützen Hierarchie, Orientierung und Rückmeldung; ihre konkrete Bedeutung ergibt sich aus dem Kontext.
- Die Palette basiert auf den Standardfarben von Tailwind CSS 4.

## Spezifikation

| Farbe | Zulässige Tailwind-Farbwerte | Beispiele für den Bestand |
| --- | --- | --- |
| White | `white` | Flächen und Karten |
| Gray | `gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-400`, `gray-500`, `gray-600`, `gray-700`, `gray-800`, `gray-900`, `gray-950` | Flächen, Konturen und Text |
| Black | `black` | Text und Konturen |
| Blue | `blue-50`, `blue-100`, `blue-300`, `blue-500`, `blue-600`, `blue-700`, `blue-800`, `blue-950` | Links, Fokus und Hervorhebungen |
| Green | `green-100`, `green-300`, `green-500`, `green-700` | Spielflächen und positive Rückmeldungen |
| Yellow | `yellow-100`, `yellow-300`, `yellow-500`, `yellow-900` | Hervorhebungen und Warnhinweise |
| Red | `red-100`, `red-300`, `red-500`, `red-600`, `red-700` | Fehler und destruktive Aktionen |
| Purple (Lila) | `purple-100`, `purple-300`, `purple-500` | Akzent und seltene beziehungsweise besondere Inhalte |
| Orange | `orange-100`, `orange-300`, `orange-500` | Akzent und besonders hervorgehobene Inhalte |

- Die Bestandsspalte beschreibt vorhandene Verwendungen im Client, keine vorgeschriebene Zuordnung.
- Die [bestehende `Color`-Enum](../../../client/src/app/shared/enums/color.enum.ts) enthält Blue, Gray, Green, Red, White und Yellow; Black wird bereits für Text und Konturen verwendet.
- Purple und Orange ergänzen die bisherige Palette als Dokumentationsvorgabe; die Dokumentation allein ändert keine Implementierung.
- Die WoW-Qualitäten Epic (Purple) und Legendary (Orange) sind eine Bedeutungsinspiration, keine Vorgabe für konkrete Hexwerte.
- Cyan und Gold sind nicht Teil der Palette.

## Verwendung

| Einsatz | Orientierung |
| --- | --- |
| Flächen und Text | White und Gray für neutrale Flächen; Gray und Black für Text und Konturen |
| Interaktive Elemente | Blue für primäre Aktionen, Links und Fokus; Zustände zusätzlich durch Form, Text oder Icon kennzeichnen |
| Rückmeldungen | Green für positive, Yellow für warnende und Red für fehlerhafte oder destruktive Situationen |
| Akzente | Purple und Orange für besondere Hervorhebungen, ohne sie ausschließlich auf Seltenheit festzulegen |

- Die Zuordnung ist kontextbezogen: Eine Farbe kann mehrere Rollen unterstützen.
- Bestehende Komponenten müssen nicht allein wegen dieser Dokumentation umgestaltet werden.
- Farbwerte mit Transparenz sind situationsabhängig zu prüfen; Transparenz ersetzt keine Kontrastprüfung.

## Regeln

- Für neue UI die in der Spezifikation aufgeführten Farben und Stufen verwenden; keine zusätzlichen Palettenfarben oder freien Hexwerte einführen.
- Zustände wie Hover, Active und Disabled sichtbar und konsistent gestalten; Focus muss deutlich erkennbar sein.
- Textkontraste nach WCAG 2.2 AA prüfen: mindestens 4,5:1 für normalen Text und 3:1 für großen Text.
- Informationen und Zustände nie ausschließlich durch Farbe vermitteln; zusätzlich Text, Icon, Muster oder Form verwenden.
- Bedienelemente und grafische Informationen müssen ausreichend kontrastreich zum Umfeld sein; für relevante nicht-textuelle UI-Bestandteile mindestens 3:1 einhalten.

[Zur Kapitelübersicht](README.md)
