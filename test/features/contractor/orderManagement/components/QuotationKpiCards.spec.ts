import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import QuotationKpiCards from '@/features/contractor/orderManagement/components/QuotationKpiCards.vue';
import KpiCard from '@/components/common/KpiCard.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const mockRequests: QuotationRequestJson[] = [
  {
    id: 'qr-1', status: 'REQUESTED', scopeOfWork: 'Dachrinne reparieren'
  },
  {
    id: 'qr-2', status: 'REQUESTED', scopeOfWork: 'Dach reparieren'
  },
  {
    id: 'qr-3', status: 'VIEWING_REQUIRED', scopeOfWork: 'Fenster prüfen'
  },
  {
    id: 'qr-4', status: 'CONSULTATION_REQUIRED', scopeOfWork: 'Heizung beraten'
  },
  {
    id: 'qr-5', status: 'SUBMITTED', scopeOfWork: 'Fassade streichen'
  },
  {
    id: 'qr-6', status: 'REJECTED', scopeOfWork: 'Garage bauen'
  },
];

describe('QuotationKpiCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountCard = () => mount(QuotationKpiCards);

  it('calls getContractorQuotationRequests on mount', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: mockRequests,});
    mountCard();
    await flushPromises();
    expect(quotationRequestService.getContractorQuotationRequests).toHaveBeenCalledOnce();
  });

  it('shows a loading skeleton for 4 cards while fetching', () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockReturnValue(new Promise(() => {}));
    const wrapper = mountCard();
    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(4);
    expect(cards.every((card) => card.props('loading'))).toBe(true);
  });

  it('renders one KpiCard per status with count > 0', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: mockRequests,});
    const wrapper = mountCard();
    await flushPromises();

    const cards = wrapper.findAllComponents(KpiCard);
    expect(cards).toHaveLength(4);

    expect(cards[0]!.props('title')).toBe('Angefragt');
    expect(cards[0]!.props('value')).toBe(2);
    expect(cards[1]!.props('title')).toBe('Besichtigung erforderlich');
    expect(cards[1]!.props('value')).toBe(1);
    expect(cards[2]!.props('title')).toBe('Beratung erforderlich');
    expect(cards[2]!.props('value')).toBe(1);
    expect(cards[3]!.props('title')).toBe('Eingereicht');
    expect(cards[3]!.props('value')).toBe(1);
  });

  it('does not render a card for a status with zero count', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({
      items: [{
        id: 'qr-1', status: 'REQUESTED', scopeOfWork: 'Test'
      }],
    });
    const wrapper = mountCard();
    await flushPromises();

    const titles = wrapper.findAllComponents(KpiCard).map((card) => card.props('title'));
    expect(titles).toEqual(['Angefragt']);
  });

  it('shows an empty-state message when there are no requests at all', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: [],});
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
    expect(wrapper.text()).toContain('Sie haben keine eingehenden Angebotsanfragen.');
  });

  it('handles undefined items from the API gracefully as an empty state', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: undefined,});
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
    expect(wrapper.text()).toContain('Sie haben keine eingehenden Angebotsanfragen.');
  });

  it('shows an error toast and does not throw when the fetch fails', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockRejectedValue(new Error('Network'));
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(KpiCard).exists()).toBe(false);
  });
});
