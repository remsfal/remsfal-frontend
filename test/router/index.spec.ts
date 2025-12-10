import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Router } from 'vue-router';

vi.mock('@/stores/UserSession', () => ({useUserSessionStore: vi.fn(),}));

import { useUserSessionStore } from '@/stores/UserSession';

describe('Router beforeEach guard', () => {
    let router: Router;

    beforeEach(async () => {
        const routerModule = await import('@/router');
        router = routerModule.default as Router;

        // Standard: nicht eingeloggt
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: null,});

        try {
            await router.push({ name: 'LandingPage' });
            await router.isReady();
        } catch {
            // kann im Test schon dort sein, dann egal
        }
    });

    it('does nothing when user is not logged in on LandingPage', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: null,});

        await router.push({ name: 'LandingPage' });

        expect(router.currentRoute.value.name).toBe('LandingPage');
    });

    it('does nothing on non-LandingPage routes (even if user has roles)', async () => {
        (useUserSessionStore as unknown as vi.Mock).mockReturnValue({user: { userRoles: ['MANAGER'] },});

        await router.push({ name: 'ProjectSelection' });

        expect(router.currentRoute.value.name).toBe('ProjectSelection');
    });
});
