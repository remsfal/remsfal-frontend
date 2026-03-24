import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RentableUnitDangerZoneCard from '@/features/project/rentableUnits/components/RentableUnitDangerZoneCard.vue';
import { propertyService } from '@/services/PropertyService';
import { buildingService } from '@/services/BuildingService';
import { apartmentService } from '@/services/ApartmentService';
import { commercialService } from '@/services/CommercialService';
import { storageService } from '@/services/StorageService';
import { siteService } from '@/services/SiteService';

vi.mock('@/services/PropertyService');
vi.mock('@/services/BuildingService');
vi.mock('@/services/ApartmentService');
vi.mock('@/services/CommercialService');
vi.mock('@/services/StorageService');
vi.mock('@/services/SiteService');

const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));

const DangerZoneCardStub = {
  name: 'DangerZoneCard',
  props: ['description', 'deleteButtonLabel', 'confirmTitle', 'confirmMessage'],
  emits: ['confirm'],
  template: '<div><button data-testid="confirm-trigger" @click="$emit(\'confirm\')">confirm</button></div>',
};

describe('RentableUnitDangerZoneCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  const defaultProps = { projectId: 'proj-1', unitId: 'unit-1', unitType: 'PROPERTY' as const };

  it('passes localized props to DangerZoneCard', () => {
    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: defaultProps,
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    const card = wrapper.findComponent(DangerZoneCardStub);
    expect(card.props('description')).toBe('rentableUnits.dangerZone.description');
    expect(card.props('deleteButtonLabel')).toBe('rentableUnits.dangerZone.deleteButton');
    expect(card.props('confirmTitle')).toBe('rentableUnits.dangerZone.confirmTitle');
    expect(card.props('confirmMessage')).toBe('rentableUnits.dangerZone.confirmMessage');
  });

  it('calls propertyService.deleteProperty for PROPERTY type', async () => {
    vi.mocked(propertyService.deleteProperty).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: defaultProps,
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(propertyService.deleteProperty).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('calls buildingService.deleteBuilding for BUILDING type', async () => {
    vi.mocked(buildingService.deleteBuilding).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: { ...defaultProps, unitType: 'BUILDING' as const },
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(buildingService.deleteBuilding).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('calls apartmentService.deleteApartment for APARTMENT type', async () => {
    vi.mocked(apartmentService.deleteApartment).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: { ...defaultProps, unitType: 'APARTMENT' as const },
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(apartmentService.deleteApartment).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('calls commercialService.deleteCommercial for COMMERCIAL type', async () => {
    vi.mocked(commercialService.deleteCommercial).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: { ...defaultProps, unitType: 'COMMERCIAL' as const },
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(commercialService.deleteCommercial).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('calls storageService.deleteStorage for STORAGE type', async () => {
    vi.mocked(storageService.deleteStorage).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: { ...defaultProps, unitType: 'STORAGE' as const },
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(storageService.deleteStorage).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('calls siteService.deleteSite for SITE type', async () => {
    vi.mocked(siteService.deleteSite).mockResolvedValue(undefined);

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: { ...defaultProps, unitType: 'SITE' as const },
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(siteService.deleteSite).toHaveBeenCalledWith('proj-1', 'unit-1');
    expect(mockPush).toHaveBeenCalledWith({ name: 'RentableUnits', params: { projectId: 'proj-1' } });
  });

  it('does not navigate when deletion fails', async () => {
    vi.mocked(propertyService.deleteProperty).mockRejectedValue(new Error('Server error'));

    const wrapper = mount(RentableUnitDangerZoneCard, {
      props: defaultProps,
      global: { stubs: { DangerZoneCard: DangerZoneCardStub } },
    });

    await wrapper.find('[data-testid="confirm-trigger"]').trigger('click');
    await flushPromises();

    expect(mockPush).not.toHaveBeenCalled();
  });
});
