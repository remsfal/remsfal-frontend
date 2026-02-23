<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import DataView from 'primevue/dataview';
import { tenantService, type TenantItemJson } from '@/services/TenantService';
import TenantCard from '@/components/tenants/TenantCard.vue';
import TenantToolbar from '@/components/tenants/TenantToolbar.vue';
import BaseCard from '@/components/common/BaseCard.vue';

const props = defineProps<{
  projectId: string;
}>();

const router = useRouter();
const { t } = useI18n();

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

// State
const tenants = ref<TenantItemJson[]>([]);
const isLoading = ref(false);
const activeFilter = ref<ActiveFilter>('ALL');
const searchQuery = ref('');

// Load data
async function loadTenants() {
  isLoading.value = true;
  try {
    tenants.value = await tenantService.fetchTenants(props.projectId);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadTenants();
});

// Filtering
const filteredTenants = computed(() => {
  let result = tenants.value;

  // Active/Inactive filter
  if (activeFilter.value === 'ACTIVE') {
    result = result.filter((t) => t.active === true);
  } else if (activeFilter.value === 'INACTIVE') {
    result = result.filter((t) => t.active === false);
  }

  // Last name search (case-insensitive, partial match)
  if (searchQuery.value.trim()) {
    const search = searchQuery.value.toLowerCase();
    result = result.filter((t) => t.lastName?.toLowerCase().includes(search));
  }

  return result;
});

// Navigation
function onTenantClick(tenant: TenantItemJson) {
  router.push({
    name: 'TenantDetail',
    params: { projectId: props.projectId, tenantId: tenant.id },
  });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('tenantList.title') }}
    </template>
    <template #content>
      <!-- Toolbar -->
      <TenantToolbar
        v-model:activeFilter="activeFilter"
        v-model:searchQuery="searchQuery"
      />

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <ProgressSpinner />
      </div>

      <!-- Empty State: No Tenants -->
      <div
        v-else-if="tenants.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <i class="pi pi-inbox text-6xl text-muted-color mb-4" />
        <p class="text-lg text-muted-color">
          {{ t('tenantList.empty.noAgreements') }}
        </p>
      </div>

      <!-- Empty State: No Results -->
      <div
        v-else-if="filteredTenants.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <i class="pi pi-filter-slash text-6xl text-muted-color mb-4" />
        <p class="text-lg text-muted-color">
          {{ t('tenantList.empty.noResults') }}
        </p>
      </div>

      <!-- Tenant List -->
      <DataView v-else :value="filteredTenants">
        <template #list="slotProps">
          <div class="flex flex-col">
            <div v-for="(tenant, index) in slotProps.items" :key="tenant.id">
              <div
                class="flex flex-col sm:flex-row sm:items-center gap-4"
                :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }"
              >
                <TenantCard :tenant="tenant" @click="onTenantClick(tenant)" />
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </template>
  </BaseCard>
</template>
