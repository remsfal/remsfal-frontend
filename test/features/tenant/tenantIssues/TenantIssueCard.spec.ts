import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from 'primevue/tag';
import type { IssueItemJson } from '@/services/IssueService';

describe('TenantIssueCard component', () => {
  const baseIssue: IssueItemJson = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
  };

  it('renders title and shows only uuid node as issue tag', async () => {
    const { default: TenantIssueCard } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueCard.vue'
    );
    const wrapper = mount(TenantIssueCard, { props: { issue: baseIssue } });

    expect(wrapper.text()).toContain('Heizung defekt');
    expect(wrapper.text()).toContain('2c963f66afa6');
    expect(wrapper.text()).not.toContain('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('uses expected tag severities for node, status and type', async () => {
    const { default: TenantIssueCard } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueCard.vue'
    );
    const wrapper = mount(TenantIssueCard, { props: { issue: baseIssue } });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(3);
    expect(tags[0].props('severity')).toBe('info');
    expect(tags[1].props('severity')).toBe('info');
    expect(tags[2].props('severity')).toBe('danger');
  });

  it('emits select when the card is clicked', async () => {
    const { default: TenantIssueCard } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueCard.vue'
    );
    const wrapper = mount(TenantIssueCard, { props: { issue: baseIssue } });

    await wrapper.get('[data-testid="tenant-issue-card"]').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
  });
});
