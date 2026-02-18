<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TenancyJson } from '@/services/TenancyService.ts';
import type { Status, Type } from '@/services/IssueService.ts';
import Button from 'primevue/button';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  tenancyId: string | null;
  status: Status | null;
  type: Type | null;
  search: string;
  contracts: TenancyJson[];
}>();

const emit = defineEmits<{
  'update:tenancyId': [value: string | null];
  'update:status': [value: Status | null];
  'update:type': [value: Type | null];
  'update:search': [value: string];
  newIssue: [];
}>();

const { t } = useI18n();

const tenancyOptions = computed(() => [
  { label: t('tenantIssues.filter.allTenancies'), value: null },
  ...props.contracts.map(c => ({
    label: c.rentalUnits?.[0]?.location || c.rentalUnits?.[0]?.title || c.agreementId,
    value: c.agreementId,
  })),
]);

const statusOptions = computed(() => [
  { label: t('tenantIssues.filter.allStatuses'), value: null },
  { label: t('inbox.filters.status.pending'), value: 'PENDING' },
  { label: t('inbox.filters.status.open'), value: 'OPEN' },
  { label: t('inbox.filters.status.inProgress'), value: 'IN_PROGRESS' },
  { label: t('inbox.filters.status.closed'), value: 'CLOSED' },
  { label: t('inbox.filters.status.rejected'), value: 'REJECTED' },
]);

const typeOptions = computed(() => [
  { label: t('tenantIssues.filter.allTypes'), value: null },
  { label: t('inbox.filters.type.application'), value: 'APPLICATION' },
  { label: t('inbox.filters.type.task'), value: 'TASK' },
  { label: t('inbox.filters.type.defect'), value: 'DEFECT' },
  { label: t('inbox.filters.type.maintenance'), value: 'MAINTENANCE' },
]);

const onTenancyChange = (value: string | null) => {
  emit('update:tenancyId', value);
};

const onStatusChange = (value: Status | null) => {
  emit('update:status', value);
};

const onTypeChange = (value: Type | null) => {
  emit('update:type', value);
};

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:search', target.value);
};
</script>

<template>
  <div class="flex flex-col gap-4 mb-6">
    <!-- First Row: New Issue Button and Filters -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <Button
        :label="t('tenantIssues.newIssue')"
        icon="pi pi-plus"
        severity="success"
        @click="emit('newIssue')"
      />

      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Select
          :modelValue="tenancyId"
          :options="tenancyOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssues.filter.tenancy')"
          class="w-full sm:w-64"
          @update:modelValue="onTenancyChange"
        />

        <Select
          :modelValue="status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssues.filter.status')"
          class="w-full sm:w-48"
          @update:modelValue="onStatusChange"
        />

        <Select
          :modelValue="type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('tenantIssues.filter.type')"
          class="w-full sm:w-48"
          @update:modelValue="onTypeChange"
        />
      </div>
    </div>

    <!-- Second Row: Search Field -->
    <div class="flex justify-end">
      <IconField class="w-full sm:w-80">
        <InputIcon class="pi pi-search" />
        <InputText
          :modelValue="search"
          :placeholder="t('tenantIssues.search.placeholder')"
          type="text"
          fluid
          @input="onSearchInput"
        />
      </IconField>
    </div>
  </div>
</template>
