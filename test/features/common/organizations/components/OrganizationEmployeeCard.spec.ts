import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OrganizationEmployeeCard from '@/features/common/organizations/components/OrganizationEmployeeCard.vue';
import { organizationService } from '@/services/OrganizationService';

const VALID_UUID_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const VALID_UUID_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const mockEmployees = [
  {
    id: VALID_UUID_1, name: 'Max Muster', email: 'max@test.de', employeeRole: 'OWNER' as const, active: true 
  },
  {
    id: VALID_UUID_2, name: undefined, email: 'jane@test.de', employeeRole: 'STAFF' as const, active: false 
  },
];

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

describe('OrganizationEmployeeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(organizationService, 'getEmployees').mockResolvedValue({ employees: mockEmployees });
    vi.spyOn(organizationService, 'updateEmployeeRole').mockResolvedValue({
      id: 'emp-1',
      employeeRole: 'MANAGER',
    });
    vi.spyOn(organizationService, 'removeEmployee').mockResolvedValue(undefined);
  });

  const mountCard = (organizationId = 'org-123') =>
    mount(OrganizationEmployeeCard, {
      props: { organizationId },
      global: {
        stubs: {
          EmployeeRoleSelect: true,
          NewOrganizationEmployeeButton: true,
        },
      },
    });

  it('calls getEmployees on mount', async () => {
    mountCard();
    await flushPromises();
    expect(organizationService.getEmployees).toHaveBeenCalledWith('org-123');
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Mitglieder');
  });

  it('renders employee names in the table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Max Muster');
  });

  it('shows email when name is missing', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('jane@test.de');
  });

  it('shows inactive label for inactive employees', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Inaktiv');
  });

  it('does not show inactive label for active employees', async () => {
    vi.spyOn(organizationService, 'getEmployees').mockResolvedValue({
      employees: [{
        id: 'emp-1', name: 'Active User', email: 'active@test.de', employeeRole: 'OWNER', active: true 
      }],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).not.toContain('inaktiv');
  });

  it('renders EmployeeRoleSelect for each employee', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const selects = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' });
    expect(selects).toHaveLength(mockEmployees.length);
  });

  it('renders NewOrganizationEmployeeButton', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'NewOrganizationEmployeeButton' }).exists()).toBe(true);
  });

  it('calls updateEmployeeRole when role select emits change', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const firstSelect = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' })[0];
    await firstSelect.vm.$emit('change');
    await flushPromises();

    expect(organizationService.updateEmployeeRole).toHaveBeenCalled();
  });

  it('shows success toast when role update succeeds', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const firstSelect = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' })[0];
    await firstSelect.vm.$emit('change');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('logs error when employee id is missing on updateEmployeeRole', async () => {
    vi.spyOn(organizationService, 'getEmployees')
      .mockResolvedValue({employees: [{ email: 'no-id@test.de', employeeRole: 'STAFF' }]});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();

    const firstSelect = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' })[0];
    await firstSelect.vm.$emit('change');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('calls removeEmployee on delete button click', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const deleteButtons = wrapper.findAll('button').filter(b => b.text() === 'Löschen');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(organizationService.removeEmployee).toHaveBeenCalledWith('org-123', VALID_UUID_1);
  });

  it('does not call removeEmployee for invalid employeeId', async () => {
    mountCard();
    await flushPromises();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Manually call with invalid id by finding a stub
    vi.spyOn(organizationService, 'getEmployees').mockResolvedValue({
      employees: [{
        id: 'invalid-id!', email: 'test@test.de', employeeRole: 'STAFF', active: true 
      }],
    });
    const wrapper2 = mountCard();
    await flushPromises();

    const deleteButtons = wrapper2.findAll('button').filter(b => b.text() === 'Löschen');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(organizationService.removeEmployee).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('re-fetches employees after remove', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const fetchSpy = vi.spyOn(organizationService, 'getEmployees').mockResolvedValue({ employees: [] });

    const deleteButtons = wrapper.findAll('button').filter(b => b.text() === 'Löschen');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalled();
  });

  it('shows success toast when newEmployee event is emitted', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const employeeBtn = wrapper.findComponent({ name: 'NewOrganizationEmployeeButton' });
    await employeeBtn.vm.$emit('newEmployee', 'new@test.de');
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('does not throw when getEmployees fails', async () => {
    vi.spyOn(organizationService, 'getEmployees').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('handles error when updateEmployeeRole throws (with response data)', async () => {
    vi.spyOn(organizationService, 'updateEmployeeRole').mockRejectedValue({
      response: { data: { message: 'Conflict' } },
      message: 'Network error',
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();

    const firstSelect = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' })[0];
    await firstSelect.vm.$emit('change');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles error when updateEmployeeRole throws (without response data)', async () => {
    vi.spyOn(organizationService, 'updateEmployeeRole').mockRejectedValue(new Error('Server error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();

    const firstSelect = wrapper.findAllComponents({ name: 'EmployeeRoleSelect' })[0];
    await firstSelect.vm.$emit('change');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles error when removeEmployee throws (with response data)', async () => {
    vi.spyOn(organizationService, 'removeEmployee').mockRejectedValue({
      response: { data: { message: 'Not found' } },
      message: 'Remove failed',
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();

    const deleteButtons = wrapper.findAll('button').filter(b => b.text() === 'Löschen');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles error when removeEmployee throws (without response data)', async () => {
    vi.spyOn(organizationService, 'removeEmployee').mockRejectedValue(new Error('Server error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();

    const deleteButtons = wrapper.findAll('button').filter(b => b.text() === 'Löschen');
    await deleteButtons[0]?.trigger('click');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
