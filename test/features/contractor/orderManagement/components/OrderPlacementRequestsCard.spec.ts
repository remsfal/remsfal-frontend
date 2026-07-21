import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OrderPlacementRequestsCard from '@/features/contractor/orderManagement/components/OrderPlacementRequestsCard.vue';
import { orderPlacementService, type OrderPlacementJson } from '@/services/OrderPlacementService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockPlacements: OrderPlacementJson[] = [
  {
    id: 'op-1',
    projectOwner: 'Musterfrau GmbH',
    status: 'PLACED',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'op-2',
    projectOwner: 'Beispiel AG',
    status: 'CONFIRMED',
    createdAt: '2026-01-16T10:00:00Z',
  },
];

describe('OrderPlacementRequestsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: mockPlacements });
  });

  const mountCard = () => mount(OrderPlacementRequestsCard);

  it('calls getOrderPlacements on mount', async () => {
    mountCard();
    await flushPromises();
    expect(orderPlacementService.getOrderPlacements).toHaveBeenCalledOnce();
  });

  it('renders card title "Anfragen zur Auftragserteilung"', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Anfragen zur Auftragserteilung');
  });

  it('shows only PLACED entries in the table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Musterfrau GmbH');
    expect(wrapper.text()).not.toContain('Beispiel AG');
  });

  it('renders translated status label for PLACED', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Angefragt');
  });

  it('shows empty message when no order placement requests exist', async () => {
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({
      items: [{
        id: 'op-1', status: 'CONFIRMED', projectOwner: 'Test' 
      }],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Anfragen zur Auftragserteilung vorhanden');
  });

  it('handles undefined items from API gracefully', async () => {
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: undefined });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('does not throw when getOrderPlacements fails', async () => {
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('confirms order placement and refetches on confirm button click', async () => {
    const updateSpy = vi.spyOn(orderPlacementService, 'updateOrderPlacementStatus')
      .mockResolvedValue({ id: 'op-1', status: 'CONFIRMED' });
    const wrapper = mountCard();
    await flushPromises();

    const getPlacementsSpy = vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });
    const button = wrapper.findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Bestätigen'));
    await button!.trigger('click');
    await flushPromises();

    expect(updateSpy).toHaveBeenCalledWith('op-1', 'CONFIRMED');
    expect(getPlacementsSpy).toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('rejects order placement on reject button click', async () => {
    const updateSpy = vi.spyOn(orderPlacementService, 'updateOrderPlacementStatus')
      .mockResolvedValue({ id: 'op-1', status: 'REJECTED' });
    const wrapper = mountCard();
    await flushPromises();

    const button = wrapper.findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Ablehnen'));
    await button!.trigger('click');
    await flushPromises();

    expect(updateSpy).toHaveBeenCalledWith('op-1', 'REJECTED');
  });

  it('shows error toast when updateOrderPlacementStatus fails', async () => {
    vi.spyOn(orderPlacementService, 'updateOrderPlacementStatus').mockRejectedValue(new Error('fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    const button = wrapper.findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Bestätigen'));
    await button!.trigger('click');
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });
});
