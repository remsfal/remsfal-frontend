import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FacilityAddressCard from '@/features/project/rentableUnits/components/FacilityAddressCard.vue';
import { buildingService } from '@/services/BuildingService';
import { siteService } from '@/services/SiteService';

vi.mock('@/services/BuildingService', () => ({
  buildingService: {
    getBuilding: vi.fn(),
    updateBuilding: vi.fn(),
  },
}));
vi.mock('@/services/SiteService', () => ({
  siteService: {
    getSite: vi.fn(),
    updateSite: vi.fn(),
  },
}));

vi.mock('@/components/AddressCard.vue', () => ({
  default: {
    name: 'AddressCard',
    template: '<div data-testid="address-card" />',
    props: ['loadAddress', 'saveAddress', 'title'],
  },
}));

const mockAddress = {
  street: 'Teststraße 1', zip: '10115', city: 'Berlin', countryCode: 'DE' 
};

describe('FacilityAddressCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (buildingService.getBuilding as ReturnType<typeof vi.fn>).mockResolvedValue({ address: mockAddress });
    (buildingService.updateBuilding as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (siteService.getSite as ReturnType<typeof vi.fn>).mockResolvedValue({ address: mockAddress });
    (siteService.updateSite as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  const mountCard = (facilityType: 'BUILDING' | 'SITE' = 'BUILDING', title?: string) =>
    mount(FacilityAddressCard, {
      props: {
        projectId: 'proj-1', unitId: 'unit-1', facilityType, title 
      },
    });

  it('renders without errors for BUILDING type', () => {
    const wrapper = mountCard('BUILDING');
    expect(wrapper.exists()).toBe(true);
  });

  it('renders without errors for SITE type', () => {
    const wrapper = mountCard('SITE');
    expect(wrapper.exists()).toBe(true);
  });

  it('renders AddressCard component', () => {
    const wrapper = mountCard();
    expect(wrapper.find('[data-testid="address-card"]').exists()).toBe(true);
  });

  it('passes loadAddress that calls buildingService.getBuilding for BUILDING type', async () => {
    const wrapper = mountCard('BUILDING');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    await loadAddress();
    expect(buildingService.getBuilding).toHaveBeenCalledWith('proj-1', 'unit-1');
  });

  it('passes loadAddress that calls siteService.getSite for SITE type', async () => {
    const wrapper = mountCard('SITE');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    await loadAddress();
    expect(siteService.getSite).toHaveBeenCalledWith('proj-1', 'unit-1');
  });

  it('loadAddress returns address from building for BUILDING type', async () => {
    const wrapper = mountCard('BUILDING');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    const result = await loadAddress();
    expect(result).toEqual(mockAddress);
  });

  it('loadAddress returns address from site for SITE type', async () => {
    const wrapper = mountCard('SITE');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { loadAddress } = addressCard.props();

    const result = await loadAddress();
    expect(result).toEqual(mockAddress);
  });

  it('passes saveAddress that calls buildingService.updateBuilding for BUILDING type', async () => {
    const wrapper = mountCard('BUILDING');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { saveAddress } = addressCard.props();

    await saveAddress(mockAddress);
    expect(buildingService.updateBuilding).toHaveBeenCalledWith('proj-1', 'unit-1', { address: mockAddress });
  });

  it('passes saveAddress that calls siteService.updateSite for SITE type', async () => {
    const wrapper = mountCard('SITE');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    const { saveAddress } = addressCard.props();

    await saveAddress(mockAddress);
    expect(siteService.updateSite).toHaveBeenCalledWith('proj-1', 'unit-1', { address: mockAddress });
  });

  it('passes custom title to AddressCard', () => {
    const wrapper = mountCard('BUILDING', 'Custom Title');
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    expect(addressCard.props('title')).toBe('Custom Title');
  });

  it('uses default i18n title when no title prop provided', async () => {
    const wrapper = mountCard('BUILDING');
    await flushPromises();
    const addressCard = wrapper.findComponent({ name: 'AddressCard' });
    expect(addressCard.props('title')).toBeDefined();
    expect(typeof addressCard.props('title')).toBe('string');
  });
});
