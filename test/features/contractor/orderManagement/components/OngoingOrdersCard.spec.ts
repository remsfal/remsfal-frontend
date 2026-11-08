import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import OngoingOrdersCard from '@/features/contractor/orderManagement/components/OngoingOrdersCard.vue';
import { orderPlacementService } from '@/features/contractor/orderManagement/services/OrderPlacementService';
import type { OrderPlacementJson } from '@/features/contractor/orderManagement/services/OrderPlacementService';

const pushMock = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: pushMock }) };
});

const mockPlacements: OrderPlacementJson[] = [
  {
    id: 'op-1',
    issueId: 'issue-1',
    projectOwner: 'Musterfrau GmbH',
    contractorName: 'Musterbau GmbH',
    status: 'CONFIRMED',
    confirmedBy: 'Max Mustermann',
    createdAt: '2026-01-15T10:00:00Z',
  },
];

describe('OngoingOrdersCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: mockPlacements });
  });

  it('renders the card title', async () => {
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();
    expect(wrapper.text()).toContain('Laufende Aufträge');
  });

  it('loads only confirmed orders and shows owner, organization and confirmor', async () => {
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();

    expect(orderPlacementService.getOrderPlacements).toHaveBeenCalledExactlyOnceWith(['CONFIRMED']);
    expect(wrapper.text()).toContain('Musterfrau GmbH');
    expect(wrapper.text()).toContain('Musterbau GmbH');
    expect(wrapper.text()).toContain('Max Mustermann');
  });

  it('has no confirm or reject actions', async () => {
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();
    expect(wrapper.text()).not.toContain('Bestätigen');
    expect(wrapper.text()).not.toContain('Ablehnen');
  });

  it('shows the empty message when there are no ongoing orders', async () => {
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();
    expect(wrapper.text()).toContain('Keine laufenden Aufträge vorhanden');
  });

  it('logs an error and shows the empty message when loading fails', async () => {
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockRejectedValue(new Error('network'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch ongoing orders:', expect.any(Error));
    expect(wrapper.text()).toContain('Keine laufenden Aufträge vorhanden');
    consoleErrorSpy.mockRestore();
  });

  it('opens the order details when a row is clicked', async () => {
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();

    wrapper.findComponent(DataTable).vm.$emit('rowClick', { data: mockPlacements[0], originalEvent: new Event('click') });

    expect(pushMock).toHaveBeenCalledWith({ name: 'ContractorOrderDetails', params: { issueId: 'issue-1' } });
  });

  it('does not navigate for a row without issue', async () => {
    const wrapper = mount(OngoingOrdersCard);
    await flushPromises();

    wrapper.findComponent(DataTable).vm.$emit('rowClick', { data: { id: 'op-3' }, originalEvent: new Event('click') });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
