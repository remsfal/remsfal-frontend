import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmployeeRoleSelect from '@/features/common/organizations/components/EmployeeRoleSelect.vue';

describe('EmployeeRoleSelect', () => {
  const mountSelect = (props = {}) =>
    mount(EmployeeRoleSelect, {
      props,
      global: {
        stubs: {
          Select: {
            template: '<select />',
            props: ['name', 'inputId', 'modelValue', 'options', 'class', 'placeholder', 'optionLabel', 'optionValue'],
          },
        },
      },
    });

  it('renders without errors', () => {
    const wrapper = mountSelect();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a Select stub', () => {
    const wrapper = mountSelect();
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('passes modelValue to the underlying Select', () => {
    const wrapper = mount(EmployeeRoleSelect, {
      props: { modelValue: 'MANAGER' },
      global: {
        stubs: {
          Select: {
            template: '<div>{{ modelValue }}</div>',
            props: ['name', 'inputId', 'modelValue', 'options', 'class', 'placeholder', 'optionLabel', 'optionValue'],
          },
        },
      },
    });
    expect(wrapper.text()).toContain('MANAGER');
  });

  it('applies invalid class when invalid prop is true', () => {
    const wrapper = mount(EmployeeRoleSelect, {
      props: { invalid: true },
      global: {
        stubs: {
          Select: {
            inheritAttrs: false,
            template: '<div v-bind="$attrs" />',
          },
        },
      },
    });
    expect(wrapper.html()).toContain('p-invalid');
  });

  it('passes inputId as id attribute to underlying Select', () => {
    const wrapper = mount(EmployeeRoleSelect, {
      props: { inputId: 'my-role-select' },
      global: {
        stubs: {
          Select: {
            template: '<div v-bind="$attrs"></div>',
            inheritAttrs: false,
          },
        },
      },
    });
    expect(wrapper.html()).toContain('my-role-select');
  });

  it('emits update:modelValue when value changes', async () => {
    const wrapper = mount(EmployeeRoleSelect, {
      props: { modelValue: 'OWNER' },
      global: {
        stubs: {
          Select: {
            template: '<button @click="$emit(\'update:modelValue\', \'STAFF\')">change</button>',
            props: ['name', 'inputId', 'modelValue', 'options', 'class', 'placeholder', 'optionLabel', 'optionValue'],
            emits: ['update:modelValue'],
          },
        },
      },
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['STAFF']);
  });
});
