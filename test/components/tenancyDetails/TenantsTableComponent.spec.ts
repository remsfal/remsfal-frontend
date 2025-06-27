import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TenantsTableComponent from '../../../src/components/tenancyDetails/TenantsTableComponent.vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';

// Mock PrimeVue to prevent plugin errors
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    locale: 'en',
  },
}));

describe('TenantsTableComponent.vue', () => {
  let wrapper: VueWrapper;

  const sampleTenants = [
    {
      id: 't1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
    },
  ];

  beforeEach(() => {
    wrapper = mount(TenantsTableComponent, {
      global: {
        plugins: [PrimeVue],
        components: {
          Button,
          Card,
          Column,
          DataTable,
          InputText,
        },
      },
      props: {
        tenants: sampleTenants,
        isDeleteButtonEnabled: true,
      },
    });
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Mieter');
  });

  it('displays passed tenant data', () => {
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('Smith');
    expect(wrapper.text()).toContain('alice@example.com');
  });

  it('adds a new tenant row when "Add" button is clicked', async () => {
    const addButton = wrapper.find('button'); // Assumes first button is "Add"
    await addButton.trigger('click');

    // Should now be 2 tenants in the table
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(3); // One row added
  });

  it('deletes a tenant row when delete button is clicked', async () => {
    const deleteButton = wrapper.find('button.p-button-danger');
    expect(deleteButton.exists()).toBe(true);

    await deleteButton.trigger('click');

    const emitted = wrapper.emitted('on-change');
    expect(emitted).toBeTruthy();
    expect(emitted![emitted!.length - 1][0].length).toBe(0); // One tenant removed
  });

  it('emits updated tenants on cell edit complete', async () => {
    const input = wrapper.find('input');
    await input.setValue('Bob');
    await input.trigger('blur'); // Triggers cellEditComplete

    const emitted = wrapper.emitted('on-change');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0][0].firstName).toBe('Bob');
  });
});
