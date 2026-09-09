import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VerifyAdditionalEmailPage from '@/pages/verify-additional-email.vue';

vi.mock('@/features/common/users', () => ({
  VerifyAdditionalEmailView: {
    name: 'VerifyAdditionalEmailView',
    template: '<div data-test="verify-additional-email-view-stub" />',
  },
}));

describe('verify-additional-email.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(VerifyAdditionalEmailPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders VerifyAdditionalEmailView', () => {
    const wrapper = mount(VerifyAdditionalEmailPage);
    expect(wrapper.find('[data-test="verify-additional-email-view-stub"]').exists()).toBe(true);
  });
});
