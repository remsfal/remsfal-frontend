import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NewProjectView from '@/views/NewProjectView.vue';
import PrimeVue from "primevue/config";
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: { template: '<div>Landing Page</div>' }
    },
    {
      path: '/project/:projectId',
      name: 'ProjectDashboard',
      component: { template: '<div>Project Dashboard</div>' }
    },
    {
      path: '/projects',
      name: 'ProjectSelection',
      component: { template: '<div>Project Selection</div>' }
    }
  ]
});

// Initialize router
await router.push('/');
await router.isReady();

describe('Component', () => {
  test('renders NewProjectForm properly', async () => {
    const wrapper = mount(NewProjectView, {
      global: {
        plugins: [PrimeVue, router],
        stubs: {
          NewProjectForm: true
        }
      },
    });

    await router.isReady();
    expect(wrapper.exists()).toBe(true);
  });
});