import type { Router, RouteLocationRaw } from 'vue-router'
import { useUserSessionStore } from '@/stores/UserSession'
// NOTE: imports the store module directly, not the `@/features/common/projects` barrel —
// the router is loaded by the global test setup, which would evaluate the barrel before the
// `vi.mock` calls of a test file are registered, so components would bypass those mocks.
import { useProjectStore } from '@/features/common/projects/stores/ProjectStore'
import { safeRedirectPath } from '@/helper/redirectHelper'

function homeRouteFor(sessionStore: ReturnType<typeof useUserSessionStore>): RouteLocationRaw {
  if (sessionStore.isManager) return { name: 'ProjectSelection' }
  if (sessionStore.isContractor) return { name: 'ContractorDashboard' }
  if (sessionStore.isTenant) return { name: 'TenantDashboard' }
  return { name: 'ProjectSelection' }
}

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const projectId = (to.params as Record<string, string>).projectId
    if (projectId) {
      const projectStore = useProjectStore()
      projectStore.searchSelectedProject(projectId)
      console.log('Router enter project: ' + projectId)
    }
  })

  router.beforeEach((to) => {
    const sessionStore = useUserSessionStore()
    const isLoggedIn = !!sessionStore.user

    if (to.meta.requiresAuth && !isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    if (to.name === 'Login' && isLoggedIn) {
      return safeRedirectPath(to.query.redirect) ?? homeRouteFor(sessionStore)
    }

    if (to.name === 'LandingPage' && isLoggedIn) {
      return homeRouteFor(sessionStore)
    }
  })
}
