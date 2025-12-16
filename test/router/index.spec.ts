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

/**
 * Wichtig für Coverage der Lazy-Import-Line:
 * component: () => import('@/views/ContractorView.vue')
 */
vi.mock('@/views/ContractorView.vue', () => ({ default: {} }));

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

function findRouteByName(
    routes: readonly RouteRecordRaw[],
    name: string,
): RouteRecordRaw | undefined {
    return flattenRoutes(routes).find((r) => r.name === name);
}

async function pushAndReady(router: Router, name: string) {
    await router.push({ name });
    await router.isReady();
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

    it('exportiert wichtige Routen-Namen', () => {
        const names = flattenRoutes(routes)
            .map((r) => r.name)
            .filter((n): n is string => typeof n === 'string');

        expect(names).toContain('LandingPage');
        expect(names).toContain('ProjectDashboard');
        expect(names).toContain('ProjectContractors');
    });

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

    it.each([
        ['MANAGER', 'ProjectSelection'],
        ['CONTRACTOR', 'ContractorView'],
        ['TENANT', 'TenantView'],
        ['UNKNOWN', 'ProjectSelection'],
    ])(
        'redirects %s from LandingPage to %s',
        async (role: string, expected: string) => {
            (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: [role] },});

            await pushAndReady(router, 'LandingPage');

            expect(router.currentRoute.value.name).toBe(expected);
        },
    );

    it('does nothing when user is not logged in', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: null,});

        await pushAndReady(router, 'LandingPage');

        expect(router.currentRoute.value.name).toBe('LandingPage');
    });

    it('does nothing on non-LandingPage routes', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await pushAndReady(router, 'ProjectSelection');

        expect(router.currentRoute.value.name).toBe('ProjectSelection');
    });

    it('evaluates ProjectContractors props', () => {
        const route = findRouteByName(routes, 'ProjectContractors');
        expect(route).toBeTruthy();

        const propsFn = route!.props as (
            route: RouteLocationNormalizedLoaded,
        ) => unknown;

        expect(
            propsFn(
                makeLoadedRoute('ProjectContractors', {projectId: 'p1',}),
            ),
        ).toEqual({ projectId: 'p1' });
    });

    it('covers lazy import line for ProjectContractors component', async () => {
        const route = findRouteByName(routes, 'ProjectContractors');
        expect(route).toBeTruthy();

        const componentFn = route!.component as
            | (() => Promise<unknown>)
            | undefined;

        expect(typeof componentFn).toBe('function');

        const mod = await componentFn!();
        expect(mod).toBeTruthy();
    });

    it('evaluates PropertyView props', () => {
        const route = findRouteByName(routes, 'PropertyView');
        expect(route).toBeTruthy();

        const propsFn = route!.props as (
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
