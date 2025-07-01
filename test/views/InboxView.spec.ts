import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import InboxView from '../../src/views/InboxView.vue';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';
import { inboxService } from '../../src/services/InboxService';


// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('primevue/config', () => ({ default: { install: () => {}, locale: 'en' } }));
vi.mock('@/services/InboxService', () => ({ inboxService: { fetchInboxData: vi.fn() } }));
const mockFetch = inboxService.fetchInboxData as any;  // als any casten

// Stubs & global plugins
const globalConfig = {
  plugins: [PrimeVue, i18n],
  stubs: {
    DataTable: { template: '<div><slot/></div>' },
    Column: true,
    MultiSelect: { template: '<div class="multi-select"><slot/></div>' },
    DatePicker: { template: '<div class="date-picker"><slot/></div>' },
    Dialog: { template: '<div><slot/></div>' },
    Button: { template: '<button><slot/></button>' },
  }
};

// Helper function to mount the component with mock data
async function mountWithData(data: any[]) {
  mockFetch.mockResolvedValue(data);
  const wrapper = mount(InboxView, { global: globalConfig });
  return wrapper;
}

describe('InboxView.vue', () => {
  it('mounts and calls fetchInboxData, sets isLoading=false when no data', async () => {
    const wrapper = await mountWithData([]);
    expect(wrapper.exists()).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
    const vm = wrapper.vm as any;
    expect(vm.isLoading).toBe(false);
    expect(vm.filteredMessages).toHaveLength(0);
  });

  it('clearFilters resets all filters', async () => {
    const wrapper = await mountWithData([]);
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

  it('markRead/UnreadSelected und einzelne toggles funktionieren', async () => {
    const wrapper = await mountWithData([]);
    const vm = wrapper.vm as any;

    // single actions
    const msg = { id: '1', isRead: false };
    vm.messages = [msg];
    vm.markAsRead(msg);
    expect(vm.messages[0].isRead).toBe(true);
    vm.markAsUnread(msg);
    expect(vm.messages[0].isRead).toBe(false);

    // bulk actions
    vm.messages = [{ id: 'a', isRead: false }, { id: 'b', isRead: true }];
    vm.selectedMessages = [vm.messages[0], vm.messages[1]];
    vm.markReadSelected();
    await nextTick();
    expect(vm.messages.every((m: any) => m.isRead)).toBe(true);
    expect(vm.selectedMessages).toEqual([]);

    vm.selectedMessages = [vm.messages[0]];
    vm.markUnreadSelected();
    await nextTick();
    expect(vm.messages[0].isRead).toBe(false);
    expect(vm.selectedMessages).toEqual([]);
  });

  it('deleteSelected, confirmDeleteSelected und cancelDelete funktionieren', async () => {
    const wrapper = await mountWithData([]);
    const vm = wrapper.vm as any;
    vm.messages = [{ id: '1' }, { id: '2' }];
    vm.selectedMessages = [vm.messages[0]];

    vm.deleteSelected();
    expect(vm.isDeleteDialogVisible).toBe(true);

    vm.cancelDelete();
    expect(vm.isDeleteDialogVisible).toBe(false);

    vm.deleteSelected();
    vm.confirmDeleteSelected();
    await nextTick();
    expect(vm.messages.map((m: any) => m.id)).toEqual(['2']);
    expect(vm.selectedMessages).toEqual([]);
    expect(vm.isDeleteDialogVisible).toBe(false);
  });

  it('onRowClick navigates korrekt', async () => {
    const wrapper = await mountWithData([]);
    const vm = wrapper.vm as any;
    vm.onRowClick({ originalEvent: new MouseEvent('click'), data: { id: 'xyz' } });
    expect(mockPush).toHaveBeenCalledWith({ name: 'InboxDetail', params: { id: 'xyz' } });
  });

  describe('computed filteredMessages', () => {
    const sampleData = [
      { id: '1', type: 'A', contractor: 'X', project: 'P1', unit: 'U1', tenant: 'T1', owner: 'O1', isRead: false, receivedAt: new Date('2025-06-01T10:00:00Z') },
      { id: '2', type: 'B', contractor: 'Y', project: 'P2', unit: 'U2', tenant: 'T2', owner: 'O2', isRead: true,  receivedAt: new Date('2025-06-05T23:59:59Z') },
      { id: '3', type: 'A', contractor: 'X', project: 'P1', unit: 'U1', tenant: 'T1', owner: 'O1', isRead: false, receivedAt: new Date('2025-06-10T12:00:00Z') },
    ];

    let vm: any;
    beforeEach(async () => {
      const wrapper = await mountWithData(sampleData);
      vm = wrapper.vm;
    });

    it('no filter, all messages', () => {
      vm.filterType = [];
      vm.filterStatus = [];
      vm.filterDateRange = null;
      expect(vm.filteredMessages).toHaveLength(3);
    });

    it('filter by type', async () => {
      vm.filterType = ['A'];
      await nextTick();
      expect(vm.filteredMessages.every((m: any) => m.type === 'A')).toBe(true);
      expect(vm.filteredMessages).toHaveLength(2);
    });

    it('filter by status', async () => {
      vm.filterStatus = ['read'];
      await nextTick();
      expect(vm.filteredMessages).toEqual([sampleData[1]]);
    });

    it('filter by date range (inclusive)', async () => {
      vm.filterDateRange = [new Date('2025-06-01'), new Date('2025-06-05')];
      await nextTick();
      expect(vm.filteredMessages.map((m: any) => m.id)).toEqual(['1', '2']);
    });

    it('rowClass für unread/read', () => {
      expect(vm.rowClass(sampleData[0])).toBe('font-semibold');
      expect(vm.rowClass(sampleData[1])).toBe('');
    });
  });
});