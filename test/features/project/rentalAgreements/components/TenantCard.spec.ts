import { describe, it, expect, vi, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import TenantCard from '@/features/project/rentalAgreements/components/TenantCard.vue';
import type { TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

const tenant: TenantItemJson = {
  id: 'tenant-1',
  firstName: 'Max',
  lastName: 'Mustermann',
  active: true,
};

describe('TenantCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders content passed into the actions slot without triggering a card click', async () => {
    const wrapper = mount(TenantCard, {
      props: { tenant },
      slots: { actions: '<button class="my-action">Action</button>' },
    });

    expect(wrapper.find('.my-action').exists()).toBe(true);

    await wrapper.find('.my-action').trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('does not trigger a card click when Enter is pressed on an action', async () => {
    const wrapper = mount(TenantCard, {
      props: { tenant },
      slots: { actions: '<button class="my-action">Action</button>' },
    });

    await wrapper.find('.my-action').trigger('keydown.enter');

    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('emits click when Enter is pressed on the card itself', async () => {
    const wrapper = mount(TenantCard, { props: { tenant } });

    await wrapper.find('[data-testid="tenant-card"]').trigger('keydown.enter');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('uses the shared interactive-row hover instead of a card shadow', () => {
    const wrapper = mount(TenantCard, { props: { tenant } });
    const card = wrapper.find('[data-testid="tenant-card"]');

    expect(card.classes()).toContain('interactive-row');
    expect(card.classes()).not.toContain('hover:shadow-lg');
    expect(card.classes()).not.toContain('rounded-lg');
  });

  it('emits click when the card itself is clicked', async () => {
    const wrapper = mount(TenantCard, { props: { tenant } });

    await wrapper.find('[data-testid="tenant-card"]').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('switches to the stacked layout once the row overflows and back when it fits again', async () => {
    let notifyResize: () => void = () => {};
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) {
        notifyResize = callback;
      }
      observe() {}
      disconnect() {}
    });
    const wrapper = mount(TenantCard, { props: { tenant } });
    const card = wrapper.find('[data-testid="tenant-card"]');
    const setWidths = (clientWidth: number, scrollWidth: number) => {
      Object.defineProperty(card.element, 'clientWidth', { value: clientWidth, configurable: true });
      Object.defineProperty(card.element, 'scrollWidth', { value: scrollWidth, configurable: true });
    };

    expect(card.attributes('data-layout')).toBe('row');

    setWidths(500, 800);
    notifyResize();
    await flushPromises();
    expect(card.attributes('data-layout')).toBe('stacked');

    setWidths(700, 700);
    notifyResize();
    await flushPromises();
    expect(card.attributes('data-layout')).toBe('stacked');

    setWidths(800, 800);
    notifyResize();
    await flushPromises();
    expect(card.attributes('data-layout')).toBe('row');
  });
});
