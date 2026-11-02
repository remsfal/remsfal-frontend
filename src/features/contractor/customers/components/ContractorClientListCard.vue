<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/BaseCard.vue';
import { countryDisplayName } from '@/helper/countryHelper';
import { type ClientProjectJson, clientService } from '@/features/contractor/customers/services/ClientService';

const props = defineProps<{
  organizationId: string;
}>();

const { t, locale } = useI18n();

const projects = ref<ClientProjectJson[]>([]);
const isLoading = ref(true);

function formatBillingAddress(project: ClientProjectJson): string {
  const address = project.billingAddress;
  if (!address) return '';
  const cityLine = [address.zip, address.city].filter(Boolean).join(' ');
  const country = address.countryCode ? countryDisplayName(address.countryCode, locale.value) : undefined;
  return [address.street, cityLine, country].filter(Boolean).join(', ');
}

onMounted(async () => {
  try {
    const result = await clientService.getClients(props.organizationId);
    projects.value = result.projects ?? [];
  } catch (error) {
    console.error('Failed to fetch clients', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('contractorClients.list.title') }}
    </template>
    <template #content>
      <DataTable :value="projects">
        <template #empty>
          <span class="text-muted-color">{{ t('contractorClients.list.empty') }}</span>
        </template>
        <Column field="title" :header="t('contractorClients.list.columnProject')" />
        <Column field="owner" :header="t('contractorClients.list.columnOwner')" />
        <Column field="careOf" :header="t('projectSettings.billingAddress.careOf')" />
        <Column :header="t('contractorClients.list.columnBillingAddress')">
          <template #body="{ data }">
            {{ formatBillingAddress(data) }}
          </template>
        </Column>
      </DataTable>
    </template>
  </BaseCard>
</template>
