import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Tag from 'primevue/tag';
import type { TenantIssueJson } from '@/features/tenant/tenantIssues/services/TenantIssueService';

describe('TenantIssueListItem component', () => {
  const baseIssue: TenantIssueJson = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-1',
    description: 'Die Heizung ist kalt.',
  };

  const mountCard = async (issue: TenantIssueJson, isLast = false) => {
    const { default: TenantIssueListItem } = await import(
      '@/features/tenant/tenantIssues/components/TenantIssueListItem.vue'
    );

    return mount(TenantIssueListItem, { props: { issue, isLast } });
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
      status: 'UNKNOWN' as TenantIssueJson['status'],
    });

    const tags = wrapper.findAllComponents(Tag);
    expect(tags[2].props('value')).toBe('UNKNOWN');
  });

  it('emits select when the row is clicked', async () => {
    const wrapper = await mountCard(baseIssue);

    await wrapper.get('[data-testid="tenant-issue-item"]').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  it('emits select when Enter is pressed on the row', async () => {
    const wrapper = await mountCard(baseIssue);

    await wrapper.get('[data-testid="tenant-issue-item"]').trigger('keydown.enter');

    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  it('uses the shared interactive-row styling without card shadow or lift effects', async () => {
    const wrapper = await mountCard(baseIssue);
    const row = wrapper.get('[data-testid="tenant-issue-item"]');

    expect(row.classes()).toContain('interactive-row');
    expect(row.classes()).toContain('border-surface');
    expect(wrapper.find('.p-card').exists()).toBe(false);
    expect(wrapper.html()).not.toContain('shadow');
  });

  it('omits the separator for the last row', async () => {
    const wrapper = await mountCard(baseIssue, true);

    expect(wrapper.get('[data-testid="tenant-issue-item"]').classes()).not.toContain('border-b');
  });

  it.each(['CLOSED', 'REJECTED'] as const)('strikes through and mutes the title of a %s issue', async (status) => {
    const wrapper = await mountCard({ ...baseIssue, status });

    const title = wrapper.get('.line-through');
    expect(title.text()).toBe('Heizung defekt');
    expect(title.classes()).toContain('text-muted-color');
  });

  it('does not strike through the title of an open issue', async () => {
    const wrapper = await mountCard(baseIssue);

    expect(wrapper.find('.line-through').exists()).toBe(false);
  });
});
