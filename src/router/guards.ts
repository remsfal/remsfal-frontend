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

  router.beforeEach((to) => {
    const sessionStore = useUserSessionStore()
    const isLoggedIn = !!sessionStore.user

    if (to.meta.requiresAuth && !isLoggedIn) {
      return { name: 'LandingPage', query: { redirect: to.fullPath } }
    }

    if (to.name === 'LandingPage' && isLoggedIn) {
      const roles = sessionStore.user?.userContexts || []
      if (roles.includes('MANAGER')) return { name: 'ProjectSelection' }
      if (roles.includes('CONTRACTOR')) return { name: 'ContractorDashboard' }
      if (roles.includes('TENANT')) return { name: 'TenantDashboard' }
      return { name: 'ProjectSelection' }
    }
  })
}
