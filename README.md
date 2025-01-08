<img src="https://remsfal.de/logo_upscaled.png" width="60%">

[![License](https://img.shields.io/github/license/remsfal/remsfal-frontend)](https://github.com/remsfal/remsfal-frontend/blob/main/LICENSE)
![GitHub package.json version](https://img.shields.io/github/package-json/v/remsfal/remsfal-frontend)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=remsfal_remsfal-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=remsfal_remsfal-frontend)
![Contributors](https://img.shields.io/github/contributors/remsfal/remsfal-frontend)

# Open Source Facility Management Software (Frontend)

`remsfal-frontend` is a single-page application (SPA) built using Vue 3 in Vite to manage real estate projects.
It works together with the [`remsfal-backend`](https://github.com/remsfal/remsfal-backend) repository.  
You can see a live version at https://remsfal.de.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Lint with [Stylelint](https://stylelint.io/)

```sh
npm run stylelint
```

## Service Worker

The Service Worker is **disabled by default** in the local development environment to ensure that code changes are reflected immediately without caching issues.

To enable and develop the Service Worker locally, set the following variable in your `.env` file:

```env
VITE_SERVICE_WORKER_ENABLED=true
```

## Translate with [vue-18n](https://vue-i18n.intlify.dev/)

The default language is set to German with English as the fallback Language

Hint: Use i18n-ally with VS Code

Steps:
1. Create a translation key in `src/i18n/locales/de.json` and `src/i18n/locales/de.json`
2. Reference it inside the Component with `t('your.key')` after importing t from useI18n()
