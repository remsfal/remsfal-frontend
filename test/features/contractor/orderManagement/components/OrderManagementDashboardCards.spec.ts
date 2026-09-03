import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import OrderManagementDashboardCards from '@/features/contractor/orderManagement/components/OrderManagementDashboardCards.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';
import { orderPlacementService, type OrderPlacementJson } from '@/services/OrderPlacementService';

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: routerMocks.push }),
  };
});

const quotationRequests: QuotationRequestJson[] = [
  {
    id: 'qr-1', status: 'REQUESTED', scopeOfWork: 'Dachrinne reparieren', createdAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'qr-2', status: 'REQUESTED', scopeOfWork: 'Dach reparieren', createdAt: '2026-01-03T10:00:00Z'
  },
  {
    id: 'qr-3', status: 'REQUESTED', scopeOfWork: 'Heizung prüfen', createdAt: '2026-01-02T10:00:00Z'
  },
  {
    id: 'qr-4', status: 'VIEWING_REQUIRED', scopeOfWork: 'Fenster prüfen', createdAt: '2026-01-04T10:00:00Z'
  },
];

const orderPlacements: OrderPlacementJson[] = [
  {
    id: 'op-1', status: 'PLACED', projectOwner: 'Musterfirma GmbH', createdAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'op-2', status: 'PLACED', projectOwner: 'Zweitfirma GmbH', createdAt: '2026-01-05T10:00:00Z'
  },
  {
    id: 'op-3', status: 'CONFIRMED', projectOwner: 'Drittfirma GmbH', createdAt: '2026-01-06T10:00:00Z'
  },
];

describe('OrderManagementDashboardCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountCard = () => mount(OrderManagementDashboardCards);

  it('fetches quotation requests and order placements on mount', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: [] });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });

    mountCard();
    await flushPromises();

    expect(quotationRequestService.getContractorQuotationRequests).toHaveBeenCalledOnce();
    expect(orderPlacementService.getOrderPlacements).toHaveBeenCalledOnce();
  });

  it('shows only REQUESTED quotation requests, newest first', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: quotationRequests });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });

    const wrapper = mountCard();
    await flushPromises();

    const table = wrapper.findAllComponents(DataTable)[0]!;
    const rows = table.props('value') as QuotationRequestJson[];
    expect(rows.map((r) => r.id)).toEqual(['qr-2', 'qr-3', 'qr-1']);
    expect(wrapper.text()).toContain('Dach reparieren');
    expect(wrapper.text()).not.toContain('Fenster prüfen');
  });

  it('shows only PLACED orders, newest first', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: [] });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: orderPlacements });

    const wrapper = mountCard();
    await flushPromises();

    const table = wrapper.findAllComponents(DataTable)[0]!;
    const rows = table.props('value') as OrderPlacementJson[];
    expect(rows.map((r) => r.id)).toEqual(['op-2', 'op-1']);
    expect(wrapper.text()).toContain('Zweitfirma GmbH');
    expect(wrapper.text()).not.toContain('Drittfirma GmbH');
  });

  it('limits each list to 5 entries', async () => {
    const manyRequests: QuotationRequestJson[] = Array.from({ length: 8 }, (_, i) => ({
      id: `qr-${i}`,
      status: 'REQUESTED',
      scopeOfWork: `Auftrag ${i}`,
      createdAt: `2026-01-0${(i % 9) + 1}T10:00:00Z`,
    }));
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: manyRequests });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });

    const wrapper = mountCard();
    await flushPromises();

    const table = wrapper.findAllComponents(DataTable)[0]!;
    expect(table.props('value') as unknown[]).toHaveLength(5);
  });

  it('shows empty-state text per card when there are no matching entries', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: [] });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });

    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain('Keine Anfragen zur Erstellung eines Angebots vorhanden');
    expect(wrapper.text()).toContain('Keine Anfragen zur Auftragserteilung vorhanden');
    expect(wrapper.findComponent(DataTable).exists()).toBe(false);
  });

  it('navigates to the open orders page when a quotation request row is selected', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: quotationRequests });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: [] });

    const wrapper = mountCard();
    await flushPromises();

    const table = wrapper.findAllComponents(DataTable)[0]!;
    await table.vm.$emit('row-select', { data: quotationRequests[0] });

    expect(routerMocks.push).toHaveBeenCalledWith({ name: 'ContractorOrdersOpen' });
  });

  it('navigates to the open orders page when an order row is selected', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({ items: [] });
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockResolvedValue({ items: orderPlacements });

    const wrapper = mountCard();
    await flushPromises();

    const table = wrapper.findAllComponents(DataTable)[0]!;
    await table.vm.$emit('row-select', { data: orderPlacements[0] });

    expect(routerMocks.push).toHaveBeenCalledWith({ name: 'ContractorOrdersOpen' });
  });

  it('shows an error toast and does not throw when a fetch fails', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockRejectedValue(new Error('Network'));
    vi.spyOn(orderPlacementService, 'getOrderPlacements').mockRejectedValue(new Error('Network'));

    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(DataTable).exists()).toBe(false);
  });
});
