import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import router from '@/router';

// Mock only useRouter (not useRoute, which is provided by the real router via injection)
const mockPush = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return {
        ...actual,
        useRouter: () => ({ push: mockPush }),
    };
});

// Mock useI18n
vi.mock('vue-i18n', () => ({useI18n: () => ({ t: (key: string) => key }),}));

// Mock globalThis location
const originalLocation = globalThis.location;

describe('useTopbarUserActions', () => {
    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock globalThis.location
        Object.defineProperty(globalThis, 'location', {
            value: {
                href: '',
                pathname: '',
                assign: vi.fn(),
            } as unknown as Location,
            writable: true,
        });

        // Reset router to root
        await router.push('/');
        await router.isReady();
    });

    afterEach(() => {
        Object.defineProperty(globalThis, 'location', {
            value: originalLocation,
            writable: true,
        });
    });

    const TestComponent = defineComponent({
        setup() {
            return { ...useTopbarUserActions() };
        },
        template: '<div></div>',
    });

    it('login uses redirect query param when present', async () => {
        await router.push('/?redirect=%2Fdashboard');
        const pinia = createTestingPinia({ stubActions: false });
        const wrapper = mount(TestComponent, { global: { plugins: [pinia] } });
        wrapper.vm.login();
        expect(globalThis.location.href).toBe('/api/v1/authentication/login?route=%2Fdashboard');
    });

    it('login falls back to current fullPath when no redirect param', async () => {
        await router.push('/');
        const pinia = createTestingPinia({ stubActions: false });
        const wrapper = mount(TestComponent, { global: { plugins: [pinia] } });
        wrapper.vm.login();
        expect(globalThis.location.href).toBe('/api/v1/authentication/login?route=%2F');
    });

    it('logout navigates to correct URL', () => {
        const pinia = createTestingPinia({ stubActions: false });
        const wrapper = mount(TestComponent, { global: { plugins: [pinia] } });
        wrapper.vm.logout();
        expect(globalThis.location.pathname).toBe('/api/v1/authentication/logout');
    });
});
