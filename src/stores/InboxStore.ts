import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { inboxService, type InboxMessage } from '@/services/InboxService';

function normalizeMessage(m: InboxMessage): InboxMessage {
  const received = (m as any).receivedAt;
  if (received && !(received instanceof Date)) {
    (m as any).receivedAt = new Date(received);
  }
  return m;
}

export const useInboxStore = defineStore('inbox', () => {
  // State
  const messages = ref<InboxMessage[]>([]);
  const isLoading = ref<boolean>(true);
  const selectedMessages = ref<InboxMessage[]>([]);
  const isDeleteDialogVisible = ref<boolean>(false);

  // Filters
  const filterType = ref<string[]>([]);
  const filterContractor = ref<string[]>([]);
  const filterProject = ref<string[]>([]);
  const filterUnit = ref<string[]>([]);
  const filterTenant = ref<string[]>([]);
  const filterOwner = ref<string[]>([]);
  const filterStatus = ref<string[]>([]);
  const filterDateRange = ref<Date[] | null>(null);

  // Getters

  const hasDateRange = computed(() => filterDateRange.value?.length === 2);

  const dateRangeStartEnd = computed(() => {
    if (!hasDateRange.value) return { start: undefined as Date | undefined, end: undefined as Date | undefined };
    const [from, to] = filterDateRange.value!;
    if (!from || !to) return { start: undefined, end: undefined };
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    const end   = new Date(to);   end.setHours(23, 59, 59, 999);
    return { start, end };
  });

  const filteredMessages = computed<InboxMessage[]>(() => {
    const { start, end } = dateRangeStartEnd.value;
    const hasRange = !!(start && end);

    return messages.value.filter((msg) => {
      const status = msg.isRead ? 'read' : 'unread';

      const inType        = !filterType.value.length       || filterType.value.includes(msg.type);
      const inContractor  = !filterContractor.value.length || filterContractor.value.includes(msg.contractor);
      const inProject     = !filterProject.value.length    || filterProject.value.includes(msg.project);
      const inUnit        = !filterUnit.value.length       || filterUnit.value.includes(msg.unit);
      const inTenant      = !filterTenant.value.length     || filterTenant.value.includes(msg.tenant);
      const inOwner       = !filterOwner.value.length      || filterOwner.value.includes(msg.owner);
      const inStatus      = !filterStatus.value.length     || filterStatus.value.includes(status);
      const inDate = !hasRange ||
        (!!msg.receivedAt && msg.receivedAt >= (start as Date) && msg.receivedAt <= (end as Date));

      return inType && inContractor && inProject && inUnit && inTenant && inOwner && inStatus && inDate;
    });
  });

  // Option lists for filters
  const typeOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.type))).map(v => ({ label: v, value: v }))
  );
  const contractorOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.contractor))).map(v => ({ label: v, value: v }))
  );
  const projectOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.project))).map(v => ({ label: v, value: v }))
  );
  const unitOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.unit))).map(v => ({ label: v, value: v }))
  );
  const tenantOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.tenant))).map(v => ({ label: v, value: v }))
  );
  const ownerOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.owner))).map(v => ({ label: v, value: v }))
  );

  // Actions

  async function fetchInbox() {
    isLoading.value = true;
    try {
      const data = await inboxService.fetchInboxData();
      messages.value = data.map(normalizeMessage);
    } finally {
      isLoading.value = false;
    }
    console.log('Messages in store are:', messages.value)
  }

  function markAsRead(msg: InboxMessage) {
    msg.isRead = true;
    messages.value = [...messages.value];
  }

  function markAsUnread(msg: InboxMessage) {
    msg.isRead = false;
    messages.value = [...messages.value];
  }

  function markReadSelected() {
    selectedMessages.value.forEach(m => (m.isRead = true));
    messages.value = [...messages.value];
    selectedMessages.value = [];
  }

  function markUnreadSelected() {
    selectedMessages.value.forEach(m => (m.isRead = false));
    messages.value = [...messages.value];
    selectedMessages.value = [];
  }

  function requestDeleteSelected() {
    isDeleteDialogVisible.value = true;
  }

  function confirmDeleteSelected() {
    const ids = new Set(selectedMessages.value.map(m => m.id));
    messages.value = messages.value.filter(m => !ids.has(m.id));
    selectedMessages.value = [];
    isDeleteDialogVisible.value = false;
  }

  function cancelDelete() {
    isDeleteDialogVisible.value = false;
  }

  function clearFilters() {
    filterType.value = [];
    filterContractor.value = [];
    filterProject.value = [];
    filterUnit.value = [];
    filterTenant.value = [];
    filterOwner.value = [];
    filterStatus.value = [];
    filterDateRange.value = null;
  }

  function rowClass(data: InboxMessage) {
    return !data.isRead ? 'font-semibold' : '';
  }

  return {
    // State
    messages,
    isLoading,
    selectedMessages,
    isDeleteDialogVisible,

    // Filters
    filterType,
    filterContractor,
    filterProject,
    filterUnit,
    filterTenant,
    filterOwner,
    filterStatus,
    filterDateRange,

    // Getters
    filteredMessages,
    typeOptions,
    contractorOptions,
    projectOptions,
    unitOptions,
    tenantOptions,
    ownerOptions,
    rowClass,

    // Actions
    fetchInbox,
    markAsRead,
    markAsUnread,
    markReadSelected,
    markUnreadSelected,
    requestDeleteSelected,
    confirmDeleteSelected,
    cancelDelete,
    clearFilters,
  };
});
