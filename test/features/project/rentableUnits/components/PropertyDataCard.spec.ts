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
import Select from 'primevue/select';

import PropertyDataCard from '@/features/project/rentableUnits/components/PropertyDataCard.vue';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock(
  '@/features/project/rentableUnits/services/PropertyService',
  () => ({ propertyService: { getProperty: vi.fn(), updateProperty: vi.fn() } }),
);

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {...actual, showSavingErrorToast: vi.fn()};
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

  it('does not call updateProperty when the form is invalid on submit', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('ab');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.updateProperty).not.toHaveBeenCalled();
  });

  it('checking titleMatchesLocation disables and syncs the location field', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeUndefined();

    await wrapper.find('input#titleMatchesLocation').setValue(true);
    await flushPromises();

    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after description field changes', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('textarea[name="description"]').setValue('Neue Beschreibung');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('calls updateProperty with cadastral, land registry and area fields when changed', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('textarea[name="description"]').setValue('Neue Beschreibung');
    await wrapper.find('input[name="cadastralDistrict"]').setValue('Neue Gemarkung');
    await wrapper.find('input[name="sheetNumber"]').setValue('S999');
    await wrapper.find('input[name="cadastralSection"]').setValue('Flur 9');
    await wrapper.find('input[name="plot"]').setValue('Flurstück 9/9');
    await wrapper.find('input[name="landRegistry"]').setValue('LR999');
    await wrapper.find('input[name="plotNumber"]').setValue('99');
    await wrapper.find('input[name="plotNumber"]').trigger('blur');
    await wrapper.find('input[name="plotArea"]').setValue('999');
    await wrapper.find('input[name="plotArea"]').trigger('blur');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        description: 'Neue Beschreibung',
        cadastralDistrict: 'Neue Gemarkung',
        sheetNumber: 'S999',
        cadastralSection: 'Flur 9',
        plot: 'Flurstück 9/9',
        plotNumber: 99,
        landRegistry: 'LR999',
        plotArea: 999,
      }),
    );
  });

  it('calls updateProperty with economyType when changed via the Select field', async () => {
    const wrapper = mount(PropertyDataCard, { props: defaultProps });
    await flushPromises();

    // PrimeVue Select commits its value through `writeValue` (called internally on option
    // selection), which both emits `update:modelValue` and registers the value with the
    // surrounding @primevue/forms Form. Simulating a plain DOM/UI interaction with the
    // overlay panel is unreliable in jsdom, so the commit is invoked directly here.
    const selectVm = wrapper.findComponent(Select).vm as unknown as {
      writeValue: (value: unknown, event: Event) => void;
    };
    selectVm.writeValue('Bauplatz', new Event('change'));
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.updateProperty).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ economyType: 'Bauplatz' }),
    );
  });
});
