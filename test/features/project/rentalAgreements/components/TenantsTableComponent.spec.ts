import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import TenantsTableComponent from '@/features/project/rentalAgreements/components/TenantsTableComponent.vue';
import type { TenantJson } from '@/features/project/rentalAgreements/services/TenantService';

describe('TenantsTableComponent', () => {
  const tenantsMock = [{
    id: '1', firstName: 'Max', lastName: 'Mustermann', email: 'max@test.de'
  }];

  it('renders tenant data in table', () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: false },});

    expect(wrapper.text()).toContain('Max');
    expect(wrapper.text()).toContain('Mustermann');
    expect(wrapper.text()).toContain('max@test.de');
  });

  it('emits updated data when a cell is edited', async () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: false },});

    const newData = { ...tenantsMock[0], firstName: 'Moritz' };
    await wrapper.findComponent(DataTable).vm.$emit('cellEditComplete', { newData, index: 0 });

    expect(wrapper.emitted('onChange')).toBeTruthy();
    // emitted() payload types are erased to `unknown` by @vue/test-utils; narrow to the known emit payload shape
    const onChangePayload = wrapper.emitted('onChange')![0][0] as unknown as TenantJson[];
    expect(onChangePayload[0].firstName).toBe('Moritz');
  });

  it('adds a new row when button is clicked', async () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: true },});

    await wrapper.find('button').trigger('click');

    // toBe(3) because onMounted adds a tenant, tenantsMock adds a tenant and the button click adds another one
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(3);
    const secondRowCells = rows[1].findAll('td');
    expect(secondRowCells[0].text()).toBe('');
  });

  it('shows delete button when isDeleteButtonEnabled is true', () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: true },});

    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(true);
  });

  it('doesnt show delete button when isDeleteButtonEnabled is false', () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: false },});

    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(false);
  });

  it('deletes a row and emits change', async () => {
    const wrapper = mount(TenantsTableComponent, {props: { tenants: tenantsMock, isDeleteButtonEnabled: true },});

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    //same prodecure as above, but now we delete the first row
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.emitted('onChange')).toBeTruthy();
  });
});
