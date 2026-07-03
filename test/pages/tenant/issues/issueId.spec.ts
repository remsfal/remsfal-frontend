import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TenantIssueDetailsPage from '@/pages/tenant/issues/[issueId].vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { issueId: 'issue-123' }, }),
  };
});

vi.mock('@/features/tenant/tenantIssues', () => ({
  TenantIssueDetails: {
    name: 'TenantIssueDetails',
    props: ['issueId'],
    template: '<div data-test="tenant-issue-details-stub" />',
  },
}));

describe('tenant/issues/[issueId].vue', () => {
  it('renders TenantIssueDetails', () => {
    const wrapper = mount(TenantIssueDetailsPage);
    expect(wrapper.find('[data-test="tenant-issue-details-stub"]').exists()).toBe(true);
  });

  it('passes issueId from route params to TenantIssueDetails', () => {
    const wrapper = mount(TenantIssueDetailsPage);
    const details = wrapper.findComponent({ name: 'TenantIssueDetails' });
    expect(details.props('issueId')).toBe('issue-123');
  });
});
