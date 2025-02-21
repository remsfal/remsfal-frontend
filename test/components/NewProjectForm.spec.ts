import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectForm from '../../src/components/NewProjectForm.vue'; // update the path accordingly
import { projectService } from '../../src/services/ProjectService';
import { useProjectStore } from '../../src/stores/ProjectStore';

vi.mock('@/services/ProjectService', { spy: true });

describe('NewProjectForm.vue', () => {
  let wrapper: VueWrapper;
  let pushSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.mocked(projectService.createProject).mockResolvedValue({ id: '1', title: 'Valid Project' });

    wrapper = mount(NewProjectForm);
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
    await wrapper.findComponent('input[type="text"]').setValue('a'.repeat(101));
    expect(wrapper.find('.p-error').text()).toBe(
      'Der Name der Liegenschaft darf nicht mehr als 100 Zeichen lang sein',
    );
  });

  it('should call createProject and navigate to ProjectDashboard on valid submit', async () => {
    await wrapper.findComponent('input[type="text"]').setValue('Valid Project');
    await wrapper.find('form').trigger('submit.prevent');

    const projectStore = useProjectStore();
    expect(projectService.createProject).toHaveBeenCalledWith('Valid Project');
    expect(projectStore.searchSelectedProject).toHaveBeenCalledWith('1');
    expect(pushSpy).toHaveBeenCalledWith({
      name: 'ProjectDashboard',
      params: { projectId: '1' },
    });
  });

  it('should navigate to ProjectSelection on abort', async () => {
    await wrapper.find('button[type="reset"]').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'ProjectSelection' });
  });
});
