import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import ProjectForm from '@/components/NewProjectForm.vue'; // update the path accordingly
import ProjectService from '@/services/ProjectService';
import { createPinia, setActivePinia } from 'pinia'; // make sure these imports are correct
import PrimeVue from 'primevue/config';

vi.mock('@/services/ProjectService');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/projects',
      name: 'ProjectSelection',
      component: { template: '<div>Project Selection</div>' },
    },
    {
      path: '/project/:projectId',
      name: 'ProjectDashboard',
      component: { template: '<div>Project Dashboard</div>' },
    },
  ],
});

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper<any>;
  let pushSpy: ReturnType<typeof vi.spyOn>;
  let createProjectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    createProjectMock = vi.fn().mockResolvedValue({ id: 1, title: 'New Project' });
    ProjectService.mockImplementation(() => ({
      createProject: createProjectMock,
    }));

    wrapper = mount(ProjectForm, {
      global: {
        plugins: [router, pinia, PrimeVue],
      },
    });

    pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
  });

  it('should render form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('[id="value"]').exists()).toBe(true);
    expect(wrapper.find('label[for="value"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.find('button[type="reset"]').exists()).toBe(true);
  });

  it('should show error message if projectTitle exceeds maxLength', async () => {
    // await wrapper.setData({ projectTitle: 'a'.repeat(101) });
    await wrapper.findComponent('input[type="text"]').setValue('a'.repeat(101));
    expect(wrapper.find('.p-error').text()).toBe(
      'Der Projekttitel darf nicht mehr als 100 Zeichen lang sein',
    );
  });

  it('should call createProject and navigate to ProjectDashboard on valid submit', async () => {
    await wrapper.findComponent('input[type="text"]').setValue('Valid Project');
    await wrapper.find('form').trigger('submit.prevent');

    expect(createProjectMock).toHaveBeenCalledWith('Valid Project');
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: 1 },
    });
  });

  it('should navigate to ProjectSelection on abort', async () => {
    await wrapper.find('button[type="reset"]').trigger('click');

    expect(pushSpy).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
