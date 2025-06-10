import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import InboxView from '../../src/views/InboxView.vue';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock PrimeVue plugin to avoid errors
vi.mock('primevue/config', () => ({ default: { install: () => {}, locale: 'en' } }));

describe('InboxView.vue', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    mockPush.mockClear();

    wrapper = mount(InboxView, {
      global: {
        plugins: [PrimeVue, i18n],
        stubs: {
          DataTable: { template: '<div><slot /></div>' },
          Column: true,
          MultiSelect: { template: '<div class="multi-select"><slot /></div>' },
          DatePicker: { template: '<div class="date-picker"><slot /></div>' },
          Dialog: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        }
      }
    });
  });

  it('mounts properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('clearFilters resets all filters', async () => {
    const vm = wrapper.vm as any;

    vm.filterType = ['a'];
    vm.filterContractor = ['b'];
    vm.filterProject = ['c'];
    vm.filterUnit = ['d'];
    vm.filterTenant = ['e'];
    vm.filterOwner = ['f'];
    vm.filterStatus = ['read'];
    vm.filterDateRange = [new Date(), new Date()];

    vm.clearFilters();
    await nextTick();

    expect(vm.filterType).toEqual([]);
    expect(vm.filterContractor).toEqual([]);
    expect(vm.filterProject).toEqual([]);
    expect(vm.filterUnit).toEqual([]);
    expect(vm.filterTenant).toEqual([]);
    expect(vm.filterOwner).toEqual([]);
    expect(vm.filterStatus).toEqual([]);
    expect(vm.filterDateRange).toBeNull();
  });

  it('markReadSelected marks selected messages as read', async () => {
    const vm = wrapper.vm as any;
    vm.messages = [{ id: '1', isRead: false }];
    vm.selectedMessages = [vm.messages[0]];

    vm.markReadSelected();
    await nextTick();

    expect(vm.messages[0].isRead).toBe(true);
    expect(vm.selectedMessages).toEqual([]);
  });

  it('markUnreadSelected marks selected messages as unread', async () => {
    const vm = wrapper.vm as any;
    vm.messages = [{ id: '1', isRead: true }];
    vm.selectedMessages = [vm.messages[0]];

    vm.markUnreadSelected();
    await nextTick();

    expect(vm.messages[0].isRead).toBe(false);
    expect(vm.selectedMessages).toEqual([]);
  });

  it('deleteSelected and confirmDeleteSelected removes selected messages', async () => {
    const vm = wrapper.vm as any;
    vm.messages = [
      { id: '1', isRead: false },
      { id: '2', isRead: false }
    ];
    vm.selectedMessages = [vm.messages[0]];

    vm.deleteSelected();
    expect(vm.isDeleteDialogVisible).toBe(true);

    vm.confirmDeleteSelected();
    await nextTick();

    expect(vm.messages.map((m: any) => m.id)).toEqual(['2']);
    expect(vm.selectedMessages).toEqual([]);
    expect(vm.isDeleteDialogVisible).toBe(false);
  });

  it('onRowClick navigates to detail page', () => {
    const vm = wrapper.vm as any;
    const fakeMsg = { id: 'xyz' };
    vm.onRowClick({ originalEvent: new MouseEvent('click'), data: fakeMsg });
    expect(mockPush).toHaveBeenCalledWith({ name: 'InboxDetail', params: { id: 'xyz' } });
  });

  it('clicking the clear-X icon resets just that filter', async () => {
    const vm = wrapper.vm as any;
    vm.filterType = ['foo'];
    await nextTick();

    const icon = wrapper.find('i.pi-times');
    expect(icon.exists()).toBe(true);

    await icon.trigger('click');
    await nextTick();

    expect(vm.filterType).toEqual([]);
  });
});
