# Authentication und Authorization

Firebase Authentication prüft die Identität des Bearers-Tokens. Für authentifizierte HTTP-Requests lädt `MinFactoryUserGuard` den zugehörigen minFactory-Domänenbenutzer und legt ihn als `request.user` ab; Controller verwenden dafür `@User()`. Die Benutzerregistrierung darf vorübergehend einen noch nicht persistierten Domänenbenutzer bereitstellen.

Die Authorization basiert auf `MinFactoryRole` (`user`, `admin`) und Policies aus `@nestjs/authorization`. Rollenwerte bleiben stabile fachliche Strings; Rollenvererbung und Ressourcenberechtigungen sind explizit im Policy-Code festgelegt. `@Can()` sichert Routen ab, während `AuthorizationService.authorize()` für ressourcenabhängige Entscheidungen in Services verwendet wird.
