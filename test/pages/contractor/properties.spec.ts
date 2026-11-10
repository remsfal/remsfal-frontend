import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContractorPropertiesPage from '@/pages/contractor/properties.vue';
import { useProjectStore } from '@/features/common/projects/stores/ProjectStore';

vi.mock('@/features/manager/projects', () => ({
  ProjectsWelcomeMessage: {
    name: 'ProjectsWelcomeMessage',
    template: '<div data-test="welcome-message-stub" />',
  },
  ProjectSelectionView: {
    name: 'ProjectSelectionView',
    template: '<div data-test="project-selection-view-stub" />',
  },
}));

describe('contractor/properties.vue', () => {
  beforeEach(() => {
    useProjectStore().$reset();
  });

  it('renders the welcome message but no property list while the user has no property', () => {
    const wrapper = mount(ContractorPropertiesPage);
    expect(wrapper.find('[data-test="welcome-message-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="project-selection-view-stub"]').exists()).toBe(false);
  });

  it('renders the property list once the user has a property', () => {
    useProjectStore().projects = [{
      id: 'p-1', name: 'Musterliegenschaft', memberRole: 'MANAGER',
    }];
    const wrapper = mount(ContractorPropertiesPage);
    expect(wrapper.find('[data-test="project-selection-view-stub"]').exists()).toBe(true);
  });
});
