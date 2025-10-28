<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';

import { useInboxStore } from '@/stores/InboxStore';
import type { InboxMessage } from '@/services/InboxService';

const { t } = useI18n();
const router = useRouter();
const inbox = useInboxStore();

const {
  // state
  isLoading,
  selectedMessages,
  isDeleteDialogVisible,

  // filters
  filterType,
  filterContractor,
  filterProject,
  filterUnit,
  filterTenant,
  filterOwner,
  filterStatus,
  filterDateRange,

  // getters
  filteredMessages,
  typeOptions,
  contractorOptions,
  projectOptions,
  unitOptions,
  tenantOptions,
  ownerOptions,
} = storeToRefs(inbox);

onMounted(async () => {
  await inbox.fetchInbox();
});

const statusOptions = [
  { label: t('inbox.filter.statusOptions.read'),   value: 'read' },
  { label: t('inbox.filter.statusOptions.unread'), value: 'unread' }
];

const onRowClick = (e: { originalEvent: MouseEvent; data: InboxMessage }) => {
  router.push({ name: 'InboxDetail', params: { id: e.data.id } });
};
</script>

<template>
  <main class="w-full px-6 py-8">
    <h1 class="text-2xl font-semibold mb-4">{{ t('inbox.title') }}</h1>
    <div class="card p-4 flex gap-6 -mx-6" :aria-busy="isLoading">

      <!-- Sidebar -->
      <aside class="w-72 flex-shrink-0 space-y-4 pr-4">
        <h2 class="text-lg font-semibold">
          {{ t('inbox.filter.title') }}
        </h2>

        <!-- Filter Type -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.type')"
            class="w-full border pr-14"
            :style="{ borderColor: filterType.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterType.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterType = []"
          />
        </div>

        <!-- Filter Contractor -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterContractor"
            :options="contractorOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.contractor')"
            class="w-full border pr-14"
            :style="{ borderColor: filterContractor.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterContractor.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterContractor = []"
          />
        </div>

        <!-- Filter Project-->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterProject"
            :options="projectOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.project')"
            class="w-full border pr-14"
            :style="{ borderColor: filterProject.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterProject.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterProject = []"
          />
        </div>

        <!-- Filter Unit -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterUnit"
            :options="unitOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.unit')"
            class="w-full border pr-14"
            :style="{ borderColor: filterUnit.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterUnit.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterUnit = []"
          />
        </div>

        <!-- Filter Tenant -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterTenant"
            :options="tenantOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.tenant')"
            class="w-full border pr-14"
            :style="{ borderColor: filterTenant.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterTenant.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterTenant = []"
          />
        </div>

        <!-- Filter Owner -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterOwner"
            :options="ownerOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.owner')"
            class="w-full border pr-14"
            :style="{ borderColor: filterOwner.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterOwner.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterOwner = []"
          />
        </div>

        <!-- Filter Status -->
        <div class="relative inline-block w-full">
          <MultiSelect
            v-model="filterStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('inbox.filter.status')"
            class="w-full border pr-14"
            :style="{ borderColor: filterStatus.length ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterStatus.length"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterStatus = []"
          />
        </div>

        <!-- Filter Date -->
        <div class="relative inline-block w-full">
          <DatePicker
            v-model="filterDateRange"
            selectionMode="range"
            showIcon
            dateFormat="dd.mm.yy"
            :placeholder="t('inbox.filter.date')"
            class="w-full border pr-14"
            :style="{ borderColor: filterDateRange?.length === 2 ? '#22c55e' : '#d1d5db' }"
          />
          <i
            v-if="filterDateRange?.length === 2"
            class="pi pi-times text-green-500 cursor-pointer
                   absolute right-9 top-1/2 -translate-y-1/2"
            @click="filterDateRange = null"
          />
        </div>

        <Button
          icon="pi pi-filter-slash"
          :label="t('inbox.actions.clearFilters')"
          class="w-full"
          @click="inbox.clearFilters()"
        />
      </aside>

      <!-- Main Area -->
      <section class="flex-1 space-y-4">
        <div class="flex flex-wrap gap-3">
          <Button
            icon="pi pi-inbox"
            :label="t('inbox.actions.markReadSelected')"
            :disabled="!selectedMessages.length"
            @click="inbox.markReadSelected"
          />
          <Button
            icon="pi pi-envelope"
            :label="t('inbox.actions.markUnreadSelected')"
            :disabled="!selectedMessages.length"
            @click="inbox.markUnreadSelected"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            :label="t('inbox.actions.deleteSelected')"
            :disabled="!selectedMessages.length"
            @click="inbox.requestDeleteSelected"
          />
        </div>

        <div class="overflow-x-auto">
          <DataTable
            v-model:selection="selectedMessages"
            :value="filteredMessages"
            :rows="10"
            dataKey="id"
            :emptyMessage="t('inbox.empty')"
            :rowClass="inbox.rowClass"
            class="min-w-full"
            rowHover
            @rowClick="onRowClick"
          >
            <Column selectionMode="multiple" headerStyle="width:3rem" />
            <Column
              frozen alignFrozen="left"
              headerStyle="width:4rem" :header="t('inbox.column.status')"
            >
              <template #body="slot">
                <div class="flex justify-center">
                  <Button
                    v-if="!slot.data.isRead"
                    icon="pi pi-envelope"
                    text rounded
                    title="Als gelesen markieren"
                    class="h-8 w-8"
                    @click.stop="inbox.markAsRead(slot.data)"
                  />
                  <Button
                    v-else text
                    rounded title="Als ungelesen markieren"
                    class="h-8 w-8 text-gray-400"
                    @click.stop="inbox.markAsUnread(slot.data)"
                  />
                </div>
              </template>
            </Column>

            <Column field="contractor" :header="t('inbox.column.contractor')" sortable />
            <Column field="type" :header="t('inbox.column.type')" sortable />
            <Column field="subject" :header="t('inbox.column.subject')" sortable />
            <Column field="project" :header="t('inbox.column.project')" sortable />
            <Column field="unit" :header="t('inbox.column.unit')" sortable />
            <Column field="tenant" :header="t('inbox.column.tenant')" sortable />
            <Column field="owner" :header="t('inbox.column.owner')" sortable />
            <Column field="receivedAt" :header="t('inbox.column.receivedAt')" sortable />
          </DataTable>
        </div>

        <Dialog
          v-model:visible="isDeleteDialogVisible"
          :header="t('inbox.confirmDeleteTitle')"
          modal :closable="false"
          class="w-11/12 md:w-6/12 lg:w-4/12"
        >
          <p class="p-2">
            {{ t('inbox.confirmDeleteMessage', [selectedMessages.length]) }}
          </p>
          <template #footer>
            <Button :label="t('inbox.actions.cancel')" text class="p-button-text" @click="inbox.cancelDelete()" />
            <Button :label="t('inbox.actions.confirm')" severity="danger" @click="inbox.confirmDeleteSelected()" />
          </template>
        </Dialog>
      </section>
    </div>
  </main>
</template>
