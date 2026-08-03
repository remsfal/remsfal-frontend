import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import InputNumber from 'primevue/inputnumber';

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
import { commercialService, type CommercialJson } from '@/features/project/rentableUnits/services/CommercialService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
const mockCommercialService = vi.hoisted(() => ({ getCommercial: vi.fn(), updateCommercial: vi.fn() }));
vi.mock('@/features/project/rentableUnits/services/CommercialService', () => ({ commercialService: mockCommercialService }));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {...actual, showSavingErrorToast: vi.fn(),};
});

// ─── Test Data ────────────────────────────────────────────────────────────────
// CommercialDataCard.vue tracks "no value" internally as `null` (see its
// `!== null` detail-mode detection), while the wire type CommercialJson only
// allows `number | undefined`. The cast preserves the `null` sentinel the
// component actually relies on while satisfying the mock's declared type.
const mockCommercial = {
  title: 'Testgewerbe',
  description: 'Eine Beschreibung',
  location: 'Musterstraße 1',
  netFloorArea: 200,
  usableFloorArea: null,
  technicalServicesArea: null,
  trafficArea: null,
  heatingSpace: 180,
} as unknown as CommercialJson;

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

  it('does not call updateCommercial when the form is invalid on submit', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('ab');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).not.toHaveBeenCalled();
  });

  it('treats missing optional fields as undefined on load and submits them as undefined in total mode', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({} as CommercialJson);
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect((wrapper.find('input[name="title"]').element as HTMLInputElement).value).toBe('');
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeUndefined();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        description: undefined,
        netFloorArea: undefined,
        heatingSpace: undefined,
      }),
    );
  });

  it('submits the new location value when it differs from title and was changed', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="location"]').setValue('Neue Lage');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ location: 'Neue Lage' }),
    );
  });

  it('renders required form fields in total mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingSpace"]').exists()).toBe(true);
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
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('shows the NF+TF+VF sum in the netFloorArea field in detail mode', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 30,
      technicalServicesArea: 20,
      trafficArea: 10,
    });

    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect((wrapper.find('input[name="netFloorArea"]').element as HTMLInputElement).value).toBe('60 m²');
  });

  it('submits the NF+TF+VF sum as netFloorArea in detail mode', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 30,
      technicalServicesArea: 20,
      trafficArea: 10,
    });

    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        netFloorArea: 60, usableFloorArea: 30, technicalServicesArea: 20, trafficArea: 10,
      }),
    );
  });

  it('submits usableFloorArea/technicalServicesArea/trafficArea as 0 in total mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        usableFloorArea: 0, technicalServicesArea: 0, trafficArea: 0 
      }),
    );
  });

  it('auto-detects detail mode when API returns detail fields', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 100,
      technicalServicesArea: 50,
      trafficArea: 30,
    });

    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="usableFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, title: 'Same', location: 'Same' 
    });
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
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, title: 'Same', location: 'Same' 
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, title: 'Same', location: 'Same' 
    });
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

  it('renders heatingSpace field inside the DIN 277 fieldset', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    const fieldset = wrapper.find('.p-fieldset');
    expect(fieldset.find('input[name="heatingSpace"]').exists()).toBe(true);
  });

  it('shows the "matches NRF" checkbox label in total mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Heizfläche entspricht Netto-Raumfläche (NRF)');
  });

  it('shows the "matches NF" checkbox label in detail mode', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 30,
      technicalServicesArea: 20,
      trafficArea: 10,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Heizfläche entspricht Nutzungsfläche (NF)');
  });

  it('auto-checks heatingSpaceMatchesArea when heatingSpace equals netFloorArea on load (total mode)', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, netFloorArea: 200, heatingSpace: 200,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeDefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');
  });

  it('auto-checks heatingSpaceMatchesArea when heatingSpace equals usableFloorArea on load (detail mode)', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 30,
      technicalServicesArea: 20,
      trafficArea: 10,
      heatingSpace: 30,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeDefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('30 m²');
  });

  it('does not check heatingSpaceMatchesArea when heatingSpace differs from netFloorArea', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeUndefined();
  });

  it('checking heatingSpaceMatchesArea disables and live-fills heatingSpace with netFloorArea', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(true);
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeDefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');
  });

  it('submits netFloorArea reference value as heatingSpace when heatingSpaceMatchesArea is checked', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(true);
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ heatingSpace: 200 }),
    );
  });

  // ─── Mode ↔ heatingSpaceMatchesArea interaction ────────────────────────────
  async function switchToDetailMode(wrapper: ReturnType<typeof mount>) {
    const detailButton = wrapper.findAll('.p-selectbutton .p-togglebutton').find(
      (btn) => btn.text() === 'Aufgeschlüsselt',
    );
    if (detailButton) {
      await detailButton.trigger('click');
      await flushPromises();
    }
  }

  // PrimeVue's InputNumber (with a " m²" suffix) does not parse a plain-text
  // `.setValue()` on the native input reliably — it leaves the field in an
  // invalid, unparsed state. Emitting `update:modelValue` directly on the
  // component simulates a completed edit without that formatting quirk.
  async function setInputNumber(wrapper: ReturnType<typeof mount>, name: string, value: number) {
    const component = wrapper.findAllComponents(InputNumber).find((c) => c.props('name') === name);
    expect(component).toBeTruthy();
    component!.vm.$emit('update:modelValue', value);
    await flushPromises();
  }

  it('live-updates heatingSpace when netFloorArea changes while heatingSpaceMatchesArea is checked (total mode)', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(true);
    await flushPromises();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');

    await setInputNumber(wrapper, 'netFloorArea', 250);

    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('250 m²');
  });

  it('follows heatingSpaceReferenceArea switching to usableFloorArea after changing to detail mode while checked', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(true);
    await flushPromises();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');

    await switchToDetailMode(wrapper);
    await flushPromises();

    await setInputNumber(wrapper, 'usableFloorArea', 75);

    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('75 m²');
  });

  it('changes the checkbox label from NRF to NF wording when switching to detail mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Heizfläche entspricht Netto-Raumfläche (NRF)');

    await switchToDetailMode(wrapper);

    expect(wrapper.text()).toContain('Heizfläche entspricht Nutzungsfläche (NF)');
    expect(wrapper.text()).not.toContain('Heizfläche entspricht Netto-Raumfläche (NRF)');
  });

  it('computes din277Sum as null and submits area fields as undefined when all detail values are empty', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await switchToDetailMode(wrapper);
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({
        netFloorArea: undefined,
        usableFloorArea: undefined,
        technicalServicesArea: undefined,
        trafficArea: undefined,
      }),
    );
  });

  it('auto-detects detail mode when only usableFloorArea is > 0', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 40,
      technicalServicesArea: 0,
      trafficArea: 0,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="usableFloorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('auto-detects detail mode when only technicalServicesArea is > 0', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 0,
      technicalServicesArea: 25,
      trafficArea: 0,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="technicalServicesArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('auto-detects detail mode when only trafficArea is > 0', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 0,
      technicalServicesArea: 0,
      trafficArea: 15,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="trafficArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="netFloorArea"]').attributes('disabled')).toBeDefined();
  });

  it('auto-checks heatingSpaceMatchesArea when heatingSpace is falsy on load', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, netFloorArea: 200, heatingSpace: undefined,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeDefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');
  });

  it('unchecking heatingSpaceMatchesArea re-enables heatingSpace for free editing without resetting its value', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(true);
    await flushPromises();
    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeDefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');

    await wrapper.find('input#heatingSpaceMatchesArea').setValue(false);
    await flushPromises();

    expect(wrapper.find('input[name="heatingSpace"]').attributes('disabled')).toBeUndefined();
    expect((wrapper.find('input[name="heatingSpace"]').element as HTMLInputElement).value).toBe('200 m²');
  });

  it('submits usableFloorArea reference value as heatingSpace when checked in detail mode', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial,
      netFloorArea: undefined,
      usableFloorArea: 30,
      technicalServicesArea: 20,
      trafficArea: 10,
      heatingSpace: 30,
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ heatingSpace: 30 }),
    );
  });

  it('re-enables location editing when titleMatchesLocation is unchecked', async () => {
    vi.mocked(commercialService.getCommercial).mockResolvedValue({
      ...mockCommercial, title: 'Same', location: 'Same'
    });
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();

    await wrapper.find('input#titleMatchesLocation').setValue(false);
    await flushPromises();

    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeUndefined();
  });

  it('updates the description and submits the new value', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('textarea[name="description"]').setValue('Neue Beschreibung');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ description: 'Neue Beschreibung' }),
    );
  });

  it('updates technicalServicesArea and trafficArea via the fields in detail mode', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await switchToDetailMode(wrapper);
    await flushPromises();

    await wrapper.find('input[name="technicalServicesArea"]').setValue('15');
    await wrapper.find('input[name="technicalServicesArea"]').trigger('blur');
    await flushPromises();
    await wrapper.find('input[name="trafficArea"]').setValue('5');
    await wrapper.find('input[name="trafficArea"]').trigger('blur');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ technicalServicesArea: 15, trafficArea: 5 }),
    );
  });

  it('updates heatingSpace directly via the field when heatingSpaceMatchesArea is unchecked', async () => {
    const wrapper = mount(CommercialDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="heatingSpace"]').setValue('77');
    await wrapper.find('input[name="heatingSpace"]').trigger('blur');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(commercialService.updateCommercial).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ heatingSpace: 77 }),
    );
  });
});
