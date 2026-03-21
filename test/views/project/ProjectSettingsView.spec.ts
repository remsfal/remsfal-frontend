import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectSettingsView from '@/views/project/ProjectSettingsView.vue';

// ---- Test Suite ----
describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectSettingsView>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'test-project-id' },
      global: {
        stubs: {
          ProjectSettings: true,
          ProjectMemberSettings: true,
          ProjectDangerZoneCard: true,
        },
      },
    });

    await flushPromises();
  });

  test('renders ProjectSettings component', () => {
    const projectSettings = wrapper.findComponent({ name: 'ProjectSettings' });
    expect(projectSettings.exists()).toBe(true);
  });

  test('renders ProjectMemberSettings component', () => {
    const memberSettings = wrapper.findComponent({ name: 'ProjectMemberSettings' });
    expect(memberSettings.exists()).toBe(true);
  });

  test('renders ProjectDangerZoneCard component', () => {
    const dangerZoneCard = wrapper.findComponent({ name: 'ProjectDangerZoneCard' });
    expect(dangerZoneCard.exists()).toBe(true);
  });

  test('passes projectId to all child components', () => {
    const projectSettings = wrapper.findComponent({ name: 'ProjectSettings' });
    const memberSettings = wrapper.findComponent({ name: 'ProjectMemberSettings' });
    const dangerZoneCard = wrapper.findComponent({ name: 'ProjectDangerZoneCard' });

    expect(projectSettings.props('projectId')).toBe('test-project-id');
    expect(memberSettings.props('projectId')).toBe('test-project-id');
    expect(dangerZoneCard.props('projectId')).toBe('test-project-id');
  });
});
