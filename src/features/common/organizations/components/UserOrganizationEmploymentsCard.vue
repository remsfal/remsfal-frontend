<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const isLoading = ref(!organizationStore.initialized);

onMounted(async () => {
  if (!organizationStore.initialized) {
    await organizationStore.fetchUserOrganization();
  }
  isLoading.value = false;
});

const employments = computed(() => organizationStore.userEmployments);

function roleLabel(role: string): string {
  return t(`managerSettings.employments.role.${role}`);
}
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('managerSettings.employments.title') }}
    </template>
    <template #content>
      <DataTable :value="employments">
        <template #empty>
          {{ t('managerSettings.employments.empty') }}
        </template>
        <Column
          field="organizationName"
          :header="t('managerSettings.employments.column.organization')"
        />
        <Column :header="t('managerSettings.employments.column.role')">
          <template #body="{ data }">
            {{ roleLabel(data.employeeRole) }}
          </template>
        </Column>
        <Column :header="t('managerSettings.employments.column.status')">
          <template #body="{ data }">
            <Tag
              :severity="data.active ? 'success' : 'secondary'"
              :value="data.active
                ? t('managerSettings.employments.status.active')
                : t('managerSettings.employments.status.inactive')"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </BaseCard>
</template>
