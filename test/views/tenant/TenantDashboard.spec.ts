import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { tenancyService, type TenancyItem } from '@/services/TenancyService';

vi.mock('@/services/TenancyService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenancyService')>(
    '@/services/TenancyService',
  );

  return {
    ...actual,
    tenancyService: {
      getTenancies: vi.fn(),
      getTenancyDetail: vi.fn(),
    },
  };
});

describe('TenantDashboard', () => {
  const mockContracts: TenancyItem[] = [
    {
      id: 'T-1',
      name: 'Mietverhältnis 1',
      rentalType: 'APARTMENT',
      rentalTitle: 'Wohnung 1',
      location: 'Teststr. 1, 12345 Berlin',
      active: true,
    },
    {
      id: 'T-2',
      name: 'Mietverhältnis 2',
      rentalType: 'APARTMENT',
      rentalTitle: 'Wohnung 2',
      location: 'Musterweg 5, 12345 Berlin',
      active: false,
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
