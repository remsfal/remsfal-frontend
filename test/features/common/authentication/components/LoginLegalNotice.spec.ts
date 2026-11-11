import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginLegalNotice from '@/features/common/authentication/components/LoginLegalNotice.vue';

describe('LoginLegalNotice', () => {
  it('renders the legal notice of the login page', () => {
    const wrapper = mount(LoginLegalNotice);
    expect(wrapper.find('[data-test="login-legal-notice"]').text())
      .toContain('Datenschutz- und Nutzungsbestimmungen');
  });
});
