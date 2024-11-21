import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PrivacyView from '../../src/views/PrivacyView.vue';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { createRouter, createWebHistory } from 'vue-router';

describe('PrivacyView', () => {
  let wrapper;
  let router;

  beforeEach(async () => {
    // Create router with necessary routes
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        },
        {
          path: '/privacy',
          name: 'privacy',
          component: PrivacyView
        }
      ]
    });

    wrapper = mount(PrivacyView, {
      global: {
        plugins: [PrimeVue, router],
        components: {
          Card,
          Button
        },
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <div class="p-card-title"><slot name="title" /></div>
                <div class="p-card-content"><slot name="content" /></div>
                <div class="p-card-footer"><slot name="footer" /></div>
              </div>
            `
          },
          Button: true
        }
      }
    });

    // Wait for router to be ready
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
});