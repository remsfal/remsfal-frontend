import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContractDetailView from '@/views/ContractDetailView.vue';
import { tenancyService, type TenancyItem } from '@/services/TenancyService';

vi.mock('vue-router', () => ({ useRoute: () => ({ params: { contractId: 'T-TEST' } }) }));

describe('ContractDetailView', () => {
  const mockTenancies: TenancyItem[] = [
    {
      id: 'T-TEST',
      name: 'Test Mietverhältnis',
      rentalType: 'APARTMENT',
      rentalTitle: 'Wohnung 1',
      location: 'Hauptstr. 99, 12345 Berlin',
      active: true,
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contract details from API', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockResolvedValue(mockTenancies);

    const wrapper = mount(ContractDetailView);
    await flushPromises();

    expect(wrapper.text()).toContain('Hauptstr. 99');
    expect(wrapper.text()).toContain('APARTMENT');
    expect(wrapper.text()).toContain('Aktiv');
  });

  it('shows error when contract not found', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockResolvedValue([]);

    const wrapper = mount(ContractDetailView);
    await flushPromises();

    expect(wrapper.text()).toContain('Vertragsdetails konnten nicht geladen werden');
  });

  it('shows error when fetch fails', async () => {
    vi.spyOn(tenancyService, 'getTenancies').mockRejectedValue(new Error('fail'));

    const wrapper = mount(ContractDetailView);
    await flushPromises();

    expect(wrapper.text()).toContain('Vertragsdetails konnten nicht geladen werden');
  });
});
