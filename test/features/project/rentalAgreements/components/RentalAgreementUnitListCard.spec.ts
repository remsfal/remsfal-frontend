import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RentalAgreementUnitListCard from '@/features/project/rentalAgreements/components/RentalAgreementUnitListCard.vue';
import AdjustRentDialog from '@/features/project/rentalAgreements/components/AdjustRentDialog.vue';
import type { RentalAgreementJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';
import type { UnitType } from '@/features/project/rentableUnits/services/PropertyService';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { apartmentService } from '@/features/project/rentableUnits/services/ApartmentService';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import { storageService } from '@/features/project/rentableUnits/services/StorageService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

vi.mock('@/features/project/rentableUnits/services/PropertyService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/project/rentableUnits/services/PropertyService')>();
  return {
    ...actual,
    propertyService: { getProperty: vi.fn(), getPropertyTree: vi.fn() },
  };
});

vi.mock('@/features/project/rentableUnits/services/BuildingService', () => ({buildingService: { getBuilding: vi.fn() },}));
vi.mock('@/features/project/rentableUnits/services/ApartmentService', () => ({apartmentService: { getApartment: vi.fn() },}));
vi.mock(
  '@/features/project/rentableUnits/services/CommercialService',
  () => ({ commercialService: { getCommercial: vi.fn() } }),
);
vi.mock('@/features/project/rentableUnits/services/StorageService', () => ({storageService: { getStorage: vi.fn() },}));
vi.mock('@/features/project/rentableUnits/services/SiteService', () => ({siteService: { getSite: vi.fn() },}));

vi.mock('@/features/project/rentalAgreements/services/RentalAgreementService', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/features/project/rentalAgreements/services/RentalAgreementService')
  >();
  return {
    ...actual,
    rentalAgreementService: {
      removeRentalUnit: vi.fn(),
      getRentalAgreement: vi.fn(),
    },
  };
});

const baseAgreement: RentalAgreementJson = {
  id: 'agreement-1',
  propertyRents: [{ rentalUnitId: 'prop-1' }],
  siteRents: [{ rentalUnitId: 'site-1' }],
  buildingRents: [{ rentalUnitId: 'building-1' }],
  apartmentRents: [{ rentalUnitId: 'apt-1' }],
  storageRents: [{ rentalUnitId: 'storage-1' }],
  commercialRents: [{ rentalUnitId: 'comm-1' }],
};

const UNIT_TYPE_CASES: Array<{ unitId: string; type: UnitType; view: string; title: string }> = [
  {
    unitId: 'prop-1', type: 'PROPERTY', view: 'PropertyView', title: 'Haupthaus'
  },
  {
    unitId: 'site-1', type: 'SITE', view: 'SiteView', title: 'Garten'
  },
  {
    unitId: 'building-1', type: 'BUILDING', view: 'BuildingView', title: 'Gebäude A'
  },
  {
    unitId: 'apt-1', type: 'APARTMENT', view: 'ApartmentView', title: 'Wohnung 3'
  },
  {
    unitId: 'storage-1', type: 'STORAGE', view: 'StorageView', title: 'Keller'
  },
  {
    unitId: 'comm-1', type: 'COMMERCIAL', view: 'CommercialView', title: 'Laden'
  },
];

describe('RentalAgreementUnitListCard', () => {
  const mountCard = (agreement: RentalAgreementJson = baseAgreement) =>
    mount(RentalAgreementUnitListCard, {
      props: { projectId: 'proj-1', rentalAgreement: agreement },
      attachTo: document.body,
    });

  // Group header row for a unit renders its title inside a role="button" element
  // alongside its "Miete anpassen"/"Einheit löschen" buttons in the same table row.
  const findGroupHeaderRow = (title: string) => {
    const titleEl = Array.from(document.querySelectorAll('[role="button"]')).find(
      (el) => el.textContent?.includes(title),
    ) as HTMLElement | undefined;
    return titleEl?.closest('tr') as HTMLElement | undefined;
  };

  beforeEach(() => {
    vi.mocked(propertyService.getProperty).mockResolvedValue({
      id: 'prop-1', title: 'Haupthaus', type: 'PROPERTY'
    });
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [] });
    vi.mocked(siteService.getSite).mockResolvedValue({
      id: 'site-1', title: 'Garten', type: 'SITE'
    });
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      id: 'building-1', title: 'Gebäude A', type: 'BUILDING'
    });
    vi.mocked(apartmentService.getApartment).mockResolvedValue({
      id: 'apt-1', title: 'Wohnung 3', type: 'APARTMENT'
    });
    vi.mocked(storageService.getStorage).mockResolvedValue({
      id: 'storage-1', title: 'Keller', type: 'STORAGE'
    });
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      id: 'comm-1', title: 'Laden', type: 'COMMERCIAL'
    });
    vi.mocked(rentalAgreementService.removeRentalUnit).mockResolvedValue(undefined);
    vi.mocked(rentalAgreementService.getRentalAgreement).mockResolvedValue(baseAgreement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows empty state when the rental agreement has no rent entries', async () => {
    const wrapper = mountCard({ id: 'agreement-1' });
    await flushPromises();
    expect(wrapper.text()).toContain('Noch keine Wirtschaftseinheiten hinzugefügt.');
  });

  it('hydrates units from mixed rent-array types via their respective services', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(propertyService.getProperty).toHaveBeenCalledWith('proj-1', 'prop-1');
    expect(siteService.getSite).toHaveBeenCalledWith('proj-1', 'site-1');
    expect(buildingService.getBuilding).toHaveBeenCalledWith('proj-1', 'building-1');
    expect(apartmentService.getApartment).toHaveBeenCalledWith('proj-1', 'apt-1');
    expect(storageService.getStorage).toHaveBeenCalledWith('proj-1', 'storage-1');
    expect(commercialService.getCommercial).toHaveBeenCalledWith('proj-1', 'comm-1');

    expect(wrapper.text()).toContain('Haupthaus');
    expect(wrapper.text()).toContain('Garten');
    expect(wrapper.text()).toContain('Gebäude A');
    expect(wrapper.text()).toContain('Wohnung 3');
    expect(wrapper.text()).toContain('Keller');
    expect(wrapper.text()).toContain('Laden');
  });

  it('skips a unit whose detail fetch fails and still renders the remaining units', async () => {
    vi.mocked(propertyService.getProperty).mockRejectedValueOnce(new Error('boom'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    expect(wrapper.text()).not.toContain('Haupthaus');
    expect(wrapper.text()).toContain('Garten');
    consoleSpy.mockRestore();
  });

  it.each(UNIT_TYPE_CASES)('navigates to $view when the $title header row is clicked', async ({ unitId, view, title }) => {
    mountCard();
    await flushPromises();

    const row = findGroupHeaderRow(title);
    expect(row).toBeTruthy();
    (row!.querySelector('[role="button"]') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(push).toHaveBeenCalledWith({
      name: view,
      params: { projectId: 'proj-1', unitId },
    });
  });

  it('opens AdjustRentDialog in add mode (unit=null) when "Wirtschaftseinheit hinzufügen" is clicked', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const addBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Wirtschaftseinheit hinzufügen');
    await addBtn?.trigger('click');
    await flushPromises();

    const dialog = wrapper.findComponent(AdjustRentDialog);
    expect(dialog.props('visible')).toBe(true);
    expect(dialog.props('unit')).toBeNull();
    expect(dialog.props('excludeUnitIds')).toEqual(
      expect.arrayContaining(['prop-1', 'site-1', 'building-1', 'apt-1', 'storage-1', 'comm-1']),
    );
  });

  it('opens AdjustRentDialog in adjust mode with the clicked row as unit when "Miete anpassen" is clicked', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const row = findGroupHeaderRow('Haupthaus');
    const adjustBtn = row?.querySelector('.pi-pencil')?.closest('button') as HTMLButtonElement;
    adjustBtn.click();
    await flushPromises();

    const dialog = wrapper.findComponent(AdjustRentDialog);
    expect(dialog.props('visible')).toBe(true);
    expect(dialog.props('unit')).toEqual(expect.objectContaining({
      unitId: 'prop-1', unitType: 'PROPERTY', unitTitle: 'Haupthaus',
    }));
  });

  it('reacts to AdjustRentDialog emitting update:rentalAgreement by forwarding the update and reloading rows', async () => {
    const updatedAgreement: RentalAgreementJson = {
      ...baseAgreement,
      apartmentRents: [{ rentalUnitId: 'apt-1' }, { rentalUnitId: 'apt-2' }],
    };
    vi.mocked(apartmentService.getApartment).mockImplementation((_projectId, unitId) =>
      Promise.resolve(unitId === 'apt-2'
        ? {
          id: 'apt-2', title: 'Wohnung 5', type: 'APARTMENT' 
        }
        : {
          id: 'apt-1', title: 'Wohnung 3', type: 'APARTMENT' 
        }));

    const wrapper = mountCard();
    await flushPromises();

    await wrapper.findComponent(AdjustRentDialog).vm.$emit('update:rentalAgreement', updatedAgreement);
    await flushPromises();

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted?.[0]).toEqual([updatedAgreement]);
    expect(wrapper.text()).toContain('Wohnung 5');
  });

  it('opens the remove-confirm dialog on delete-unit click without triggering row navigation', async () => {
    mountCard();
    await flushPromises();

    const row = findGroupHeaderRow('Haupthaus');
    const deleteBtn = row?.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();
    await flushPromises();

    expect(push).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Haupthaus');
  });

  it('removes a unit: calls the dedicated endpoint, refreshes the agreement, emits update, shows success toast', async () => {
    const refreshedAgreement: RentalAgreementJson = { ...baseAgreement, propertyRents: [] };
    vi.mocked(rentalAgreementService.getRentalAgreement).mockResolvedValue(refreshedAgreement);

    const wrapper = mountCard();
    await flushPromises();

    const row = findGroupHeaderRow('Haupthaus');
    const deleteBtn = row?.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
    deleteBtn.click();
    await flushPromises();

    const confirmDeleteBtn = document.querySelector('.p-dialog .pi-trash')?.closest('button') as HTMLButtonElement;
    confirmDeleteBtn.click();
    await flushPromises();

    expect(rentalAgreementService.removeRentalUnit).toHaveBeenCalledWith('proj-1', 'agreement-1', 'PROPERTY', 'prop-1');
    expect(rentalAgreementService.getRentalAgreement).toHaveBeenCalledWith('proj-1', 'agreement-1');

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    expect((emitted![0][0] as RentalAgreementJson).propertyRents).toEqual([]);
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows an error toast when removing a unit fails and still closes the dialog', async () => {
    vi.mocked(rentalAgreementService.removeRentalUnit).mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountCard();
    await flushPromises();

    const row = findGroupHeaderRow('Haupthaus');
    const deleteBtn = row?.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
    deleteBtn.click();
    await flushPromises();
    const confirmDeleteBtn = document.querySelector('.p-dialog .pi-trash')?.closest('button') as HTMLButtonElement;
    confirmDeleteBtn.click();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(document.querySelector('.p-dialog')).toBeNull();
    consoleSpy.mockRestore();
  });
});
