import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import RentalAgreementTenantListCard from '@/features/project/rentalAgreements/components/RentalAgreementTenantListCard.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

const toastSpy = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastSpy }) }));

const baseAgreement: RentalAgreementJson = {
  id: 'agreement-1',
  tenants: [{
    id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann', email: 'max@test.de' 
  }],
};

describe('RentalAgreementTenantListCard', () => {
  beforeEach(() => {
    vi.spyOn(rentalAgreementService, 'addTenant').mockResolvedValue({
      id: 'tenant-2',
      firstName: 'Erika',
      lastName: 'Musterfrau',
    });
    vi.spyOn(rentalAgreementService, 'removeTenant').mockResolvedValue(undefined);
  });

  const mountCard = (agreement: RentalAgreementJson = baseAgreement) =>
    mount(RentalAgreementTenantListCard, {props: { projectId: 'proj-1', rentalAgreement: agreement },});

  it('renders a TenantCard for each tenant', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Max Mustermann');
  });

  it('shows empty state when there are no tenants', () => {
    const wrapper = mountCard({ ...baseAgreement, tenants: [] });
    expect(wrapper.text()).toContain('Noch keine Mieter hinzugefügt.');
  });

  it('adds a new tenant via addTenant and emits update:rentalAgreement with the created tenant', async () => {
    const wrapper = mountCard();

    const addBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));
    await addBtn?.trigger('click');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' },
        lastName: { value: 'Musterfrau' },
        email: { value: '' },
        mobilePhoneNumber: { value: '' },
        businessPhoneNumber: { value: '' },
        privatePhoneNumber: { value: '' },
        placeOfBirth: { value: '' },
      },
    });
    await flushPromises();

    expect(rentalAgreementService.addTenant).toHaveBeenCalledWith(
      'proj-1',
      'agreement-1',
      expect.objectContaining({ firstName: 'Erika', lastName: 'Musterfrau' }),
    );

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    const updatedAgreement = emitted![0][0] as RentalAgreementJson;
    expect(updatedAgreement.tenants).toEqual([
      expect.objectContaining({ firstName: 'Max' }),
      expect.objectContaining({ id: 'tenant-2', firstName: 'Erika' }),
    ]);
    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('removes a tenant via the TenantCard delete button and calls removeTenant with the tenant id', async () => {
    const wrapper = mountCard();

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    expect(rentalAgreementService.removeTenant).toHaveBeenCalledWith('proj-1', 'agreement-1', 'tenant-1');

    const emitted = wrapper.emitted('update:rentalAgreement');
    expect(emitted).toBeTruthy();
    const updatedAgreement = emitted![0][0] as RentalAgreementJson;
    expect(updatedAgreement.tenants).toEqual([]);
  });

  it('does not navigate when the delete button is clicked', async () => {
    const wrapper = mountCard();

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    expect(push).not.toHaveBeenCalled();
  });

  it('shows an error toast when adding a tenant fails', async () => {
    vi.spyOn(rentalAgreementService, 'addTenant').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    const addBtn = wrapper.findAll('button').find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));
    await addBtn?.trigger('click');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' },
        lastName: { value: 'Musterfrau' },
        email: { value: '' },
        mobilePhoneNumber: { value: '' },
        businessPhoneNumber: { value: '' },
        privatePhoneNumber: { value: '' },
        placeOfBirth: { value: '' },
      },
    });
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('shows an error toast when removing a tenant fails', async () => {
    vi.spyOn(rentalAgreementService, 'removeTenant').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountCard();
    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('navigates to tenant detail when a tenant with an id is clicked', async () => {
    const wrapper = mountCard();

    await wrapper.find('[data-testid="tenant-card"]').trigger('click');

    expect(push).toHaveBeenCalledWith({
      name: 'TenantDetail',
      params: { projectId: 'proj-1', tenantId: 'tenant-1' },
    });
  });

  it('does not navigate when the tenant has no id', async () => {
    const wrapper = mountCard({
      ...baseAgreement,
      tenants: [{ firstName: 'Neu', lastName: 'Mieter' }],
    });

    await wrapper.find('[data-testid="tenant-card"]').trigger('click');

    expect(push).not.toHaveBeenCalled();
  });
});
