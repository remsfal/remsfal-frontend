import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import TenantIssueSummaryCard from '@/features/tenant/tenantIssues/components/TenantIssueSummaryCard.vue';
import type { IssueJson } from '@/services/IssueService';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: ref('de-DE'),
  }),
}));

describe('TenantIssueSummaryCard.vue', () => {
  const baseIssue: IssueJson = {
    id: 'issue-42',
    title: 'Wasserschaden Küche',
    status: 'OPEN',
    type: 'DEFECT',
    description: 'Wasser tropft aus dem Rohr',
  };

  function mountCard(overrides: Partial<IssueJson> = {}, deletingIssue = false) {
    return mount(TenantIssueSummaryCard, {
      props: {
        issue: {
          ...baseIssue,
          ...overrides,
        },
        deletingIssue,
      },
    });
  }

  it('renders title, issue number and node id tag', () => {
    const wrapper = mountCard();

    expect(wrapper.text()).toContain('Wasserschaden Küche');
    expect(wrapper.text()).toContain('issue-42');
    expect(wrapper.text()).toContain('42');
  });

  it('emits cancel when clicking cancel button', async () => {
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it.each([
    ['TERMINATION', 'OPEN'],
    ['DEFECT', 'CLOSED'],
    ['DEFECT', 'REJECTED'],
  ] as const)('hides cancel button for type %s and status %s', (type, status) => {
    const wrapper = mountCard({ type, status });

    expect(wrapper.find('[data-testid="tenant-issue-cancel"]').exists()).toBe(false);
  });

  it('filters Verursacher/Ort lines from description', () => {
    const wrapper = mountCard({ description: 'Verursacher: Unbekannt\nOrt: Küche\nWasser tropft aus dem Rohr' });

    expect(wrapper.text()).toContain('Wasser tropft aus dem Rohr');
    expect(wrapper.text()).not.toContain('Verursacher: Unbekannt');
    expect(wrapper.text()).not.toContain('Ort: Küche');
  });

  it('hides description block when only filtered description lines exist', () => {
    const wrapper = mountCard({ description: 'Verursacher: Unbekannt\nOrt: Küche' });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.description');
  });

  it('renders invalid modifiedAt as raw value', () => {
    const wrapper = mountCard({ modifiedAt: 'invalid-modified-at' });

    expect(wrapper.text()).toContain('invalid-modified-at');
  });
});
