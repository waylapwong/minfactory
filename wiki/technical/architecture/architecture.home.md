# Architektur | Home

## 1. Konzepte

### 1.1 Rollierendes Agentengedächtnis

Das gemeinsame Gedächtnis in `agents-memory.md` bewahrt bestätigtes, langfristig nützliches Projektwissen für spätere Aufgaben. Es ist weder Gesprächsprotokoll noch Ersatz für Quellcode oder Dokumentation.

#### 1.1.1 Grundprinzipien

- **Selektiv:** Nur nicht offensichtliches Wissen mit künftigem Nutzen aufnehmen.
- **Bestätigt:** Code, Tests oder wiederholte Erfahrung müssen die Erkenntnis stützen.
- **Kompakt:** Bestehende Dokumentation nicht duplizieren; ähnliche Einträge zusammenführen.
- **Aktuell:** Veraltetes oder Widersprüchliches korrigieren oder entfernen.
- **Nachrangig:** Aktueller Code und Projektanweisungen gelten vor Erinnerungen.

#### 1.1.2 Ablauf des Gedächtniszyklus

1. **Gezielt lesen:** Nur für die aktuelle Aufgabe relevante Einträge heranziehen.
2. **Abgleichen:** Erinnerungen an aktuellem Code, Tests und Projektanweisungen prüfen.
3. **Erkenntnisse bewerten:** Dauerhaften Nutzen, Bestätigung und fehlende Redundanz sicherstellen.
4. **Kompakt festhalten:** Bestätigtes Wissen verständlich und umsetzbar formulieren; thematisch einordnen und ähnliche Einträge zusammenführen.
5. **Pflegen:** Veraltete oder widersprüchliche Einträge korrigieren oder löschen.
6. **Wiederverwenden:** Relevante Einträge bei späteren Aufgaben erneut prüfen und anwenden.

#### 1.1.3 Inhalte und Qualitätsprüfung

- **Speichern:** Bestätigte Projektkonventionen, Abhängigkeiten und wiederkehrende Stolperstellen, die spätere Änderungen oder Tests erleichtern.
- **Nicht speichern:** Gesprächsprotokolle, offene Aufgabenstände, einmalige Debug-Ausgaben, Vermutungen sowie Kopien vorhandener Dokumentation oder Quelltexte.
- **Prüfen:** Ist der Eintrag aktuell, belegt, künftig nützlich, knapp und ohne Gesprächskontext verständlich? Sonst nicht aufnehmen oder entfernen.

So bleibt das Gedächtnis klein, überprüfbar und bei späteren Aufgaben direkt nutzbar.
