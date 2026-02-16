import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({useRouter: () => ({ push: mockPush }),}));

// Mock useI18n
vi.mock('vue-i18n', () => ({useI18n: () => ({ t: (key: string) => key }),}));

// Mock globalThis location
const originalLocation = globalThis.location;

describe('useTopbarUserActions', () => {
    beforeEach(() => {
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

    it('login navigates to correct URL', () => {
        const pinia = createTestingPinia({ stubActions: false });
        const wrapper = mount(TestComponent, { global: { plugins: [pinia] } });
        wrapper.vm.login('/dashboard');
        expect(globalThis.location.href).toBe('/api/v1/authentication/login?route=%2Fdashboard');
    });

    it('logout navigates to correct URL', () => {
        const pinia = createTestingPinia({ stubActions: false });
        const wrapper = mount(TestComponent, { global: { plugins: [pinia] } });
        wrapper.vm.logout();
        expect(globalThis.location.pathname).toBe('/api/v1/authentication/logout');
    });


});
