import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import InboxView from '../../src/views/InboxView.vue';
import PrimeVue from 'primevue/config';
import i18n from '../../src/i18n/i18n';
import { inboxService } from '../../src/services/InboxService';

// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('@/services/InboxService', () => ({ inboxService: { fetchInboxData: vi.fn() } }));
const mockFetch = inboxService.fetchInboxData as any; // cast as any

const globalConfig = {
  plugins: [PrimeVue, i18n],
  // no stubs - use real components for better coverage
};

// Helper to mount with mocked data
async function mountWithData(data: any[]) {
  mockFetch.mockResolvedValue(data);
  const wrapper = mount(InboxView, { global: globalConfig });
  await nextTick();
  return wrapper;
}

describe('InboxView.vue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetchInboxData and sets loading states correctly when no data', async () => {
    const wrapper = await mountWithData([]);
    expect(wrapper.exists()).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
    const vm = wrapper.vm as any;
    expect(vm.isLoading).toBe(false);
    expect(vm.filteredMessages).toHaveLength(0);
  });

  it('handles fetchInboxData failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const wrapper = mount(InboxView, { global: globalConfig });
    await nextTick();
    const vm = wrapper.vm as any;
    expect(vm.isLoading).toBe(false);
    expect(vm.error).toBeTruthy(); // assuming you handle error state in your component
  });

  it('clearFilters resets all filter data properly', async () => {
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

  describe('Mark as read/unread actions', () => {
    it('toggles single message read/unread correctly', async () => {
      const wrapper = await mountWithData([]);
      const vm = wrapper.vm as any;
      const msg = { id: '1', isRead: false };
      vm.messages = [msg];

      vm.markAsRead(msg);
      expect(vm.messages[0].isRead).toBe(true);

      vm.markAsUnread(msg);
      expect(vm.messages[0].isRead).toBe(false);
    });

    it('marks selected messages read/unread in bulk and clears selection', async () => {
      const wrapper = await mountWithData([]);
      const vm = wrapper.vm as any;
      vm.messages = [{ id: 'a', isRead: false }, { id: 'b', isRead: true }];
      vm.selectedMessages = [...vm.messages];

      vm.markReadSelected();
      await nextTick();
      expect(vm.messages.every((m: any) => m.isRead)).toBe(true);
      expect(vm.selectedMessages).toHaveLength(0);

      vm.selectedMessages = [vm.messages[0]];
      vm.markUnreadSelected();
      await nextTick();
      expect(vm.messages[0].isRead).toBe(false);
      expect(vm.selectedMessages).toHaveLength(0);
    });
  });

  describe('Delete selected messages flow', () => {
    it('shows and hides delete dialog properly', async () => {
      const wrapper = await mountWithData([]);
      const vm = wrapper.vm as any;
      vm.messages = [{ id: '1' }, { id: '2' }];
      vm.selectedMessages = [vm.messages[0]];

      vm.deleteSelected();
      expect(vm.isDeleteDialogVisible).toBe(true);

      vm.cancelDelete();
      expect(vm.isDeleteDialogVisible).toBe(false);
    });

    it('deletes selected messages and clears selection & dialog', async () => {
      const wrapper = await mountWithData([]);
      const vm = wrapper.vm as any;
      vm.messages = [{ id: '1' }, { id: '2' }];
      vm.selectedMessages = [vm.messages[0]];

      vm.deleteSelected();
      vm.confirmDeleteSelected();
      await nextTick();

      expect(vm.messages.map((m: any) => m.id)).toEqual(['2']);
      expect(vm.selectedMessages).toEqual([]);
      expect(vm.isDeleteDialogVisible).toBe(false);
    });
  });

  it('navigates on row click', async () => {
    const wrapper = await mountWithData([]);
    const vm = wrapper.vm as any;
    vm.onRowClick({ originalEvent: new MouseEvent('click'), data: { id: 'xyz' } });
    expect(mockPush).toHaveBeenCalledWith({ name: 'InboxDetail', params: { id: 'xyz' } });
  });

  describe('computed filteredMessages', () => {
    const sampleData = [
      { id: '1', type: 'A', contractor: 'X', project: 'P1', unit: 'U1', tenant: 'T1', owner: 'O1', isRead: false, receivedAt: new Date('2025-06-01T10:00:00Z') },
      { id: '2', type: 'B', contractor: 'Y', project: 'P2', unit: 'U2', tenant: 'T2', owner: 'O2', isRead: true, receivedAt: new Date('2025-06-05T23:59:59Z') },
      { id: '3', type: 'A', contractor: 'X', project: 'P1', unit: 'U1', tenant: 'T1', owner: 'O1', isRead: false, receivedAt: new Date('2025-06-10T12:00:00Z') },
    ];

    let vm: any;
    beforeEach(async () => {
      const wrapper = await mountWithData(sampleData);
      vm = wrapper.vm;
    });

    it('returns all messages with no filters', () => {
      vm.filterType = [];
      vm.filterStatus = [];
      vm.filterDateRange = null;
      expect(vm.filteredMessages).toHaveLength(3);
    });

    it('filters by type correctly', async () => {
      vm.filterType = ['A'];
      await nextTick();
      expect(vm.filteredMessages.every((m: any) => m.type === 'A')).toBe(true);
      expect(vm.filteredMessages).toHaveLength(2);
    });

    it('filters by read status', async () => {
      vm.filterStatus = ['read'];
      await nextTick();
      expect(vm.filteredMessages).toEqual([sampleData[1]]);
    });

    it('filters by date range inclusively', async () => {
      const start = new Date('2025-06-01T00:00:00Z');
      const end = new Date('2025-06-05T23:59:59Z');
      vm.filterDateRange = [start, end];
      await nextTick();
      expect(vm.filteredMessages.map((m: any) => m.id)).toEqual(['1', '2']);
    });

    it('rowClass returns correct class based on read status', () => {
      expect(vm.rowClass(sampleData[0])).toBe('font-semibold');
      expect(vm.rowClass(sampleData[1])).toBe('');
    });
  });
});
