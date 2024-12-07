import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import CommercialCreationForm from '@/views/CommercialCreationView.vue';
import PrimeVue from 'primevue/config';



describe('CommercialForm.vue', () => {

  // Define the wrapper
  let wrapper: VueWrapper<CommercialCreationForm>;

  const defaultProps = {
    projectId: '1',
    propertyId: '2',
    buildingId: '3',
  }
  // Create the wrapper before each test
  beforeEach(() => {
    wrapper = mount(CommercialCreationForm, {
      props: defaultProps,
      global: {
        plugins: [PrimeVue]
      },
    });
  });

  it('renders form with correct fields', () => {
    expect(wrapper.text()).toContain('Neue Gewerbeeinheit erstellen');
    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#location').exists()).toBe(true);
  });
});
