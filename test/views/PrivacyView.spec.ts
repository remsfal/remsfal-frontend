import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrivacyView from '../../src/views/PrivacyView.vue';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { createRouter, createWebHistory } from 'vue-router';
import i18n from '../../src/i18n/i18n';

describe('PrivacyView', () => {
  let wrapper;
  let router;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' },
        },
        {
          path: '/privacy',
          name: 'privacy',
          component: PrivacyView,
        },
      ],
    });

    wrapper = mount(PrivacyView, {
      global: {
        plugins: [PrimeVue, router, i18n],
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

    await router.isReady();
  });

  it('renders the title', async () => {
    const title = wrapper.find('.p-card-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Datenschutzerklärung');
  });

  it('renders the content', async () => {
    const content = wrapper.find('.p-card-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toContain(
      'Im Folgenden möchten wir Sie aufklären, wie Ihre Daten von uns verarbeitet werden.',
    );
    expect(content.text()).toContain('Verantwortlich im Sinne der DSGVO ist:');
    expect(content.text()).toContain('E-Mail: info@remsfal.de');
  });

  it('renders the footer', async () => {
    const footer = wrapper.find('.p-card-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('open privacy by opr.vc');
  });

  it('navigates to home when the home button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push');

    await wrapper.find('.p-button').trigger('click');

    expect(pushSpy).toHaveBeenCalledWith('/');
  });
});
