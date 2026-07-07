# CLAUDE.md

> **This file is a thin wrapper. All project conventions and architecture are maintained in [`AGENT.md`](./AGENT.md).**
> Please read `AGENT.md` for the full instructions before working on this codebase.

## Claude Code-Specific Notes

- Use the `@` path alias (`./src`) for all imports
- PrimeVue components are auto-imported at build time, but **always add an explicit import** in `<script setup>` (e.g. `import Button from 'primevue/button'`) — this is enforced by ESLint and improves traceability of where components come from
- When adding new i18n keys, always update both `src/i18n/locales/de.json` and `src/i18n/locales/en.json`
