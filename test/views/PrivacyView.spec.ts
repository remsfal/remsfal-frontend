import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PrivacyView from '../../src/views/PrivacyView.vue';
import PrimeVue from 'primevue/config';

describe('PrivacyView', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PrivacyView, {
      global: {
        plugins: [PrimeVue],
      },
    });
  });
  it('renders the title', () => {
    const title = wrapper.find('.p-card-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Datenschutzerklärung');
  });

  it('renders the content', () => {
    const content = wrapper.find('.p-card-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain(
      'Im Folgenden möchten wir Sie aufklären, wie Ihre Daten von uns verarbeitet werden.',
    );
    expect(content.text()).toContain('Verantwortlich im Sinne der DSGVO ist:');
    expect(content.text()).toContain('E-Mail: info@remsfal.de');
  });

  it('renders the footer', () => {
    const footer = wrapper.find('.p-card-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('open privacy by opr.vc');
  });
});
