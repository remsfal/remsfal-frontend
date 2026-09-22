import { describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount, mount } from '@vue/test-utils';
import TimelineCard from '@/components/TimelineCard.vue';
import IssueContractorTimelineItemCard from '@/features/project/issues/components/IssueContractorTimelineItemCard.vue';
import { contractorTimelineService, type ContractorTimelineJson }
  from '@/features/project/issues/services/ContractorTimelineService';
import { quotationRequestService, type QuotationRequestJson }
  from '@/features/project/issues/services/QuotationRequestService';
import { setupResizeObserverMock } from '../../../../setup/issueTestHelpers';

// PrimeVue TabList relies on ResizeObserver, which JSDOM does not implement.
setupResizeObserverMock();

vi.mock('@/features/project/issues/services/ContractorTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/features/project/issues/services/ContractorTimelineService')>(
    '@/features/project/issues/services/ContractorTimelineService',
  );
  return {
    ...actual,
    contractorTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntryWithAttachments: vi.fn(),
    },
  };
});

vi.mock('@/features/project/issues/services/QuotationRequestService', async () => {
  const actual = await vi.importActual<typeof import('@/features/project/issues/services/QuotationRequestService')>(
    '@/features/project/issues/services/QuotationRequestService',
  );
  return {
    ...actual,
    quotationRequestService: {
      getQuotationRequests: vi.fn(),
      createQuotationRequest: vi.fn(),
    },
  };
});

const makeTimeline = (overrides: Partial<ContractorTimelineJson> = {}): ContractorTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const makeQuotationRequest = (overrides: Partial<QuotationRequestJson> = {}): QuotationRequestJson => ({
  id: 'qr-1',
  organizationId: 'org-1',
  contractorName: 'ACME GmbH',
  ...overrides,
});

const mountCardShallow = async (issueId = 'issue-1') => {
  const { default: IssueContractorTimelineCard } = await import(
    '@/features/project/issues/components/IssueContractorTimelineCard.vue'
  );
  const wrapper = shallowMount(IssueContractorTimelineCard, { props: { issueId } });
  await flushPromises();
  return wrapper;
};

const mountCardFull = async (issueId = 'issue-1') => {
  const { default: IssueContractorTimelineCard } = await import(
    '@/features/project/issues/components/IssueContractorTimelineCard.vue'
  );
  const wrapper = mount(IssueContractorTimelineCard, {
    props: { issueId },
    global: { stubs: { IssueContractorTimelineItemCard: true } },
  });
  await flushPromises();
  return wrapper;
};

describe('IssueContractorTimelineCard component', () => {
  it('enables sending as soon as a quotation request has been sent to exactly one contractor', async () => {
    vi.mocked(quotationRequestService.getQuotationRequests)
      .mockResolvedValueOnce({ items: [makeQuotationRequest()] });
    vi.mocked(contractorTimelineService.getTimelineEntries).mockResolvedValueOnce({
      timelines: [makeTimeline({ organizationId: 'org-1' })],
      visibleToTenant: false,
    });

    const wrapper = await mountCardShallow('issue-1');

    expect(quotationRequestService.getQuotationRequests).toHaveBeenCalledWith('issue-1');
    expect(wrapper.getComponent(TimelineCard).props('hideComposer')).toBe(false);

    const load = wrapper.getComponent(TimelineCard).props('load');
    expect(await load()).toEqual([makeTimeline({ organizationId: 'org-1' })]);
  });

  it('treats multiple quotation requests to the same organization as a single contractor', async () => {
    const items = [makeQuotationRequest({ id: 'qr-1' }), makeQuotationRequest({ id: 'qr-2' })];
    vi.mocked(quotationRequestService.getQuotationRequests).mockResolvedValueOnce({ items });
    vi.mocked(contractorTimelineService.getTimelineEntries)
      .mockResolvedValueOnce({ timelines: [], visibleToTenant: false });

    const wrapper = await mountCardShallow('issue-1');

    expect(wrapper.getComponent(TimelineCard).props('hideComposer')).toBe(false);
  });

  it('sends messages using the resolved organizationId', async () => {
    vi.mocked(quotationRequestService.getQuotationRequests)
      .mockResolvedValueOnce({ items: [makeQuotationRequest({ organizationId: 'org-9' })] });
    vi.mocked(contractorTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [], visibleToTenant: false });
    vi.mocked(contractorTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow('issue-1');
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(contractorTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      'org-9',
      { purpose: 'MESSAGE_SENT', message: 'Hallo' },
      files,
    );
  });

  it('hides the composer when no contractor has been requested yet', async () => {
    vi.mocked(quotationRequestService.getQuotationRequests).mockResolvedValueOnce({ items: [] });
    vi.mocked(contractorTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [], visibleToTenant: false });

    const wrapper = await mountCardFull('issue-1');

    expect(wrapper.getComponent(TimelineCard).props('hideComposer')).toBe(true);
  });

  it('shows one tab per requested contractor and scopes each timeline to its organization', async () => {
    const items = [
      makeQuotationRequest({
        id: 'qr-1',
        organizationId: 'org-1',
        contractorName: 'ACME GmbH',
      }),
      makeQuotationRequest({
        id: 'qr-2',
        organizationId: 'org-2',
        contractorName: 'Muster Bau',
      }),
    ];
    vi.mocked(quotationRequestService.getQuotationRequests).mockResolvedValueOnce({ items });
    vi.mocked(contractorTimelineService.getTimelineEntries).mockResolvedValue({
      timelines: [
        makeTimeline({ timelineId: 't-1', organizationId: 'org-1' }),
        makeTimeline({ timelineId: 't-2', organizationId: 'org-2' }),
      ],
      visibleToTenant: false,
    });

    const wrapper = await mountCardFull('issue-1');

    expect(wrapper.find('[data-testid="contractor-tab-org-1"]').text()).toBe('ACME GmbH');
    expect(wrapper.find('[data-testid="contractor-tab-org-2"]').text()).toBe('Muster Bau');

    const timelineCards = wrapper.findAllComponents(TimelineCard);
    expect(timelineCards).toHaveLength(2);
    expect(timelineCards[0].props('title')).toBe('ACME GmbH');
    expect(timelineCards[1].props('title')).toBe('Muster Bau');

    expect(await timelineCards[0].props('load')()).toEqual([makeTimeline({ timelineId: 't-1', organizationId: 'org-1' })]);
    expect(await timelineCards[1].props('load')()).toEqual([makeTimeline({ timelineId: 't-2', organizationId: 'org-2' })]);

    vi.mocked(contractorTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();
    await timelineCards[1].props('send')({ purpose: 'MESSAGE_SENT', message: 'Hi' }, []);
    expect(contractorTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      'org-2',
      { purpose: 'MESSAGE_SENT', message: 'Hi' },
      [],
    );
  });

  it('renders IssueContractorTimelineItemCard for each entry with item and issueId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc', organizationId: 'org-1' });
    vi.mocked(quotationRequestService.getQuotationRequests)
      .mockResolvedValueOnce({ items: [makeQuotationRequest()] });
    vi.mocked(contractorTimelineService.getTimelineEntries)
      .mockResolvedValueOnce({ timelines: [timeline], visibleToTenant: false });

    const { default: IssueContractorTimelineCard } = await import(
      '@/features/project/issues/components/IssueContractorTimelineCard.vue'
    );
    const wrapper = mount(IssueContractorTimelineCard, {
      props: { issueId: 'issue-1' },
      global: { stubs: { IssueContractorTimelineItemCard: true } },
    });
    await flushPromises();

    const itemCard = wrapper.getComponent(IssueContractorTimelineItemCard);
    expect(itemCard.props('item')).toEqual(timeline);
    expect(itemCard.props('issueId')).toBe('issue-1');
  });
});
