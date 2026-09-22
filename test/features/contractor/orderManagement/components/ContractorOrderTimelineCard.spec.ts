import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import TimelineCard from '@/components/TimelineCard.vue';
import ContractorOrderTimelineItemCard from
  '@/features/contractor/orderManagement/components/ContractorOrderTimelineItemCard.vue';
import { contractorOrderTimelineService, type ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

vi.mock('@/features/contractor/orderManagement/services/ContractorOrderTimelineService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/contractor/orderManagement/services/ContractorOrderTimelineService')
      >('@/features/contractor/orderManagement/services/ContractorOrderTimelineService');
  return {
    ...actual,
    contractorOrderTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntryWithAttachments: vi.fn(),
    },
  };
});

const makeTimeline = (overrides: Partial<ContractorTimelineJson> = {}): ContractorTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  senderRole: 'CONTRACTOR',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

interface CardProps {
  issueId: string;
  requestId: string;
  title: string;
}

const defaultProps: CardProps = {
  issueId: 'issue-1',
  requestId: 'request-1',
  title: 'Mieter-Kommunikation',
};

const mountCardShallow = async (props: Partial<CardProps> = {}) => {
  const { default: ContractorOrderTimelineCard } = await import(
    '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
  );
  return shallowMount(ContractorOrderTimelineCard, { props: { ...defaultProps, ...props } });
};

const mountCard = async (props: Partial<CardProps> = {}) => {
  const { default: ContractorOrderTimelineCard } = await import(
    '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
  );
  return mount(ContractorOrderTimelineCard, { props: { ...defaultProps, ...props } });
};

describe('ContractorOrderTimelineCard component', () => {
  it('loads timeline entries for the given issue', async () => {
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce([makeTimeline()]);

    const wrapper = await mountCardShallow();
    const result = await wrapper.getComponent(TimelineCard).props('load')();

    expect(contractorOrderTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(result).toEqual([makeTimeline()]);
  });

  it('disables the submit button while reloading after issueId changes', async () => {
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce([]);

    const wrapper = await mountCard();
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Entwurf');
    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeUndefined();

    let resolveSecondLoad: ((value: never[]) => void) | undefined;
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockReturnValueOnce(
      new Promise((resolve) => { resolveSecondLoad = resolve; }),
    );

    await wrapper.setProps({ issueId: 'issue-2' });

    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeDefined();

    resolveSecondLoad?.([]);
    await flushPromises();
  });

  it('sends messages with attachments for the given issue', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hallo' },
      files,
    );
  });

  it('sends an empty message when only attachments are submitted', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: '' }, files);

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: '' },
      files,
    );
  });

  it('renders ContractorOrderTimelineItemCard for each entry with item and requestId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc' });
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce([timeline]);

    const { default: ContractorOrderTimelineCard } = await import(
      '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
    );
    const wrapper = mount(ContractorOrderTimelineCard, {
      props: defaultProps,
      global: { stubs: { ContractorOrderTimelineItemCard: true } },
    });
    await flushPromises();

    const itemCard = wrapper.getComponent(ContractorOrderTimelineItemCard);
    expect(itemCard.props('item')).toEqual(timeline);
    expect(itemCard.props('requestId')).toBe('request-1');
  });
});
