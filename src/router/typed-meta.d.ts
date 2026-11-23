import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'manager' | 'project' | 'tenant' | 'contractor' | 'public' | 'auth'
    requiresAuth?: boolean
    /** Reachable while the app is closed (CONSTRUCTION/MAINTENANCE mode), e.g. legal texts */
    availableWhenClosed?: boolean
  }
}
