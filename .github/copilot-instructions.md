# GitHub Copilot Instructions for remsfal-frontend

## Project Overview

This is the frontend for Remsfal, an open-source facility management software built as a Vue 3 single-page application (SPA) using Vite. It manages real estate projects and works in conjunction with the [`remsfal-backend`](https://github.com/remsfal/remsfal-backend) repository.

## Technology Stack

- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Framework**: PrimeVue 4.3+ with PrimeIcons
- **Styling**: TailwindCSS with tailwindcss-primeui plugin
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Internationalization**: Vue I18n
- **Testing**: Vitest (unit), Cypress (e2e/component)
- **API Mocking**: MSW (Mock Service Worker) for backend mocking
- **Linting**: ESLint with Vue, TypeScript, and Prettier plugins
- **Style Linting**: Stylelint

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page-level Vue components (route targets)
├── layout/             # Layout components
├── stores/             # Pinia stores for state management
├── services/           # API services and business logic
├── router/             # Vue Router configuration
├── i18n/               # Internationalization files
├── types/              # TypeScript type definitions
├── helper/             # Utility functions
├── assets/             # Static assets
└── mocks/              # MSW mocks for backend mocking

test/
├── components/         # Component tests
├── views/              # View tests
├── services/           # Service tests
├── setup/              # Test configuration
└── mocks/              # MSW mocks and fixtures
```

## Coding Standards & Conventions

### Vue Components

- **Always use `<script setup>` syntax** with TypeScript
- **Component naming**: Use PascalCase for component names (e.g., `NewProjectForm.vue`)
- **File naming**: Use PascalCase for Vue files, matching the component name
- **Props**: Use `defineProps<T>()` with TypeScript interfaces
- **Emits**: Use `defineEmits<T>()` with TypeScript event definitions
- **Block order**: `<script setup>`, `<template>`, `<style scoped>`

### Template Conventions

- Use **camelCase** for attributes (not kebab-case): `onClick` not `on-click`
- Use **camelCase** for event names: `@updateValue` not `@update-value`
- Prefer composition over inheritance
- Use PrimeVue components when available

### TypeScript Guidelines

- Avoid `any` type - use proper type definitions
- Create interfaces in `src/types/` for complex types
- Use type imports: `import type { ComponentType } from './types'`
- Prefer `interface` over `type` for object definitions

### State Management (Pinia)

- Store files should be named `[Name]Store.ts` (e.g., `ProjectStore.ts`)
- Use options API stores with `defineStore()` and state/getters/actions pattern
- Keep stores focused and domain-specific
- State should use factory functions for proper reactivity

### Routing

- Route names should match view component names
- Use lazy loading for routes: `component: () => import('@/views/ViewName.vue')`
- Define route props properly for type safety

### Testing

- **Unit tests**: Test individual components and services
- **File naming**: `[ComponentName].spec.ts`
- Use `@vue/test-utils` for Vue component testing
- Mock external dependencies using Vitest's `vi.mock()`
- Use MSW mocks for API testing and mocking API calls
- Setup files are in `test/setup/vitest.setup.ts`

### Styling

- Use TailwindCSS utility classes for styling
- Use PrimeVue theming system for consistent UI
- Scoped styles when needed: `<style scoped>`
- Follow responsive design patterns with TailwindCSS breakpoints

### Internationalization

- All user-facing text should be internationalized using Vue I18n
- Use `$t('key')` in templates or `t('key')` in composition functions
- Translation keys should be descriptive and hierarchical

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:dev

# Run end-to-end tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Style linting
npm run stylelint
npm run stylelint:fix

# Format code
npm run format
```

## Environment Configuration

- Environment variables are configured in `.env` files
- Key variables:
  - `VITE_BASE_URL`: Base URL for the application (default: http://localhost:5173)
  - `VITE_SERVICE_WORKER_ENABLED`: Enable/disable service worker (default: false)
- Backend proxy is configured in `vite.config.ts` (proxies `/api` to `http://localhost:8080`)

## Code Quality Rules

### ESLint Configuration Highlights

- Vue components must use `<script setup>` syntax
- TypeScript strict mode enabled
- No unused variables or imports
- Consistent component naming and structure
- Proper Vue 3 composition API usage

### Common Patterns

1. **API Calls**: Use services in `src/services/` directory
   - **CRITICAL**: Each backend resource has its own dedicated service
   - Examples: `PropertyService`, `ApartmentService`, `BuildingService`, `SiteService`, `CommercialService`, `StorageService`
   - **Never call `apiClient` directly** from views or components
   - Always use the appropriate service for each resource type
2. **Error Handling**: Implement proper error boundaries and user feedback
3. **Loading States**: Show loading indicators for async operations
4. **Form Validation**: Use PrimeVue form validation patterns
5. **Responsive Design**: Mobile-first approach with TailwindCSS

## Dependencies Guidelines

- **PrimeVue**: Use PrimeVue components for consistent UI
- **TailwindCSS**: Use utility-first CSS approach
- **Vue Router**: Implement proper navigation and route guards
- **Pinia**: Centralize state management for shared data
- **Axios**: HTTP client for API calls (via vue-axios)

## Best Practices

1. **Performance**: Use lazy loading for routes and large components
2. **Security**: Sanitize user inputs and validate data
3. **Accessibility**: Follow WCAG guidelines, use semantic HTML
4. **SEO**: Implement proper meta tags and structured data
5. **PWA**: Service worker is configurable via environment variables

## Common Anti-patterns to Avoid

- Don't use `v-html` without sanitization
- Don't mix Options API with Composition API
- Don't use `any` type in TypeScript
- Don't skip internationalization for user-facing text
- Don't forget to handle loading and error states
- Don't use direct DOM manipulation - use Vue's reactivity
- **Don't call `apiClient` directly from views or components** - always use the appropriate resource-specific service
- **Don't create a single service for multiple resource types** - each resource has its own dedicated service

## Context for AI Assistance

When helping with this codebase:
- Suggest Vue 3 Composition API solutions
- Recommend PrimeVue components when applicable
- Consider TypeScript type safety
- Include proper error handling and loading states
- Follow the established project structure
- Include appropriate tests for new functionality
- Consider internationalization requirements
- Maintain responsive design principles
- **Always use resource-specific services** - identify which resource is being operated on (property, apartment, building, site, commercial, storage, etc.) and use the corresponding service
- **When implementing CRUD operations for rentable units**, ensure you're calling the correct service based on the unit type

## Service Layer Architecture

The application follows a strict **resource-per-service** pattern:

- **PropertyService** - Manages properties (`/api/v1/projects/{projectId}/properties`)
- **ApartmentService** - Manages apartments (`/api/v1/projects/{projectId}/apartments`)
- **BuildingService** - Manages buildings (`/api/v1/projects/{projectId}/buildings`)
- **SiteService** - Manages sites (`/api/v1/projects/{projectId}/sites`)
- **CommercialService** - Manages commercial units (`/api/v1/projects/{projectId}/commercials`)
- **StorageService** - Manages storage units (`/api/v1/projects/{projectId}/storages`)
- **ProjectMemberService** - Manages project members
- **IssueService** - Manages issues/tickets
- **TenancyService** - Manages tenancies

**Key Rules**:
1. Each service wraps `apiClient` from `@/services/ApiClient.ts`
2. Views and components NEVER call `apiClient` directly
3. When working with different resource types (e.g., in a tree view with properties, buildings, apartments), import and use ALL relevant services
4. Use type-safe methods: `service.get()`, `service.post()`, `service.patch()`, `service.delete()`