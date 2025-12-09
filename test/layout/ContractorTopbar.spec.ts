import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ContractorTopbar from '../../src/layout/ContractorTopbar.vue';
import { useUserSessionStore } from '../../src/stores/UserSession';

// Router mock
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Mock platform helper (since TopbarUserActions uses it)
vi.mock('../../src/helper/platform', () => ({
    shouldShowDevLogin: vi.fn().mockReturnValue(false),
}));

describe('ContractorTopbar.vue', () => {
    it('should render TopbarUserActions', async () => {
        const pinia = createTestingPinia({ stubActions: false });
        const userStore = useUserSessionStore(pinia);
        userStore.user = { email: 'contractor@example.com' } as any;

        const wrapper = mount(ContractorTopbar, {
            global: { plugins: [pinia] },
        });

        await flushPromises();

        expect(wrapper.text()).toContain('contractor@example.com');
    });
});
