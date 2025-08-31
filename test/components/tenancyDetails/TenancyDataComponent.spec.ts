import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TenancyDataComponent from '../../../src/components/tenancyDetails/TenancyDataComponent.vue';

describe('TenancyDataComponent', () => {
  const today = new Date();
  const past = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const future = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  it('renders date pickers with initial values', () => {
    const wrapper = mount(TenancyDataComponent, {
      props: {
        tenancy: {
          startOfRental: past.toISOString(),
          endOfRental: future.toISOString(),
        },
      },
    });

    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0); // DatePicker renders text inputs
  });

  it('computes rentalActive correctly', () => {
    const wrapper = mount(TenancyDataComponent, {
      props: {
        tenancy: {
          startOfRental: past.toISOString(),
          endOfRental: future.toISOString(),
        },
      },
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it('emits onChange when dates change', async () => {
    const wrapper = mount(TenancyDataComponent, {
      props: {
        tenancy: {
          startOfRental: past.toISOString(),
          endOfRental: future.toISOString(),
        },
      },
    });
  
    const startInput = wrapper.find('#rentalStart input');
    await startInput.setValue(today.toISOString());
  
    const emitted = wrapper.emitted('onChange') as unknown[][]; // 👈 cast to 2D array
  
    expect(emitted).toBeTruthy();
    expect((emitted[0][0] as any).startOfRental).toEqual(today.toISOString());
  });  
});
