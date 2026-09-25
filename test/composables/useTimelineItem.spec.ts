import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import { buildAttachmentDownloadUrl, buildOrderAttachmentDownloadUrl, useTimelineItem } from '@/composables/useTimelineItem';
import type { OrderAttachmentJson } from '@/composables/useTimelineItem';
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
  },
  setup(props) {
    return {
      ...useTimelineItem(props, {
        titleNamespace: 'tenantIssues.timeline',
        buildAttachmentUrl: buildAttachmentDownloadUrl(`/base/${props.issueId}`),
      }),
    };
  },
  template: '<div></div>',
});

const mountTimelineItem = (item: TenantTimelineJson, issueId = 'issue-1') =>
  mount(TestComponent, { props: { item, issueId } });

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

  it('builds a normalized attachment list under the given base path, ignoring entries without an id', () => {
    const wrapper = mountTimelineItem(makeTimeline({
      attachments: [
        {
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
        },
        { fileName: 'missing-id.txt' },
      ],
    }));

    expect(wrapper.vm.attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        contentType: 'application/pdf',
        fileName: 'report.pdf',
        downloadUrl: '/base/issue-1/attachments/att-1/report.pdf',
      }),
    ]);
  });

  it('recomputes title and attachments when the item prop changes', async () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'STATUS_CHANGED' }));
    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));

    await wrapper.setProps({ item: makeTimeline({ purpose: 'MESSAGE_SENT', senderName: 'Alex' }) });

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.messageTitle', { senderName: 'Alex' }));
  });
});

describe('buildOrderAttachmentDownloadUrl', () => {
  const phaseSegments = {
    QUOTATION_REQUEST: 'quotation-request',
    QUOTATION: 'quotations',
    ORDER_PLACEMENT: 'orders',
  } as const;

  const makeAttachment = (overrides: Partial<OrderAttachmentJson> = {}): OrderAttachmentJson => ({
    attachmentId: 'att-1',
    fileName: 'report.pdf',
    processPhase: 'QUOTATION_REQUEST',
    processId: 'proc-1',
    ...overrides,
  });

  it.each([
    ['QUOTATION_REQUEST', 'quotation-request'],
    ['QUOTATION', 'quotations'],
    ['ORDER_PLACEMENT', 'orders'],
  ] as const)('builds the %s URL under the %s path segment', (processPhase, segment) => {
    const buildUrl = buildOrderAttachmentDownloadUrl('/base/issue-1', phaseSegments);

    expect(buildUrl(makeAttachment({ processPhase }))).toBe(
      `/base/issue-1/${segment}/proc-1/attachments/att-1/report.pdf`,
    );
  });

  it('falls back to the attachment id as filename when fileName is missing', () => {
    const buildUrl = buildOrderAttachmentDownloadUrl('/base/issue-1', phaseSegments);

    expect(buildUrl(makeAttachment({ fileName: undefined }))).toBe(
      '/base/issue-1/quotation-request/proc-1/attachments/att-1/att-1',
    );
  });

  it('encodes special characters in processId, attachmentId and fileName', () => {
    const buildUrl = buildOrderAttachmentDownloadUrl('/base/issue-1', phaseSegments);

    expect(buildUrl(makeAttachment({
      attachmentId: 'att 1/x', fileName: 'report ä.pdf', processId: 'proc 1/y',
    }))).toBe(
      '/base/issue-1/quotation-request/proc%201%2Fy/attachments/att%201%2Fx/report%20%C3%A4.pdf',
    );
  });

  it('falls back to the generic attachment URL when processPhase/processId are missing', () => {
    const buildUrl = buildOrderAttachmentDownloadUrl('/base/issue-1', phaseSegments);

    expect(buildUrl(makeAttachment({ processPhase: undefined, processId: undefined }))).toBe(
      '/base/issue-1/attachments/att-1/report.pdf',
    );
  });

  it('falls back to the generic attachment URL for a phase unknown to phaseSegments', () => {
    const buildUrl = buildOrderAttachmentDownloadUrl('/base/issue-1', phaseSegments);

    expect(
      buildUrl(makeAttachment({ processPhase: 'SOMETHING_NEW' as OrderAttachmentJson['processPhase'] })),
    ).toBe('/base/issue-1/attachments/att-1/report.pdf');
  });
});
