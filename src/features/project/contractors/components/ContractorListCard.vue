<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/common/BaseCard.vue';
import NewContractorButton from '@/features/project/contractors/components/NewContractorButton.vue';
import { type ContractorJson, projectContractorService } from '@/services/ProjectContractorService';

const props = defineProps<{ projectId: string }>();

const { t } = useI18n();
const router = useRouter();

const contractors = ref<ContractorJson[]>([]);

const sortedContractors = computed(() =>
  [...contractors.value].sort((a, b) =>
    (a.companyName ?? '').localeCompare(b.companyName ?? ''),
  ),
);

const fetchContractors = async () => {
  try {
    const result = await projectContractorService.getContractors(props.projectId);
    contractors.value = result.contractors ?? [];
  } catch (error) {
    console.error('Failed to fetch contractors', error);
  }
};

onMounted(() => {
  fetchContractors();
});

function onRowClick(contractor: ContractorJson) {
  if (!contractor.id) return;
  router.push({
    name: 'ProjectContractorDetail',
    params: { projectId: props.projectId, contractorId: contractor.id },
  });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('contractor.list.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable
          :value="sortedContractors"
          row-hover
          class="cursor-pointer"
          @row-click="(e) => onRowClick(e.data)"
        >
          <template #empty>
            <span class="text-muted-color">{{ t('contractor.list.empty') }}</span>
          </template>
          <Column field="companyName" :header="t('contractor.list.columnName')" />
          <Column field="email" :header="t('contractor.list.columnEmail')" />
          <Column field="phone" :header="t('contractor.list.columnPhone')" />
          <Column field="trade" :header="t('contractor.list.columnTrade')" />
          <Column field="contactPerson" :header="t('contractor.list.columnContact')" />
        </DataTable>
      </div>
      <div class="flex justify-end mt-6">
        <NewContractorButton :projectId="projectId" @newContractor="fetchContractors" />
      </div>
    </template>
  </BaseCard>
</template>
