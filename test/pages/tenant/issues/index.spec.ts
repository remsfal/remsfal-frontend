import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TenantIssueOverviewPage from '@/pages/tenant/issues/index.vue';

vi.mock('@/features/tenant/tenantIssues', () => ({
  TenantIssueList: {
    name: 'TenantIssueList',
    template: '<div data-test="tenant-issue-list-stub" />',
  },
}));

describe('tenant/issues/index.vue', () => {
  it('renders TenantIssueList', () => {
    const wrapper = mount(TenantIssueOverviewPage);
    expect(wrapper.find('[data-test="tenant-issue-list-stub"]').exists()).toBe(true);
  });
});
