import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import TimelineCard from '@/components/common/TimelineCard.vue';
import FileUpload from 'primevue/fileupload';
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
  requestId: string;
  recipient: 'TENANT' | 'MANAGER';
  title: string;
}

const defaultProps: CardProps = {
  requestId: 'request-1',
  recipient: 'TENANT',
  title: 'Mieter-Kommunikation',
};

const mountCardShallow = async (props: Partial<CardProps> = {}) => {
  const { default: ContractorOrderTimelineCard } = await import(
    '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
  );
  return shallowMount(ContractorOrderTimelineCard, { props: { ...defaultProps, ...props } });
};

describe('ContractorOrderTimelineCard component', () => {
  it('loads timeline entries for the given request', async () => {
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce({timelines: [makeTimeline()],});

    const wrapper = await mountCardShallow();
    const result = await wrapper.getComponent(TimelineCard).props('load')();

    expect(contractorOrderTimelineService.getTimelineEntries).toHaveBeenCalledWith('request-1');
    expect(result).toEqual([makeTimeline()]);
  });

  it('sends messages with attachments for the given request and fixed recipient', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow({ recipient: 'MANAGER' });
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'request-1',
      {
        purpose: 'MESSAGE_SENT', message: 'Hallo', recipient: 'MANAGER' 
      },
      files,
    );
  });

  it('sends an empty message when only attachments are submitted', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT' }, files);

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'request-1',
      {
        purpose: 'MESSAGE_SENT', message: '', recipient: 'TENANT' 
      },
      files,
    );
  });

  it('does not render a FileUpload composer of its own (reuses the base TimelineCard one)', async () => {
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [] });

    const { default: ContractorOrderTimelineCard } = await import(
      '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
    );
    const wrapper = mount(ContractorOrderTimelineCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.findAllComponents(FileUpload)).toHaveLength(1);
  });

  it('renders ContractorOrderTimelineItemCard for each entry with item and requestId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc' });
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [timeline] });

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
