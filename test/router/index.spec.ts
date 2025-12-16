import { beforeEach, describe, expect, it, vi } from 'vitest';
import {createMemoryHistory,
    type RouteLocationNormalizedLoaded,
    type RouteRecordRaw,
    type Router,} from 'vue-router';

/* -------------------------------------------------------------------------- */
/*                                   Mocks                                    */
/* -------------------------------------------------------------------------- */

vi.mock('vue-router', async () => {
    const actual =
        await vi.importActual<typeof import('vue-router')>('vue-router');

    return {
        ...actual,
        createWebHistory: () => createMemoryHistory(),
    };
});

vi.mock('@/stores/UserSession', () => ({useUserSessionStore: vi.fn(),}));

vi.mock('@/stores/ProjectStore', () => ({useProjectStore: vi.fn(),}));

vi.mock('@/views/LandingPageView.vue', () => ({ default: {} }));
vi.mock('@/layout/AppLayout.vue', () => ({ default: {} }));
vi.mock('@/layout/ManagerMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/ManagerTopbar.vue', () => ({ default: {} }));
vi.mock('@/layout/ContractorMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/ContractorTopbar.vue', () => ({ default: {} }));
vi.mock('@/layout/TenantMenu.vue', () => ({ default: {} }));
vi.mock('@/layout/TenantTopbar.vue', () => ({ default: {} }));

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function flattenRoutes(
    routes: readonly RouteRecordRaw[],
): RouteRecordRaw[] {
    const result: RouteRecordRaw[] = [];

    const walk = (route: RouteRecordRaw) => {
        result.push(route);
        route.children?.forEach(walk);
    };

    routes.forEach(walk);
    return result;
}

function makeLoadedRoute(
    name: string,
    params: Record<string, string>,
    query: Record<string, unknown> = {},
): RouteLocationNormalizedLoaded {
    return {
        name,
        params,
        query,
    } as RouteLocationNormalizedLoaded;
}

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

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

        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: null,});

        const routerModule = await import('@/router');

        router = routerModule.default;
        routes = routerModule.routes;

        mockSearchSelectedProject.mockClear();
    });

    /* ---------------------------------------------------------------------- */
    /*                               Route export                              */
    /* ---------------------------------------------------------------------- */

    it('exportiert Routen inkl. LandingPage und ProjectDashboard', () => {
        const names = flattenRoutes(routes)
            .map((route) => route.name)
            .filter((n): n is string => typeof n === 'string');

        expect(names).toContain('LandingPage');
        expect(names).toContain('ProjectDashboard');
    });

    /* ---------------------------------------------------------------------- */
    /*                         Manager beforeEnter hook                        */
    /* ---------------------------------------------------------------------- */

    it('ruft searchSelectedProject im beforeEnter-Hook auf', () => {
        const managerRoot = routes.find(
            (r) => r.path === '/projects/:projectId',
        );

        expect(managerRoot).toBeTruthy();
        expect(typeof managerRoot!.beforeEnter).toBe('function');

        managerRoot!.beforeEnter!(
            {params: { projectId: 'p123' },} as RouteLocationNormalizedLoaded,
        );

        expect(mockSearchSelectedProject).toHaveBeenCalledTimes(1);
        expect(mockSearchSelectedProject).toHaveBeenCalledWith('p123');
    });

    /* ---------------------------------------------------------------------- */
    /*                       Role-based redirect (guard)                       */
    /* ---------------------------------------------------------------------- */

    it('redirects MANAGER from LandingPage to ProjectSelection', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe(
            'ProjectSelection',
        );
    });

    it('redirects CONTRACTOR from LandingPage to ContractorView', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['CONTRACTOR'] },});

        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe(
            'ContractorView',
        );
    });

    it('redirects TENANT from LandingPage to TenantView', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['TENANT'] },});

        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('TenantView');
    });

    it('falls back to ProjectSelection for unknown roles', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['UNKNOWN'] },});

        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe(
            'ProjectSelection',
        );
    });

    it('does nothing when user is not logged in', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: null,});

        await router.push({ name: 'LandingPage' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe('LandingPage');
    });

    it('does nothing on non-LandingPage routes', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await router.push({ name: 'ProjectSelection' });
        await router.isReady();

        expect(router.currentRoute.value.name).toBe(
            'ProjectSelection',
        );
    });

    /* ---------------------------------------------------------------------- */
    /*                        Props functions (coverage)                       */
    /* ---------------------------------------------------------------------- */

    it('evaluates ProjectContractors props', () => {
        const route = flattenRoutes(routes).find(
            (r) => r.name === 'ProjectContractors',
        );

        const propsFn = route?.props as (
            route: RouteLocationNormalizedLoaded,
        ) => unknown;

        expect(
            propsFn(
                makeLoadedRoute('ProjectContractors', {projectId: 'p1',}),
            ),
        ).toEqual({ projectId: 'p1' });
    });

    it('evaluates PropertyView props', () => {
        const route = flattenRoutes(routes).find(
            (r) => r.name === 'PropertyView',
        );

        const propsFn = route?.props as (
            route: RouteLocationNormalizedLoaded,
        ) => unknown;

        expect(
            propsFn(
                makeLoadedRoute('PropertyView', {
                    projectId: 'p1',
                    unitId: 'u1',
                }),
            ),
        ).toEqual({
            projectId: 'p1',
            unitId: 'u1',
        });
    });
});
