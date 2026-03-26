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

import StorageDataCard from '@/features/project/rentableUnits/components/StorageDataCard.vue';
import { storageService, type StorageJson } from '@/services/StorageService';
import * as viewHelper from '@/helper/viewHelper';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual };
});

// ─── Toast Mock ───────────────────────────────────────────────────────────────
const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// ─── Service Mock ─────────────────────────────────────────────────────────────
vi.mock('@/services/StorageService', () => ({storageService: { getStorage: vi.fn(), updateStorage: vi.fn() },}));

// ─── viewHelper Mock ──────────────────────────────────────────────────────────
vi.mock('@/helper/viewHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helper/viewHelper')>();
  return {
    ...actual, navigateToObjects: vi.fn(), showSavingErrorToast: vi.fn(),
  };
});

// ─── Test Data ────────────────────────────────────────────────────────────────
const mockStorage = {
  title: 'Testlager',
  description: 'Eine Beschreibung',
  location: 'Keller 1',
  usableSpace: 20,
  heatingSpace: 15,
  space: 25,
};

const defaultProps = { projectId: 'project1', unitId: 'unit1' };

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('StorageDataCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.getStorage).mockResolvedValue({ ...mockStorage });
    vi.mocked(storageService.updateStorage).mockResolvedValue({} as StorageJson);
  });

  it('renders card title "Lagerdaten"', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.text()).toContain('Lagerdaten');
  });

  it('calls getStorage on mount with correct ids', async () => {
    mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    expect(storageService.getStorage).toHaveBeenCalledWith('project1', 'unit1');
  });

  it('shows warning toast when unitId is empty', async () => {
    mount(StorageDataCard, { props: { projectId: 'p1', unitId: '' } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(storageService.getStorage).not.toHaveBeenCalled();
  });

  it('shows error toast when getStorage fails', async () => {
    vi.mocked(storageService.getStorage).mockRejectedValue(new Error('Network error'));
    mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('save button is disabled before any changes', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after title input changes', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Geänderter Titel');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('calls updateStorage with correct payload on submit', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(storageService.updateStorage).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ title: 'Neuer Titel' }),
    );
  });

  it('shows success toast after successful save', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls showSavingErrorToast when updateStorage fails', async () => {
    vi.mocked(storageService.updateStorage).mockRejectedValue(new Error('Save failed'));

    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Fehlertitel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(viewHelper.showSavingErrorToast).toHaveBeenCalled();
  });

  it('save button is disabled again after successful save (no new changes)', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('renders all required form fields', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
    expect(wrapper.find('input[name="location"]').exists()).toBe(true);
    expect(wrapper.find('input[name="usableSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="heatingSpace"]').exists()).toBe(true);
    expect(wrapper.find('input[name="space"]').exists()).toBe(true);
  });

  it('location input is disabled when title matches location on load', async () => {
    vi.mocked(storageService.getStorage).mockResolvedValue({ ...mockStorage, title: 'Same', location: 'Same' });
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    expect(wrapper.find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('save button becomes enabled after location field changes', async () => {
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="location"]').setValue('Neue Lage');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('title watcher enables save button when titleMatchesLocation is true and title changes', async () => {
    vi.mocked(storageService.getStorage).mockResolvedValue({ ...mockStorage, title: 'Same', location: 'Same' });
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

  it('submit sends title as location when titleMatchesLocation is true', async () => {
    vi.mocked(storageService.getStorage).mockResolvedValue({ ...mockStorage, title: 'Same', location: 'Same' });
    const wrapper = mount(StorageDataCard, { props: defaultProps });
    await flushPromises();
    await wrapper.find('input[name="title"]').setValue('Neuer Titel');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(storageService.updateStorage).toHaveBeenCalledWith(
      'project1',
      'unit1',
      expect.objectContaining({ location: 'Neuer Titel' }),
    );
  });
});
