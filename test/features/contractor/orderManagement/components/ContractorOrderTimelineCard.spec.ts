import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import TimelineCard from '@/components/common/TimelineCard.vue';
import FileUpload from 'primevue/fileupload';
import ContractorOrderTimelineItemCard from
  '@/features/contractor/orderManagement/components/ContractorOrderTimelineItemCard.vue';
import { contractorOrderTimelineService, type ContractorTimelineJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';
import { orderAttachmentService, type OrderAttachmentJson }
  from '@/features/contractor/orderManagement/services/OrderAttachmentService';

vi.mock('@/features/contractor/orderManagement/services/ContractorOrderTimelineService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/contractor/orderManagement/services/ContractorOrderTimelineService')
      >('@/features/contractor/orderManagement/services/ContractorOrderTimelineService');
  return {
    ...actual,
    contractorOrderTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntry: vi.fn(),
    },
  };
});

vi.mock('@/features/contractor/orderManagement/services/OrderAttachmentService', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/contractor/orderManagement/services/OrderAttachmentService')
      >('@/features/contractor/orderManagement/services/OrderAttachmentService');
  return {
    ...actual,
    orderAttachmentService: { uploadAttachments: vi.fn() },
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
  attachments: OrderAttachmentJson[];
}

const defaultProps: CardProps = {
  requestId: 'request-1',
  recipient: 'TENANT',
  title: 'Mieter-Kommunikation',
  attachments: [],
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

  it('sends a text-only message with the fixed recipient and no attachments', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntry).mockResolvedValueOnce();

    const wrapper = await mountCardShallow({ recipient: 'MANAGER' });
    const send = wrapper.getComponent(TimelineCard).props('send');
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, []);

    expect(orderAttachmentService.uploadAttachments).not.toHaveBeenCalled();
    expect(contractorOrderTimelineService.createTimelineEntry).toHaveBeenCalledWith('request-1', {
      purpose: 'MESSAGE_SENT',
      message: 'Hallo',
      recipient: 'MANAGER',
      attachmentIds: [],
    });
  });

  it('uploads files first, then creates the timeline entry with the returned attachmentIds', async () => {
    const uploaded: OrderAttachmentJson[] = [{ attachmentId: 'att-1', fileName: 'a.pdf' }];
    vi.mocked(orderAttachmentService.uploadAttachments).mockResolvedValueOnce(uploaded);
    vi.mocked(contractorOrderTimelineService.createTimelineEntry).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(orderAttachmentService.uploadAttachments).toHaveBeenCalledWith('request-1', files);
    expect(contractorOrderTimelineService.createTimelineEntry).toHaveBeenCalledWith('request-1', {
      purpose: 'MESSAGE_SENT',
      message: 'Hallo',
      recipient: 'TENANT',
      attachmentIds: ['att-1'],
    });
  });

  it('sends an empty message when only attachments are submitted', async () => {
    vi.mocked(orderAttachmentService.uploadAttachments).mockResolvedValueOnce([]);
    vi.mocked(contractorOrderTimelineService.createTimelineEntry).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    await send({ purpose: 'MESSAGE_SENT' }, [new File(['a'], 'a.pdf')]);

    expect(contractorOrderTimelineService.createTimelineEntry).toHaveBeenCalledWith('request-1', {
      purpose: 'MESSAGE_SENT',
      message: '',
      recipient: 'TENANT',
      attachmentIds: [],
    });
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

  it('renders ContractorOrderTimelineItemCard for each entry with item, requestId and attachmentsById', async () => {
    const timeline = makeTimeline({ timelineId: 'abc', attachmentIds: ['att-1'] });
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce({ timelines: [timeline] });

    const { default: ContractorOrderTimelineCard } = await import(
      '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue'
    );
    const wrapper = mount(ContractorOrderTimelineCard, {
      props: { ...defaultProps, attachments: [{ attachmentId: 'att-1', fileName: 'a.pdf' }] },
      global: { stubs: { ContractorOrderTimelineItemCard: true } },
    });
    await flushPromises();

    const itemCard = wrapper.getComponent(ContractorOrderTimelineItemCard);
    expect(itemCard.props('item')).toEqual(timeline);
    expect(itemCard.props('requestId')).toBe('request-1');
    expect(itemCard.props('attachmentsById').get('att-1')).toEqual({ attachmentId: 'att-1', fileName: 'a.pdf' });
  });
});
