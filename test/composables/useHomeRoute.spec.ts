import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHomeRoute } from '@/composables/useHomeRoute';
import { useUserSessionStore } from '@/stores/UserSession';

type SessionUser = ReturnType<typeof useUserSessionStore>['user'];

describe('useHomeRoute', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns the landing page when logged out', () => {
    const { isLoggedIn, homeRoute } = useHomeRoute();
    expect(isLoggedIn.value).toBe(false);
    expect(homeRoute.value).toEqual({ name: 'LandingPage' });
  });

  it.each([
    [['MANAGER'], 'ProjectSelection'],
    [['CONTRACTOR'], 'ContractorDashboard'],
    [['TENANT'], 'TenantDashboard'],
    [['TENANT', 'CONTRACTOR', 'MANAGER'], 'ProjectSelection'],
    [['TENANT', 'CONTRACTOR'], 'ContractorDashboard'],
    [undefined, 'ProjectSelection'],
  ])('returns the personal overview for user contexts %j', (userContexts, routeName) => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts } as SessionUser;
    const { isLoggedIn, homeRoute } = useHomeRoute();
    expect(isLoggedIn.value).toBe(true);
    expect(homeRoute.value).toEqual({ name: routeName });
  });

  it('reacts to login and logout', () => {
    const { homeRoute } = useHomeRoute();
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['TENANT'] } as SessionUser;
    expect(homeRoute.value).toEqual({ name: 'TenantDashboard' });
    useUserSessionStore().user = null;
    expect(homeRoute.value).toEqual({ name: 'LandingPage' });
  });
});
