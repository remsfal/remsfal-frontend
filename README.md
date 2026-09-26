<img src="https://remsfal.de/remsfal-logo.svg" alt="REMSFAL Logo" width="60%">

![GitHub Release](https://img.shields.io/github/v/release/remsfal/remsfal-frontend?label=latest%20release)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=remsfal_remsfal-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=remsfal_remsfal-frontend)
[![License](https://img.shields.io/github/license/remsfal/remsfal-frontend)](https://github.com/remsfal/remsfal-frontend/blob/main/LICENSE)
![Contributors](https://img.shields.io/github/contributors/remsfal/remsfal-frontend)

# REMSFAL – Open Source Real Estate & Facility Management (Frontend)

**REMSFAL** is an open source platform for the management of residential and commercial real estate.
It connects the three parties involved in day-to-day property operations – **property managers**, **tenants**
and **contractors** – in a single system and replaces scattered emails, phone calls and spreadsheets with
structured, traceable workflows.

This repository contains the frontend: a responsive single-page application built with **Vue 3**,
**TypeScript** and **[Vite](https://vite.dev)** that runs in the browser, can be installed as a
Progressive Web App and packaged as a native Android/iOS app. It consumes the REST APIs of the
[`remsfal-backend`](https://github.com/remsfal/remsfal-backend) microservices.
A live version is available at **[remsfal.online](https://remsfal.online)**.

### Key Features

- **Role-based workspaces** – dedicated views with their own navigation for property managers, individual
  projects, tenants and contractors.
- **Property portfolio management** – browse and edit properties, sites, buildings, apartments, commercial units
  and storage rooms as a hierarchical tree, with KPIs on the project dashboard.
- **Tenancy management** – rental agreements, tenant records and a self-service portal for tenants.
- **Issue & maintenance ticketing** – report damages and requests, triage them in configurable issue lists and
  collaborate via attachments, chat and an activity timeline.
- **Contractor workflows** – manage contractors, customers and orders from both the manager's and the
  contractor's point of view.
- **Organizations & memberships** – organizations, employees and project members with role-based access.
- **Mobile & offline ready** – mobile-optimized navigation, installable PWA with service worker, native
  Android/iOS builds via Capacitor.
- **Multilingual** – German (default) and English.

### Technology Stack

| Area            | Technology                                                                          |
|-----------------|-------------------------------------------------------------------------------------|
| Framework       | Vue 3 (Composition API, `<script setup>`), TypeScript                              |
| Build tooling   | Vite, `vue-tsc`, file-based routing via Vue Router                                  |
| UI & Styling    | PrimeVue 4, TailwindCSS 4, PrimeIcons, Font Awesome, Chart.js                       |
| State & Routing | Pinia, Vue Router                                                                   |
| API access      | Axios with types generated from the backend OpenAPI specs (`openapi-typescript`)    |
| i18n            | vue-i18n                                                                            |
| Mobile / PWA    | Capacitor (Android, iOS), `vite-plugin-pwa` / Workbox                               |
| Observability   | OpenTelemetry (browser traces and logs via OTLP/HTTP)                               |
| Quality         | Vitest, Cypress, MSW, ESLint, Stylelint, SonarCloud                                 |


## Architecture

The application is organized by feature and by user role:

```
src/
├── pages/        # File-based routes (URL structure = folder structure)
├── layouts/      # Role-based layouts: manager, project, tenant, contractor, public
├── features/     # Feature slices grouped by view: manager/, project/, tenant/, contractor/, common/
├── components/   # Generic, feature-independent UI components
├── composables/  # App-wide composables
├── services/     # API services and generated OpenAPI types (services/api/*-schema.ts)
├── stores/       # Pinia stores (user session, events, ...)
├── i18n/         # Translations (de.json, en.json)
└── telemetry/    # OpenTelemetry setup
```

> **_NOTE:_** Before implementing a new feature, please **first** read [AGENT.md](AGENT.md). It is the single source
> of truth for the project architecture, the ongoing migration to the feature-sliced structure, API and form
> patterns, testing organization and coding conventions.


## Development

### Prerequisites

To develop or start this project locally, you need

- [Node.js](https://nodejs.org) (current LTS) and npm
- A running [`remsfal-backend`](https://github.com/remsfal/remsfal-backend) (Docker or Podman plus Java 17+ and Maven)

**Recommended IDE:** [IntelliJ IDEA](https://www.jetbrains.com/idea/) with the Vue.js plugin. ESLint and Stylelint
are picked up automatically from the project configuration; enable *ESLint → Run eslint --fix on save* for
automatic formatting.


## How to get started

**1. Start the backend.** Follow the [backend's getting started guide](https://github.com/remsfal/remsfal-backend#how-to-get-started):
start the infrastructure with `docker compose up -d` and run the microservices in dev mode.

**2. Install dependencies and start the frontend:**

```sh
npm install
npm run dev
```

The app is served at [http://localhost:5173](http://localhost:5173) with hot module replacement.
The Vite dev server proxies all API calls to the locally running backend, so no CORS setup is required:

| Path          | Target                  | Purpose                                     |
|---------------|-------------------------|---------------------------------------------|
| `/api`        | `http://localhost:8080` | Platform service (login, projects, users …) |
| `/ticketing`  | `http://localhost:8081` | Ticketing service (issues, chat, documents) |
| `/otlp`       | `http://localhost:4318` | OpenTelemetry collector (Grafana LGTM)      |

**3. Log in.** Click *Login* – in dev mode the backend shows a dev login page instead of Google OAuth.
Choose one of the seed users (`verwalter@remsfal.dev`, `mieter@remsfal.dev`, `handwerker@remsfal.dev`) to explore
the manager, tenant or contractor view. Use a private window or a second browser profile to be logged in as
several users at the same time. See [Local setup without credentials](https://github.com/remsfal/remsfal-backend#local-setup-without-credentials)
for details.

### Configuration

Build-time configuration is done via Vite environment variables in [`.env`](.env) (development) and
[`.env.production`](.env.production) (production build). Put personal overrides into an untracked `.env.local`.

| Variable                           | Description                                                           |
|------------------------------------|-----------------------------------------------------------------------|
| `VITE_BASE_URL`                    | Public base URL of the application                                    |
| `VITE_SERVICE_WORKER_ENABLED`      | Enables the service worker (disabled in development by default)       |
| `VITE_OTEL_ENABLED`                | Enables OpenTelemetry tracing and logging in the browser              |
| `VITE_OTEL_EXPORTER_OTLP_ENDPOINT` | Base URL of the OTLP/HTTP endpoint (`/otlp` via the dev proxy)        |
| `VITE_OTEL_SERVICE_NAME`           | Service name reported to OpenTelemetry                                |

The service worker is disabled locally so that code changes are reflected immediately without caching issues.
To develop the service worker itself, set `VITE_SERVICE_WORKER_ENABLED=true`.

### Available scripts

| Command                               | Description                                                                    |
|---------------------------------------|--------------------------------------------------------------------------------|
| `npm run dev`                         | Start the dev server with hot reload and backend proxy                         |
| `npm run build`                       | Type-check, compile and minify for production (output in `dist/`)              |
| `npm run preview`                     | Serve the production build locally on port 4173                                |
| `npm run type-check`                  | Run `vue-tsc` type checking                                                    |
| `npm run test:unit`                   | Run unit tests with [Vitest](https://vitest.dev/)                              |
| `npm run test:unit:dev`               | Run unit tests in watch mode                                                   |
| `npm run test:e2e`                    | Build preview and run end-to-end tests with [Cypress](https://www.cypress.io/) |
| `npm run test:e2e:dev`                | Start the dev server and open the interactive Cypress runner                   |
| `npm test`                            | Type-check, unit tests, build and e2e tests                                    |
| `npm run coverage`                    | Collect and merge unit and e2e coverage reports                                |
| `npm run lint` / `lint:fix`           | Lint with [ESLint](https://eslint.org/)                                        |
| `npm run stylelint` / `stylelint:fix` | Lint styles with [Stylelint](https://stylelint.io/)                            |
| `npm run openapi`                     | Regenerate TypeScript API types from the specs in [`openapi/`](openapi)        |

### Testing

Unit and component tests live in [`test/`](test) and mirror the structure of `src/`. End-to-end tests live in
[`cypress/e2e`](cypress/e2e). Neither requires a running backend – API calls are mocked.

### API types

The backend's OpenAPI specifications are synced into [`openapi/`](openapi). After a spec changes, run
`npm run openapi` to regenerate the typed schemas in `src/services/api/`. Services access the backend exclusively
through these generated types.

### Internationalization

The default language is German, with English as fallback. When adding a translation key, always update both
[`src/i18n/locales/de.json`](src/i18n/locales/de.json) and [`src/i18n/locales/en.json`](src/i18n/locales/en.json)
and reference it via `t('your.key')` from `useI18n()`.

### Mobile apps

Native Android and iOS projects are generated with [Capacitor](https://capacitorjs.com/) and live in
[`android/`](android) and [`ios/`](ios). The default [`capacitor.config.ts`](capacitor.config.ts) points the app at the
local dev server (`http://localhost:5173`) for live development:

```sh
npx cap sync
npx cap open android   # or: npx cap open ios
```

### Docker

For production, the built app is served by nginx. Build the application first, then the container image:

```sh
npm run build
docker build -f docker/Dockerfile -t remsfal/frontend:dev .
docker run -i --rm -p 8080:80 remsfal/frontend:dev
```

### CI/CD

This project uses GitHub Actions to build and test every pull request on the current and the LTS version of
Node.js and to check the code quality using
[SonarCloud](https://sonarcloud.io/summary/new_code?id=remsfal_remsfal-frontend&branch=main). It is mandatory to
pass the specified **Quality Gates** before a pull request can be merged.


## Contributing

Before contributing to REMSFAL, please read our [contributing guidelines](https://github.com/remsfal/.github/blob/main/CONTRIBUTING.md). Participation in the REMSFAL project is governed by the [CNCF Code of Conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md).

> **_NOTE:_** When contributing to this repository, please **first** discuss the change you wish to make by creating an issue before making a change. Once you got feedback on your idea, feel free to fork the project and open a pull request.

> **_NOTE:_** Please only make changes in files directly related to your issue!


## License

* [MIT License](LICENSE)
