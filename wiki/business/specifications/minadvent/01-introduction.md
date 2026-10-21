# 1. Einleitung

## `minAdvent` | Fachliches Konzept

> **Geplanter Soll-Zustand für minAdvent v1.0.0.** Diese Dokumentation beschreibt Anforderungen, keine bereits implementierten Funktionen. Grundlage: [Issue #175](https://github.com/waylapwong/minfactory/issues/175); die technische Ausarbeitung erfolgt getrennt in [#176](https://github.com/waylapwong/minfactory/issues/176).

#### 1. Allgemeines

minAdvent ist ein persönlich gestaltbarer Adventskalender innerhalb von minFactory. Ein angemeldeter **Ersteller** legt beliebig viele voneinander unabhängige Kalender an, gestaltet bis zu 24 Türchen und veröffentlicht jeden Kalender ausdrücklich für **genau einen namentlich angesprochenen Empfänger**. Der Empfänger benötigt keinen Account. Wer den geheimen Shared Link besitzt, kann den Kalender ansehen und freigeschaltete Türchen öffnen; die angegebene Empfängeridentität wird technisch nicht überprüft.

Die geplante technische Umsetzung ist unter [minAdvent – Technische Spezifikation](../../../technical/minadvent/minadvent-home.md) dokumentiert.

#### 2. Dokumentationsübersicht

- [Kalender, Lebenszyklus und Freigabe](../../3-mintools/minadvent/calendar-lifecycle.md): Kalenderjahr, Veröffentlichung, Türchenzustände, Abschluss, Löschen.
- [Inhalte und Validierung](../../3-mintools/minadvent/content-and-validation.md): Blöcke, Editor, Stammdaten, Speichern, Versionierung.
- [Benutzerabläufe und Fehlerfälle](../../3-mintools/minadvent/user-journeys.md): Ersteller-/Empfängeransichten, Countdown, Öffnung, Konflikte, Tests und Grenzfälle.

Alle Regeln der drei Detailseiten gelten gemeinsam. Im Zweifel sind Datum und Zustand serverseitig maßgeblich; zeitbezogene Entscheidungen folgen **Europe/Berlin**.

Die Verifikation für v1.0.0 verwendet ausschließlich Unit-Tests mit Mocks; die fachlichen Anforderungen und Zustandsregeln bleiben davon unberührt. Details stehen in der [technischen Teststrategie](../../../technical/minadvent/testing.md).

#### 3. Rollen und Ansichten

| Rolle | Zugang | Berechtigungen |
| --- | --- | --- |
| Ersteller | Angemeldeter minFactory-Nutzer | Eigene Kalender anlegen, Titel und Empfängername ändern, ungeöffnete Türchen bearbeiten, geöffnete Türchen jederzeit schließen und danach bearbeiten, Freigabe verwalten und löschen; jeweils nur soweit der Kalenderzustand es erlaubt. |
| Empfänger | Aktiver Shared Link, ohne Anmeldung | Kalender anzeigen, datumsbedingt verfügbare befüllte Türchen erstmals öffnen und bereits geöffnete Türchen lesen. |
| Andere angemeldete Nutzer | Kein Eigentümerzugriff | Dürfen fremde Kalender nicht verwalten. Linkbesitz berechtigt nur zum Empfängerzugriff. |

Es gibt **keine separate Erstellervorschau**, keine Reaktionen, keinen Testmodus und keine Duplizierungsfunktion. Ein Testkalender ist ein gewöhnlicher Kalender mit denselben Regeln.

#### 4. Gestaltungsgrundsätze

Die Anwendung ist **minimalistisch, mobile-first** und einheitlich gestaltet. Es gibt keine wählbaren Themes, keine individuelle Begrüßung und keinen Fortschrittsbalken für Empfänger. Empfänger sehen den Kalendertitel und – vor Dezember – den Countdown, danach das Türchenraster. Einzelne Türcheninhalte erscheinen in einem schließbaren Dialog ohne Navigation zwischen Türchen. Eine dezente Animation erscheint ausschließlich nach einer erfolgreichen erstmaligen Öffnung.

Die Erstellerverwaltung sortiert Kalender des aktuellen Jahres zuerst; Kalender vergangener Jahre sind nach Jahr gruppiert. Die Bearbeitungsansicht unterscheidet `EMPTY`, `FILLED` und `OPENED` sichtbar und zeigt unaufdringlich „X von 24 Türchen befüllt“ sowie den Öffnungsstand. Der Veröffentlichungszustand ist unabhängig davon sichtbar.

#### 5. Geltungsbereich v1.0.0

Die fachlichen Abläufe und verbindlichen Randfälle stehen in den verlinkten Detailseiten. Die technische Umsetzung (Datenbank, genaue DTO-Strukturen, Framework-Komponenten und konkrete API-Routen) ist Gegenstand von #176 und späteren Umsetzungstickets. Nicht Teil dieses Dokumentationstickets sind Frontend-/Backend-Implementierungen.
