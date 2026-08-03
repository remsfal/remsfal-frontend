import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { mount, VueWrapper, DOMWrapper, flushPromises } from '@vue/test-utils';
import NewRentableUnitButton from '@/features/project/rentableUnits/components/NewRentableUnitButton.vue';
import { EntityType, propertyService } from '@/features/project/rentableUnits/services/PropertyService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { apartmentService } from '@/features/project/rentableUnits/services/ApartmentService';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import { storageService } from '@/features/project/rentableUnits/services/StorageService';

// PrimeVue Textarea with autoResize uses ResizeObserver — mock it for jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

const mockPropertyService = vi.hoisted(() => ({ createProperty: vi.fn() }));
const mockSiteService = vi.hoisted(() => ({ createSite: vi.fn() }));
const mockBuildingService = vi.hoisted(() => ({ createBuilding: vi.fn() }));
const mockApartmentService = vi.hoisted(() => ({ createApartment: vi.fn() }));
const mockCommercialService = vi.hoisted(() => ({ createCommercial: vi.fn() }));
const mockStorageService = vi.hoisted(() => ({ createStorage: vi.fn() }));

vi.mock('@/features/project/rentableUnits/services/PropertyService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/project/rentableUnits/services/PropertyService')>();
  return { ...actual, propertyService: mockPropertyService };
});
vi.mock('@/features/project/rentableUnits/services/SiteService', () => ({ siteService: mockSiteService }));
vi.mock('@/features/project/rentableUnits/services/BuildingService', () => ({ buildingService: mockBuildingService }));
vi.mock('@/features/project/rentableUnits/services/ApartmentService', () => ({ apartmentService: mockApartmentService }));
vi.mock('@/features/project/rentableUnits/services/CommercialService', () => ({ commercialService: mockCommercialService }));
vi.mock('@/features/project/rentableUnits/services/StorageService', () => ({ storageService: mockStorageService }));

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// BaseDialog and Popover both teleport their content to document.body via Portal, so form fields
// and popover options must be located via a DOMWrapper rooted at document.body.
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

type Wrapper = VueWrapper<InstanceType<typeof NewRentableUnitButton>>;

function mountButton(props: Record<string, unknown>): Wrapper {
  return mount(NewRentableUnitButton, { props, attachTo: document.body });
}

async function clickTrigger(wrapper: Wrapper) {
  await wrapper.find('button').trigger('click');
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 50));
}

async function selectOption(label: string) {
  const option = body()
    .findAll('li')
    .find((li) => li.text().includes(label));
  if (!option) {
    throw new Error(`Option "${label}" not found`);
  }
  await option.trigger('click');
  await flushPromises();
}

async function fillAndSubmit(title: string) {
  await body().find('input[name="title"]').setValue(title);
  await body().find('form').trigger('submit');
  await flushPromises();
}

describe('NewRentableUnitButton.vue', () => {
  let wrapper: Wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('type = Project', () => {
    beforeEach(() => {
      wrapper = mountButton({
        projectId: 'project-1', parentId: 'root', type: EntityType.Project 
      });
    });

    it('renders the create-property button', () => {
      expect(wrapper.find('button').text()).toBe('Grundstück erstellen');
    });

    it('opens the dialog directly for property creation', async () => {
      await clickTrigger(wrapper);
      expect(document.querySelector('.p-dialog')).toBeTruthy();
      expect(body().find('input[name="title"]').exists()).toBe(true);
    });

    it('creates a property and emits newUnit on submit', async () => {
      vi.mocked(propertyService.createProperty).mockResolvedValue({});
      await clickTrigger(wrapper);
      await fillAndSubmit('Neues Grundstück');

      expect(propertyService.createProperty).toHaveBeenCalledWith('project-1', {
        title: 'Neues Grundstück',
        location: 'Neues Grundstück',
        description: undefined,
        plotArea: 0,
      });
      expect(wrapper.emitted('newUnit')).toEqual([['Neues Grundstück']]);
      expect(document.querySelector('.p-dialog')).toBeFalsy();
    });

    it('logs an error and skips creation when parentId is missing', async () => {
      wrapper.unmount();
      wrapper = mountButton({ projectId: 'project-1', type: EntityType.Project });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await clickTrigger(wrapper);
      await fillAndSubmit('Neues Grundstück');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Parent ID is missing');
      expect(propertyService.createProperty).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('shows an error toast when creation fails', async () => {
      vi.mocked(propertyService.createProperty).mockRejectedValue(new Error('network error'));
      await clickTrigger(wrapper);
      await fillAndSubmit('Neues Grundstück');

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(wrapper.emitted('newUnit')).toBeFalsy();
    });
  });

  describe('type = Property', () => {
    beforeEach(() => {
      wrapper = mountButton({
        projectId: 'project-1', parentId: 'property-1', type: EntityType.Property 
      });
    });

    it('renders the add-annexation button', () => {
      expect(wrapper.find('button').text()).toBe('Anlage hinzufügen');
    });

    it('shows the building and site options in the popover', async () => {
      await clickTrigger(wrapper);
      expect(body().find('.p-popover').exists()).toBe(true);
      expect(document.body.textContent).toContain('Gebäude');
      expect(document.body.textContent).toContain('Außenanlage');
    });

    it('creates a building via the popover option', async () => {
      vi.mocked(buildingService.createBuilding).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Gebäude');
      await fillAndSubmit('Haus 1');

      expect(buildingService.createBuilding).toHaveBeenCalledWith('project-1', 'property-1', {
        title: 'Haus 1',
        location: 'Haus 1',
        description: undefined,
      });
      expect(wrapper.emitted('newUnit')).toEqual([['Haus 1']]);
    });

    it('creates a site via the popover option', async () => {
      vi.mocked(siteService.createSite).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Außenanlage');
      await fillAndSubmit('Garten');

      expect(siteService.createSite).toHaveBeenCalledWith('project-1', 'property-1', {
        title: 'Garten',
        location: 'Garten',
        description: undefined,
      });
      expect(wrapper.emitted('newUnit')).toEqual([['Garten']]);
    });
  });

  describe('type = Building', () => {
    beforeEach(() => {
      wrapper = mountButton({
        projectId: 'project-1', parentId: 'building-1', type: EntityType.Building 
      });
    });

    it('renders the add-unit button', () => {
      expect(wrapper.find('button').text()).toBe('Einheit hinzufügen');
    });

    it('shows apartment, commercial and storage options in the popover', async () => {
      await clickTrigger(wrapper);
      expect(document.body.textContent).toContain('Wohnung');
      expect(document.body.textContent).toContain('Gewerbe');
      expect(document.body.textContent).toContain('Nebennutzungsraum');
    });

    it('creates an apartment via the popover option', async () => {
      vi.mocked(apartmentService.createApartment).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Wohnung');
      await fillAndSubmit('Wohnung 1');

      expect(apartmentService.createApartment).toHaveBeenCalledWith('project-1', 'building-1', {
        title: 'Wohnung 1',
        location: 'Wohnung 1',
        description: undefined,
      });
    });

    it('creates a commercial unit via the popover option', async () => {
      vi.mocked(commercialService.createCommercial).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Gewerbe');
      await fillAndSubmit('Laden 1');

      expect(commercialService.createCommercial).toHaveBeenCalledWith('project-1', 'building-1', {
        title: 'Laden 1',
        location: 'Laden 1',
        description: undefined,
      });
    });

    it('creates a storage unit via the popover option', async () => {
      vi.mocked(storageService.createStorage).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Nebennutzungsraum');
      await fillAndSubmit('Keller 1');

      expect(storageService.createStorage).toHaveBeenCalledWith('project-1', 'building-1', {
        title: 'Keller 1',
        location: 'Keller 1',
        description: undefined,
      });
    });

    it('closes the dialog when cancel is clicked', async () => {
      await clickTrigger(wrapper);
      await selectOption('Wohnung');
      const cancelButton = body().findAll('button').find((btn) => btn.text() === 'Abbrechen');
      await cancelButton?.trigger('click');
      await flushPromises();

      expect(document.querySelector('.p-dialog')).toBeFalsy();
    });

    it('resets and disables the location field, and re-syncs it via the checkbox', async () => {
      vi.mocked(apartmentService.createApartment).mockResolvedValue({});
      await clickTrigger(wrapper);
      await selectOption('Wohnung');

      expect(body().find('input[name="location"]').attributes('disabled')).toBeDefined();

      await body().find('input[name="title"]').setValue('Wohnung 2');
      await body().find('input[type="checkbox"]').setValue(false);
      await flushPromises();
      expect(body().find('input[name="location"]').attributes('disabled')).toBeUndefined();

      await body().find('input[type="checkbox"]').setValue(true);
      await flushPromises();
      expect((body().find('input[name="location"]').element as HTMLInputElement).value).toBe('Wohnung 2');
    });

    it('does not submit when the title is shorter than 3 characters', async () => {
      await clickTrigger(wrapper);
      await selectOption('Wohnung');
      await fillAndSubmit('ab');

      expect(apartmentService.createApartment).not.toHaveBeenCalled();
    });

    it('shows an error toast when creation fails', async () => {
      vi.mocked(apartmentService.createApartment).mockRejectedValue(new Error('network error'));
      await clickTrigger(wrapper);
      await selectOption('Wohnung');
      await fillAndSubmit('Wohnung 1');

      expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
      expect(wrapper.emitted('newUnit')).toBeFalsy();
    });
  });

  describe('other unit types', () => {
    it('renders no trigger button for leaf unit types', () => {
      wrapper = mountButton({
        projectId: 'project-1', parentId: 'building-1', type: EntityType.Apartment 
      });
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });
});
