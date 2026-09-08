import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import { useTimelineItem } from '@/composables/useTimelineItem';
import type { TimelineJson } from '@/composables/useTimeline';

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const TestComponent = defineComponent({
  props: {
    item: { type: Object as () => TimelineJson, required: true },
    issueId: { type: String, required: true },
  },
  setup(props) {
    return { ...useTimelineItem(props, '/base') };
  },
  template: '<div></div>',
});

const mountTimelineItem = (item: TimelineJson, issueId = 'issue-1') =>
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
      'tenantIssues.timeline.tenantMessageTitle',
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
    [{ purpose: 'UNKNOWN_PURPOSE' as TimelineJson['purpose'] }, 'tenantIssues.timeline.entryFallbackTitle', undefined],
    [{ purpose: undefined }, 'tenantIssues.timeline.entryFallbackTitle', undefined],
  ] as [Partial<TimelineJson>, string, Record<string, string> | undefined][])(
    'maps %o to the %s title',
    (overrides, key, params) => {
      const wrapper = mountTimelineItem(makeTimeline(overrides));

      expect(wrapper.vm.title).toBe(params ? i18n.global.t(key, params) : i18n.global.t(key));
    },
  );

  it('falls back to "not set" when senderName is missing', () => {
    const wrapper = mountTimelineItem(makeTimeline({ purpose: 'MESSAGE_SENT', senderName: undefined }));

    expect(wrapper.vm.title).toBe(
      i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: i18n.global.t('common.notSet') }),
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

    expect(wrapper.vm.title).toBe(i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: 'Alex' }));
  });
});
