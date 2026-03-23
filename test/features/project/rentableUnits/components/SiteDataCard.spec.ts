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

import SiteDataCard from '@/features/project/rentableUnits/components/SiteDataCard.vue';
import { siteService, type SiteJson } from '@/services/SiteService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/SiteService', () => ({ siteService: { getSite: vi.fn(), updateSite: vi.fn() } }));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {
    ...actual, navigateToObjects: vi.fn(), showSavingErrorToast: vi.fn(),
  };
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockSite = {
  title: 'Testanlage',
  description: 'Eine Beschreibung',
  location: 'Musterstraße 1',
  outdoorArea: 300,
  space: 150.5,
};

const defaultProps = { projectId: 'project1', unitId: 'unit1' };

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('SiteDataCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(siteService.getSite).mockResolvedValue({ ...mockSite });
    vi.mocked(siteService.updateSite).mockResolvedValue({} as SiteJson);
  });

  it('renders card title "Außenanlage"', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Außenanlage');
  });

  it('calls getSite on mount with correct ids', async () => {
    mount(SiteDataCard, { props: defaultProps });
    await flushPromises();
    expect(siteService.getSite).toHaveBeenCalledWith('project1', 'unit1');
  });

  it('shows warning toast when unitId is empty', async () => {
    mount(SiteDataCard, { props: { projectId: 'p1', unitId: '' } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(siteService.getSite).not.toHaveBeenCalled();
  });

  it('shows error toast when getSite fails', async () => {
    vi.mocked(siteService.getSite).mockRejectedValue(new Error('Network error'));
    mount(SiteDataCard, { props: defaultProps });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after title input changes', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    const titleInput = wrapper.find('input[name="title"]');
    await titleInput.setValue('Geänderter Titel');
    await flushPromises();

    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('calls updateSite with correct payload on submit', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(siteService.updateSite).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Neuer Titel' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls showSavingErrorToast when updateSite fails', async () => {
    vi.mocked(siteService.updateSite).mockRejectedValue(new Error('Save failed'));

    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Fehlertitel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(viewHelper.showSavingErrorToast).toHaveBeenCalled();
  });

  it('save button is disabled again after successful save (no new changes)', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('renders all required form fields', async () => {
    const wrapper = mount(SiteDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
    expect(wrapper.find('input[name="outdoorArea"]').exists()).toBe(true);
    expect(wrapper.find('input[name="space"]').exists()).toBe(true);
  });
});
