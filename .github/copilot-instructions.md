# Remsfal Frontend - Facility Management SPA

Remsfal Frontend is a Vue 3 + TypeScript + Vite single-page application for facility management that works with the remsfal-backend repository. This application uses PrimeVue components, TailwindCSS, and integrates with a Java backend via REST APIs.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build
Always follow these exact steps to set up the repository:

1. **Install dependencies:**
   ```bash
   CYPRESS_INSTALL_BINARY=0 npm ci
   ```
   - Takes ~15 seconds
   - Note: Cypress binary download often fails in sandboxed environments due to network restrictions
   - Use `CYPRESS_INSTALL_BINARY=0` to skip Cypress binary installation
   - If you need Cypress for E2E tests, install it separately: `npx cypress install`

2. **Type check the codebase:**
   ```bash
   npm run type-check
   ```
   - Takes ~10 seconds
   - NEVER CANCEL - Set timeout to 30+ minutes for safety
   - Uses `vue-tsc --build --force` to validate TypeScript in .vue files

3. **Build for production:**
   ```bash
   npm run build
   ```
   - Takes ~19 seconds total (type-check + vite build)
   - NEVER CANCEL - Set timeout to 60+ minutes for safety
   - Creates `dist/` directory with optimized assets
   - Build warnings about chunk sizes are normal and expected

### Development and Testing

4. **Run unit tests:**
   ```bash
   npm run test:unit
   ```
   - Takes ~30 seconds for 198 tests across 44 files
   - NEVER CANCEL - Set timeout to 60+ minutes for safety
   - Uses Vitest with jsdom environment
   - Console warnings about Vue plugins are normal and can be ignored

5. **Start development server:**
   ```bash
   npm run dev
   ```
   - Starts in <1 second on http://localhost:5173/
   - Hot-reload enabled
   - Proxies `/api` requests to http://localhost:8080 (backend)
   - Service Worker is disabled by default in development

6. **Preview production build:**
   ```bash
   npm run preview
   ```
   - Starts in <1 second on http://localhost:4173/
   - Serves the built `dist/` directory
   - Used for E2E testing in CI

### Code Quality and Validation

7. **Lint JavaScript/TypeScript/Vue:**
   ```bash
   npm run lint
   ```
   - Takes ~4 seconds
   - Uses ESLint with Vue, TypeScript, and Prettier configurations
   - Add `:fix` suffix to auto-fix issues: `npm run lint:fix`

8. **Lint CSS/SCSS:**
   ```bash
   npm run stylelint
   ```
   - Takes ~3 seconds
   - Checks Vue files and CSS/SCSS files in src/ and public/
   - Add `:fix` suffix to auto-fix issues: `npm run stylelint:fix`

9. **Format code:**
   ```bash
   npm run format
   ```
   - Takes ~3 seconds
   - Uses Prettier to format all files in src/
   - ALWAYS run before committing changes

## Required Dependencies

- **Node.js 20.x** (as specified in CI workflows)
- **npm 10.x** (comes with Node.js 20)

## Common Validation Scenarios

After making changes, ALWAYS validate with these scenarios:

### Build and Lint Validation
```bash
npm run build && npm run lint && npm run stylelint && npm run format
```
This ensures your changes will pass CI checks.

### Backend Integration Test
1. Ensure the backend is running on http://localhost:8080
2. Start dev server: `npm run dev`
3. Navigate to http://localhost:5173/
4. Test login flow (if authentication is available)
5. Test basic navigation between views

### Manual Testing Scenarios
- **Login Flow**: Test user authentication and role-based navigation
- **Project Management**: Create/edit projects, properties, buildings
- **Facility Management**: Test building, apartment, storage, and commercial unit management
- **Task Management**: Create and manage facility maintenance tasks
- **Internationalization**: Switch between German (default) and English

## Repository Structure

### Key Directories
```
src/
├── components/          # Reusable Vue components (53 total)
├── views/              # Page-level components/routes
├── services/           # API service classes and generated schemas
├── stores/             # Pinia state management
├── router/             # Vue Router configuration
├── i18n/               # Internationalization (German/English)
├── layout/             # Layout components for different user roles
├── assets/             # SCSS styles and static assets
└── types/              # TypeScript type definitions

test/                   # Unit tests (Vitest)
cypress/                # E2E tests (Cypress)
openapi/               # OpenAPI specifications for code generation
```

### Important Files
- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Build configuration with backend proxy
- `tsconfig.*.json` - TypeScript configurations
- `eslint.config.js` - Linting rules
- `.env` / `.env.production` - Environment variables

## Technology Stack

- **Frontend Framework**: Vue 3 with Composition API and `<script setup>`
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS + PrimeVue components + custom SCSS
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Testing**: Vitest (unit) + Cypress (E2E)
- **Icons**: FontAwesome + PrimeIcons
- **Internationalization**: Vue I18n

## OpenAPI Integration

The project generates TypeScript schemas from OpenAPI specifications:

```bash
npm run openapi
```
- Generates schemas in `src/services/api/`
- Sources from `openapi/*.json` files
- Run after backend API changes

## Environment Configuration

- **Development**: Uses `.env` with localhost backend
- **Production**: Uses `.env.production` with remsfal.online backend
- **Service Worker**: Disabled in dev, enabled in production
- **Backend Proxy**: `/api` → `http://localhost:8080` in development

## Common Issues and Troubleshooting

### Cypress Installation Fails
```bash
# Install without Cypress binary (common in sandboxed environments)
CYPRESS_INSTALL_BINARY=0 npm ci

# Install Cypress separately if needed
npx cypress install
```

### Service Worker Issues
- Service Worker is disabled by default in development
- Enable with `VITE_SERVICE_WORKER_ENABLED=true` in `.env`
- Clear browser cache if experiencing caching issues

### Backend Connection Issues
- Ensure backend is running on http://localhost:8080
- Check `vite.config.ts` proxy configuration
- Network tab in DevTools shows proxy requests

### Build Performance
- Large chunk warnings are normal (PrimeVue components)
- Build takes ~19 seconds - never cancel builds
- Type checking adds ~10 seconds to build time

## Internationalization (i18n)

- **Default Language**: German (de)
- **Fallback Language**: English (en)
- **Files**: `src/i18n/locales/de.json` and `src/i18n/locales/en.json`
- **Usage**: Import `useI18n()` and use `t('key')` in components
- **Tip**: Use i18n-ally VS Code extension for translation management

## Critical Reminders

- **NEVER CANCEL builds or tests** - They may take up to 30 seconds
- **ALWAYS run `npm run format`** before committing
- **ALWAYS validate builds pass** with `npm run build`
- **Set explicit timeouts** of 60+ minutes for build commands
- **Test manually** after making changes - don't rely only on unit tests
- **Use exact Node.js 20.x** to match CI environment
- **Skip Cypress binary** installation in sandboxed environments