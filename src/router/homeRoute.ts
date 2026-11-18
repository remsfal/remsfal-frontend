import type { RouteLocationRaw } from 'vue-router'
import type { useUserSessionStore } from '@/stores/UserSession'

/**
 * Personal overview of a logged-in user, depending on the user's roles.
 * Used by the router guards, the topbar logo and the BackToOverviewLink.
 */
export function homeRouteFor(sessionStore: ReturnType<typeof useUserSessionStore>): RouteLocationRaw {
  if (sessionStore.isManager) return { name: 'ProjectSelection' }
  if (sessionStore.isContractor) return { name: 'ContractorDashboard' }
  if (sessionStore.isTenant) return { name: 'TenantDashboard' }
  return { name: 'ProjectSelection' }
}
