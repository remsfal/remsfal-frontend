import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TenancyDataComponent from '../../../src/components/tenancyDetails/TenancyDataComponent.vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

// Mock PrimeVue config to avoid plugin errors
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    locale: 'en',
  },
}));

describe('TenancyDataComponent.vue', () => {
  let wrapper: VueWrapper;

  const sampleTenants = [
    {
      id: 'tenant-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  ];

  beforeEach(() => {
    wrapper = mount(TenancyDataComponent, {
      global: {
        plugins: [PrimeVue],
        components: {
          Button,
          InputText,
          Card,
          Column,
          DataTable,
        },
      },
      props: {
        tenants: sampleTenants,
        isDeleteButtonEnabled: true,
      },
    });
  });

  it('mounts the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders tenant rows correctly', () => {
    const rows = wrapper.findAll('tr');
    // 1 header + 1 data row
    expect(rows.length).toBeGreaterThan(1);
    expect(wrapper.text()).toContain('John');
    expect(wrapper.text()).toContain('Doe');
  });

  it('emits on-change event when cell is edited', async () => {
    const input = wrapper.find('input');
    await input.setValue('Jane');
    await input.trigger('blur');

    const emitted = wrapper.emitted('on-change');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0][0].firstName).toBe('Jane');
  });

  it('adds a new tenant row on button click', async () => {
    const addButton = wrapper.find('button'); // Neuen Mieter hinzufügen
    await addButton.trigger('click');

    const rows = wrapper.findAll('tr');
    // Should now be more than one data row
    expect(rows.length).toBeGreaterThan(2);
  });

  it('deletes a tenant row when delete button is clicked', async () => {
    const deleteButtons = wrapper.findAll('button.p-button-danger');
    expect(deleteButtons.length).toBeGreaterThan(0);

    await deleteButtons[0].trigger('click');

    const emitted = wrapper.emitted('on-change');
    expect(emitted).toBeTruthy();
    expect(emitted![emitted!.length - 1][0].length).toBe(0); // All tenants deleted
  });
});
