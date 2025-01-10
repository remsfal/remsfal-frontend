import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LegalNoticeView from '@/views/LegalNoticeView.vue';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { createRouter, createWebHistory } from 'vue-router';
import i18n from '../../src/i18n/i18n';

describe('LegalNoticeView.vue', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: { template: '<div>Home</div>' },
      },
      {
        path: '/legal',
        name: 'legal',
        component: LegalNoticeView,
      },
    ],
  });

  it('renders the legal notice', () => {
    const wrapper = mount(LegalNoticeView, {
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
              </div>
            `,
          },
          Button: true,
        },
      },
    });

    router.isReady().then(() => {
      expect(wrapper.text()).toContain('Impressum');
    });
  });

  it('navigates to home when the home button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push');

    const wrapper = mount(LegalNoticeView, {
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
              </div>
            `,
          },
          Button: {
            template: '<button class="p-button"><slot /></button>',
          },
        },
      },
    });

    await wrapper.find('.p-button').trigger('click');

    expect(pushSpy).toHaveBeenCalledWith('/');
  });
});
