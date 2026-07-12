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

  const mountCard = async (issue: IssueItemJson) => {
    const { default: TenantIssueCard } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueCard.vue'
    );

    return mount(TenantIssueCard, { props: { issue } });
  };

  it('renders title and shows only uuid node as issue tag', async () => {
    const wrapper = await mountCard(baseIssue);

    expect(wrapper.text()).toContain('Heizung defekt');
    expect(wrapper.text()).toContain('2c963f66afa6');
    expect(wrapper.text()).not.toContain('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('renders node tag even when id is missing', async () => {
    const wrapper = await mountCard({
      ...baseIssue,
      id: undefined,
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(3);
    expect(tags[0].props('value')).toBeUndefined();
  });

  it('uses expected tag severities for node, status and type', async () => {
    const wrapper = await mountCard(baseIssue);

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(3);
    expect(tags[0].props('severity')).toBe('info');
    expect(tags[1].props('severity')).toBe('warn');
    expect(tags[2].props('severity')).toBe('info');
  });

  it('hides updated tag when modifiedAt is missing', async () => {
    const wrapper = await mountCard(baseIssue);

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(3);
    expect(tags.some(tag => String(tag.props('value')).includes('Aktualisiert am:'))).toBe(false);
  });

  it('renders updated tag with raw modifiedAt for invalid date', async () => {
    const modifiedAt = 'invalid-date';
    const wrapper = await mountCard({
      ...baseIssue,
      modifiedAt,
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(4);
    expect(tags[1].props('value')).toBe(`Aktualisiert am: ${modifiedAt}`);
  });

  it('renders updated tag with localized date for valid modifiedAt', async () => {
    const modifiedAt = '2026-01-02T00:00:00.000Z';
    const wrapper = await mountCard({
      ...baseIssue,
      modifiedAt,
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags).toHaveLength(4);
    expect(String(tags[1].props('value')).startsWith('Aktualisiert am: ')).toBe(true);
    expect(String(tags[1].props('value'))).not.toContain(modifiedAt);
  });

  it.each([
    ['IN_PROGRESS', 'warn'],
    ['CLOSED', 'success'],
    ['REJECTED', 'secondary'],
    [undefined, 'secondary'],
  ] as const)('maps status %s to severity %s', async (status, expectedSeverity) => {
    const wrapper = await mountCard({
      ...baseIssue,
      status,
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags[2].props('severity')).toBe(expectedSeverity);
  });

  it.each([
    ['IN_PROGRESS', 'In Bearbeitung'],
    ['CLOSED', 'Abgeschlossen'],
    ['REJECTED', 'Abgelehnt'],
  ] as const)('maps status %s to translated label', async (status, expectedLabel) => {
    const wrapper = await mountCard({
      ...baseIssue,
      status,
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags[2].props('value')).toBe(expectedLabel);
  });

  it('falls back to raw status label for unknown status values', async () => {
    const wrapper = await mountCard({
      ...baseIssue,
      status: 'UNKNOWN' as IssueItemJson['status'],
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags[2].props('value')).toBe('UNKNOWN');
  });

  it('emits select when the card is clicked', async () => {
    const wrapper = await mountCard(baseIssue);

    await wrapper.get('[data-testid="tenant-issue-card"]').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
  });
});
