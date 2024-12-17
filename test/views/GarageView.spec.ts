import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GarageView from '@/views/GarageView.vue';
import ProjectService from '@/services/ProjectService';
import PrimeVue from 'primevue/config';

// Mock ProjectService
const mockGetGarage = vi.fn();
const mockUpdateGarage = vi.fn();
const mockCreateGarage = vi.fn();

vi.mock('@/services/ProjectService', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getGarage: mockGetGarage,
      updateGarage: mockUpdateGarage,
      createGarage: mockCreateGarage,
    })),
  };
});

// Mock vue-router
const mockRouterBack = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mockRouterBack,
  }),
}));

//Mock for reusable component
vi.mock('@/components/ReusableFormComponent.vue', () => ({
  default: {
    name: 'ReusableFormComponentVue',
    props: ['headline', 'fields', 'initialValues', 'saveButtonText', 'cancelButtonText'],
    emits: ['submit', 'cancel'],
    template: `
      <form @submit.prevent="$emit('submit', initialValues)">
        <input v-for="field in fields" :key="field.name" 
              :name="field.name" 
              :type="field.type" 
              v-model="initialValues[field.name]" />
        <button type="button" @click="$emit('cancel')">Cancel</button>
        <button type="submit">{{ saveButtonText }}</button>
      </form>
    `,
  },
}));

// Dummy data for testing
const dummyGarageData = {
  title: 'Test Garage',
  description: 'Test description',
  location: 'Basement A',
  usableSpace: '50',
};

describe('GarageView.vue', () => {
// Define reusable component's default props
  const defaultProps = {
    headline: 'Test Form',
    saveButtonText: 'Save',
    cancelButtonText: 'Cancel',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isChecked', label: 'Checked', type: 'checkbox' },
      {
        name: 'dropdownOption',
        label: 'Option',
        type: 'dropdown',
        options: [{ label: 'Option 1', value: 'option1' }],
      },
    ],
    initialValues: { name: 'name', description: '', isChecked: false, dropdownOption: null },
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    new ProjectService();
  });

  interface WrapperProps {
    garageId?: string;
  }

  const createWrapper = (props: WrapperProps = {}) => {
    return mount(GarageView, {
      props: {
        projectId: '1',
        propertyId: '2',
        buildingId: '3',
        ...props, // Spread optional garageId for edit mode
        ...defaultProps,
      },
      global: {
        plugins: [PrimeVue],
      },
    });
  };

  it('renders the create form when not in edit mode', () => {
    const wrapper = createWrapper();
    const reusableForm = wrapper.findComponent({ name: 'ReusableFormComponentVue' });
    expect(reusableForm.props('headline')).toBe('Garage Creation Form');
    expect(wrapper.findAll('button')[0].text()).toBe('Cancel');
    expect(wrapper.findAll('button')[1].text()).toBe('Save');
  });

  it('renders the edit form when in edit mode', () => {
    const wrapper = createWrapper({ garageId: '123' });
    const reusableForm = wrapper.findComponent({ name: 'ReusableFormComponentVue' });
    expect(reusableForm.props('headline')).toBe('Edit Garage Form');
    expect(wrapper.findAll('button')[0].text()).toBe('Cancel');
    expect(wrapper.findAll('button')[1].text()).toBe('Save');
  });

  it('populates the form with fetched data in edit mode', async () => {
    mockGetGarage.mockResolvedValueOnce({
      data: dummyGarageData,
    });

    const wrapper = createWrapper({ garageId: '123' });
    await flushPromises();

    expect(mockGetGarage).toHaveBeenCalledWith('1', '2', '3', '123');
    const reusableForm = wrapper.findComponent({ name: 'ReusableFormComponentVue' });
    expect(reusableForm.props('initialValues')).toEqual({
      title: dummyGarageData.title,
      description: dummyGarageData.description,
      location: dummyGarageData.location,
      usableSpace: dummyGarageData.usableSpace,
    });

    // Simulate form values (uncomment when inputs are implemented)
    // expect(wrapper.find('input[name="title"]').element.value).toBe(dummyGarageData.title);
    // expect(wrapper.find('textarea[name="location"]').element.value).toBe(dummyGarageData.location);
  });

  it('handles form submission for create mode', async () => {
    const wrapper = createWrapper();
    //temporary without testing service//
    const mockFormData = {
      title: 'New Garage',
      description: 'A spacious new garage',
      location: 'Downtown',
      usableSpace: '50',
    };
    await wrapper
      .findComponent({ name: 'ReusableFormComponentVue' })
      .vm.$emit('submit', mockFormData);
    await flushPromises();
    expect(mockCreateGarage).toHaveBeenCalledWith('1', '2', '3', {
      title: 'New Garage',
      description: 'A spacious new garage',
      location: 'Downtown',
      usableSpace: 50, // ensure usableSpace is converted to a number
      buildingId: '3',
    });
    //end temporary implementation//

    // Uncomment when backend is ready
    // expect(wrapper.emitted()).toHaveProperty('submit');
  });

  it('handles form submission for update mode', async () => {
    mockUpdateGarage.mockResolvedValueOnce({ success: true });
    const wrapper = createWrapper({ garageId: '123' });
    // Simulate submit with test values
    const mockFormData = {
      title: 'Updated Garage',
      description: 'An updated spacious garage',
      location: 'Uptown',
      usableSpace: '75',
    };
    // Emit submit event with form data
    await wrapper
      .findComponent({ name: 'ReusableFormComponentVue' })
      .vm.$emit('submit', mockFormData);
    await flushPromises();
    expect(mockUpdateGarage).toHaveBeenCalledWith('1', '2', '3', '123', {
      title: 'Updated Garage',
      description: 'An updated spacious garage',
      location: 'Uptown',
      usableSpace: 75,
      buildingId: '3',
    });
    // Uncomment when backend is ready
    // expect(wrapper.emitted()).toHaveProperty('submit');
  });

  it('navigates back when cancel is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper.find('button').trigger('click'); // Simulate cancel button click
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it('validates usable space input', async () => {
    const wrapper = createWrapper();
    const usableSpaceInput = wrapper.find('input[name="usableSpace"]');
    await usableSpaceInput.setValue('-10');
    await wrapper.find('form').trigger('submit.prevent');
  });

  it('validates title input length', async () => {
    const wrapper = createWrapper();
    const titleInput = wrapper.find('input[name="title"]');
    await titleInput.setValue('ab'); // Invalid title length
    await wrapper.find('form').trigger('submit.prevent');
  });
});
