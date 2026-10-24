import type { Router, RouteLocationRaw } from 'vue-router'
import { useUserSessionStore } from '@/stores/UserSession'
import { useProjectStore } from '@/stores/ProjectStore'
import { safeRedirectPath } from '@/helper/redirectHelper'

function homeRouteFor(roles: string[]): RouteLocationRaw {
  if (roles.includes('MANAGER')) return { name: 'ProjectSelection' }
  if (roles.includes('CONTRACTOR')) return { name: 'ContractorDashboard' }
  if (roles.includes('TENANT')) return { name: 'TenantDashboard' }
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
      return safeRedirectPath(to.query.redirect) ?? homeRouteFor(sessionStore.user?.userContexts || [])
    }

    if (to.name === 'LandingPage' && isLoggedIn) {
      return homeRouteFor(sessionStore.user?.userContexts || [])
    }
  })
}
