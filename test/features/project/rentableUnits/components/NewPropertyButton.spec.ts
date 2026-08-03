import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { mount, VueWrapper, DOMWrapper, flushPromises } from '@vue/test-utils';
import NewPropertyButton from '@/features/project/rentableUnits/components/NewPropertyButton.vue';
import { propertyService } from '@/features/project/rentableUnits/services/PropertyService';

// PrimeVue Textarea with autoResize uses ResizeObserver — mock it for jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

vi.mock('@/features/project/rentableUnits/services/PropertyService', () => ({propertyService: { createProperty: vi.fn() },}));

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// BaseDialog renders PrimeVue's Dialog, which teleports its content to document.body via Portal,
// so form fields must be located via a DOMWrapper rooted at document.body rather than wrapper.find().
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

async function openDialog(wrapper: VueWrapper<InstanceType<typeof NewPropertyButton>>) {
  await wrapper.find('button').trigger('click');
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 50));
}

describe('NewPropertyButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewPropertyButton>>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(NewPropertyButton, {
      props: { projectId: 'project-1' },
      attachTo: document.body,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the add-property button', () => {
    expect(wrapper.find('button').text()).toBe('Grundstück hinzufügen');
  });

  it('opens the dialog when the button is clicked', async () => {
    await openDialog(wrapper);
    expect(document.querySelector('.p-dialog')).toBeTruthy();
    expect(body().find('input[name="title"]').exists()).toBe(true);
  });

  it('disables the location field while titleMatchesLocation is checked', async () => {
    await openDialog(wrapper);
    expect(body().find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('enables the location field once titleMatchesLocation is unchecked', async () => {
    await openDialog(wrapper);
    await body().find('input[type="checkbox"]').setValue(false);
    await flushPromises();
    expect(body().find('input[name="location"]').attributes('disabled')).toBeUndefined();
  });

  it('re-syncs the location field with the title when checked again', async () => {
    await openDialog(wrapper);

    const titleInput = body().find('input[name="title"]');
    await titleInput.setValue('Neues Grundstück');

    await body().find('input[type="checkbox"]').setValue(false);
    await flushPromises();
    await body().find('input[type="checkbox"]').setValue(true);
    await flushPromises();

    expect((body().find('input[name="location"]').element as HTMLInputElement).value).toBe(
      'Neues Grundstück',
    );
    expect(body().find('input[name="location"]').attributes('disabled')).toBeDefined();
  });

  it('does not submit when the title is shorter than 3 characters', async () => {
    await openDialog(wrapper);

    await body().find('input[name="title"]').setValue('ab');
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.createProperty).not.toHaveBeenCalled();
  });

  it('creates the property using the title as location and emits newUnit on submit', async () => {
    vi.mocked(propertyService.createProperty).mockResolvedValue({});
    await openDialog(wrapper);

    await body().find('input[name="title"]').setValue('Musterstraße 1');
    await body().find('textarea[name="description"]').setValue('Eine Beschreibung');
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.createProperty).toHaveBeenCalledWith('project-1', {
      title: 'Musterstraße 1',
      location: 'Musterstraße 1',
      description: 'Eine Beschreibung',
    });

    expect(wrapper.emitted('newUnit')).toEqual([['Musterstraße 1']]);
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(document.querySelector('.p-dialog')).toBeFalsy();
  });

  it('uses the explicit location value when titleMatchesLocation is unchecked', async () => {
    vi.mocked(propertyService.createProperty).mockResolvedValue({});
    await openDialog(wrapper);

    await body().find('input[name="title"]').setValue('Musterstraße 1');
    await body().find('input[type="checkbox"]').setValue(false);
    await flushPromises();
    await body().find('input[name="location"]').setValue('Anderer Ort');
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.createProperty).toHaveBeenCalledWith('project-1', {
      title: 'Musterstraße 1',
      location: 'Anderer Ort',
      description: undefined,
    });
  });

  it('sends location as undefined when unchecked and left empty', async () => {
    vi.mocked(propertyService.createProperty).mockResolvedValue({});
    await openDialog(wrapper);

    await body().find('input[name="title"]').setValue('Musterstraße 1');
    await body().find('input[type="checkbox"]').setValue(false);
    await flushPromises();
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(propertyService.createProperty).toHaveBeenCalledWith('project-1', {
      title: 'Musterstraße 1',
      location: undefined,
      description: undefined,
    });
  });

  it('shows an error toast and logs when creation fails', async () => {
    vi.mocked(propertyService.createProperty).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await openDialog(wrapper);
    await body().find('input[name="title"]').setValue('Musterstraße 1');
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create property:', expect.any(Error));
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(wrapper.emitted('newUnit')).toBeFalsy();

    consoleErrorSpy.mockRestore();
  });

  it('closes the dialog when cancel is clicked', async () => {
    await openDialog(wrapper);
    const cancelButton = body().findAll('button').find((btn) => btn.text() === 'Abbrechen');
    await cancelButton?.trigger('click');
    await flushPromises();

    expect(document.querySelector('.p-dialog')).toBeFalsy();
  });

  it('resets the form after a successful submission', async () => {
    vi.mocked(propertyService.createProperty).mockResolvedValue({});
    await openDialog(wrapper);

    await body().find('input[name="title"]').setValue('Musterstraße 1');
    await body().find('form').trigger('submit');
    await flushPromises();

    await openDialog(wrapper);
    expect((body().find('input[name="title"]').element as HTMLInputElement).value).toBe('');
  });
});
