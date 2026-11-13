<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';
import NewOrganizationDialog from '@/features/common/organizations/components/NewOrganizationDialog.vue';
import { useOrganizationStore } from '@/features/common/organizations/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const isLoading = ref(true);
const dialogVisible = ref(false);

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
const showEmptyState = computed(() => !isLoading.value && !organizationStore.isOrganizationMember);

function formatAddressLine(address: { street?: string; zip?: string; city?: string }): string {
  return [address.street, [address.zip, address.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}
</script>

<template>
  <Message v-if="showEmptyState" severity="warn">
    <template #icon>
      <i class="pi pi-exclamation-triangle text-xl" />
    </template>
    <span>
      {{ t('contractorDashboard.organization.emptyState.text') }}
      <br>
      <button
        type="button"
        class="font-semibold underline cursor-pointer"
        @click="dialogVisible = true"
      >
        {{ t('contractorDashboard.organization.emptyState.link') }}
      </button>
    </span>
  </Message>
  <!-- Outside the message: it disappears as soon as the new organization is in the store -->
  <NewOrganizationDialog v-model:visible="dialogVisible" />
  <BaseCard v-if="isLoading" loading data-testid="organizations-loading-skeleton" />
  <template v-else-if="organizations.length > 0">
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
  </template>
</template>
