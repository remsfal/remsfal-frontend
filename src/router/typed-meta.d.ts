import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'manager' | 'project' | 'tenant' | 'contractor' | 'public' | 'auth'
    requiresAuth?: boolean
  }
}
