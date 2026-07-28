import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantListPage from '@/pages/projects/[projectId]/tenants/index.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123' } }),
  };
});

vi.mock('@/features/project/rentalAgreements', () => ({
  TenantListView: {
    name: 'TenantListView',
    props: ['projectId'],
    template: '<div data-test="tenant-list-view-stub" />',
  },
}));

describe('projects/[projectId]/tenants/index.vue', () => {
  it('renders TenantListView', () => {
    const wrapper = mount(TenantListPage);
    expect(wrapper.find('[data-test="tenant-list-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to TenantListView', () => {
    const wrapper = mount(TenantListPage);
    const view = wrapper.findComponent({ name: 'TenantListView' });
    expect(view.props('projectId')).toBe('project-123');
  });
});
