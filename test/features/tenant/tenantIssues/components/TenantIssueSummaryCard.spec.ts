import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from 'primevue/tag';
import type { TenantIssueJson } from '@/services/TenantIssueService';
import TenantIssueSummaryCard from '@/features/tenant/tenantIssues/components/TenantIssueSummaryCard.vue';

describe('TenantIssueSummaryCard component', () => {
  const baseIssue: TenantIssueJson = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-1',
    location: 'Küche',
    description: 'Wasser tropft von der Decke',
  };

  const mountCard = (issue: TenantIssueJson = baseIssue, deletingIssue = false) => {
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

  it('uses fallback title when title is missing', () => {
    const wrapper = mountCard({
      ...baseIssue,
      title: '',
    });

    expect(wrapper.text()).toContain('Unbenannt');
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mountCard();

    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('renders cancel button label for cancellable issues', () => {
    const wrapper = mountCard();

    expect(wrapper.get('[data-testid="tenant-issue-cancel"]').text()).toContain('Vorgang schließen');
  });

  it('renders cancel button in title header after title/number block', () => {
    const wrapper = mountCard();
    const headerRow = wrapper.get('.border-b.border-gray-200.pb-4');
    const headerChildren = Array.from(headerRow.element.children);

    expect(headerChildren).toHaveLength(2);
    expect(headerChildren[0].tagName).toBe('DIV');
    expect(headerChildren[0].textContent).toContain('Heizung defekt');
    expect(headerChildren[0].textContent).toContain('Ticketnummer:');
    expect((headerChildren[1] as HTMLElement).dataset.testid).toBe('tenant-issue-cancel');
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

  it('uses full id as node label when id ends with separator', () => {
    const wrapper = mountCard({
      ...baseIssue,
      id: 'issue-',
    });

    const tags = wrapper.findAllComponents(Tag);

    expect(tags[0].props('value')).toBe('issue-');
  });

  it('uses full id as node label when id has no separator', () => {
    const wrapper = mountCard({
      ...baseIssue,
      id: 'issue42',
    });

    const tags = wrapper.findAllComponents(Tag);

    expect(tags[0].props('value')).toBe('issue42');
  });

  it('hides optional fields when values are empty', () => {
    const wrapper = mountCard({
      ...baseIssue,
      id: undefined,
      location: '   ',
      description: '',
      modifiedAt: undefined,
    });

    expect(wrapper.findAllComponents(Tag)).toHaveLength(2);
    expect(wrapper.text()).toContain(' —');
    expect(wrapper.text()).not.toContain('Küche');
    expect(wrapper.text()).not.toContain('Beschreibung:');
  });

  it('renders category label when category is set', () => {
    const wrapper = mountCard({
      ...baseIssue,
      category: 'GENERAL',
    });

    expect(wrapper.text()).toContain('Sonstiges');
  });

  it('hides category row when category is missing', () => {
    const wrapper = mountCard({
      ...baseIssue,
      category: undefined,
    });

    expect(wrapper.text()).not.toContain('Kategorie');
    expect(wrapper.text()).not.toContain('Sonstiges');
  });

  it('hides type row when type is missing', () => {
    const issueWithoutType = { ...baseIssue } as TenantIssueJson;
    delete (issueWithoutType as { type?: TenantIssueJson['type'] }).type;
    const wrapper = mountCard(issueWithoutType);

    expect(wrapper.findAllComponents(Tag)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Schaden');
  });

  it('hides status row when status is missing', () => {
    const wrapper = mountCard({
      ...baseIssue,
      status: undefined,
    });

    expect(wrapper.findAllComponents(Tag)).toHaveLength(2);
  });

  it('disables and shows loading state on cancel button while deleting', () => {
    const wrapper = mountCard(baseIssue, true);
    const cancelButton = wrapper.get('[data-testid="tenant-issue-cancel"]');

    expect(cancelButton.attributes('disabled')).toBeDefined();
    expect(cancelButton.classes()).toContain('p-button-loading');
  });

  it('cleans metadata lines case-insensitively and preserves regular lines', () => {
    const wrapper = mountCard({
      ...baseIssue,
      description: 'verursacher: Test\nORT: Flur\nLeitung tropft weiter',
    });

    const description = wrapper.get('span.whitespace-pre-line').text();

    expect(description).toBe('Leitung tropft weiter');
    expect(description).not.toContain('verursacher:');
    expect(description).not.toContain('ORT:');
  });
});
