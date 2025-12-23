import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import TenantTopbar from '../../src/layout/TenantTopbar.vue';
import { useUserSessionStore, type User } from '../../src/stores/UserSession';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }), }));

// Mock platform helper
vi.mock('../../src/helper/platform', () => ({ shouldShowDevLogin: vi.fn().mockReturnValue(false), }));

describe('TenantTopbar.vue', () => {
    it('should render TopbarUserActions', async () => {
        const pinia = createTestingPinia({ stubActions: false });
        const userStore = useUserSessionStore(pinia);
        userStore.user = { email: 'tenant@example.com' } as User;

        const wrapper = mount(TenantTopbar, { global: { plugins: [pinia] }, });

        await flushPromises();

        expect(wrapper.text()).toContain('tenant@example.com');
    });
});
