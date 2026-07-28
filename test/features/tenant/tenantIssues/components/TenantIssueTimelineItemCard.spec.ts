import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import type { TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import TenantIssueTimelineItemCard from '@/features/tenant/tenantIssues/components/TenantIssueTimelineItemCard.vue';

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (item: TimelineJson, issueId = 'issue-1') => {
  return mount(TenantIssueTimelineItemCard, {
    props: {
      item,
      issueId,
    },
  });
};

describe('TenantIssueTimelineItemCard component', () => {
  it.each([
    {
      name: 'renders non-image attachment tile and opens download',
      attachment: {
        attachmentId: 'att-1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
      expectedUrl:
        '/ticketing/v1/tenant-relations/issues/issue-1/attachments/att-1/report.pdf',
      expectedLabel: 'PDF',
    },
    {
      name: 'falls back to attachment id when filename is missing',
      attachment: { attachmentId: 'fallback-att', contentType: 'application/pdf' },
      expectedUrl:
        '/ticketing/v1/tenant-relations/issues/issue-1/attachments/fallback-att/fallback-att',
      expectedLabel: 'FILE',
    },
  ])('$name', async ({ attachment, expectedUrl, expectedLabel }) => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mountItemCard(makeTimeline({ attachments: [attachment] }));

    expect(wrapper.text()).toContain(expectedLabel);
    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('renders image attachments and triggers download from image action button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [
          {
            attachmentId: 'img-1',
            fileName: 'photo.jpg',
            contentType: 'image/jpeg',
          },
        ],
      }),
    );

    await wrapper.get('button.p-button').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue-1/attachments/img-1/photo.jpg',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('treats image extensions as images even without content type', () => {
    const wrapper = mountItemCard(
      makeTimeline({ attachments: [{ attachmentId: 'img-ext-1', fileName: 'photo.webp' }] }),
    );

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('WEBP');
  });

  it('shows FILE label for attachments without extension and ignores attachments without id', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [
          { attachmentId: 'file-1', fileName: 'README' },
          { fileName: 'missing-id.txt' },
        ],
      }),
    );

    expect(wrapper.text()).toContain('FILE');
    expect(wrapper.findAll('button.cursor-pointer')).toHaveLength(1);
  });

  it('renders purpose-based titles including fallback', () => {
    const wrappers = [
      mountItemCard(
        makeTimeline({
          purpose: 'ISSUE_CREATED',
          senderName: 'Alex',
          issueId: 'issue-1',
        }),
      ),
      mountItemCard(makeTimeline({ purpose: 'MESSAGE_SENT', senderName: 'Alex' })),
      mountItemCard(makeTimeline({ purpose: 'APPOINTMENT_REQUESTED', senderName: 'Alex' })),
      mountItemCard(makeTimeline({ purpose: 'APPOINTMENT_SCHEDULED', senderName: 'Alex' })),
      mountItemCard(makeTimeline({ purpose: 'STATUS_CHANGED' })),
      mountItemCard(makeTimeline({ purpose: 'UNKNOWN_PURPOSE' as TimelineJson['purpose'] })),
      mountItemCard(makeTimeline({ purpose: undefined })),
    ];

    const text = wrappers.map((wrapper) => wrapper.text()).join(' | ');
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.issueCreatedTitle', {
      issueNumber: '1',
      senderName: 'Alex',
    }));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: 'Alex' }));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentRequestedTitle', { senderName: 'Alex' }));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentScheduledTitle', { senderName: 'Alex' }));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.entryFallbackTitle'));
  });

  it('renders fallback date placeholder when createdAt is missing', () => {
    const wrapper = mountItemCard(makeTimeline({ createdAt: undefined }));

    expect(wrapper.find('[data-testid="tenant-issue-timeline-entry"]').text()).toContain(
      i18n.global.t('tenantIssues.timeline.tenantMessageTitle', { senderName: i18n.global.t('common.notSet') }),
    );
    expect(wrapper.find('.w-40').text()).toContain('-');
  });

  it('encodes issue, attachment and filename in generated download URL', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
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

    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue%20id%2F%C3%A4/attachments/att%20id%2F1/file%20name%20%231.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });
});
