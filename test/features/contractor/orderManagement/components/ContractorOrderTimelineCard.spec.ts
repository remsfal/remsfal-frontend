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
    const timelineList = { timelines: [makeTimeline()], visibleToTenant: false };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCardShallow();
    const result = await wrapper.getComponent(TimelineCard).props('load')();

    expect(contractorOrderTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(result).toEqual([makeTimeline()]);
  });

  it('disables the submit button while reloading after issueId changes', async () => {
    const timelineList = { timelines: [], visibleToTenant: false };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Entwurf');
    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeUndefined();

    let resolveSecondLoad: ((value: { timelines: never[]; visibleToTenant: boolean }) => void) | undefined;
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockReturnValueOnce(
      new Promise((resolve) => { resolveSecondLoad = resolve; }),
    );

    await wrapper.setProps({ issueId: 'issue-2' });

    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeDefined();

    resolveSecondLoad?.({ timelines: [], visibleToTenant: false });
    await flushPromises();
  });

  it('resets the recipient picker while reloading after issueId changes', async () => {
    const timelineList = { timelines: [], visibleToTenant: true };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-recipient-tenant"]').exists()).toBe(true);

    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockReturnValueOnce(
      new Promise(() => {}),
    );
    await wrapper.setProps({ issueId: 'issue-2' });

    expect(wrapper.find('[data-testid="timeline-recipient-tenant"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(true);
  });

  it('sends messages with attachments for the given issue', async () => {
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCardShallow();
    const send = wrapper.getComponent(TimelineCard).props('send');
    const files = [new File(['a'], 'a.pdf')];
    await send({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, files);

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      {
        purpose: 'MESSAGE_SENT', message: 'Hallo', messageToTenant: false
      },
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
      {
        purpose: 'MESSAGE_SENT', message: '', messageToTenant: false
      },
      files,
    );
  });

  it('sets messageToTenant to true when the tenant recipient button is clicked', async () => {
    const timelineList = { timelines: [], visibleToTenant: true };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);
    vi.mocked(contractorOrderTimelineService.createTimelineEntryWithAttachments).mockResolvedValueOnce();

    const wrapper = await mountCard();
    await flushPromises();

    await wrapper.get('[data-testid="timeline-recipient-tenant"]').trigger('click');
    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Hallo');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(contractorOrderTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      {
        purpose: 'MESSAGE_SENT', message: 'Hallo', messageToTenant: true
      },
      [],
    );
  });

  it('returns to the recipient picker when cancel is clicked', async () => {
    const timelineList = { timelines: [], visibleToTenant: true };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    await wrapper.get('[data-testid="timeline-recipient-manager"]').trigger('click');
    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Entwurf');
    await wrapper.get('[data-testid="timeline-message-cancel"]').trigger('click');

    expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="timeline-recipient-tenant"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="timeline-recipient-manager"]').exists()).toBe(true);
  });

  it('does not render a cancel button when the tenant cannot be messaged', async () => {
    const timelineList = { timelines: [], visibleToTenant: false };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-message-cancel"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="timeline-message-submit"]').exists()).toBe(true);
  });

  it('opens the composer immediately when the tenant cannot be messaged', async () => {
    const timelineList = { timelines: [], visibleToTenant: false };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-recipient-manager"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(true);
  });

  it('shows recipient buttons and hides the composer when the tenant can be messaged', async () => {
    const timelineList = { timelines: [], visibleToTenant: true };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

    const wrapper = await mountCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-recipient-tenant"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="timeline-recipient-manager"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(false);
  });

  it('renders ContractorOrderTimelineItemCard for each entry with item and requestId', async () => {
    const timeline = makeTimeline({ timelineId: 'abc' });
    const timelineList = { timelines: [timeline], visibleToTenant: false };
    vi.mocked(contractorOrderTimelineService.getTimelineEntries).mockResolvedValueOnce(timelineList);

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
