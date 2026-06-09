<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();

onMounted(() => {
  if (!organizationStore.initialized) {
    organizationStore.fetchUserOrganization();
  }
});

const employments = computed(() => organizationStore.userEmployments);

function roleLabel(role: string): string {
  return t(`managerSettings.memberships.role.${role}`);
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('managerSettings.memberships.title') }}
    </template>
    <template #content>
      <DataTable :value="employments">
        <template #empty>
          {{ t('managerSettings.memberships.empty') }}
        </template>
        <Column
          field="organizationName"
          :header="t('managerSettings.memberships.column.organization')"
        />
        <Column :header="t('managerSettings.memberships.column.role')">
          <template #body="{ data }">
            {{ roleLabel(data.employeeRole) }}
          </template>
        </Column>
        <Column :header="t('managerSettings.memberships.column.status')">
          <template #body="{ data }">
            <Tag
              :severity="data.active ? 'success' : 'secondary'"
              :value="data.active
                ? t('managerSettings.memberships.status.active')
                : t('managerSettings.memberships.status.inactive')"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </BaseCard>
</template>
