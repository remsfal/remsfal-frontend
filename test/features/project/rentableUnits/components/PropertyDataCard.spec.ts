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
import PropertyDataCard from '@/features/project/rentableUnits/components/PropertyDataCard.vue';
import { propertyService } from '@/services/PropertyService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/PropertyService', () => ({propertyService: { getProperty: vi.fn(), updateProperty: vi.fn() },}));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {
 ...actual, navigateToObjects: vi.fn(), showSavingErrorToast: vi.fn() 
};
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockProperty = {
  title: 'Testgrundstück',
  description: 'Eine Beschreibung',
  cadastralDistrict: 'Gemarkung A',
  sheetNumber: 'S123',
  cadastralSection: 'Flur 1',
  plot: 'Flurstück 1/2',
  plotNumber: 42,
  landRegistry: 'LR456',
  economyType: 'GF Wohnen',
  location: 'Musterstraße 1',
  plotArea: 500,
  space: 250.5,
};

const defaultProps = { projectId: 'project1', unitId: 'unit1' };

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('PropertyDataCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertyService.getProperty).mockResolvedValue({ ...mockProperty });
    vi.mocked(propertyService.updateProperty).mockResolvedValue({});
  });

  it('renders card title "Grundstücksdaten"', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Grundstücksdaten');
  });

  it('calls getProperty on mount with correct ids', async () => {
    mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    expect(propertyService.getProperty).toHaveBeenCalledWith('project1', 'unit1');
  });

  it('shows warning toast when unitId is empty', async () => {
    mount(PropertyDataCard, { props: { projectId: 'p1', unitId: '' } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(propertyService.getProperty).not.toHaveBeenCalled();
  });

  it('shows error toast when getProperty fails', async () => {
    vi.mocked(propertyService.getProperty).mockRejectedValue(new Error('Network error'));
    mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after title input changes', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    const titleInput = wrapper.find('input[name="title"]');
    await titleInput.setValue('Geänderter Titel');
    await flushPromises();

    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls updateProperty with correct payload on submit', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Neuer Titel' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls showSavingErrorToast when updateProperty fails', async () => {
    vi.mocked(propertyService.updateProperty).mockRejectedValue(new Error('Save failed'));

    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Fehlertitel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(viewHelper.showSavingErrorToast).toHaveBeenCalled();
  });

  it('save button is disabled again after successful save (no new changes)', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('renders all required form fields', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="cadastralDistrict"]').exists()).toBe(true);
    expect(wrapper.find('input[name="sheetNumber"]').exists()).toBe(true);
    expect(wrapper.find('input[name="cadastralSection"]').exists()).toBe(true);
    expect(wrapper.find('input[name="plot"]').exists()).toBe(true);
    expect(wrapper.find('input[name="landRegistry"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(propertyService.getProperty).mockResolvedValue({
 ...mockProperty, title: 'Same', location: 'Same' 
});
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after location field changes', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="location"]').setValue('Neue Lage');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('title watcher enables save button when titleMatchesLocation is true and title changes', async () => {
    vi.mocked(propertyService.getProperty).mockResolvedValue({
 ...mockProperty, title: 'Same', location: 'Same' 
});
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(propertyService.getProperty).mockResolvedValue({
 ...mockProperty, title: 'Same', location: 'Same' 
});
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ location: 'Neuer Titel' }),
    );
  });
});
