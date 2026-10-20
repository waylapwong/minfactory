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

Das gemeinsame Projektgedächtnis für Codex und Copilot liegt in `./agents-memory.md`. Es hilft Agents, wiederkehrende Repo-Patterns und Coding-Konventionen über Aufgaben hinweg anzuwenden.

* **Zu Aufgabenbeginn lesen:** Prüfe das Gedächtnis, sobald die Aufgabe Code, Tests, Architektur oder Projektabläufe betrifft. Nutze die Einträge als Hinweise und gleiche sie mit dem aktuellen Code und den geltenden Anweisungen ab.
* **Beim Arbeiten beobachten:** Achte darauf, ob ein Pattern oder eine Konvention an mehreren unabhängigen Stellen im Repository vorkommt oder durch mehrere passende Beispiele bestätigt wird. Übernimm solche wiederkehrenden Patterns bei der Umsetzung.
* **Selbstständig lernen:** Wenn du dabei eine neue, nicht offensichtliche und langfristig nützliche Repo-Konvention feststellst, ergänze sie direkt in `agents-memory.md` – auch wenn der Prompt nicht ausdrücklich um eine Memory-Aktualisierung bittet. Schreibe nur, wenn die Beobachtung durch den aktuellen Code oder die Aufgabe belegt ist; halte Vermutungen und einmalige Entscheidungen heraus.
* **Gedächtnis aktuell halten:** Korrigiere oder entferne Einträge, die dem aktuellen Code oder geltenden Anweisungen widersprechen. Fasse ähnliche Hinweise zusammen und vermeide Duplikate.
* **Knapp und dauerhaft:** Formuliere Erkenntnisse prägnant, möglichst in einer Zeile. Speichere keine Aufgabenprotokolle, temporären Details oder Regeln, die bereits eindeutig in `AGENTS.md` stehen.
* **Priorität:** Aktueller Repository-Code und geltende Projektanweisungen haben immer Vorrang vor dem Gedächtnis.

Pflege `agents-memory.md` eigenständig während der Arbeit, ohne dafür eine Bestätigung einzuholen. Ändere es nur bei belegtem, dauerhaft nützlichem Erkenntnisgewinn oder notwendiger Korrektur.