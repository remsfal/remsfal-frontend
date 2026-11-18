import { computed, type ComputedRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useUserSessionStore } from '@/stores/UserSession'
import { homeRouteFor } from '@/router/homeRoute'

export interface HomeRoute {
  isLoggedIn: ComputedRef<boolean>
  homeRoute: ComputedRef<RouteLocationRaw>
}

/**
 * Start page for the current user: the personal overview when logged in,
 * otherwise the public landing page.
 */
export function useHomeRoute(): HomeRoute {
  const sessionStore = useUserSessionStore()

  const isLoggedIn = computed(() => sessionStore.user != null)
  const homeRoute = computed<RouteLocationRaw>(() =>
    isLoggedIn.value ? homeRouteFor(sessionStore) : { name: 'LandingPage' },
  )

  return { isLoggedIn, homeRoute }
}
