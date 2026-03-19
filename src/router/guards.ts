import type { Router } from 'vue-router'
import { useUserSessionStore } from '@/stores/UserSession'
import { useProjectStore } from '@/stores/ProjectStore'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const projectId = (to.params as Record<string, string>).projectId
    if (projectId) {
      const projectStore = useProjectStore()
      projectStore.searchSelectedProject(projectId)
      console.log('Router enter project: ' + projectId)
    }
  })

  router.beforeEach((to, _from, next) => {
    const sessionStore = useUserSessionStore()
    const isLoggedIn = !!sessionStore.user

    if (to.meta.requiresAuth && !isLoggedIn) {
      return next({ name: 'LandingPage', query: { redirect: to.fullPath } })
    }

    if (to.name === 'LandingPage' && isLoggedIn) {
      const roles = sessionStore.user?.userContexts || []
      if (roles.includes('MANAGER')) return next({ name: 'ProjectSelection' })
      if (roles.includes('CONTRACTOR')) return next({ name: 'ContractorDashboard' })
      if (roles.includes('TENANT')) return next({ name: 'TenantDashboard' })
      return next({ name: 'ProjectSelection' })
    }

    next()
  })
}
