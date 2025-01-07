import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GarageView from '@/views/GarageView.vue';
import PrimeVue from 'primevue/config';

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

const mockRouterBack = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: mockRouterBack,
  }),
}));

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

const dummyGarageData = {
  title: 'Test Garage',
  description: 'Test description',
  location: 'Basement A',
  usableSpace: '50',
};

describe('GarageView.vue', () => {
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
  let originalAlert: any;

  beforeEach(() => {
    vi.clearAllMocks();
    originalAlert = window.alert;
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.alert = originalAlert;
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
        ...props,
        ...defaultProps,
      },
      global: {
        plugins: [PrimeVue],
      },
    });
  };

  const validateFormSubmission = async (wrapper, mockFormData, expectedCalls) => {
    await wrapper
      .findComponent({ name: 'ReusableFormComponentVue' })
      .vm.$emit('submit', mockFormData);
    await flushPromises();
    expect(mockCreateGarage).toHaveBeenCalledTimes(expectedCalls.create);
    expect(mockUpdateGarage).toHaveBeenCalledTimes(expectedCalls.update);
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
  });

  it('handles form submission for create mode', async () => {
    const wrapper = createWrapper();
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
      usableSpace: 50,
      buildingId: '3',
    });
  });

  it('handles form submission for update mode', async () => {
    mockUpdateGarage.mockResolvedValueOnce({ success: true });
    const wrapper = createWrapper({ garageId: '123' });
    const mockFormData = {
      title: 'Updated Garage',
      description: 'An updated spacious garage',
      location: 'Uptown',
      usableSpace: '75',
    };
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
  });

  it('navigates back when cancel is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper.find('button').trigger('click');
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it('validates form submission with various invalid inputs', async () => {
    const wrapper = createWrapper();

    const testCases = [
      {
        data: { title: '', description: 'A spacious new garage', location: 'Downtown', usableSpace: '50' },
        description: 'missing required fields',
      },
      {
        data: { title: 'Valid Garage Title', description: 'A spacious new garage', location: 'Downtown', usableSpace: '-10' },
        description: 'invalid usable space value',
      },
      {
        data: { title: 'ab', description: 'A spacious new garage', location: 'Downtown', usableSpace: '50' },
        description: 'invalid title length',
      },
      {
        data: { title: 'ab', description: '', location: '', usableSpace: '-10' },
        description: 'invalid data for all fields',
      },
    ];

    for (const testCase of testCases) {
      await validateFormSubmission(wrapper, testCase.data, { create: 0, update: 0 });
    }
  });

  it('shows an alert when data fetch fails', async () => {
    mockGetGarage.mockRejectedValueOnce(new Error('Failed to fetch garage data.'));
    const wrapper = createWrapper({ garageId: '123' });
    await flushPromises();
    expect(window.alert).toHaveBeenCalledWith('Failed to fetch garage data. Please try again.');
    expect(wrapper.exists()).toBe(true);
  });

  it('shows an alert when creating a garage fails', async () => {
    mockCreateGarage.mockRejectedValueOnce(new Error('Failed to create garage.'));
    const wrapper = createWrapper();
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
    expect(window.alert).toHaveBeenCalledWith('Failed to submit garage data. Please try again.');
  });

  it('shows an alert when updating a garage fails', async () => {
    mockUpdateGarage.mockRejectedValueOnce(new Error('Failed to update garage.'));
    const wrapper = createWrapper({ garageId: '123' });
    const mockFormData = {
      title: 'Updated Garage',
      description: 'An updated spacious garage',
      location: 'Uptown',
      usableSpace: '75',
    };
    await wrapper
      .findComponent({ name: 'ReusableFormComponentVue' })
      .vm.$emit('submit', mockFormData);
    await flushPromises();
    expect(window.alert).toHaveBeenCalledWith('Failed to submit garage data. Please try again.');
  });
});