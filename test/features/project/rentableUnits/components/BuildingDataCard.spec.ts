import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// PrimeVue Textarea with autoResize uses ResizeObserver — mock it for jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

import BuildingDataCard from '@/features/project/rentableUnits/components/BuildingDataCard.vue';
import { buildingService, type BuildingJson } from '@/features/project/rentableUnits/services/BuildingService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
const mockBuildingService = vi.hoisted(() => ({ getBuilding: vi.fn(), updateBuilding: vi.fn() }));
vi.mock('@/features/project/rentableUnits/services/BuildingService', () => ({ buildingService: mockBuildingService }));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {...actual, showSavingErrorToast: vi.fn()};
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockBuilding = {
  title: 'Testgebäude',
  description: 'Eine Beschreibung',
  grossFloorArea: 300,
  netFloorArea: undefined,
  constructionFloorArea: undefined,
  commercialHeatingSpace: 50,
  livingSpace: 200,
  usableSpace: 180,
  heatingSpace: 220,
};

const defaultProps = { projectId: 'project1', unitId: 'unit1' };

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('BuildingDataCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildingService.getBuilding).mockResolvedValue({ ...mockBuilding });
    vi.mocked(buildingService.updateBuilding).mockResolvedValue({} as BuildingJson);
  });

  it('renders card title "Gebäudedaten"', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Gebäudedaten');
  });

  it('calls getBuilding on mount with correct ids', async () => {
    mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    expect(buildingService.getBuilding).toHaveBeenCalledWith('project1', 'unit1');
  });

  it('shows warning toast when unitId is empty', async () => {
    mount(BuildingDataCard, { props: { projectId: 'p1', unitId: '' } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(buildingService.getBuilding).not.toHaveBeenCalled();
  });

  it('shows error toast when getBuilding fails', async () => {
    vi.mocked(buildingService.getBuilding).mockRejectedValue(new Error('Network error'));
    mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after title input changes', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Geänderter Titel');
    await flushPromises();

    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls updateBuilding with correct payload on submit', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(buildingService.updateBuilding).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Neuer Titel' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls showSavingErrorToast when updateBuilding fails', async () => {
    vi.mocked(buildingService.updateBuilding).mockRejectedValue(new Error('Save failed'));

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Fehlertitel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(viewHelper.showSavingErrorToast).toHaveBeenCalled();
  });

  it('save button is disabled again after successful save', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('does not call updateBuilding when the form is invalid on submit', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('ab');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(buildingService.updateBuilding).not.toHaveBeenCalled();
  });

  it('renders DIN 277 and WoFlV fieldsets', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.text()).toContain('DIN 277');
    expect(wrapper.text()).toContain('WoFlV');
  });

  it('renders required form fields in total mode', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="livingSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="usableSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="commercialHeatingSpace"]').exists()).toBe(true);
  });

  it('loads commercialHeatingSpace value', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect((wrapper.find('input[name="commercialHeatingSpace"]').element as HTMLInputElement).value).toBe('50 m²');
  });

  it('save button becomes enabled after commercialHeatingSpace changes', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    const input = wrapper.find('input[name="commercialHeatingSpace"]');
    await input.setValue('75');
    await input.trigger('blur');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submits commercialHeatingSpace correctly', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    const input = wrapper.find('input[name="commercialHeatingSpace"]');
    await input.setValue('75');
    await input.trigger('blur');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(buildingService.updateBuilding).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ commercialHeatingSpace: 75 }),
    );
  });

  it('keeps commercialHeatingSpace unchanged when switching DIN277 mode', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    const detailButton = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'Aufgeschlüsselt',
    );
    if (detailButton) {
      await detailButton.trigger('click');
      await flushPromises();
    }

    expect((wrapper.find('input[name="commercialHeatingSpace"]').element as HTMLInputElement).value).toBe('50 m²');
  });

  it('switches to detail mode and shows NRF/KGF fields', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    const detailButton = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'Aufgeschlüsselt',
    );
    if (detailButton) {
      await detailButton.trigger('click');
      await flushPromises();
    }

    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="constructionFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('shows the NRF+KGF sum in the grossFloorArea field in detail mode', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      grossFloorArea: undefined,
      netFloorArea: 40,
      constructionFloorArea: 10,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect((wrapper.find('input[name="grossFloorArea"]').element as HTMLInputElement).value).toBe('50 m²');
  });

  it('submits the NRF+KGF sum as grossFloorArea in detail mode', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      grossFloorArea: undefined,
      netFloorArea: 40,
      constructionFloorArea: 10,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(buildingService.updateBuilding).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        grossFloorArea: 50, netFloorArea: 40, constructionFloorArea: 10,
      }),
    );
  });

  it('submits netFloorArea/constructionFloorArea as 0 in total mode', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(buildingService.updateBuilding).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ netFloorArea: 0, constructionFloorArea: 0 }),
    );
  });

  it('switches back to total mode and resets NRF/KGF fields', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      grossFloorArea: undefined,
      netFloorArea: 40,
      constructionFloorArea: 10,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    // starts in detail mode because both NRF/KGF are present
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);

    const totalButton = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'BGF gesamt',
    );
    if (totalButton) {
      await totalButton.trigger('click');
      await flushPromises();
    }

    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(false);
    expect(wrapper.find('input[name="grossFloorArea"]').attributes('disabled')).toBeUndefined();

    const detailButtonAgain = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'Aufgeschlüsselt',
    );
    if (detailButtonAgain) {
      await detailButtonAgain.trigger('click');
      await flushPromises();
    }

    expect((wrapper.find('input[name="netFloorArea"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="constructionFloorArea"]').element as HTMLInputElement).value).toBe('');
  });

  it('auto-detects detail mode when API returns detail fields', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      grossFloorArea: undefined,
      netFloorArea: 40,
      constructionFloorArea: 10,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('auto-detects detail mode when only netFloorArea is present', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      netFloorArea: 40,
      constructionFloorArea: undefined,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('auto-detects detail mode when only constructionFloorArea is present', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding,
      netFloorArea: undefined,
      constructionFloorArea: 15,
    });

    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="constructionFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding, title: 'Same', location: 'Same' 
    });
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after location field changes', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="location"]').setValue('Neue Lage');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('title watcher enables save button when titleMatchesLocation is true and title changes', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding, title: 'Same', location: 'Same' 
    });
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({
      ...mockBuilding, title: 'Same', location: 'Same' 
    });
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(buildingService.updateBuilding).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ location: 'Neuer Titel' }),
    );
  });
});
