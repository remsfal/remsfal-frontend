import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import Step3TenantsForm from '@/components/rentalAgreement/Step3TenantsForm.vue';
import type { TenantItem } from '@/services/RentalAgreementService';
import { tenantService } from '@/services/TenantService';

vi.mock('@/services/TenantService', () => ({
  tenantService: {fetchTenants: vi.fn(),},
  TenantItem: {},
}));

describe('Step3TenantsForm', () => {
  let wrapper: VueWrapper;

  const mockTenants: TenantItem[] = [
    {
      id: '1',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      mobilePhoneNumber: '+491234567890',
    },
    {
      id: '2',
      firstName: 'Erika',
      lastName: 'Musterfrau',
      email: 'erika@example.com',
    },
  ];

  const defaultProps = {
    projectId: 'project-123',
    tenants: [],
  };

  beforeEach(async () => {
    vi.mocked(tenantService.fetchTenants).mockResolvedValue(mockTenants);

    wrapper = mount(Step3TenantsForm, {props: defaultProps,});

    await flushPromises();
  });

  it('renders the component with title', () => {
    expect(wrapper.find('h3').text()).toBe('Mieterinformationen');
  });

  it('loads tenants on mount', async () => {
    expect(tenantService.fetchTenants).toHaveBeenCalledWith('project-123');
  });

  it('shows AutoComplete for selecting existing tenants', () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    expect(autoComplete.exists()).toBe(true);
  });

  it('shows "Add New Tenant" button', () => {
    const addButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));
    expect(addButton).toBeDefined();
  });

  it('displays TenantForm when "Add New Tenant" is clicked', async () => {
    const addButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));

    await addButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const tenantForm = wrapper.findComponent({ name: 'TenantForm' });
    expect(tenantForm.exists()).toBe(true);
  });

  it('hides TenantForm when cancel is emitted', async () => {
    const addButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));
    await addButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const tenantForm = wrapper.findComponent({ name: 'TenantForm' });
    await tenantForm.vm.$emit('cancel');
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'TenantForm' }).exists()).toBe(false);
  });

  it('adds tenant to list when TenantForm emits submit', async () => {
    const addButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Neuen Mieter hinzufügen'));
    await addButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const newTenant: TenantItem = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const tenantForm = wrapper.findComponent({ name: 'TenantForm' });
    await tenantForm.vm.$emit('submit', newTenant);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:tenants')).toBeTruthy();
    const emittedTenants = wrapper.emitted('update:tenants')?.[0]?.[0] as TenantItem[];
    expect(emittedTenants).toHaveLength(1);
    expect(emittedTenants[0]).toEqual(newTenant);
  });

  it('displays selected tenants in the list', async () => {
    await wrapper.setProps({tenants: mockTenants,});

    await wrapper.vm.$nextTick();

    const tenantCards = wrapper.findAll('.bg-gray-50');
    expect(tenantCards.length).toBe(2);
    expect(tenantCards[0].text()).toContain('Max Mustermann');
    expect(tenantCards[1].text()).toContain('Erika Musterfrau');
  });

  it('removes tenant from list when trash button is clicked', async () => {
    await wrapper.setProps({tenants: mockTenants,});

    await wrapper.vm.$nextTick();

    const deleteButtons = wrapper.findAllComponents({ name: 'Button' }).filter(btn =>
      btn.props('icon') === 'pi pi-trash'
    );
    await deleteButtons[0].trigger('click');

    expect(wrapper.emitted('update:tenants')).toBeTruthy();
    const emittedTenants = wrapper.emitted('update:tenants')?.[0]?.[0] as TenantItem[];
    expect(emittedTenants).toHaveLength(1);
    expect(emittedTenants[0].id).toBe('2');
  });

  it('shows validation message when no tenants are selected', async () => {
    const message = wrapper.findComponent({ name: 'Message' });
    expect(message.exists()).toBe(true);
    expect(message.text()).toContain('Mindestens ein Mieter ist erforderlich');
  });

  it('hides validation message when tenants are selected', async () => {
    await wrapper.setProps({tenants: mockTenants,});

    await wrapper.vm.$nextTick();

    const messages = wrapper.findAllComponents({ name: 'Message' });
    const validationMessage = messages.find((msg) =>
      msg.text().includes('Mindestens ein Mieter ist erforderlich'),
    );
    expect(validationMessage).toBeUndefined();
  });

  it('disables next button when no tenants are selected', async () => {
    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));

    expect(nextButton?.attributes('disabled')).toBeDefined();
  });

  it('enables next button when tenants are selected', async () => {
    await wrapper.setProps({tenants: mockTenants,});

    await wrapper.vm.$nextTick();

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));

    expect(nextButton?.attributes('disabled')).toBeUndefined();
  });

  it('emits back event when back button is clicked', async () => {
    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Zurück'));

    await backButton?.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits next event when next button is clicked', async () => {
    await wrapper.setProps({tenants: mockTenants,});

    await wrapper.vm.$nextTick();

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('Weiter'));

    await nextButton?.trigger('click');
    expect(wrapper.emitted('next')).toBeTruthy();
  });

  it('adds existing tenant from AutoComplete selection', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });

    // Simulate selecting an existing tenant
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);

    expect(wrapper.emitted('update:tenants')).toBeTruthy();
    const emittedTenants = wrapper.emitted('update:tenants')?.[0]?.[0] as TenantItem[];
    expect(emittedTenants).toHaveLength(1);
    expect(emittedTenants[0].id).toBe('1');
  });

  it('does not add duplicate tenants', async () => {
    await wrapper.setProps({tenants: [mockTenants[0]],});

    await wrapper.vm.$nextTick();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });

    // Try to select the same tenant again
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);

    // Should not emit update:tenants since tenant is already in list
    const updateEvents = wrapper.emitted('update:tenants');
    // Only initial prop set, no new event
    expect(updateEvents).toBeUndefined();
  });

  it('formats date of birth correctly', async () => {
    const tenantWithBirthday: TenantItem = {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-15',
    };

    await wrapper.setProps({tenants: [tenantWithBirthday],});

    await wrapper.vm.$nextTick();

    const tenantCard = wrapper.find('.bg-gray-50');
    expect(tenantCard.text()).toContain('15.01.1990');
  });
});
