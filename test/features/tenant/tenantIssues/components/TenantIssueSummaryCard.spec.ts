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

  it('disables cancel button while deletion is in progress', () => {
    const wrapper = mountCard({}, true);
    const cancelButton = wrapper.get('[data-testid="tenant-issue-cancel"]');

    expect(cancelButton.attributes('disabled')).toBeDefined();
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

  it('renders valid modifiedAt as localized date', () => {
    const modifiedAt = '2026-01-02T00:00:00.000Z';
    const wrapper = mountCard({ modifiedAt });

    expect(wrapper.text()).toContain(new Date(modifiedAt).toLocaleDateString('de-DE'));
    expect(wrapper.text()).not.toContain(modifiedAt);
  });

  it('uses fallback title and hides issue-node block when issue id is missing', () => {
    const wrapper = mountCard({ id: undefined, title: undefined });

    expect(wrapper.text()).toContain('tenantIssues.detail.untitled');
    expect(wrapper.text()).toContain('tenantIssues.detail.number');
    expect(wrapper.findComponent({ name: 'Tag' }).exists()).toBe(true);
    expect(wrapper.text()).not.toContain('tenantIssues.detail.issueNode');
  });

  it('hides location row when location contains only whitespace', () => {
    const wrapper = mountCard({ location: '   ' });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.location');
  });

  it('renders location row when location is set', () => {
    const wrapper = mountCard({ location: 'Kueche EG' });

    expect(wrapper.text()).toContain('tenantIssues.detail.location');
    expect(wrapper.text()).toContain('Kueche EG');
  });

  it('renders category row when category is set', () => {
    const wrapper = mountCard({ category: 'WATER_DAMAGE' as IssueJson['category'] });

    expect(wrapper.text()).toContain('tenantIssues.detail.category');
    expect(wrapper.text()).toContain('WATER_DAMAGE');
  });
});
