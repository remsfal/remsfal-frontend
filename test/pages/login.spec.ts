import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '@/pages/login.vue';

vi.mock('@/features/common/authentication', () => ({
  LoginView: {
    name: 'LoginView',
    template: '<div data-test="login-view-stub" />',
  },
}));

describe('login.vue', () => {
  it('renders LoginView', () => {
    const wrapper = mount(LoginPage);
    expect(wrapper.find('[data-test="login-view-stub"]').exists()).toBe(true);
  });
});
