# AGENT.md

Central AI instructions for the remsfal-frontend repository.
**This is the single source of truth — edit only this file when conventions change.**

## Project Overview

This is the frontend for Remsfal, an open-source facility management software built as a Vue 3 single-page application (SPA) using Vite. It manages real estate projects and works in conjunction with the [`remsfal-backend`](https://github.com/remsfal/remsfal-backend) repository.

**Technology Stack**: Vue 3 (Composition API), TypeScript, Vite, PrimeVue 4, TailwindCSS 4, Pinia, Vue Router 4, Vitest, Cypress

**Live Version**: https://remsfal.de

## Architecture Roadmap

The project is undergoing a planned architectural modernization in three phases.
**New code must follow the target architecture.** Existing code is migrated incrementally when touched.

### Guiding Principles

- **Feature Cohesion over Technical Layering** — code that changes together lives together
- **Nuxt-Inspired Conventions in Vite** — layout system and file-based routing without framework migration
- **Incremental Migration** — never rewrite everything at once; phases are independent and additive

---

### Target Directory Structure

```
src/
├── layouts/                    # Role-based layout components (Nuxt-inspired)
│   ├── manager.vue             # ManagerMenu + ManagerTopbar + ManagerMobileBar
│   ├── project.vue             # ProjectMenu + ProjectTopbar + ProjectMobileBar
│   ├── tenant.vue              # TenantMenu + AppSimpleTopbar + TenantMobileBar
│   ├── contractor.vue          # ContractorMenu + AppSimpleTopbar + ContractorMobileBar
│   └── public.vue              # AppSimpleTopbar + AppFooter (Landing, Legal, Privacy)
│
├── pages/                      # File-based routes via unplugin-vue-router
│   ├── index.vue               →  /                    (layout: public)
│   ├── legal-notice.vue        →  /legal-notice        (layout: public)
│   ├── privacy.vue             →  /privacy             (layout: public)
│   ├── inbox/
│   │   ├── index.vue           →  /inbox               (layout: manager)
│   │   └── [id].vue            →  /inbox/:id           (layout: manager)
│   ├── manager/
│   │   ├── index.vue           →  /manager             (layout: manager)
│   │   ├── settings.vue        →  /manager/settings    (layout: manager)
│   │   └── organizations.vue   →  /manager/organizations
│   ├── projects/
│   │   └── [projectId]/
│   │       ├── index.vue       →  /projects/:projectId          (layout: project)
│   │       ├── settings.vue
│   │       ├── chat.vue
│   │       ├── issues/
│   │       │   ├── index.vue
│   │       │   └── [issueId]/
│   │       │       └── index.vue
│   │       ├── units/
│   │       │   ├── index.vue
│   │       │   ├── property/[unitId].vue
│   │       │   ├── building/[unitId].vue
│   │       │   ├── apartment/[unitId].vue
│   │       │   ├── site/[unitId].vue
│   │       │   ├── storage/[unitId].vue
│   │       │   └── commercial/[unitId].vue
│   │       ├── tenants/
│   │       │   ├── index.vue
│   │       │   └── [tenantId].vue
│   │       ├── rental-agreements/
│   │       │   ├── index.vue
│   │       │   └── [agreementId].vue
│   │       └── contractors/
│   │           └── index.vue
│   ├── tenancies/
│   │   ├── index.vue           →  /tenancies           (layout: tenant)
│   │   ├── issues/
│   │   │   └── index.vue
│   │   └── account-settings.vue
│   └── contractor/
│       ├── index.vue           →  /contractor          (layout: contractor)
│       ├── issues/
│       │   └── index.vue
│       └── clients/
│           └── index.vue
│
├── features/                   # Domain-based feature slices
│   ├── manager/
│   │   ├── components/         # ProjectSelectionTable, NewProjectDialog, ...
│   │   ├── stores/             # ProjectStore (belongs to manager domain)
│   │   └── index.ts            # Public API of this feature
│   ├── project/
│   │   ├── units/
│   │   │   ├── components/     # RentableUnitsTable, UnitBreadcrumb, ...
│   │   │   ├── services/       # PropertyService, BuildingService, ApartmentService, ...
│   │   │   └── index.ts
│   │   ├── tenants/
│   │   │   ├── components/     # TenantCard, TenantToolbar, TenantContactButtons
│   │   │   ├── services/       # TenantService
│   │   │   └── index.ts
│   │   ├── rental-agreements/
│   │   │   ├── components/     # Step1..Step4Forms, RentalDetailsForm
│   │   │   ├── services/       # RentalAgreementService, TenancyService
│   │   │   └── index.ts
│   │   ├── issues/
│   │   │   ├── components/     # IssueTable, IssueDetailsCard, IssueDescriptionCard
│   │   │   ├── services/       # IssueService
│   │   │   └── index.ts
│   │   └── contractors/
│   │       ├── components/     # ContractorTable
│   │       ├── services/       # ContractorService, ProjectMemberService
│   │       └── index.ts
│   ├── tenant/
│   │   ├── components/         # TenantIssueList, tenancyDetails/*, tenantIssue/*
│   │   ├── services/           # TenancyService (tenant-side)
│   │   └── index.ts
│   ├── contractor/
│   │   ├── components/
│   │   └── index.ts
│   └── inbox/
│       ├── components/         # InboxSidebar, InboxMessageList, InboxToolbar, ...
│       ├── stores/             # InboxStore (belongs to inbox domain)
│       ├── services/           # InboxService
│       └── index.ts
│
├── shared/                     # Code used by ≥2 features
│   ├── components/             # BaseCard, UserContactDataCard, UserAddressCard, StatCard, MemberAutoComplete
│   ├── composables/            # useTopbarUserActions
│   ├── services/               # ApiClient.ts, AuthService.ts (infrastructure)
│   ├── stores/                 # UserSession.ts, EventStore.ts (app-wide state)
│   ├── i18n/                   # i18n config + locale files
│   ├── types/                  # Shared TypeScript types
│   ├── helpers/                # viewHelper, platform, indexeddb, service-worker-init
│   └── constants/              # countries.ts
│
├── layout/                     # LEGACY — layout chrome components (not deleted yet)
│   └── composables/            # useLayout(), useMobileBarActiveState()
│
├── App.vue                     # Root: resolves route.meta.layout → renders <component>
├── main.ts                     # Bootstrap only
└── mocks/                      # MSW service worker

test/                           # Mirrors src/ structure (pages/ + features/ + shared/)
```

---

### Phase 1 — File-Based Routing (Vue Router v5)

**Goal**: Replace the manual `src/router/index.ts` (currently 392 lines) with auto-generated routes from file structure.

> **Note**: File-based routing was previously provided by the separate `unplugin-vue-router` package.
> As of Vue Router v5, it is built into the core — no extra package needed.

**`vite.config.ts`** — add plugin **before** `Vue()`:
```ts
import VueRouter from 'vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({ routesFolder: 'src/pages' }),
    Vue(),
  ],
})
```

**`src/router/index.ts`** becomes a thin wrapper:
```ts
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { setupRouterGuards } from './guards'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

setupRouterGuards(router)
```

**`src/router/guards.ts`** — extracted `beforeEach` logic:
```ts
import type { Router } from 'vue-router'
import { useUserSessionStore } from '@/shared/stores/UserSession'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const sessionStore = useUserSessionStore()
    if (to.meta.requiresAuth && !sessionStore.user) {
      return { path: '/', query: { redirect: to.fullPath } }
    }
    if (to.path === '/' && sessionStore.user) {
      return { path: '/manager' }
    }
  })
}
```

**Each page declares its own meta** via `<route>` block:
```vue
<!-- src/pages/manager/index.vue -->
<route lang="yaml">
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
// page code
</script>
```

**Typed route names**: Vue Router v5 generates a `RouteNamedMap` — no more string-typos in `router.push({ name: '...' })`.

---

### Phase 2 — Nuxt-Inspired Layout System

**Goal**: Replace named router slots (`components: { topbar, sidebar, mobilebar }`) with dynamic layout components resolved from `route.meta.layout`.

**Create `src/layouts/`** — one file per role, each wraps `<slot>` with role chrome:

```vue
<!-- src/layouts/manager.vue -->
<template>
  <div class="layout-wrapper" :class="containerClass">
    <ManagerTopbar />
    <ManagerMenu />
    <div class="layout-main-container">
      <div class="layout-main">
        <slot />
      </div>
    </div>
    <ManagerMobileBar />
  </div>
</template>

<script setup lang="ts">
const { layoutState } = useLayout()
const containerClass = computed(() => ({
  'layout-overlay': layoutState.menuMode === 'overlay',
  'layout-static': layoutState.menuMode === 'static',
  'layout-static-inactive': layoutState.menuMode === 'static' && !layoutState.staticMenuActive,
}))
</script>
```

**`src/App.vue`** — resolves layout dynamically:

```vue
<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
  <Toast />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import ManagerLayout from '@/layouts/manager.vue'
import ProjectLayout from '@/layouts/project.vue'
import TenantLayout from '@/layouts/tenant.vue'
import ContractorLayout from '@/layouts/contractor.vue'
import PublicLayout from '@/layouts/public.vue'

type LayoutKey = 'manager' | 'project' | 'tenant' | 'contractor' | 'public'

const layouts: Record<LayoutKey, Component> = {
  manager: ManagerLayout,
  project: ProjectLayout,
  tenant: TenantLayout,
  contractor: ContractorLayout,
  public: PublicLayout,
}

const route = useRoute()
const currentLayout = computed(
  () => layouts[(route.meta.layout as LayoutKey) ?? 'public']
)

// EventStore listeners (toast, session-expired) remain here
</script>
```

**Extend `vue-router` types** for typed meta:
```ts
// src/router/typed-meta.d.ts
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'manager' | 'project' | 'tenant' | 'contractor' | 'public'
    requiresAuth?: boolean
  }
}
```

---

### Phase 3 — Feature-Sliced Structure (incremental)

**Goal**: Co-locate components, services, and stores by domain instead of by technical type.

**Rules**:
- New features are created in `src/features/<domain>/`
- Existing code moves to its feature slice when the file is next modified
- Never reach into a feature's internals from outside — use `index.ts` as the public API
- `shared/` is for code actually used by ≥2 features; when in doubt, start in the feature

```ts
// ✅ Correct — import through public API
import { TenantCard } from '@/features/project/tenants'

// ❌ Wrong — reaching into internals
import TenantCard from '@/features/project/tenants/components/TenantCard.vue'
```

**Priority order for migration** (highest impact first):
1. `src/services/` → split into feature slices (most files, clearest ownership)
2. `src/components/` subdirectories → already partially organized, finish the grouping
3. `src/stores/ProjectStore.ts` → move to `features/manager/`
4. `src/stores/InboxStore.ts` → move to `features/inbox/`
5. `src/views/` → replaced by `src/pages/` in Phase 1, then co-located with features

---

### Migration Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — File-Based Routing | ✅ Done | Vue Router v5 built-in, `src/pages/`, `src/router/guards.ts` |
| 2 — Layout System | ✅ Done | `src/layouts/`, `App.vue` uses `route.meta.layout` |
| 3 — Feature-Sliced | 🔲 Not started | Incremental; new code goes into `src/features/` |

**Update this table** as work is completed. Use ✅ for done, 🔄 for in-progress, 🔲 for planned.

---

## Current Project Structure

> **Note**: This reflects the *current* state. The target structure is described in the Architecture Roadmap above.
> During migration, both structures coexist — legacy code in the flat directories, new/migrated code in `features/` and `pages/`.

```
src/
├── components/          # Reusable Vue components (→ features/ or shared/components/)
├── views/               # Page-level components (→ pages/ + features/)
├── layout/              # Layout components (→ layouts/ + features/*/layout/)
├── stores/              # Pinia stores (→ shared/stores/ or features/*/stores/)
├── services/            # API services (→ shared/services/ or features/*/services/)
├── router/              # Vue Router config (→ thin wrapper after Phase 1)
├── i18n/                # i18n config + locales (→ shared/i18n/)
├── types/               # TypeScript types (→ shared/types/)
├── helper/              # Utility functions (→ shared/helpers/)
├── assets/              # Static assets
├── constants/           # App constants (→ shared/constants/)
└── mocks/               # MSW service worker

test/
├── components/          # Component tests
├── views/               # View tests
├── services/            # Service tests
├── setup/               # Test configuration
└── mocks/               # MSW handlers and fixtures
```

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
Service Classes (ProjectMemberService, IssueService, etc.)
    ↓
apiClient (Type-safe HTTP methods: get, post, put, patch, delete)
    ↓
Axios Instance (with interceptors)
    ↓
OpenAPI-generated schemas (platform-schema.ts, ticketing-schema.ts, notification-schema.ts)
```

**Type-Safe API Calls**:
- OpenAPI specs in `/openapi` directory are the source of truth
- `openapi-typescript` generates TypeScript schemas from specs
- `ApiClient` class in `src/services/ApiClient.ts` provides type-safe HTTP methods
- Path parameters use simplified syntax: `pathParams: { projectId, memberId }`
- Axios interceptors handle URL placeholder replacement and global error handling

**API Client Usage**:
```typescript
// Import the singleton instance and type definitions
import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

// Extract types from OpenAPI schemas
export type MemberRole = ApiComponents['schemas']['MemberRole'];
export type ProjectMember = ApiComponents['schemas']['ProjectMemberJson'];

// Use type-safe HTTP methods
const members = await apiClient.get('/api/v1/projects/{projectId}/members', {
  pathParams: { projectId: '123' }
});

const newMember = await apiClient.post('/api/v1/projects/{projectId}/members',
  { email: 'user@example.com', role: 'MANAGER' },
  { pathParams: { projectId: '123' } }
);
```

**When modifying API integration**:
1. Update the OpenAPI spec file in `/openapi` directory
2. Run `npm run openapi` to regenerate TypeScript schemas
3. Update service classes if endpoints changed
4. The `apiClient` methods will enforce correct types at compile time

### State Management Architecture

**Pinia Stores** (composition API pattern):
- `UserSessionStore` - Authentication state, user roles, login/logout
- `ProjectStore` - Projects list, selection, filtering
- `EventStore` - Custom typed event bus for cross-component communication

Store files are named `[Name]Store.ts` (e.g., `ProjectStore.ts`). Keep stores focused and domain-specific.

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

Use lazy loading for routes: `component: () => import('@/views/ViewName.vue')`

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

**BaseCard Component** (`src/components/BaseCard.vue`):
- Standardized wrapper around PrimeVue Card with consistent styling
- Default classes: `flex flex-col gap-4 basis-full`
- Default title styling: `font-semibold text-xl`
- All PrimeVue Card slots are supported (title, subtitle, header, content, footer)
- **Use BaseCard instead of PrimeVue Card directly** for consistent styling across the application

Usage examples:
```vue
<!-- Basic usage with default styling -->
<BaseCard>
  <template #title>Card Title</template>
  <template #content>Card content here</template>
</BaseCard>

<!-- Custom title styling (e.g., for danger zones) -->
<BaseCard titleClass="text-red-600 font-semibold text-xl">
  <template #title>Danger Zone</template>
  <template #content>Dangerous actions here</template>
</BaseCard>

<!-- Custom card classes -->
<BaseCard cardClass="mb-4">
  <template #content>Custom card styling</template>
</BaseCard>

<!-- Disable default classes -->
<BaseCard cardClass="">
  <template #content>No default styling</template>
</BaseCard>

<!-- Unstyled title (no wrapper div) -->
<BaseCard :unstyled="true">
  <template #title>
    <div class="custom-title-class">Custom Title</div>
  </template>
</BaseCard>
```

Props:
- `cardClass` (string | null): Custom CSS classes for the card. Default: `'flex flex-col gap-4 basis-full'`
- `titleClass` (string): CSS classes for the title wrapper div. Default: `'font-semibold text-xl'`
- `unstyled` (boolean): Disable automatic title wrapper. Default: `false`

### Form Validation Pattern

**Standard:** All forms use **PrimeVue Forms + Zod Resolver** for schema-based validation with **PrimeVue Message** component for error display.

**Pattern:**
```typescript
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import Message from 'primevue/message';

// Define Zod schema with trim() for string inputs
const schema = z.object({
  fieldName: z
    .string()
    .trim()
    .min(3, { message: t('validation.minLength', { min: 3 }) })
    .max(100, { message: t('validation.maxLength', { max: 100 }) })
});

const resolver = zodResolver(schema);
const initialValues = ref({ fieldName: '' });

// Submit handler
const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const fieldValue = formState.fieldName?.value?.trim() || '';

  if (!event.valid || !fieldValue) {
    return;
  }

  // ... API call with fieldValue
};
```

**Template:**
```vue
<Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
  <div class="flex flex-col gap-4">
    <label for="fieldName" class="font-semibold">
      {{ t('form.label') }}
    </label>

    <InputText
      name="fieldName"
      type="text"
      :placeholder="t('form.placeholder')"
      :class="{ 'p-invalid': $form.fieldName?.invalid && $form.fieldName?.touched }"
      autofocus
      fluid
    />

    <Message v-if="$form.fieldName?.invalid" severity="error" size="small" variant="simple">
      {{ $form.fieldName.error.message }}
    </Message>
  </div>

  <div class="flex justify-end gap-3 mt-6">
    <Button type="button" :label="t('button.cancel')" severity="secondary" @click="onCancel" />
    <Button
      type="submit"
      :label="t('button.submit')"
      icon="pi pi-check"
      :disabled="!$form.fieldName?.valid || !$form.fieldName?.dirty"
    />
  </div>
</Form>
```

**Key Points:**
- Use `name` attribute on inputs (no v-model needed)
- Access form state via `$form` slot prop
- Use `z.string().trim()` for automatic trimming in Zod schema
- **Error display:** Use `<Message>` component with `v-if="$form.fieldName?.invalid"` for validation errors
- **Button state:** Disable submit button with `:disabled="!$form.fieldName?.valid || !$form.fieldName?.dirty"`
- **Touch state:** Only show errors after field is touched: `$form.fieldName?.touched`
- **p-invalid class:** Apply only when invalid AND touched: `:class="{ 'p-invalid': $form.fieldName?.invalid && $form.fieldName?.touched }"`

**Validation Triggers:**
- Fields validate on blur (touched state)
- Form validates on submit
- Errors only appear after first blur or submit attempt

**Known Issues:**
- Issue [#6789](https://github.com/primefaces/primevue/issues/6789): `event.values` can be undefined in submit event
- **Workaround:** Extract values from `event.states.[fieldName].value` instead of `event.values`

### Service Layer Pattern

Services are classes with instance methods and singleton exports that wrap the type-safe `apiClient`:

```typescript
import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

// Extract types from OpenAPI components
export type ProjectMember = ApiComponents['schemas']['ProjectMemberJson'];
export type ProjectMemberList = ApiComponents['schemas']['ProjectMemberListJson'];

class ProjectMemberService {
  async getMembers(projectId: string): Promise<ProjectMemberList> {
    return apiClient.get('/api/v1/projects/{projectId}/members', {
      pathParams: { projectId },
    });
  }

  async addMember(projectId: string, member: ProjectMember): Promise<ProjectMember> {
    return apiClient.post('/api/v1/projects/{projectId}/members', member, {
      pathParams: { projectId },
    });
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    return apiClient.delete('/api/v1/projects/{projectId}/members/{memberId}', {
      pathParams: { projectId, memberId },
    });
  }
}

export const projectMemberService = new ProjectMemberService();
```

**Service naming**: `[Domain]Service.ts` (e.g., `ProjectMemberService.ts`, `IssueService.ts`)

**Key patterns**:
- Import `apiClient` and `ApiComponents` from `@/services/ApiClient.ts`
- Export types extracted from `ApiComponents['schemas']` for reuse
- Use `apiClient.get()`, `.post()`, `.put()`, `.patch()`, `.delete()` methods
- Path parameters: `{ pathParams: { projectId, memberId } }` (no curly braces in keys)
- Query parameters: `{ params: { filter: 'active' } }`
- Full type safety is enforced at compile time

**Resource-Specific Services** (CRITICAL):
- **Each backend resource has its own dedicated service** - do NOT call `apiClient` directly from views or components
- Examples of existing services:
  - `PropertyService` - For properties (`/api/v1/projects/{projectId}/properties`)
  - `ApartmentService` - For apartments (`/api/v1/projects/{projectId}/apartments`)
  - `BuildingService` - For buildings (`/api/v1/projects/{projectId}/buildings`)
  - `SiteService` - For sites (`/api/v1/projects/{projectId}/sites`)
  - `CommercialService` - For commercial units (`/api/v1/projects/{projectId}/commercials`)
  - `StorageService` - For storage units (`/api/v1/projects/{projectId}/storages`)
  - `ProjectMemberService` - For project members
  - `IssueService` - For issues/tickets
  - `TenancyService` - For tenancies
- **When implementing CRUD operations**, always use the appropriate service for each resource type
- **Never bypass services** - Components and views should ONLY call services, never `apiClient` directly

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
- **Don't call `apiClient` directly from views or components** - always use the appropriate resource-specific service
- **Don't create a single service for multiple resource types** - each resource (apartment, building, site, etc.) has its own dedicated service

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
5. Use `apiClient` singleton for all API calls to ensure type safety
6. Extract types from `ApiComponents['schemas']` for TypeScript definitions

### Path Aliases
- `@` → `./src` (configured in `vite.config.ts` and `tsconfig.json`)
- Use `@/components/...` instead of relative paths

### Data Flow for API Calls
1. Component → Store action (if shared state) or direct service call
2. Service → `apiClient` type-safe HTTP methods (get, post, put, patch, delete)
3. `apiClient` → Axios interceptors (path placeholder replacement) → API
4. Response → Promise chain back to component
5. Errors → EventStore event → Toast notification

**Example flow**:
```typescript
// 1. Component calls service
const members = await projectMemberService.getMembers(projectId);

// 2. Service uses apiClient
async getMembers(projectId: string) {
  return apiClient.get('/api/v1/projects/{projectId}/members', {
    pathParams: { projectId }
  });
}

// 3. ApiClient enforces types and makes HTTP request
// 4. Interceptor replaces {projectId} with actual value
// 5. Response data is returned with full type safety
```

## Best Practices

1. **Performance**: Use lazy loading for routes and large components
2. **Security**: Sanitize user inputs, validate data, avoid `v-html` without sanitization
3. **Accessibility**: Follow WCAG guidelines, use semantic HTML
4. **Responsive design**: Mobile-first approach with TailwindCSS breakpoints
5. **PWA**: Service worker is configurable via `VITE_SERVICE_WORKER_ENABLED` environment variable

## AI Assistance Guidelines

When working on this codebase:
- Suggest Vue 3 Composition API solutions with `<script setup>`
- Recommend PrimeVue components when applicable
- **Use BaseCard instead of PrimeVue Card** for consistent styling across the application
- Ensure TypeScript type safety (avoid `any`)
- Include proper error handling and loading states
- Follow established project structure and patterns
- Include appropriate tests for new functionality
- Consider internationalization requirements (use `t()`)
- Maintain responsive design principles with Tailwind
- Use camelCase for attributes and events (NOT kebab-case)
- Prefer editing existing components over creating new files
- **Always use resource-specific services** - identify which resource is being operated on (property, apartment, building, site, commercial, storage, etc.) and use the corresponding service
- **When implementing delete/update operations for rentable units**, ensure you're calling the correct service based on the unit type (e.g., `apartmentService.deleteApartment()` for apartments, `buildingService.deleteBuilding()` for buildings)
