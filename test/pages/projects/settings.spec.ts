import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectSettingsPage from '@/pages/projects/[projectId]/settings.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123' } }),
  };
});

vi.mock('@/features/project/settings', () => ({
  ProjectSettingsView: {
    name: 'ProjectSettingsView',
    props: ['projectId'],
    template: '<div data-test="project-settings-view-stub" />',
  },
}));

describe('projects/[projectId]/settings.vue', () => {
  it('renders ProjectSettingsView', () => {
    const wrapper = mount(ProjectSettingsPage);
    expect(wrapper.find('[data-test="project-settings-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to ProjectSettingsView', () => {
    const wrapper = mount(ProjectSettingsPage);
    const view = wrapper.findComponent({ name: 'ProjectSettingsView' });
    expect(view.props('projectId')).toBe('project-123');
  });
});
