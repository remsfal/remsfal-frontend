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
import { buildingService, type BuildingJson } from '@/services/BuildingService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/BuildingService', () => ({buildingService: { getBuilding: vi.fn(), updateBuilding: vi.fn() },}));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {
 ...actual, navigateToObjects: vi.fn(), showSavingErrorToast: vi.fn() 
};
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockBuilding = {
  title: 'Testgebäude',
  description: 'Eine Beschreibung',
  grossFloorArea: 300,
  netFloorArea: 250,
  constructionFloorArea: 50,
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

  it('renders DIN 277 and WoFlV fieldsets', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.text()).toContain('DIN 277');
    expect(wrapper.text()).toContain('WoFlV');
  });

  it('renders all required form fields', async () => {
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="grossFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="constructionFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="livingSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="usableSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingSpace"]').exists()).toBe(true);
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({ ...mockBuilding, title: 'Same', location: 'Same' });
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
    vi.mocked(buildingService.getBuilding).mockResolvedValue({ ...mockBuilding, title: 'Same', location: 'Same' });
    const wrapper = mount(BuildingDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(buildingService.getBuilding).mockResolvedValue({ ...mockBuilding, title: 'Same', location: 'Same' });
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
