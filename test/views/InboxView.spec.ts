import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import { nextTick } from 'vue';
import i18n from '../../src/i18n/i18n';
import InboxView from '../../src/views/InboxView.vue';
import { useInboxStore } from '../../src/stores/InboxStore';

// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('InboxView.vue', () => {
  let store: any;

  const sampleData = [
    {
      id: '1',
      type: 'A',
      contractor: 'X',
      project: 'P1',
      unit: 'U1',
      tenant: 'T1',
      owner: 'O1',
      isRead: false,
      receivedAt: new Date('2025-06-01T10:00:00Z'),
    },
    {
      id: '2',
      type: 'B',
      contractor: 'Y',
      project: 'P2',
      unit: 'U2',
      tenant: 'T2',
      owner: 'O2',
      isRead: true,
      receivedAt: new Date('2025-06-05T23:59:59Z'),
    },
    {
      id: '3',
      type: 'A',
      contractor: 'X',
      project: 'P1',
      unit: 'U1',
      tenant: 'T1',
      owner: 'O1',
      isRead: false,
      receivedAt: new Date('2025-06-10T12:00:00Z'),
    },
  ];

  beforeEach(() => {
    const pinia = createTestingPinia({
      stubActions: false,
    });
    store = useInboxStore(pinia);
    store.fetchInbox = vi.fn().mockResolvedValue(undefined);
    mount(InboxView, {
      global: {
        plugins: [pinia, PrimeVue, i18n],
      },
    });
  });

  it('calls fetchInbox on mount', () => {
    expect(store.fetchInbox).toHaveBeenCalled();
  });

  it('clears filters when clearFilters is called', async () => {
    store.filterType = ['a'];
    store.clearFilters();
    await nextTick();
    expect(store.filterType).toEqual([]);
  });

  it('marks messages as read/unread', async () => {
    const msg = { id: '1', isRead: false };
    store.messages = [msg];
    store.markAsRead(msg);
    expect(store.messages[0].isRead).toBe(true);
    store.markAsUnread(msg);
    expect(store.messages[0].isRead).toBe(false);
  });

  it('handles message deletion flow', async () => {
    store.messages = [{ id: '1' }, { id: '2' }];
    store.selectedMessages = [store.messages[0]];

    store.requestDeleteSelected();
    expect(store.isDeleteDialogVisible).toBe(true);

    store.cancelDelete();
    expect(store.isDeleteDialogVisible).toBe(false);

    store.requestDeleteSelected();
    store.confirmDeleteSelected();
    await nextTick();
    expect(store.messages.map((m: any) => m.id)).toEqual(['2']);
    expect(store.selectedMessages).toEqual([]);
    expect(store.isDeleteDialogVisible).toBe(false);
  });

  it('navigates on row click', () => {
    const wrapper = mount(InboxView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false }), PrimeVue, i18n],
      },
    });
    wrapper.vm.onRowClick({ originalEvent: new MouseEvent('click'), data: { id: 'xyz' } });
    expect(mockPush).toHaveBeenCalledWith({ name: 'InboxDetail', params: { id: 'xyz' } });
  });

  describe('computed filteredMessages', () => {
    beforeEach(() => {
      store.messages = sampleData;
    });

    it('no filter, all messages', () => {
      store.filterType = [];
      store.filterStatus = [];
      store.filterDateRange = null;
      expect(store.filteredMessages).toHaveLength(3);
    });

    it('filter by type', async () => {
      store.filterType = ['A'];
      await nextTick();
      expect(store.filteredMessages.every((m: any) => m.type === 'A')).toBe(true);
      expect(store.filteredMessages).toHaveLength(2);
    });

    it('filter by status', async () => {
      store.filterStatus = ['read'];
      await nextTick();
      expect(store.filteredMessages).toEqual([sampleData[1]]);
    });

    it('filter by date range (inclusive)', async () => {
      store.filterDateRange = [new Date('2025-06-01T00:00:00Z'), new Date('2025-06-05T23:59:59Z')];
      await nextTick();
      expect(store.filteredMessages.map((m: any) => m.id)).toEqual(['1', '2']);
    });

    it('rowClass for unread/read', () => {
      expect(store.rowClass(sampleData[0])).toBe('font-semibold');
      expect(store.rowClass(sampleData[1])).toBe('');
    });
  });
});