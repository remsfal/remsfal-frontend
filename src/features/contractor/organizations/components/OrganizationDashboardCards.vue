<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import BaseCard from '@/components/common/BaseCard.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    if (!organizationStore.initialized) {
      await organizationStore.fetchUserOrganization();
    }
  } finally {
    isLoading.value = false;
  }
});

const organizations = computed(() => organizationStore.userOrganizations);
const showEmptyState = computed(() => !isLoading.value && organizationStore.userEmployments.length <= 0);

function formatAddressLine(address: { street?: string; zip?: string; city?: string }): string {
  return [address.street, [address.zip, address.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}
</script>

<template>
  <Message v-if="showEmptyState" severity="warn" class="mb-6">
    <template #icon>
      <i class="pi pi-exclamation-triangle text-xl" />
    </template>
    <span>
      {{ t('contractorDashboard.organization.emptyState.text') }}
      <br>
      <RouterLink :to="{ name: 'ContractorOrganizations' }" class="font-semibold underline">
        {{ t('contractorDashboard.organization.emptyState.link') }}
      </RouterLink>
    </span>
  </Message>
  <div v-if="isLoading" class="mb-6 flex flex-col gap-4">
    <BaseCard loading />
  </div>
  <div v-else-if="organizations.length > 0" class="mb-6 flex flex-col gap-4">
    <BaseCard v-for="org in organizations" :key="org.id">
      <template #title>
        <RouterLink
          :to="{ name: 'ContractorOrganizationSettings', params: { organizationId: org.id! } }"
          class="hover:underline"
        >
          {{ org.name }}
        </RouterLink>
      </template>
      <template #content>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div v-if="org.email" class="flex items-center gap-2">
            <i class="pi pi-envelope" />
            <span>{{ org.email }}</span>
          </div>
          <div v-if="org.phone" class="flex items-center gap-2">
            <i class="pi pi-phone" />
            <span>{{ org.phone }}</span>
          </div>
          <div v-if="org.address" class="flex items-center gap-2">
            <i class="pi pi-map-marker" />
            <span>{{ formatAddressLine(org.address) }}</span>
          </div>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
