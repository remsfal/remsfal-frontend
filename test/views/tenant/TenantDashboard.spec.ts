import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';

vi.mock('@/services/TenancyService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenancyService')>(
    '@/services/TenancyService',
  );

  return {
    ...actual,
    tenancyService: {getTenancies: vi.fn(),},
  };
});

describe('TenantDashboard', () => {
  const mockContracts: TenancyJson[] = [
    {
      agreementId: 'aaaaaaaa-0000-0000-0000-000000000001',
      startOfRental: '2024-01-01',
      active: true,
      basicRent: 850,
      operatingCostsPrepayment: 150,
      heatingCostsPrepayment: 80,
      address: {
 street: 'Teststr. 1', zip: '12345', city: 'Berlin' 
},
      tenants: [{
 id: 'c1', firstName: 'Max', lastName: 'Mustermann' 
}],
      rentalUnits: [
        {
          id: 'u1',
          type: 'APARTMENT',
          title: 'Wohnung 1',
          location: 'Teststr. 1, 12345 Berlin',
          space: 75,
        },
      ],
    },
    {
      agreementId: 'aaaaaaaa-0000-0000-0000-000000000002',
      startOfRental: '2024-01-01',
      active: false,
      tenants: [],
      rentalUnits: [
        {
          id: 'u2',
          type: 'APARTMENT',
          title: 'Wohnung 2',
          location: 'Musterweg 5, 12345 Berlin',
        },
      ],
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.resetModules();
  });

  it('renders contracts from API', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue(mockContracts);
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    const cards = wrapper.findAll('[data-testid="contract-card"]');
    expect(cards).toHaveLength(mockContracts.length);
    expect(wrapper.text()).toContain('Teststr. 1');
    expect(wrapper.text()).toContain('Musterweg 5');
    expect(wrapper.text()).toContain('Aktiv');
    expect(wrapper.text()).toContain('Abgelaufen');
  });

  it('shows financial data when available', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue(mockContracts);
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('850');
    expect(wrapper.text()).toContain('150');
    expect(wrapper.text()).toContain('80');
  });

  it('shows rental start date', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue(mockContracts);
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('2024');
  });

  it('shows co-tenant names', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue(mockContracts);
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('Max Mustermann');
  });

  it('shows error notice when fetch fails', async () => {
    vi.mocked(tenancyService.getTenancies).mockRejectedValue(new Error('fail'));
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('Verträge konnten nicht geladen werden');
  });

  it('shows empty state when no contracts returned', async () => {
    vi.mocked(tenancyService.getTenancies).mockResolvedValue([]);
    const { default: TenantDashboard } = await import('../../../src/views/tenant/TenantDashboard.vue');

    const wrapper = mount(TenantDashboard);
    await flushPromises();

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });
});
