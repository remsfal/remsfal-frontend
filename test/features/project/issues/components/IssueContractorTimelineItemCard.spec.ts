import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import type { ContractorTimelineJson } from '@/features/project/issues/services/ContractorTimelineService';
import IssueContractorTimelineItemCard from '@/features/project/issues/components/IssueContractorTimelineItemCard.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';

const makeTimeline = (overrides: Partial<ContractorTimelineJson> = {}): ContractorTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountItemCard = (item: ContractorTimelineJson, issueId = 'issue-1') =>
  shallowMount(IssueContractorTimelineItemCard, { props: { item, issueId } });

const entryCardProps = (wrapper: ReturnType<typeof mountItemCard>) =>
  wrapper.getComponent(TimelineEntryCard).props();

describe('IssueContractorTimelineItemCard component', () => {
  it('passes date, message and testId through to TimelineEntryCard', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ message: 'Hallo' })));

    expect(props.date).toBe('2026-01-02T10:00:00.000Z');
    expect(props.message).toBe('Hallo');
    expect(props.testId).toBe('issue-contractor-timeline-entry');
  });

  it.each([
    ['ISSUE_CREATED', 'Meldung von Contractor GmbH erstellt'],
    ['MESSAGE_SENT', 'Nachricht von Contractor GmbH'],
    ['APPOINTMENT_REQUESTED', 'Terminanfrage von Contractor GmbH'],
    ['APPOINTMENT_SCHEDULED', 'Terminankündigung von Contractor GmbH'],
    ['QUOTATION_REQUESTED', 'Angebotsanfrage von Contractor GmbH gesendet'],
    ['ORDER_PLACED', 'Auftrag von Contractor GmbH vergeben'],
  ] as const)('titles a %s entry', (purpose, expectedTitle) => {
    const props = entryCardProps(
      mountItemCard(makeTimeline({ purpose, senderName: 'Contractor GmbH' })),
    );

    expect(props.title).toBe(expectedTitle);
  });

  it('titles a STATUS_CHANGED entry without a sender name', () => {
    const props = entryCardProps(mountItemCard(makeTimeline({ purpose: 'STATUS_CHANGED' })));

    expect(props.title).toBe('Status geändert');
  });

  it.each([
    ['WITHDRAWN', 'Zurückgezogen'],
    ['REJECTED', 'Abgelehnt'],
    ['CONFIRMED', 'Bestätigt'],
  ] as const)(
    'translates a STATUS_CHANGED message of %s using the existing status i18n keys',
    (status, expectedMessage) => {
      const props = entryCardProps(mountItemCard(makeTimeline({ purpose: 'STATUS_CHANGED', message: status })));

      expect(props.message).toBe(expectedMessage);
    },
  );

  it('falls back to the raw status when no matching status i18n key exists', () => {
    const props = entryCardProps(
      mountItemCard(makeTimeline({ purpose: 'STATUS_CHANGED', message: 'SOME_UNKNOWN_STATUS' })),
    );

    expect(props.message).toBe('SOME_UNKNOWN_STATUS');
  });

  it.each([
    ['QUOTATION_REQUEST', 'quotation-request'],
    ['QUOTATION', 'quotations'],
    ['ORDER_PLACEMENT', 'orders'],
  ] as const)('builds a %s attachment download URL under the %s path', (processPhase, segment) => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf', processPhase, processId: 'proc-1',
        }],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: `/ticketing/v1/issues/issue-1/${segment}/proc-1/attachments/att-1/report.pdf`,
      }),
    ]);
  });

  it('falls back to the attachment id as filename for process-scoped attachments', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [{
          attachmentId: 'fallback-att', contentType: 'application/pdf', processPhase: 'QUOTATION_REQUEST', processId: 'proc-1',
        }],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'fallback-att',
        downloadUrl: '/ticketing/v1/issues/issue-1/quotation-request/proc-1/attachments/fallback-att/fallback-att',
      }),
    ]);
  });

  it('falls back to the generic issue attachments path when an attachment has no process phase/id', () => {
    const wrapper = mountItemCard(
      makeTimeline({
        attachments: [
          {
            attachmentId: 'att-1', fileName: 'report.pdf', contentType: 'application/pdf'
          },
        ],
      }),
    );

    expect(entryCardProps(wrapper).attachments).toEqual([
      expect.objectContaining({
        attachmentId: 'att-1',
        downloadUrl: '/ticketing/v1/issues/issue-1/attachments/att-1/report.pdf',
      }),
    ]);
  });
});
