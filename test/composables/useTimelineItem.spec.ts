import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import { useTimelineItem, type UseTimelineItemOptions } from '@/composables/useTimelineItem';
import type { TenantTimelineJson } from '@/composables/useTimeline';

const makeTimeline = (overrides: Partial<TenantTimelineJson> = {}): TenantTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const TestComponent = defineComponent({
  props: {
    item: { type: Object as () => TenantTimelineJson, required: true },
    issueId: { type: String, required: true },
    showSenderRole: { type: Boolean, default: false },
  },
  setup(props) {
    const options: UseTimelineItemOptions = {
      titleNamespace: 'tenantIssues.timeline',
      showSenderRole: props.showSenderRole,
    };
    return useTimelineItem(props, options);
  },
  template: '<div></div>',
});

const mountTimelineItem = (item: TenantTimelineJson, issueId = 'issue-1', showSenderRole = false) =>
  mount(TestComponent, {
    props: {
      item, issueId, showSenderRole 
    } 
  });

describe('useTimelineItem', () => {
  it.each([
    [
      {
        purpose: 'ISSUE_CREATED',
        senderName: 'Alex',
        issueId: 'issue-1',
      },
      'tenantIssues.timeline.issueCreatedTitle',
      { issueNumber: '1', senderName: 'Alex' },
    ],
    [
      { purpose: 'MESSAGE_SENT', senderName: 'Alex' },
      'tenantIssues.timeline.messageTitle',
      { senderName: 'Alex' },
    ],
    [
      { purpose: 'APPOINTMENT_REQUESTED', senderName: 'Alex' },
      'tenantIssues.timeline.appointmentRequestedTitle',
      { senderName: 'Alex' },
    ],
    [
      { purpose: 'APPOINTMENT_SCHEDULED', senderName: 'Alex' },
      'tenantIssues.timeline.appointmentScheduledTitle',
      { senderName: 'Alex' },
    ],
    [{ purpose: 'STATUS_CHANGED' }, 'tenantIssues.timeline.statusChangedTitle', undefined],
    [
      { purpose: 'QUOTATION_REQUESTED', senderName: 'Alex' },
      'tenantIssues.timeline.quotationRequestedTitle',
      { senderName: 'Alex' },
    ],
    [
      { purpose: 'ORDER_PLACED', senderName: 'Alex' },
      'tenantIssues.timeline.orderPlacedTitle',
      { senderName: 'Alex' },
    ],
    [{ purpose: 'UNKNOWN_PURPOSE' as TenantTimelineJson['purpose'] }, 'tenantIssues.timeline.entryFallbackTitle', undefined],
    [{ purpose: undefined }, 'tenantIssues.timeline.entryFallbackTitle', undefined],
  ] as [Partial<TenantTimelineJson>, string, Record<string, string> | undefined][])(
    'maps %o to the %s title',
    (overrides, key, params) => {
      const wrapper = mountTimelineItem(makeTimeline(overrides));

      expect(wrapper.vm.title).toBe(params ? i18n.global.t(key, params) : i18n.global.t(key));
    },
  );

  it('falls back to "not set" when senderName is missing', () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'MESSAGE_SENT', senderName: undefined }));

    expect(wrapper.vm.title).toBe(
      i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: i18n.global.t('common.notSet') }),
    );
  });

  it.each([
    ['MANAGER', 'Alex (Hausverwaltung)'],
    ['TENANT', 'Alex (Mieter)'],
    ['CONTRACTOR', 'Alex (Dienstleister)'],
  ] as const)('appends the %s sender role to the sender name when enabled', (senderRole, expected) => {
    const wrapper = mountTimelineItem(
      makeTimeline({
        purpose: 'MESSAGE_SENT', senderName: 'Alex', senderRole 
      }),
      'issue-1',
      true,
    );

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: expected }));
  });

  it('shows only the sender role when the sender name is missing', () => {
    const wrapper = mountTimelineItem(
      makeTimeline({
        purpose: 'MESSAGE_SENT', senderName: undefined, senderRole: 'MANAGER' 
      }),
      'issue-1',
      true,
    );

    expect(wrapper.vm.title).toBe(
      i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: 'Hausverwaltung' }),
    );
  });

  it('keeps the plain sender name when the entry has no sender role', () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'MESSAGE_SENT', senderName: 'Alex' }), 'issue-1', true);

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: 'Alex' }));
  });

  it('ignores the sender role unless showSenderRole is enabled', () => {
    const wrapper = mountTimelineItem(
      makeTimeline({
        purpose: 'MESSAGE_SENT', senderName: 'Alex', senderRole: 'MANAGER' 
      }),
    );

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: 'Alex' }));
  });

  it.each([
    ['WITHDRAWN', 'Zurückgezogen'],
    ['REJECTED', 'Abgelehnt'],
    ['CONFIRMED', 'Bestätigt'],
  ] as const)('translates a STATUS_CHANGED message of %s using the existing status i18n keys', (status, expected) => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'STATUS_CHANGED', message: status }));

    expect(wrapper.vm.message).toBe(expected);
  });

  it('falls back to the raw status when no matching status i18n key exists', () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'STATUS_CHANGED', message: 'SOME_UNKNOWN_STATUS' }));

    expect(wrapper.vm.message).toBe('SOME_UNKNOWN_STATUS');
  });

  it('leaves the message untouched for purposes other than STATUS_CHANGED', () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'MESSAGE_SENT', message: 'Hallo' }));

    expect(wrapper.vm.message).toBe('Hallo');
  });

  it('builds a normalized attachment list from the backend download URLs, ignoring entries without id or URL', () => {
    const wrapper = mountTimelineItem(makeTimeline({
      attachments: [
        {
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/backend/provided/att-1/report.pdf',
        },
        { fileName: 'missing-id.txt', downloadUrl: '/backend/provided/missing-id.txt' },
        { attachmentId: 'att-2', fileName: 'missing-url.txt' },
      ],
    }));

    expect(wrapper.vm.attachments).toEqual([
      {
        attachmentId: 'att-1',
        contentType: 'application/pdf',
        fileName: 'report.pdf',
        downloadUrl: '/backend/provided/att-1/report.pdf',
      },
    ]);
  });

  it('recomputes title and attachments when the item prop changes', async () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'STATUS_CHANGED' }));
    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));

    await wrapper.setProps({ item: makeTimeline({ purpose: 'MESSAGE_SENT', senderName: 'Alex' }) });

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: 'Alex' }));
  });
});
