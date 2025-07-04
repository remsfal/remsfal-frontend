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
          rentalStart: past,
          rentalEnd: future,
        },
      },
    });

    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0); // DatePicker renders text inputs
  });

  it('computes rentalActive correctly', async () => {
    const wrapper = mount(TenancyDataComponent, {
      props: {
        tenancy: {
          rentalStart: past,
          rentalEnd: future,
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
          rentalStart: past,
          rentalEnd: future,
        },
      },
    });

    const newTenancy = {
      rentalStart: today,
      rentalEnd: future,
    };
    wrapper.vm.localTenancy = newTenancy;
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('onChange')).toBeTruthy();
    expect(wrapper.emitted('onChange')![0][0].rentalStart).toEqual(today);
  });
});
