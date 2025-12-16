import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {RouteLocationNormalized,
    RouteRecordRaw,
    Router,} from 'vue-router';

vi.mock('vue-router', async () => {
    const actual =
        await vi.importActual<typeof import('vue-router')>('vue-router');
    return { ...actual, createWebHistory: actual.createMemoryHistory };
});

vi.mock('@/stores/UserSession', () => ({ useUserSessionStore: vi.fn() }));
vi.mock('@/stores/ProjectStore', () => ({ useProjectStore: vi.fn() }));

vi.mock('@/views/LandingPageView.vue', () => ({ default: {} }));
vi.mock('@/layout/AppLayout.vue', () => ({ default: {} }));
vi.mock('@/layout/ManagerMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/ManagerTopbar.vue', () => ({ default: {} }));
vi.mock('@/layout/ContractorMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/ContractorTopbar.vue', () => ({ default: {} }));
vi.mock('@/layout/TenantMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/TenantTopbar.vue', () => ({ default: {} }));

import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';

function flattenRoutes(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
    const out: RouteRecordRaw[] = [];
    const walk = (r: RouteRecordRaw) => {
        out.push(r);
        r.children?.forEach(walk);
    };
    routes.forEach(walk);
    return out;
}

describe('router/index.ts', () => {
    let router: Router;
    let routes: Readonly<RouteRecordRaw[]>;
    const mockSearchSelectedProject = vi.fn();

    beforeEach(async () => {
        vi.resetModules();

        (useProjectStore as unknown as vi.Mock).mockReturnValue({
            projectId: undefined,
            searchSelectedProject: mockSearchSelectedProject,
        });

        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({ user: null });

        const routerModule = await import('@/router');
        router = routerModule.default as Router;
        routes = routerModule.routes as Readonly<RouteRecordRaw[]>;

        mockSearchSelectedProject.mockClear();

        // Wichtig: Router initialisieren & eine echte Navigation machen
        await router.push({ name: 'Privacy' });
        await router.isReady();
    });

    it('exportiert Routen inkl. LandingPage und ProjectDashboard', () => {
        const names = flattenRoutes(routes)
            .map((r) => r.name)
            .filter((n): n is string => typeof n === 'string');

        expect(names).toContain('LandingPage');
        expect(names).toContain('ProjectDashboard');
    });

    it('ruft searchSelectedProject im beforeEnter-Hook der Manager-Route auf', () => {
        const managerRoot = routes.find((r) => r.path === '/projects/:projectId');
        expect(managerRoot).toBeTruthy();
        expect(typeof managerRoot!.beforeEnter).toBe('function');

        const to = {params: { projectId: 'p123' },} as unknown as RouteLocationNormalized;

        (managerRoot!.beforeEnter as (to: RouteLocationNormalized) => void)(to);

        expect(mockSearchSelectedProject).toHaveBeenCalledTimes(1);
        expect(mockSearchSelectedProject).toHaveBeenCalledWith('p123');
    });

    it('redirects MANAGER from LandingPage to ProjectSelection', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await router.push({ name: 'LegalNotice' });
        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('ProjectSelection');
    });

    it('redirects CONTRACTOR from LandingPage to ContractorView', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['CONTRACTOR'] },});

        await router.push({ name: 'LegalNotice' });
        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('ContractorView');
    });

    it('redirects TENANT from LandingPage to TenantView', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['TENANT'] },});

        await router.push({ name: 'LegalNotice' });
        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('TenantView');
    });

    it('falls back to ProjectSelection for unknown roles', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['SOME_UNKNOWN_ROLE'] },});

        await router.push({ name: 'LegalNotice' });
        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('ProjectSelection');
    });

    it('does nothing when user is not logged in on LandingPage', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({ user: null });

        await router.push({ name: 'LegalNotice' });
        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('LandingPage');
    });

    it('does nothing on non-LandingPage routes even if logged in', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await router.push({ name: 'ProjectSelection' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('ProjectSelection');
    });
});
