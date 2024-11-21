import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LegalNoticeView from '@/views/LegalNoticeView.vue';
import PrimeVue from 'primevue/config';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { createRouter, createWebHistory } from 'vue-router';

describe('LegalNoticeView.vue', () => {
  it('renders the legal notice', () => {
    // Create router with necessary routes
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        },
        {
          path: '/legal',
          name: 'legal',
          component: LegalNoticeView
        }
      ]
    });

    const wrapper = mount(LegalNoticeView, {
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
              </div>
            `
          },
          Button: true
        }
      }
    });

    // Wait for router to be ready before making assertions
    router.isReady().then(() => {
      expect(wrapper.text()).toContain('Impressum');
    });
  });
});