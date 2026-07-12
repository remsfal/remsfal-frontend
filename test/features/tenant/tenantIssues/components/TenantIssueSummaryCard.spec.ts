import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from 'primevue/tag';
import type { IssueJson } from '@/services/IssueService';
import TenantIssueSummaryCard from '@/features/tenant/tenantIssues/components/TenantIssueSummaryCard.vue';

describe('TenantIssueSummaryCard component', () => {
  const baseIssue: IssueJson = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    location: 'Küche',
    description: 'Wasser tropft von der Decke',
  };

  const mountCard = (issue: IssueJson = baseIssue, deletingIssue = false) => {
    return mount(TenantIssueSummaryCard, {
      props: {
        issue,
        deletingIssue,
      },
    });
  };

  it('renders title, issue number and core tags', () => {
    const wrapper = mountCard();
    const tags = wrapper.findAllComponents(Tag);

    expect(wrapper.text()).toContain('Heizung defekt');
    expect(wrapper.text()).toContain('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(tags).toHaveLength(3);
    expect(tags[0].props('value')).toBe('2c963f66afa6');
    expect(tags[1].props('severity')).toBe('warn');
    expect(tags[2].props('severity')).toBe('info');
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it.each([
    [{ ...baseIssue, status: 'CLOSED' as const }],
    [{ ...baseIssue, status: 'REJECTED' as const }],
    [{ ...baseIssue, type: 'TERMINATION' as const }],
  ])('hides cancel button for non-cancellable issues', (issue) => {
    const wrapper = mountCard(issue);

    expect(wrapper.find('[data-testid="tenant-issue-cancel"]').exists()).toBe(false);
  });

  it('cleans description metadata lines', () => {
    const wrapper = mountCard({
      ...baseIssue,
      description: 'Verursacher: Max Mustermann\nOrt: Küche\nWasser tropft von der Decke',
    });

    const description = wrapper.get('span.whitespace-pre-line').text();

    expect(description).toBe('Wasser tropft von der Decke');
    expect(description).not.toContain('Verursacher:');
    expect(description).not.toContain('Ort:');
  });

  it('hides description block when only metadata lines are present', () => {
    const wrapper = mountCard({
      ...baseIssue,
      description: 'Verursacher: Max Mustermann\nOrt: Küche',
    });

    expect(wrapper.text()).not.toContain('Beschreibung:');
  });

  it('renders modified date tag as raw value for invalid date', () => {
    const wrapper = mountCard({
      ...baseIssue,
      modifiedAt: 'invalid-date',
    });

    const tags = wrapper.findAllComponents(Tag);

    expect(tags).toHaveLength(4);
    expect(tags[1].props('value')).toBe('invalid-date');
  });

  it('renders modified date tag localized for valid date', () => {
    const modifiedAt = '2026-01-02T00:00:00.000Z';
    const wrapper = mountCard({
      ...baseIssue,
      modifiedAt,
    });

    const tags = wrapper.findAllComponents(Tag);

    expect(tags).toHaveLength(4);
    expect(tags[1].props('value')).not.toBe(modifiedAt);
  });
});
