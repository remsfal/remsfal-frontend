import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InputOtp from 'primevue/inputotp';
import EmailCodeForm from '@/features/common/authentication/components/EmailCodeForm.vue';

const defaultProps = { email: 'user@example.com', cooldownSeconds: 0 };

describe('EmailCodeForm', () => {
  it('shows the address the code was sent to', () => {
    const wrapper = mount(EmailCodeForm, { props: defaultProps });
    expect(wrapper.find('[data-test="login-code-sent-to"]').text()).toContain('user@example.com');
  });

  it('renders 8 one-time-code inputs', () => {
    const wrapper = mount(EmailCodeForm, { props: defaultProps });
    const inputs = wrapper.findAll('[data-test="login-code-input"] input');
    expect(inputs).toHaveLength(8);
    expect(inputs[0]!.attributes('autocomplete')).toBe('one-time-code');
  });

  it('auto-submits once the code is complete', async () => {
    const wrapper = mount(EmailCodeForm, { props: defaultProps });
    const otp = wrapper.findComponent(InputOtp);

    otp.vm.$emit('update:modelValue', '1234');
    expect(wrapper.emitted('submit')).toBeUndefined();

    otp.vm.$emit('update:modelValue', '12345678');
    expect(wrapper.emitted('submit')).toEqual([['12345678']]);
  });

  it('disables the submit button until the code is complete', async () => {
    const wrapper = mount(EmailCodeForm, { props: defaultProps });
    const submit = wrapper.find('[data-test="login-code-submit"]');
    expect(submit.attributes('disabled')).toBeDefined();

    wrapper.findComponent(InputOtp).vm.$emit('update:modelValue', '12345678');
    await wrapper.vm.$nextTick();
    expect(submit.attributes('disabled')).toBeUndefined();
  });

  it('does not submit while loading', () => {
    const wrapper = mount(EmailCodeForm, { props: { ...defaultProps, loading: true } });
    wrapper.findComponent(InputOtp).vm.$emit('update:modelValue', '12345678');
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('shows the countdown and disables resend during the cooldown', () => {
    const wrapper = mount(EmailCodeForm, { props: { ...defaultProps, cooldownSeconds: 42 } });
    const resend = wrapper.find('[data-test="login-code-resend"]');
    expect(resend.text()).toContain('42');
    expect(resend.attributes('disabled')).toBeDefined();
  });

  it('emits resend and changeEmail', async () => {
    const wrapper = mount(EmailCodeForm, { props: defaultProps });
    await wrapper.find('[data-test="login-code-resend"]').trigger('click');
    await wrapper.find('[data-test="login-code-change-email"]').trigger('click');
    expect(wrapper.emitted('resend')).toHaveLength(1);
    expect(wrapper.emitted('changeEmail')).toHaveLength(1);
  });

  it('shows the server error passed as i18n key', () => {
    const props = { ...defaultProps, error: 'login.email.errors.invalidCode' };
    const wrapper = mount(EmailCodeForm, { props });
    expect(wrapper.find('[data-test="login-code-error"]').text()).toContain('ungültig');
  });
});
