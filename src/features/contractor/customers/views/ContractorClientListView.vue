<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import Message from 'primevue/message';
import { ContractorClientListCard } from '@/features/contractor/customers';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const { userEmployments, initialized } = storeToRefs(organizationStore);

const organizationIds = computed(() =>
  userEmployments.value.flatMap((employment) =>
    employment.organizationId ? [employment.organizationId] : [],
  ),
);

onMounted(() => {
  if (!initialized.value) {
    organizationStore.fetchUserOrganization();
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <ContractorClientListCard
      v-for="organizationId in organizationIds"
      :key="organizationId"
      :organizationId="organizationId"
    />
    <Message v-if="initialized && organizationIds.length === 0" severity="info">
      {{ t('contractorClients.noOrganization') }}
    </Message>
  </div>
</template>
