import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantDetailPage from '@/pages/projects/[projectId]/tenants/[tenantId].vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123', tenantId: 'tenant-456' } }),
  };
});

vi.mock('@/views/project/TenantDetailView.vue', () => ({
  default: {
    name: 'TenantDetailView',
    props: ['projectId', 'tenantId'],
    template: '<div data-test="tenant-detail-view-stub" />',
  },
}));

describe('projects/[projectId]/tenants/[tenantId].vue', () => {
  it('renders TenantDetailView', () => {
    const wrapper = mount(TenantDetailPage);
    expect(wrapper.find('[data-test="tenant-detail-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId and tenantId from route params to TenantDetailView', () => {
    const wrapper = mount(TenantDetailPage);
    const view = wrapper.findComponent({ name: 'TenantDetailView' });
    expect(view.props('projectId')).toBe('project-123');
    expect(view.props('tenantId')).toBe('tenant-456');
  });
});
