import { describe, expect, it, vi } from 'vitest';
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
  const issue: IssueJson = {
    id: 'issue-1234',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    description: 'Wasser tropft',
  };

  const mountComponent = (overrides: Partial<IssueJson> = {}, deletingIssue = false) => mount(
    TenantIssueSummaryCard,
    {
      props: {
        issue: { ...issue, ...overrides },
        deletingIssue,
      },
    },
  );

  it('renders issue title, full id and node id', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Heizung defekt');
    expect(wrapper.text()).toContain('issue-1234');
    expect(wrapper.text()).toContain('1234');
  });

  it('falls back to raw issue id when node id is empty after split', () => {
    const wrapper = mountComponent({ id: 'issue-' });

    expect(wrapper.text()).toContain('issue-');
  });

  it('hides issue node, type and status sections when values are missing', () => {
    const wrapper = mountComponent({
      id: undefined,
      type: undefined,
      status: undefined,
    });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.issueNode');
    expect(wrapper.text()).not.toContain('tenantIssues.card.type');
    expect(wrapper.text()).not.toContain('tenantIssues.filter.status');
  });

  it('renders location and category sections when values are present', () => {
    const wrapper = mountComponent({
      location: 'Küche',
      category: 'UNKNOWN' as NonNullable<IssueJson['category']>,
    });

    expect(wrapper.text()).toContain('tenantIssues.detail.location');
    expect(wrapper.text()).toContain('Küche');
    expect(wrapper.text()).toContain('tenantIssues.detail.category');
  });

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mountComponent();

    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it.each([
    ['TERMINATION', 'OPEN'],
    ['DEFECT', 'CLOSED'],
    ['DEFECT', 'REJECTED'],
  ] as const)('hides cancel button for type %s and status %s', (type, status) => {
    const wrapper = mountComponent({ type, status });

    expect(wrapper.find('[data-testid="tenant-issue-cancel"]').exists()).toBe(false);
  });

  it('shows cancel button for cancellable issues', () => {
    const wrapper = mountComponent({ type: 'DEFECT', status: 'OPEN' });

    expect(wrapper.find('[data-testid="tenant-issue-cancel"]').exists()).toBe(true);
  });

  it('disables cancel button while deleting', () => {
    const wrapper = mountComponent({}, true);

    expect(wrapper.get('[data-testid="tenant-issue-cancel"]').attributes('disabled')).toBeDefined();
  });

  it('removes Verursacher and Ort lines from description', () => {
    const wrapper = mountComponent({ description: 'Verursacher: unbekannt\nOrt: Küche\nWasser tropft aus dem Rohr' });

    expect(wrapper.text()).toContain('Wasser tropft aus dem Rohr');
    expect(wrapper.text()).not.toContain('Verursacher: unbekannt');
    expect(wrapper.text()).not.toContain('Ort: Küche');
  });

  it('trims cleaned description after filtering', () => {
    const wrapper = mountComponent({ description: '  \nVerursacher: X\n  Wasser tropft  \n' });

    expect(wrapper.text()).toContain('Wasser tropft');
    expect(wrapper.text()).not.toContain('Wasser tropft  ');
  });

  it('hides description section when only filtered lines exist', () => {
    const wrapper = mountComponent({ description: 'Verursacher: unbekannt\nOrt: Küche' });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.description');
  });

  it('hides description section when description is missing', () => {
    const wrapper = mountComponent({ description: undefined });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.description');
  });

  it('hides updated section when modifiedAt is missing', () => {
    const wrapper = mountComponent({ modifiedAt: undefined });

    expect(wrapper.text()).not.toContain('tenantIssues.detail.updated');
  });

  it('renders modifiedAt raw value when date is invalid', () => {
    const wrapper = mountComponent({ modifiedAt: 'invalid-date' });

    expect(wrapper.text()).toContain('invalid-date');
  });

  it('formats modifiedAt with locale when date is valid', () => {
    const modifiedAt = '2026-01-02T00:00:00.000Z';
    const wrapper = mountComponent({ modifiedAt });

    expect(wrapper.text()).toContain(new Date(modifiedAt).toLocaleDateString('de-DE'));
  });

  it('shows fallback title when title is missing', () => {
    const wrapper = mountComponent({ title: undefined });

    expect(wrapper.text()).toContain('tenantIssues.detail.untitled');
  });
});
