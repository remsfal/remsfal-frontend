import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useAppToast, TOAST_LIFE } from '@/composables/useAppToast';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

function mountToast() {
  const TestComponent = defineComponent({
    setup() {
      return { ...useAppToast() };
    },
    template: '<div></div>',
  });
  return mount(TestComponent);
}

describe('useAppToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('success() shows a success toast with the default summary and life', () => {
    const wrapper = mountToast();
    wrapper.vm.success('Detail text');

    expect(addMock).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Detail text',
      life: TOAST_LIFE.success,
    });
  });

  it('warn() shows a warning toast with the default summary and life', () => {
    const wrapper = mountToast();
    wrapper.vm.warn('Detail text');

    expect(addMock).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warnung',
      detail: 'Detail text',
      life: TOAST_LIFE.warn,
    });
  });

  it('error() shows an error toast defaulting the summary to error.general', () => {
    const wrapper = mountToast();
    wrapper.vm.error('Detail text');

    expect(addMock).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Fehler',
      detail: 'Detail text',
      life: TOAST_LIFE.error,
    });
  });

  it('accepts a summary override', () => {
    const wrapper = mountToast();
    wrapper.vm.success('Detail text', { summary: 'Custom summary' });

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Custom summary' }),
    );
  });
});
