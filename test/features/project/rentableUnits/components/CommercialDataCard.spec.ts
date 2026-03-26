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

import CommercialDataCard from '@/features/project/rentableUnits/components/CommercialDataCard.vue';
import { commercialService, type CommercialJson } from '@/services/CommercialService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/CommercialService', () => ({commercialService: { getCommercial: vi.fn(), updateCommercial: vi.fn() },}));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {
    ...actual, navigateToObjects: vi.fn(), showSavingErrorToast: vi.fn(),
  };
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockCommercial = {
  title: 'Testgewerbe',
  description: 'Eine Beschreibung',
  location: 'Musterstraße 1',
  netFloorArea: 200,
  usableFloorArea: null,
  technicalServicesArea: null,
  trafficArea: null,
  heatingSpace: 180,
  space: 210,
};

const defaultProps = { projectId: 'project1', unitId: 'unit1' };

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('CommercialDataCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(commercialService.getCommercial).mockResolvedValue({ ...mockCommercial });
    vi.mocked(commercialService.updateCommercial).mockResolvedValue({} as CommercialJson);
  });

  it('renders card title "Gewerbedaten"', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Gewerbedaten');
  });

  it('calls getCommercial on mount with correct ids', async () => {
    mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(commercialService.getCommercial).toHaveBeenCalledWith('project1', 'unit1');
  });

  it('shows warning toast when unitId is empty', async () => {
    mount(CommercialDataCard, { props: { projectId: 'p1', unitId: '' } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(commercialService.getCommercial).not.toHaveBeenCalled();
  });

  it('shows error toast when getCommercial fails', async () => {
    vi.mocked(commercialService.getCommercial).mockRejectedValue(new Error('Network error'));
    mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after title input changes', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Geänderter Titel');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('calls updateCommercial with correct payload on submit', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Neuer Titel' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls showSavingErrorToast when updateCommercial fails', async () => {
    vi.mocked(commercialService.updateCommercial).mockRejectedValue(new Error('Save failed'));

    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Fehlertitel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(viewHelper.showSavingErrorToast).toHaveBeenCalled();
  });

  it('save button is disabled again after successful save (no new changes)', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('renders required form fields in total mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="space"]').exists()).toBe(true);
  });

  it('renders DIN 277 fieldset', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('DIN 277');
  });

  it('switches to detail mode and shows NUF/TF/VF fields', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    // Click "Aufgeschlüsselt" option in SelectButton
    const detailButton = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'Aufgeschlüsselt',
    );
    if (detailButton) {
      await detailButton.trigger('click');
      await flushPromises();
    }

    expect(wrapper.find('input[name="usableFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="technicalServicesArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="trafficArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(false);
  });

  it('auto-detects detail mode when API returns detail fields', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: null,
      usableFloorArea: 100,
      technicalServicesArea: 50,
      trafficArea: 30,
    });

    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="usableFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(false);
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({ ...mockCommercial, title: 'Same', location: 'Same' });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after location field changes', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="location"]').setValue('Neue Lage');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('title watcher enables save button when titleMatchesLocation is true and title changes', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({ ...mockCommercial, title: 'Same', location: 'Same' });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({ ...mockCommercial, title: 'Same', location: 'Same' });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ location: 'Neuer Titel' }),
    );
  });
});
