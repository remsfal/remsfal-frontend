import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TenantIssueListView from '@/features/tenant/tenantIssues/views/TenantIssueListView.vue';
import TenantIssueListCard from '@/features/tenant/tenantIssues/components/TenantIssueListCard.vue';

describe('TenantIssueListView', () => {
  it('renders the TenantIssueListCard', () => {
    const wrapper = shallowMount(TenantIssueListView);

    expect(wrapper.findComponent(TenantIssueListCard).exists()).toBe(true);
  });
});
