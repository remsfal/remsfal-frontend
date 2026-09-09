import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VerifyAdditionalEmailView from '@/features/common/users/views/VerifyAdditionalEmailView.vue';
import { authService } from '@/services/AuthService';
import router from '@/router';

vi.mock('@/services/AuthService', () => ({ authService: { verifyAdditionalEmail: vi.fn() } }));

describe('VerifyAdditionalEmailView', () => {
  beforeEach(() => {
    vi.mocked(authService.verifyAdditionalEmail).mockReset();
  });

  it('shows a loading state before the verification call resolves', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: { token: 'valid-token' } });
    vi.mocked(authService.verifyAdditionalEmail).mockReturnValue(new Promise(() => {}));

    const wrapper = mount(VerifyAdditionalEmailView);

    expect(wrapper.text()).toContain('Deine E-Mail-Adresse wird bestätigt');
  });

  it('shows a success message when the token is verified', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: { token: 'valid-token' } });
    vi.mocked(authService.verifyAdditionalEmail).mockResolvedValue(true);

    const wrapper = mount(VerifyAdditionalEmailView);
    await flushPromises();

    expect(authService.verifyAdditionalEmail).toHaveBeenCalledWith('valid-token');
    expect(wrapper.text()).toContain('erfolgreich bestätigt');
  });

  it('shows an error message when the backend rejects the token', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: { token: 'expired-token' } });
    vi.mocked(authService.verifyAdditionalEmail).mockResolvedValue(false);

    const wrapper = mount(VerifyAdditionalEmailView);
    await flushPromises();

    expect(wrapper.text()).toContain('konnte nicht bestätigt werden');
  });

  it('shows an error message when the verification call throws', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: { token: 'valid-token' } });
    vi.mocked(authService.verifyAdditionalEmail).mockRejectedValue(new Error('network error'));

    const wrapper = mount(VerifyAdditionalEmailView);
    await flushPromises();

    expect(wrapper.text()).toContain('konnte nicht bestätigt werden');
  });

  it('shows an error message and skips the API call when no token is present', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: {} });

    const wrapper = mount(VerifyAdditionalEmailView);
    await flushPromises();

    expect(authService.verifyAdditionalEmail).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('konnte nicht bestätigt werden');
  });

  it('renders a link back to the account settings', async () => {
    await router.push({ name: 'VerifyAdditionalEmail', query: { token: 'valid-token' } });
    vi.mocked(authService.verifyAdditionalEmail).mockResolvedValue(true);

    const wrapper = mount(VerifyAdditionalEmailView);
    await flushPromises();

    const link = wrapper.find('a[href="/manager/account-data"]');
    expect(link.exists()).toBe(true);
  });
});
