import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EmailLoginForm from '@/features/common/authentication/components/EmailLoginForm.vue';

describe('EmailLoginForm', () => {
  it('prefills the email field with the initial email', () => {
    const wrapper = mount(EmailLoginForm, { props: { initialEmail: 'user@example.com' } });
    const input = wrapper.find<HTMLInputElement>('[data-test="login-email-input"]');
    expect(input.element.value).toBe('user@example.com');
    expect(input.attributes('autocomplete')).toBe('email');
  });

  it('emits the trimmed email on submit', async () => {
    const wrapper = mount(EmailLoginForm);
    await wrapper.find('[data-test="login-email-input"]').setValue('  user@example.com ');
    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.emitted('submit')).toEqual([['user@example.com']]));
  });

  it('shows a validation error and does not emit for an invalid email', async () => {
    const wrapper = mount(EmailLoginForm);
    await wrapper.find('[data-test="login-email-input"]').setValue('not-an-email');
    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.text()).toContain('gültige E-Mail'));
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('shows the server error message', () => {
    const wrapper = mount(EmailLoginForm, { props: { error: 'Zu viele Anfragen.' } });
    expect(wrapper.find('[data-test="login-email-error"]').text()).toBe('Zu viele Anfragen.');
  });
});
