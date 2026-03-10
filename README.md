# minfactory

minFactory

## Installation

```bash
cd client/ && npm install
cd server/ && npm install
```

## Start

```bash
cd client/ && npm start
cd server/ && npm start
```

## Test

```bash
cd client/ && npm test
cd server/ && npm test
```

## Lint

```bash
cd client/ && npm run lint
cd server/ && npm run lint
```

## Deployment Server

```bash
git subtree push --prefix server heroku main
```

## CI Deployment (Backend)

Für den automatisierten Deploy in GitHub Actions wird ein Repository Secret benötigt:

- `HEROKU_GIT_URL` (komplette Heroku Git URL inkl. Auth), z. B. `https://heroku:<API_KEY>@git.heroku.com/<APP_NAME>.git`

Die Pipeline führt dann im Repo-Root denselben Befehl aus:

```bash
git subtree push --prefix server heroku main
```

## Logs

```bash
heroku logs --tail 
```
