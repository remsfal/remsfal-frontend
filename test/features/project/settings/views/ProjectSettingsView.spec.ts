import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectSettingsView from '@/features/project/settings/views/ProjectSettingsView.vue';

// ---- Test Suite ----
describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectSettingsView>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'test-project-id' },
      global: {
        stubs: {
          ProjectSettingsCard: true,
          BillingAddressCard: true,
          ProjectMemberSettingsCard: true,
          OrganizationMemberSettingsCard: true,
          ProjectDangerZoneCard: true,
        },
      },
    });

    await flushPromises();
  });

  test('renders ProjectSettingsCard component', () => {
    const projectSettings = wrapper.findComponent({ name: 'ProjectSettingsCard' });
    expect(projectSettings.exists()).toBe(true);
  });

  test('renders ProjectMemberSettingsCard component', () => {
    const memberSettings = wrapper.findComponent({ name: 'ProjectMemberSettingsCard' });
    expect(memberSettings.exists()).toBe(true);
  });

  test('renders BillingAddressCard component', () => {
    const billingAddressCard = wrapper.findComponent({ name: 'BillingAddressCard' });
    expect(billingAddressCard.exists()).toBe(true);
  });

  test('renders OrganizationMemberSettingsCard component', () => {
    const orgSettings = wrapper.findComponent({ name: 'OrganizationMemberSettingsCard' });
    expect(orgSettings.exists()).toBe(true);
  });

  test('renders ProjectDangerZoneCard component', () => {
    const dangerZoneCard = wrapper.findComponent({ name: 'ProjectDangerZoneCard' });
    expect(dangerZoneCard.exists()).toBe(true);
  });

  test('passes projectId to all child components', () => {
    const projectSettings = wrapper.findComponent({ name: 'ProjectSettingsCard' });
    const memberSettings = wrapper.findComponent({ name: 'ProjectMemberSettingsCard' });
    const billingAddressCard = wrapper.findComponent({ name: 'BillingAddressCard' });
    const orgSettings = wrapper.findComponent({ name: 'OrganizationMemberSettingsCard' });
    const dangerZoneCard = wrapper.findComponent({ name: 'ProjectDangerZoneCard' });

    expect(projectSettings.props('projectId')).toBe('test-project-id');
    expect(billingAddressCard.props('projectId')).toBe('test-project-id');
    expect(memberSettings.props('projectId')).toBe('test-project-id');
    expect(orgSettings.props('projectId')).toBe('test-project-id');
    expect(dangerZoneCard.props('projectId')).toBe('test-project-id');
  });
});
