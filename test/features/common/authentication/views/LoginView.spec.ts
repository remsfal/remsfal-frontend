import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import LoginView from '@/features/common/authentication/views/LoginView.vue';
import { authService } from '@/services/AuthService';

const loginMocks = vi.hoisted(() => ({
  loginWith: vi.fn(),
  loginDev: vi.fn(),
  showDevLogin: false,
}));

vi.mock('@/features/common/authentication/composables/useLogin', async () => {
  const { computed } = await import('vue');
  return {
    useLogin: () => ({
      loginWith: loginMocks.loginWith,
      loginDev: loginMocks.loginDev,
      showDevLogin: computed(() => loginMocks.showDevLogin),
    }),
  };
});

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginMocks.showDevLogin = false;
  });

  it('renders title and both provider buttons', async () => {
    const wrapper = mount(LoginView);
    await flushPromises();

    expect(wrapper.text()).toContain('Willkommen bei REMSFAL');
    expect(wrapper.find('[data-test="login-google"]').text()).toContain('Mit Google anmelden');
    expect(wrapper.find('[data-test="login-apple"]').text()).toContain('Mit Apple anmelden');
  });

  it('starts the Google login when the Google button is clicked', async () => {
    const wrapper = mount(LoginView);
    await wrapper.find('[data-test="login-google"]').trigger('click');
    expect(loginMocks.loginWith).toHaveBeenCalledWith('google');
  });

  it('starts the Apple login when the Apple button is clicked', async () => {
    const wrapper = mount(LoginView);
    await wrapper.find('[data-test="login-apple"]').trigger('click');
    expect(loginMocks.loginWith).toHaveBeenCalledWith('apple');
  });

  it('hides the dev login on web', () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find('[data-test="login-dev"]').exists()).toBe(false);
  });

  it('shows the dev login on native platforms', async () => {
    loginMocks.showDevLogin = true;
    const wrapper = mount(LoginView);
    expect(wrapper.find('[data-test="login-dev"]').exists()).toBe(true);
    await wrapper.find('[data-test="login-dev"]').trigger('click');
    expect(loginMocks.loginDev).toHaveBeenCalled();
  });

  it('shows the email login form below the provider buttons', () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find('[data-test="login-email-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="login-code-input"]').exists()).toBe(false);
  });

  it('switches to the code entry after requesting a code and back again', async () => {
    const spy = vi.spyOn(authService, 'requestEmailLoginCode').mockResolvedValue({ status: 'sent' });
    const wrapper = mount(LoginView);

    await wrapper.find('[data-test="login-email-input"]').setValue('user@example.com');
    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.find('[data-test="login-code-input"]').exists()).toBe(true));
    expect(spy).toHaveBeenCalledWith('user@example.com', 'de');
    expect(wrapper.find('[data-test="login-google"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="login-code-sent-to"]').text()).toContain('user@example.com');

    await wrapper.find('[data-test="login-code-change-email"]').trigger('click');
    expect(wrapper.find<HTMLInputElement>('[data-test="login-email-input"]').element.value)
      .toBe('user@example.com');
    spy.mockRestore();
  });

  it('links back to the landing page', () => {
    const wrapper = mount(LoginView);
    const link = wrapper.find('a[href="/"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Zurück zur Startseite');
  });
});
