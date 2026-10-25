import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import router from '@/router/index';
import { useUserSessionStore } from '@/stores/UserSession';

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
});
