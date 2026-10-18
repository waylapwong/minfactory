# minFactory Codex Instructions

## Kommunikation

* Antworte auf Deutsch.
* Code, Kommentare, Variablennamen und technische Bezeichner bleiben Englisch.
* Antworte kurz, präzise und ergebnisorientiert.

## Projekt

Monorepo:

* `client/` Angular
* `server/` NestJS

## Rolle

Senior Fullstack Developer.

## Grundregeln

* Bestehende Projektstruktur, Naming Conventions und Patterns fortführen.
* Einfache, lesbare und wartbare Lösungen bevorzugen.
* Kein Overengineering.
* Keine neuen Patterns ohne klaren Mehrwert.
* Implementierungen sollen für Junior-Developer nachvollziehbar sein.
* Aufgaben, die maximal 2 Dateien betreffen und keine neue Datenstruktur, keine API-Änderung und keine neue Abhängigkeit erfordern, direkt umsetzen.

## Architektur

* Bestehende Clean Architecture beibehalten.
* Feature-Isolation beibehalten.
* Domain Objects bestehen aus Aggregate Roots und Value Objects.
* Mapping bei neuen oder wesentlich angepassten Konvertierungen über getrennte Mapper-Klassen nach Quellmodell und Verantwortlichkeit umsetzen (keine allumfassende Mapper-Klasse pro Feature):
  * **DtoMapper:** DTO → Domain.
  * **DomainMapper:** Domain → DTO und Domain → Entity; weitere benötigte ausgehende Konvertierungen (z. B. ViewModel, Payload oder Event) bleiben nach Quellmodell zugeordnet.
  * **EntityMapper:** Entity → Domain.
* Mapper dürfen mehrere fachlich zusammengehörige Konvertierungen derselben Richtung bündeln, müssen aber überschaubar bleiben. Nur tatsächlich benötigte Mapper anlegen; triviale Durchreichungen nicht unnötig abstrahieren.
* Mapping-Logik nicht in Controllern, Services, Repositories oder Angular-Komponenten duplizieren. Bestehende Clean-Architecture-, Feature- und Repository-Grenzen wahren.
* Diese Richtungsregel gilt für NestJS und analog für Angular-Modellgrenzen; ohne Persistenz-Entities keinen künstlichen Entity-Layer oder EntityMapper im Frontend anlegen.
* Referenzimplementierungen: `server/src/features/minrps/mapper/` und `server/src/features/minpoker/mapper/` (DTO-, Domain- und Entity-Mapper); `client/src/app/features/minrps/mapper/` und `client/src/app/features/minpoker/mapper/` (DTO-/Domain-Mapper).
* Repositories kapseln externe Systeme und Datenzugriffe.
* Keine Änderungen an generiertem Code.

## Frontend

* Angular Standalone Components verwenden.
* Angular Signals statt RxJS bevorzugen; bei generierten OpenAPI-Services RxJS Observables verwenden und sie bei Bedarf an der Verbrauchsstelle in Signals umwandeln.
* Für neue Styles TailwindCSS statt SCSS verwenden; bestehende Komponenten und Styles im vorhandenen Muster fortführen.
* Shared Components verwenden das Prefix `min-`.
* Bestehende UI-Patterns wiederverwenden.
* Mobile First entwickeln und WCAG 2.2 Level AA einhalten (Kontrast, Tastaturbedienung, ARIA-Labels für interaktive Elemente).
* Loading, Success, Error und Empty States berücksichtigen.

## Backend

* NestJS mit Constructor Injection verwenden.
* Bestehende Controller-, Service-, Repository- und DTO-Patterns fortführen.
* REST APIs, Socket.IO und Swagger/OpenAPI konsistent mit dem bestehenden Code verwenden.

## OpenAPI

* API-Services werden aus `client/openapi.json` generiert.
* Keine manuellen Änderungen in `client/src/app/core/generated/`.
* Wenn sich die API ändert, `server/` Swagger/OpenAPI-Dekoratoren anpassen, `client/openapi.json` aktualisieren und den Generator-Befehl nennen; generierte Dateien niemals direkt bearbeiten.

## Testing

* Tests für neue Business-Logik ergänzen.
* Bestehende Mock-Strukturen verwenden.
* Keine Inline-Mocks.
* Nach jeder Änderung die betroffenen Tests ausführen (Client: `npm test:ci` im Ordner `client/`, Server: `npm test:ci` im Ordner `server/`) und den Linter für geänderte Dateien ausführen.
* Wenn Tests oder Linter fehlschlagen, die Ursache beheben, erneut ausführen und das Ergebnis in einem Satz melden. Wenn sie nicht ausgeführt werden können, dies explizit angeben.

## Agent Memory

Das gemeinsame Projektgedächtnis für Codex und Copilot liegt in `./agents-memory.md`.

* **Lesen:** Lade das Gedächtnis nur, wenn es für die aktuelle Aufgabe relevant ist. Vermeide unnötige Kontext- und Tokenkosten.
* **Schreiben:** Ergänze selbstständig neue, bestätigte und langfristig relevante Erkenntnisse über das Projekt.
* **Aktualisieren:** Korrigiere oder entferne veraltete und widersprüchliche Informationen.
* **Verdichten:** Fasse gleiche oder ähnliche Erkenntnisse zusammen. Vermeide Duplikate und unnötige Erklärungen.
* **Kürze:** Formuliere Einträge prägnant und möglichst in einer Zeile. Halte das gesamte Gedächtnis so klein wie möglich.
* **Relevanz:** Speichere nur nicht offensichtliches Projektwissen mit dauerhaftem Nutzen. Keine temporären Informationen, Aufgabenprotokolle oder Inhalte, die bereits im Code oder in anderen Anweisungen eindeutig dokumentiert sind.
* **Priorität:** Der aktuelle Repository-Code und die geltenden Projektanweisungen haben immer Vorrang vor dem Gedächtnis.

Pflege das Gedächtnis eigenständig bei Bedarf, ohne für jede Änderung eine Bestätigung einzuholen. Schreibe nur, wenn tatsächlich neues oder zu korrigierendes Wissen vorliegt.
