import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import PrivacyView from '../../src/views/PrivacyView.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

describe('PrivacyView', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(PrivacyView, {
      global: {
        components: {
          Card,
          Button,
        },
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <div class="p-card-title"><slot name="title" /></div>
                <div class="p-card-content"><slot name="content" /></div>
                <div class="p-card-footer"><slot name="footer" /></div>
              </div>
            `,
          },
          Button: {
            template: '<button class="p-button"><slot /></button>',
          },
        },
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

  it('navigates to home when the home button is clicked', async () => {
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.p-button').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/');
  });
});
