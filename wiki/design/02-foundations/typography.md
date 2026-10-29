# Typography

## Definition

- Die Typografie schafft eine gemeinsame, gut lesbare Texthierarchie für minFactory und alle minApps.
- Schriftfamilie, Größe, Gewicht und Zeilenhöhe kennzeichnen die Rolle eines Textes; Farbe und Dekoration ersetzen keine typografische Hierarchie.
- Die Spezifikation nutzt die Standardskala von Tailwind CSS 4 und berücksichtigt vorhandene Client-Schriften und -Komponenten.

## Spezifikation

### Schriftfamilien und -stärken

| Einsatz | Zulässige Tailwind-Klassen | Wert |
| --- | --- | --- |
| Standardschrift | `font-patrick-hand` | Patrick Hand; aktuell die globale Schrift des Clients |
| Dekorative Schrift | `font-caveat` | Caveat; auf Logo und kurze dekorative Inhalte begrenzen |
| Monospace | `font-mono` | Technische oder tabellarische Werte, wenn feste Zeichenbreiten hilfreich sind |
| Normal | `font-normal` | 400 |
| Fett | `font-bold` | 700; sparsam für Überschriften und gezielte Hervorhebungen |

- Für neue UI die Standardschrift verwenden. Keine zusätzlichen Schriftfamilien, Gewichte oder externen Schriftdateien ohne Designentscheidung einführen.

### Schriftgrößen

| Tailwind-Klasse | Größe | Verwendung |
| --- | --- | --- |
| `text-xs` | 0,75 rem / 12 px | Kompakte Kennzeichnungen, etwa kurze Badges; nicht für wichtige Hinweise oder längere Texte |
| `text-sm` | 0,875 rem / 14 px | Labels, Hilfs- und ergänzende Texte |
| `text-base` | 1 rem / 16 px | Fließtext und Formulareingaben |
| `text-lg` | 1,125 rem / 18 px | Einleitung oder hervorgehobener Fließtext |
| `text-xl` | 1,25 rem / 20 px | Untergeordnete Abschnittsüberschrift |
| `text-2xl` | 1,5 rem / 24 px | Abschnittsüberschrift |
| `text-3xl` | 1,875 rem / 30 px | Seitentitel auf kleinen Ansichten |
| `text-4xl` | 2,25 rem / 36 px | Seitentitel auf größeren Ansichten |

### Zeilenhöhe und Buchstabenabstand

| Eigenschaft | Zulässige Tailwind-Klassen | Wert |
| --- | --- | --- |
| Zeilenhöhe | `leading-tight` | 1,25 |
| Zeilenhöhe | `leading-snug` | 1,375 |
| Zeilenhöhe | `leading-normal` | 1,5 |
| Zeilenhöhe | `leading-relaxed` | 1,625 |
| Buchstabenabstand | `tracking-tight` | −0,025 em |
| Buchstabenabstand | `tracking-normal` | 0 em |
| Buchstabenabstand | `tracking-wide` | 0,025 em |

## Verwendung

| Rolle | Empfohlene Tailwind-Klassen | Bestand im Client |
| --- | --- | --- |
| Seitentitel (`h1`) | `text-3xl sm:text-4xl font-bold leading-tight` | `min-h1` verwendet `text-4xl font-bold`. Die responsive Empfehlung ist eine Vorgabe für neue oder angepasste UI, keine automatische Umstellung. |
| Abschnittsüberschrift (`h2`) | `text-2xl font-bold leading-tight` | `min-h2` verwendet `text-2xl font-bold`. |
| Unterabschnitt (`h3`) | `text-xl font-bold leading-snug` | Keine eigene gemeinsame Heading-Komponente dokumentiert. |
| Einleitung | `text-lg leading-relaxed` | Kein einheitliches Muster dokumentiert. |
| Fließtext | `text-base leading-normal` | Die globale Schrift ist Patrick Hand; Größen werden im Bestand häufig direkt an Elementen festgelegt. |
| Label | `text-sm font-bold leading-normal` | Shared Form Controls verwenden überwiegend `font-bold`, teils ohne Größenklasse. |
| Hilfs- oder Validierungstext | `text-sm leading-normal` | Input und Textarea verwenden derzeit `text-xs`; bei neuen oder angepassten wichtigen Hinweisen `text-sm` bevorzugen. |
| Kompakte Kennzeichnung | `text-xs leading-normal` | Unter anderem Badges und kurze Zähler; bestehende Nutzung bleibt unverändert. |

- Überschriften nach Inhalt und Bedeutung als `h1` bis `h3` auszeichnen, nicht allein anhand ihrer Darstellung.
- Auf kleinen Ansichten beginnen und bei Bedarf mit Tailwind-Breakpoints wie `sm:` vergrößern. Fließtext bleibt mindestens `text-base`; wichtige Hinweise mindestens `text-sm`.
- Zahlen und kurze technische Werte dürfen `font-mono` nutzen, wenn dies Ausrichtung oder Lesbarkeit verbessert. Dekorative Schriften sind nicht für Fließtext oder längere Anweisungen vorgesehen.
- Die Empfehlungen legen neue Standards fest; die Bestandsspalte beschreibt vorhandene Nutzung. Die Dokumentation allein ändert keine Komponenten.

## Regeln

- Innerhalb eines Screens dieselbe Rolle mit denselben Größen und Gewichten darstellen. Zusätzliche Einzelwerte oder willkürliche Tailwind-Werte für Schriftgröße, Zeilenhöhe und Buchstabenabstand vermeiden.
- Schriftgröße und Zeilenhöhe passend kombinieren: Überschriften kompakt, Fließtext und längere Inhalte mindestens `leading-normal`; längere Passagen vorzugsweise `leading-relaxed`.
- Wichtige Informationen nicht ausschließlich durch Schriftgröße, Gewicht, Farbe oder Dekoration vermitteln.
- Texte müssen bei 200 % Vergrößerung nutzbar bleiben und bei schmalen Viewports ohne horizontales Scrollen lesbar umbrechen. Keine festen Höhen, abgeschnittenen Inhalte oder erzwungenen Einzeiler für Text verwenden.
- Lesbarkeit und Kontrast für Text nach WCAG 2.2 AA prüfen: mindestens 4,5:1 für normalen Text und 3:1 für großen Text. Farbe allein nicht als Kennzeichnung verwenden.
- Bestehende abweichende Klassen, etwa individuelle Buchstabenabstände oder kleinere Hilfstexte, sind dokumentierter Bestand und keine neue Vorgabe; bei einer fachlichen Überarbeitung an dieser Skala ausrichten.

[Zur Kapitelübersicht](README.md)
