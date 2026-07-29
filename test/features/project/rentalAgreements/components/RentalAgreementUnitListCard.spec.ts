import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import TreeSelect from 'primevue/treeselect';
import RentalAgreementUnitListCard from '@/features/project/rentalAgreements/components/RentalAgreementUnitListCard.vue';
import type { RentalAgreementJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { rentalAgreementService } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { propertyService } from '@/services/PropertyService';
import type { UnitType } from '@/services/PropertyService';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { apartmentService } from '@/features/project/rentableUnits/services/ApartmentService';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import { storageService } from '@/features/project/rentableUnits/services/StorageService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

vi.mock('@/services/PropertyService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/PropertyService')>();
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
    rentalAgreementService: { updateRentalAgreement: vi.fn() },
  };
});

const baseAgreement: RentalAgreementJson = {
  id: 'agreement-1',
  propertyRents: [{ unitId: 'prop-1' }],
  siteRents: [{ unitId: 'site-1' }],
  buildingRents: [{ unitId: 'building-1' }],
  apartmentRents: [{ unitId: 'apt-1' }],
  storageRents: [{ unitId: 'storage-1' }],
  commercialRents: [{ unitId: 'comm-1' }],
};

const UNIT_TYPE_CASES: Array<{ unitId: string; type: UnitType; view: string }> = [
  {
    unitId: 'prop-1', type: 'PROPERTY', view: 'PropertyView' 
  },
  {
    unitId: 'site-1', type: 'SITE', view: 'SiteView' 
  },
  {
    unitId: 'building-1', type: 'BUILDING', view: 'BuildingView' 
  },
  {
    unitId: 'apt-1', type: 'APARTMENT', view: 'ApartmentView' 
  },
  {
    unitId: 'storage-1', type: 'STORAGE', view: 'StorageView' 
  },
  {
    unitId: 'comm-1', type: 'COMMERCIAL', view: 'CommercialView' 
  },
];

describe('RentalAgreementUnitListCard', () => {
  const mountCard = (agreement: RentalAgreementJson = baseAgreement) =>
    mount(RentalAgreementUnitListCard, {
      props: { projectId: 'proj-1', rentalAgreement: agreement },
      attachTo: document.body,
    });

  const findDialogButton = (text: string) =>
    Array.from(document.querySelectorAll('.p-dialog button')).find(
      (btn) => btn.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  beforeEach(() => {
    vi.mocked(propertyService.getProperty).mockResolvedValue({
      id: 'prop-1', title: 'Haupthaus', type: 'PROPERTY' 
    });
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
    vi.mocked(rentalAgreementService.updateRentalAgreement).mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows empty state when the rental agreement has no rent entries', async () => {
    const wrapper = mountCard({ id: 'agreement-1' });
    await flushPromises();
    expect(wrapper.text()).toContain('Noch keine Mietobjekte hinzugefügt.');
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

  it.each(UNIT_TYPE_CASES)('navigates to $view on row click for a $type unit', async ({ unitId, type, view }) => {
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.findComponent(DataTable).vm.$emit('rowSelect', {
      data: {
        id: unitId, title: 'x', type 
      } 
    });

    expect(push).toHaveBeenCalledWith({
      name: view,
      params: { projectId: 'proj-1', unitId },
    });
  });

  it('opens the add dialog and loads the property tree', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({ properties: [] });
    const wrapper = mountCard();
    await flushPromises();

    const addBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Mietobjekt hinzufügen');
    await addBtn?.trigger('click');
    await flushPromises();

    expect(propertyService.getPropertyTree).toHaveBeenCalledWith('proj-1');
  });

  it('marks already-added units and PROPERTY containers as non-selectable in the tree', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [
        {
          key: 'prop-1',
          data: {
            id: 'prop-1', type: 'PROPERTY', title: 'Haupthaus' 
          },
          children: [{
            key: 'apt-2', data: {
              id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
            } 
          }],
        },
      ],
    });

    const wrapper = mountCard();
    await flushPromises();

    const addBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Mietobjekt hinzufügen');
    await addBtn?.trigger('click');
    await flushPromises();

    const options = wrapper.findComponent(TreeSelect).props('options') as Array<{
      key: string; selectable: boolean; children?: Array<{ key: string; selectable: boolean }>;
    }>;
    const propertyNode = options.find((node) => node.key === 'prop-1');
    const apartmentNode = propertyNode?.children?.find((node) => node.key === 'apt-2');

    expect(propertyNode?.selectable).toBe(false);
    expect(apartmentNode?.selectable).toBe(true);
  });

  it('keeps the confirm-add button disabled until a unit is selected', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [{
        key: 'apt-2', data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        } 
      }],
    });

    const wrapper = mountCard();
    await flushPromises();
    await wrapper.findAll('button').find((btn) => btn.text() === 'Mietobjekt hinzufügen')?.trigger('click');
    await flushPromises();

    expect(findDialogButton('Hinzufügen')?.disabled).toBe(true);

    await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
      key: 'apt-2',
      data: {
        id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5'
      },
    });
    await flushPromises();

    expect(findDialogButton('Hinzufügen')?.disabled).toBe(false);
  });

  it('adds a unit: persists the extended rent array, emits update, shows success toast, closes dialog', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [{
        key: 'apt-2', data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        } 
      }],
    });

    const wrapper = mountCard();
    await flushPromises();
    await wrapper.findAll('button').find((btn) => btn.text() === 'Mietobjekt hinzufügen')?.trigger('click');
    await flushPromises();
    await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
      key: 'apt-2',
      data: {
        id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
      },
    });
    await flushPromises();
    findDialogButton('Hinzufügen')?.click();
    await flushPromises();

    expect(rentalAgreementService.updateRentalAgreement).toHaveBeenCalledWith(
      'proj-1',
      'agreement-1',
      expect.objectContaining({apartmentRents: [{ unitId: 'apt-1' }, { unitId: 'apt-2' }],}),
    );
    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    expect((emitted![0][0] as RentalAgreementJson).apartmentRents).toEqual([
      { unitId: 'apt-1' },
      { unitId: 'apt-2' },
    ]);
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows an error toast when adding a unit fails', async () => {
    vi.mocked(propertyService.getPropertyTree).mockResolvedValue({
      properties: [{
        key: 'apt-2', data: {
          id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
        } 
      }],
    });
    vi.mocked(rentalAgreementService.updateRentalAgreement).mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    await flushPromises();
    await wrapper.findAll('button').find((btn) => btn.text() === 'Mietobjekt hinzufügen')?.trigger('click');
    await flushPromises();
    await wrapper.findComponent(TreeSelect).vm.$emit('node-select', {
      key: 'apt-2',
      data: {
        id: 'apt-2', type: 'APARTMENT', title: 'Wohnung 5' 
      },
    });
    await flushPromises();
    findDialogButton('Hinzufügen')?.click();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('opens the remove-confirm dialog on trash click without triggering row navigation', async () => {
    mountCard();
    await flushPromises();

    const deleteBtn = document.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();
    await flushPromises();

    expect(push).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Haupthaus');
  });

  it('removes a unit: filters the rent array, persists, emits update, shows success toast', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const deleteBtn = document.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
    deleteBtn.click();
    await flushPromises();

    const confirmDeleteBtn = document.querySelector('.p-dialog .pi-trash')?.closest('button') as HTMLButtonElement;
    confirmDeleteBtn.click();
    await flushPromises();

    expect(rentalAgreementService.updateRentalAgreement).toHaveBeenCalled();
    const [, , updatedAgreement] = vi.mocked(rentalAgreementService.updateRentalAgreement).mock.calls[0]!;
    expect((updatedAgreement as RentalAgreementJson).propertyRents).toEqual([]);

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows an error toast when removing a unit fails and still closes the dialog', async () => {
    vi.mocked(rentalAgreementService.updateRentalAgreement).mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mountCard();
    await flushPromises();

    const deleteBtn = document.querySelector('.pi-trash')?.closest('button') as HTMLButtonElement;
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
