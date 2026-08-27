import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import type { TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TenantIssueTimelineItemCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineItemCard.vue';
import TimelineEntryCard from '@/components/common/TimelineEntryCard.vue';

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (item: TimelineJson, issueId = 'issue-1') =>
  shallowMount(TenantIssueTimelineItemCard, { props: { item, issueId } });

const entryCardProps = (wrapper: ReturnType<typeof mountItemCard>) =>
  wrapper.getComponent(TimelineEntryCard).props();

describe('TenantIssueTimelineItemCard component', () => {
  it('passes date, message and testId through to TimelineEntryCard', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ message: 'Hallo' })));

    expect(props.date).toBe('2026-01-02T10:00:00.000Z');
    expect(props.message).toBe('Hallo');
    expect(props.testId).toBe('tenant-issue-timeline-entry');
  });

  it('renders purpose-based titles including fallback', () => {
    const titleFor = (overrides: Partial<TimelineJson>) =>
      entryCardProps(mountItemCard(makeTimeline(overrides))).title;

    expect(titleFor({
      purpose: 'ISSUE_CREATED',
      senderName: 'Alex',
      issueId: 'issue-1',
    })).toBe(
      i18n.global.t('tenantIssues.timeline.issueCreatedTitle', { issueNumber: '1', senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'MESSAGE_SENT', senderName: 'Alex' })).toBe(
      i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'APPOINTMENT_REQUESTED', senderName: 'Alex' })).toBe(
      i18n.global.t('tenantIssues.timeline.appointmentRequestedTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'APPOINTMENT_SCHEDULED', senderName: 'Alex' })).toBe(
      i18n.global.t('tenantIssues.timeline.appointmentScheduledTitle', { senderName: 'Alex' }),
    );
    expect(titleFor({ purpose: 'STATUS_CHANGED' })).toBe(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));
    expect(titleFor({ purpose: 'UNKNOWN_PURPOSE' as TimelineJson['purpose'] })).toBe(
      i18n.global.t('tenantIssues.timeline.entryFallbackTitle'),
    );
    expect(titleFor({ purpose: undefined })).toBe(i18n.global.t('tenantIssues.timeline.entryFallbackTitle'));
  });

  it('falls back to a "not set" sender name when none is given', () => {
    const title = entryCardProps(mountItemCard(makeTimeline({ purpose: 'MESSAGE_SENT', senderName: undefined }))).title;

    expect(title).toBe(
      i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: i18n.global.t('common.notSet') }),
    );
  });

  it('builds attachment download URLs, falling back to the attachment id as filename', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [
          {
            attachmentId: 'att-1',
            fileName: 'report.pdf',
            contentType: 'application/pdf',
          },
          { attachmentId: 'fallback-att', contentType: 'application/pdf' },
        ],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: '/ticketing/v1/tenant-relations/issues/issue-1/attachments/att-1/report.pdf',
      }),
      expect.objectContaining({
        attachmentId: 'fallback-att',
        downloadUrl: '/ticketing/v1/tenant-relations/issues/issue-1/attachments/fallback-att/fallback-att',
      }),
    ]);
  });

  it('ignores attachments without an id', () => {
    const wrapper = mountItemCard(makeTimeline({ attachments: [{ fileName: 'missing-id.txt' }] }));

    expect(entryCardProps(wrapper).attachments).toHaveLength(0);
  });

  it('encodes issue, attachment and filename in the generated download URL', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'att id/1',
          fileName: 'file name #1.pdf',
          contentType: 'application/pdf',
        }],
      }),
      'issue id/ä',
    );

    expect(entryCardProps(wrapper).attachments[0].downloadUrl).toBe(
      '/ticketing/v1/tenant-relations/issues/issue%20id%2F%C3%A4/attachments/att%20id%2F1/file%20name%20%231.pdf',
    );
  });
});
