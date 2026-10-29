# Layout

## Definition

- Layout ordnet Inhalte und Bedienelemente für minFactory und alle minApps über verschiedene Viewportgrößen hinweg.
- Die Client-Grundlage ist Tailwind CSS 4 mit Standardwerten; `client/src/styles.scss` definiert keine eigenen Breakpoints oder Containerbreiten.
- Globale Layout-Grundlagen beschreiben Seiten- und Inhaltsbreiten, Raster, Flex-Verhalten und responsive Umbrüche.
- Konkrete Navigations-, App-Shell-, Dialog- und Komponenten-Layouts bleiben Patterns der jeweiligen Anwendung oder Komponente.

## Spezifikation

### Breakpoints

Tailwind-Breakpoints sind Mindestbreiten. Ohne Präfix gelten Regeln auf allen Viewports; ein Präfix ergänzt oder überschreibt Regeln ab dem jeweiligen Breakpoint.

| Präfix | Mindestbreite | Typische Orientierung |
| --- | ---: | --- |
| – | 0 px | Schmale Viewports und mobile Darstellung |
| `sm:` | 40 rem / 640 px | Erste größere Umbruchstufe |
| `md:` | 48 rem / 768 px | Mittlere Viewports |
| `lg:` | 64 rem / 1024 px | Große Viewports |
| `xl:` | 80 rem / 1280 px | Sehr große Viewports |
| `2xl:` | 96 rem / 1536 px | Extra große Viewports |

### Inhaltsbreiten

Die Werte sind Tailwind-Standardwerte. Die Beispiele zeigen vorhandene Verwendung, keine nachträgliche Vereinheitlichung bestehender Screens.

| Utility | Maximale Breite | Vorhandene Verwendung |
| --- | ---: | --- |
| `max-w-sm` | 24 rem / 384 px | minRPS-Inhaltsbereiche |
| `max-w-md` | 28 rem / 448 px | Login- und Registrierungs-Karten, Snackbar und Dialog |
| `max-w-lg` | 32 rem / 512 px | minAdvent-Fehlerbereich |
| `max-w-xl` | 36 rem / 576 px | minAdvent-Countdown |
| `max-w-3xl` | 48 rem / 768 px | Breiter Dialog |
| `max-w-4xl` | 56 rem / 896 px | minAdvent-Kalenderseite |
| `max-w-screen-sm` | 40 rem / 640 px | minFactory-App-Shell |

- `max-w-{size}` verwendet die Tailwind-Breiten-Skala; `max-w-screen-{breakpoint}` entspricht der jeweiligen Breakpoint-Breite.
- `w-full` füllt den verfügbaren Platz bis zur gesetzten Maximalbreite. `mx-auto` zentriert einen begrenzten Inhaltsbereich.
- Container erhalten bei Bedarf seitlichen Innenabstand, damit Inhalte nicht am Viewportrand anliegen.

### Anordnungen

| Muster | Grundlage | Bestand |
| --- | --- | --- |
| Flex | `flex`, `flex-col`, `flex-row`, `flex-wrap` | Formularaktionen wechseln teilweise mit `sm:flex-row`; Aktionen und Statusgruppen verwenden `flex-wrap`. |
| Grid | `grid`, `grid-cols-{n}`, responsive Spalten mit Breakpoint-Präfix | Kalenderübersicht wechselt von vier auf sechs Spalten mit `sm:grid-cols-6`; Spielansichten verwenden feature-spezifische Raster. |
| Inhaltsbereich | `w-full` mit `max-w-*`, optional zentriert | minAdvent-Kalenderseite und minFactory-App-Shell begrenzen ihre Breite unterschiedlich. |

## Verwendung

- Neue Oberflächen werden Mobile First aufgebaut: Grundlayout und Inhalte funktionieren ohne Breakpoint-Präfix; Erweiterungen für größere Viewports kommen bedarfsgerecht hinzu.
- Seiteninhalte nutzen die verfügbare Breite und werden bei umfangreichen Lesebereichen auf eine geeignete Maximalbreite begrenzt und zentriert.
- Flex- und Grid-Anordnungen richten sich nach Inhalt und verfügbarer Breite. Aktionen dürfen umbrechen; Spaltenzahlen werden nur verändert, wenn die Inhalte es erfordern.
- Header, Navigation, Footer, Dialoge und wiederverwendbare Komponenten folgen ihren eigenen Patterns. Diese Foundation legt dafür keine konkrete Menüstruktur, App-Shell-Breite oder Komponentenabmessung fest.
- Bestehende Beispiele sind Referenzen für den aktuellen Bestand, keine Pflicht zur Migration. Neue Vorgaben gelten für neu angelegte oder wesentlich angepasste Layouts.

## Regeln

- Inhalte müssen bei 320 CSS-Pixel Viewportbreite und bei vergrößerter Browseransicht ohne Verlust oder horizontales Scrollen der gesamten Seite nutzbar bleiben.
- Keine starre Mindestbreite für gewöhnliche Seiteninhalte festlegen. Bei Flex- und Grid-Kindern Überlauf berücksichtigen; lange Titel, URLs und nutzergenerierte Texte müssen umbrechen oder anderweitig zugänglich bleiben.
- Lange Listen und Seiten scrollen vertikal. Horizontalen Überlauf auf den kleinsten erforderlichen Bereich begrenzen und nur für Inhalte verwenden, die tatsächlich zweidimensional sind.
- Inhalte nicht allein durch Abschneiden verbergen. Falls `truncate` aus Platzgründen nötig ist, muss der vollständige Inhalt weiterhin erreichbar sein.
- Viewport-Höhen nicht als feste Inhaltsgrenze verwenden. Bei begrenzten Oberflächen muss der Inhaltsbereich intern scrollbar bleiben; Dialoge berücksichtigen die verfügbare Viewporthöhe.
- Breakpoints nach dem tatsächlichen Platzbedarf der Inhalte wählen, nicht nach Gerätebezeichnungen. Keine individuellen Breakpoints oder Containerwerte einführen, wenn die Tailwind-Standards ausreichen.
- Layoutänderungen dürfen Zoom, Tastaturbedienung und Lesereihenfolge nicht beeinträchtigen; horizontales Scrollen ist keine Alternative zu einem erforderlichen responsiven Umbruch.

[Zur Kapitelübersicht](README.md)
