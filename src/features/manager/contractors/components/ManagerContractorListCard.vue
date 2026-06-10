<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/common/BaseCard.vue';
import { type OrganizationJson, organizationService } from '@/services/OrganizationService';

const { t } = useI18n();
const router = useRouter();

const organizations = ref<OrganizationJson[]>([]);

const sortedOrganizations = computed(() =>
  [...organizations.value].sort((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? ''),
  ),
);

onMounted(async () => {
  try {
    const result = await organizationService.getContractorOrganizations();
    organizations.value = result.organizations ?? [];
  } catch (error) {
    console.error('Failed to fetch contractor organizations', error);
  }
});

function onRowClick(org: OrganizationJson) {
  if (!org.id) return;
  router.push({ name: 'ManagerContractorDetail', params: { organizationId: org.id } });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('managerContractors.list.title') }}
    </template>
    <template #content>
      <DataTable
        :value="sortedOrganizations"
        row-hover
        class="cursor-pointer"
        @row-click="(e) => onRowClick(e.data)"
      >
        <template #empty>
          <span class="text-muted-color">{{ t('managerContractors.list.empty') }}</span>
        </template>
        <Column field="name" :header="t('contractor.list.columnName')" />
        <Column field="email" :header="t('contractor.list.columnEmail')" />
        <Column field="phone" :header="t('contractor.list.columnPhone')" />
        <Column field="trade" :header="t('contractor.list.columnTrade')" />
      </DataTable>
    </template>
  </BaseCard>
</template>
