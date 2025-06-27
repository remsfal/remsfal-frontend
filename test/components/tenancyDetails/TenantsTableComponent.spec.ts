import { mount } from '@vue/test-utils';
import TenantsTableComponent from '../../../src/components/tenancyDetails/TenantsTableComponent.vue';
import { tenancyService } from '../../../src/services/TenancyService';

vi.mock('@/services/TenancyService', () => ({
  tenancyService: {
    updateTenancyTenantItem: vi.fn(),
  },
}));

describe('TenantsTableComponent', () => {
  const tenantsMock = [{ id: '1', firstName: 'Max', lastName: 'Mustermann', email: 'max@test.de' }];

  it('renders tenant data in table', () => {
    const wrapper = mount(TenantsTableComponent, {
      props: { tenants: tenantsMock, isDeleteButtonEnabled: false },
    });

    expect(wrapper.text()).toContain('Max');
    expect(wrapper.text()).toContain('Mustermann');
    expect(wrapper.text()).toContain('max@test.de');
  });

  it('emits updated data when a cell is edited', async () => {
    const wrapper = mount(TenantsTableComponent, {
      props: { tenants: tenantsMock, isDeleteButtonEnabled: false },
    });

    const newData = { ...tenantsMock[0], firstName: 'Moritz' };
    await wrapper.vm.onCellEditComplete({ newData, index: 0 });

    expect(wrapper.emitted('onChange')).toBeTruthy();
    expect(wrapper.emitted('onChange')![0][0][0].firstName).toBe('Moritz');
    expect(tenancyService.updateTenancyTenantItem).toHaveBeenCalled();
  });

  it('adds a new row when button is clicked', async () => {
    const wrapper = mount(TenantsTableComponent, {
      props: { tenants: tenantsMock, isDeleteButtonEnabled: true },
    });

    await wrapper.find('button').trigger('click');

    // toBe(3) because onMounted adds a tenant, tenantsMock adds a tenant and the button click adds another one
    expect(wrapper.vm.localTenants.length).toBe(3);
    expect(wrapper.vm.localTenants[1].firstName).toBe('');
  });

  it('deletes a row and emits change', async () => {
    const wrapper = mount(TenantsTableComponent, {
      props: { tenants: tenantsMock, isDeleteButtonEnabled: true },
    });

    await wrapper.vm.deleteRow(0);

    //same prodecure as above, but now we delete the first row
    expect(wrapper.vm.localTenants.length).toBe(1);
    expect(wrapper.emitted('onChange')).toBeTruthy();
  });
});
