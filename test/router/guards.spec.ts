import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from '@/router/index';
import { useUserSessionStore } from '@/stores/UserSession';
import { setAppMode } from '@/helper/appMode';

type SessionUser = ReturnType<typeof useUserSessionStore>['user'];

describe('Router guards - authentication', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    await router.push('/');
    await router.isReady();
  });

  it('redirects unauthenticated users from protected routes to the login page', async () => {
    await router.push('/manager/projects');
    expect(router.currentRoute.value.name).toBe('Login');
    expect(router.currentRoute.value.query.redirect).toBe('/manager/projects');
  });

  it('keeps unauthenticated users on the login page', async () => {
    await router.push({ name: 'Login' });
    expect(router.currentRoute.value.name).toBe('Login');
  });

  it('forwards logged-in users from the login page to the redirect target', async () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['MANAGER'] } as SessionUser;
    await router.push({ name: 'Login', query: { redirect: '/manager/account-data' } });
    expect(router.currentRoute.value.path).toBe('/manager/account-data');
  });

  it('ignores external redirect targets for logged-in users', async () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['TENANT'] } as SessionUser;
    await router.push({ name: 'Login', query: { redirect: '//evil.example' } });
    expect(router.currentRoute.value.name).toBe('TenantDashboard');
  });

  it('forwards logged-in users from the login page to their role home', async () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['CONTRACTOR'] } as SessionUser;
    await router.push({ name: 'Login' });
    expect(router.currentRoute.value.name).toBe('ContractorDashboard');
  });

  it('prefers the manager home for users with several contexts', async () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['TENANT', 'CONTRACTOR', 'MANAGER'] } as SessionUser;
    await router.push({ name: 'Login' });
    expect(router.currentRoute.value.name).toBe('ProjectSelection');
  });

  it('forwards logged-in users without context to the project selection', async () => {
    useUserSessionStore().user = { email: 'a@b.de' } as SessionUser;
    await router.push({ name: 'Login' });
    expect(router.currentRoute.value.name).toBe('ProjectSelection');
  });
});

describe('Router guards - closed app (CONSTRUCTION/MAINTENANCE)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    setAppMode('PRODUCTION');
    await router.push('/');
    await router.isReady();
    setAppMode('CONSTRUCTION');
  });

  afterEach(() => {
    setAppMode('DEVELOPMENT');
    if (router.hasRoute('ClosedTestPage')) {
      router.removeRoute('ClosedTestPage');
    }
  });

  it('sends protected routes to the landing page instead of the login', async () => {
    await router.push('/manager/projects');
    expect(router.currentRoute.value.name).toBe('LandingPage');
  });

  it('sends the login page to the landing page', async () => {
    setAppMode('MAINTENANCE');
    await router.push({ name: 'Login' });
    expect(router.currentRoute.value.name).toBe('LandingPage');
  });

  it('keeps logged-in users on the landing page', async () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['MANAGER'] } as SessionUser;
    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('LandingPage');
  });

  it('allows pages flagged with availableWhenClosed', async () => {
    router.addRoute({
      path: '/closed-test-page',
      name: 'ClosedTestPage',
      component: { template: '<div />' },
      meta: { availableWhenClosed: true },
    } as Parameters<typeof router.addRoute>[0]);
    await router.push('/closed-test-page');
    expect(router.currentRoute.value.path).toBe('/closed-test-page');
  });
});
