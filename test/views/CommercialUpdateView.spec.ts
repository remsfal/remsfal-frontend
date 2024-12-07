import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import CommercialUpdateView from '@/views/CommercialUpdateView.vue';
import PrimeVue from 'primevue/config';



describe('CommercialForm.vue', () => {

  // Define the wrapper
  let wrapper: VueWrapper<CommercialUpdateView>;

  const defaultProps = {
    projectId: '1',
    propertyId: '2',
    buildingId: '3',
    commercialId: '4',
  }

  // Create the wrapper before each test
  beforeEach(() => {
    wrapper = mount(CommercialUpdateView, {
      props: defaultProps,
      global: {
        plugins: [PrimeVue]
      },
    });
  });

  it('renders form with correct fields', () => {
    expect(wrapper.text()).toContain('Gewerbeeinheit bearbeiten');
    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#location').exists()).toBe(true);
  });
});
