# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for Remsfal, an open-source facility management software built as a Vue 3 single-page application (SPA) using Vite. It manages real estate projects and works in conjunction with the [`remsfal-backend`](https://github.com/remsfal/remsfal-backend) repository.

**Technology Stack**: Vue 3 (Composition API), TypeScript, Vite, PrimeVue 4, TailwindCSS 4, Pinia, Vue Router 4, Vitest, Cypress

**Live Version**: https://remsfal.de

## Development Commands

```bash
# Development server with backend proxy
npm run dev

# Build for production (type check + build)
npm run build

# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:dev

# Run end-to-end tests
npm run test:e2e

# Run E2E tests in development mode
npm run test:e2e:dev

# Run all tests (unit + e2e)
npm run test

# Type checking
npm run type-check

# Linting
npm run lint          # Check only
npm run lint:fix      # Auto-fix issues

# Style linting
npm run stylelint      # Check CSS/SCSS
npm run stylelint:fix  # Auto-fix styles

# Regenerate OpenAPI TypeScript schemas
npm run openapi                  # All schemas
npm run openapi:platform         # Platform microservice only
npm run openapi:ticketing        # Ticketing microservice only
npm run openapi:notification     # Notification microservice only
```

## High-Level Architecture

### Microservices-Oriented API Layer

The application communicates with three separate backend microservices, each with its own OpenAPI specification:

- **Platform** (`/api` → localhost:8080) - Core platform functionality
- **Ticketing** (`/ticketing` → localhost:8081) - Issue/ticket management
- **Notification** (implied) - Notification service

Development proxy is configured in `vite.config.ts:50-53` to route requests to appropriate backends.

### API Integration Pattern

```
User Code
    ↓
Service Classes (ProjectService, IssueService, etc.)
    ↓
typedRequest() [OpenAPI-typed wrapper at src/services/api/ApiClient.ts]
    ↓
apiClient (Axios instance)
    ↓
OpenAPI-generated schemas (platform-schema.ts, ticketing-schema.ts, notification-schema.ts)
```

**Type-Safe API Calls**:
- OpenAPI specs in `/openapi` directory are the source of truth
- `openapi-typescript` generates TypeScript schemas from specs
- Custom `typedRequest()` wrapper in `src/services/api/ApiClient.ts` provides compile-time type safety
- Path parameters use placeholder syntax: `pathParams: { '{projectId}': id }`
- Axios interceptors handle URL placeholder replacement and global error handling

**When modifying API integration**:
1. Update the OpenAPI spec file in `/openapi` directory
2. Run `npm run openapi` to regenerate TypeScript schemas
3. Update service classes if endpoints changed
4. The `typedRequest()` function will enforce correct types at compile time

### State Management Architecture

**Pinia Stores** (composition API pattern):
- `UserSessionStore` - Authentication state, user roles, login/logout
- `ProjectStore` - Projects list, selection, filtering
- `EventStore` - Custom typed event bus for cross-component communication

**UI State** (separate from Pinia):
- `src/layout/composables/layout.ts` manages layout state (menu visibility, dark mode, active menu)
- Uses Vue 3 `reactive()` and `ref()` for UI chrome state
- Provides `useLayout()` composable for components

**Key Pattern**: Application data uses Pinia, UI chrome state uses composables.

### Role-Based Routing

Users have roles (MANAGER, CONTRACTOR, TENANT) that determine accessible views:
- Each role has dedicated menu/topbar components
- Landing page redirects authenticated users based on role (see `src/router/index.ts:194`)
- Named routes facilitate conditional navigation
- Route guards handle post-login redirects

**View Organization**:
- `src/views/` - Page-level components (route targets)
- `src/components/` - Reusable components
- `src/layout/` - Layout components (topbar, sidebar, etc.)

### Component Standards

**Required Patterns** (enforced via ESLint):
- Always use `<script setup>` syntax with TypeScript
- Component block order: `<script setup>`, `<template>`, `<style scoped>`
- Use `defineProps<T>()` and `defineEmits<T>()` with TypeScript interfaces
- PascalCase for component names and file names
- camelCase for attributes and event names (NOT kebab-case)

**PrimeVue Integration**:
- Components auto-imported via `unplugin-vue-components`
- Theme: Aura (PrimeVue 4.3+)
- Use PrimeVue components when available instead of custom implementations
- Toast/dialog/confirm services available globally

### Service Layer Pattern

Services are classes with static methods and singleton exports:

```typescript
class ProjectService {
  static readonly BASE_PATH = '/api/v1/projects';
  async getProjects() {
    return typedRequest<paths['/api/v1/projects']['get']>({
      method: 'GET',
      url: ProjectService.BASE_PATH
    });
  }
}
export const projectService = new ProjectService();
```

**Service naming**: `[Domain]Service.ts` (e.g., `ProjectService.ts`, `IssueService.ts`)

**Error Handling**:
- API errors flow through EventStore → toast display
- Axios interceptor emits events on API failures
- Components should handle loading states and error UI

### Testing Organization

**Unit Tests** (Vitest):
- Located in `/test` directory mirroring `/src` structure
- Test files: `*.spec.ts`
- Setup in `test/setup/vitest.setup.ts` configures PrimeVue, router, i18n, Pinia globally
- Use `createTestingPinia()` from `@pinia/testing` for store tests
- Mock API calls using MSW (Mock Service Worker)

**E2E Tests** (Cypress):
- Located in `/cypress/e2e`
- Spec files: `*.cy.ts`
- Base URL: `http://localhost:4173`
- Code coverage via `vite-plugin-istanbul`
- MSW configured for API mocking

**Running Single Test**:
```bash
# Unit test - use Vitest filter
npm run test:unit:dev -- ProjectService.spec.ts

# E2E test - use Cypress spec argument
npm run test:e2e -- --spec "cypress/e2e/project.cy.ts"
```

### Internationalization

- Default language: German (de)
- Fallback language: English (en)
- Translation files: `src/i18n/locales/{de,en}.json`
- Use `$t('key')` in templates or `t('key')` in composition functions
- Translation keys should be hierarchical and descriptive

**Adding translations**:
1. Add key to both `de.json` and `en.json`
2. Import `useI18n` and destructure `t` in `<script setup>`
3. Use `t('your.key')` in component

### Styling Guidelines

- **TailwindCSS 4** with `tailwindcss-primeui` plugin for utility-first styling
- **SCSS** for component-level scoped styles
- **Responsive design**: Mobile-first with Tailwind breakpoints
- **Dark mode**: Supported via layout composable with View Transitions API

### Environment Configuration

Key environment variables in `.env`:
- `VITE_BASE_URL` - Base URL for application (default: http://localhost:5173)
- `VITE_SERVICE_WORKER_ENABLED` - Enable service worker (default: false in dev)

**Service Worker**: Disabled by default in development. Set `VITE_SERVICE_WORKER_ENABLED=true` to enable for local testing.

## Code Quality Standards

### TypeScript Guidelines
- Avoid `any` type - use proper type definitions
- Create interfaces in `src/types/` for complex types
- Use type imports: `import type { ComponentType } from './types'`
- Prefer `interface` over `type` for object definitions

### ESLint Rules
- Max line length: 128 characters
- No unused variables or imports
- TypeScript strict mode enabled
- Component naming and structure enforced
- `<script setup>` syntax required

### Common Anti-patterns to Avoid
- Don't use `v-html` without sanitization
- Don't mix Options API with Composition API
- Don't use `any` type in TypeScript
- Don't skip internationalization for user-facing text
- Don't forget to handle loading and error states
- Don't use direct DOM manipulation - use Vue's reactivity
- Don't use kebab-case for attributes or events (use camelCase)

## Important Patterns and Conventions

### Event Bus for Cross-Component Communication
- `EventStore` provides typed event bus (not global event emitter)
- All API errors flow through event bus → toast display
- Use `'toast:translate'` event for translatable messages
- Located at: `src/stores/EventStore.ts`

### OpenAPI Schema-Driven Development
1. OpenAPI specs in `/openapi` are committed to repository
2. TypeScript schemas are generated via `npm run openapi`
3. Generated files: `src/services/api/{platform,ticketing,notification}-schema.ts`
4. Never manually edit generated schema files
5. Use `typedRequest()` for all API calls to ensure type safety

### Path Aliases
- `@` → `./src` (configured in `vite.config.ts` and `tsconfig.json`)
- Use `@/components/...` instead of relative paths

### Data Flow for API Calls
1. Component → Store action (if shared state) or direct service call
2. Service → `typedRequest()` with OpenAPI types
3. `typedRequest()` → Axios interceptors → API
4. Response → Promise chain back to component
5. Errors → EventStore event → Toast notification

## Context for AI Assistance

When helping with this codebase:
- Suggest Vue 3 Composition API solutions with `<script setup>`
- Recommend PrimeVue components when applicable
- Ensure TypeScript type safety (avoid `any`)
- Include proper error handling and loading states
- Follow established project structure and patterns
- Include appropriate tests for new functionality
- Consider internationalization requirements (use `t()`)
- Maintain responsive design principles with Tailwind
- Use camelCase for attributes and events (NOT kebab-case)
- Prefer editing existing components over creating new files
