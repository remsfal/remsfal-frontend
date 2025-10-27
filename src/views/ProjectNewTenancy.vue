<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { tenancyService } from '@/services/TenancyService';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import { computed, onMounted, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import type { components } from '@/services/api/platform-schema';

type TenancyJson = components['schemas']['TenancyJson'];
type UserJson = components['schemas']['UserJson'];
type TenancyUnitItem = components['schemas']['TenancyItemJson'];

const router = useRouter();
const projectStore = useProjectStore();

// Reactive tenancy state using OpenAPI types
const tenancy = ref<TenancyJson>({
  id: '',
  tenants: [] as UserJson[],
  startOfRental: new Date().toISOString(),
  endOfRental: new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate(),
  ).toISOString(),
  active: false,
});

// Units state
const units = ref<TenancyUnitItem[]>([]);

// Form validation (handles possibly undefined arrays)
const isValidForm = computed(() => {
  return (
    tenancy.value.startOfRental &&
    tenancy.value.endOfRental &&
    (tenancy.value.tenants?.length ?? 0) > 0 &&
    (units.value?.length ?? 0) > 0
  );
});

// Save tenancy
async function saveTenancy() {
  if (!isValidForm.value) return;

  try {
    await tenancyService.createTenancy({
      ...toRaw(tenancy.value),
      tenants: toRaw(tenancy.value.tenants) ?? [],
      // Assuming your API accepts units separately or included in tenancy JSON
    });
    redirectToTenanciesList();
  } catch (error) {
    console.error('Fehler beim Erstellen des Mietvertrags:', error);
  }
}

// Redirect helper
function redirectToTenanciesList() {
  router.push(`/project/${projectStore.projectId}/tenancies/`);
}

// Update tenants from child component
function updateTenants(event: UserJson[]) {
  tenancy.value.tenants = toRaw(event);
  console.log('Updated tenants:', tenancy.value.tenants);
}

// Update units from child component
function updateUnits(event: TenancyUnitItem[]) {
  units.value = toRaw(event);
  console.log('Updated units:', units.value);
}

// Initialize rental dates
onMounted(() => {
  const now = new Date();
  tenancy.value.startOfRental = now.toISOString();
  tenancy.value.endOfRental = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate(),
  ).toISOString();
});
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">
        Neuer Mietvertrag erstellen
      </h2>
      <Button
        label="Speichern & zur Übersicht"
        icon="pi pi-save"
        class="bg-green-600 hover:bg-green-700 transition-colors"
        :disabled="!isValidForm"
        @click="saveTenancy()"
      />
    </div>

    <div class="grid grid-cols-1 gap-6">
      <TenancyDataComponent
        v-if="tenancy"
        :tenancy="tenancy"
        @update:startOfRental="tenancy.startOfRental = $event"
        @update:endOfRental="tenancy.endOfRental = $event"
      />

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div class="space-y-4">
          <TenantsTableComponent
            :tenants="tenancy.tenants ?? []"
            :isDeleteButtonEnabled="true"
            @onChange="updateTenants"
          />
        </div>

        <div class="space-y-4">
          <UnitsTableComponent
            :listOfUnits="units ?? []"
            :isDeleteButtonEnabled="true"
            @onChange="updateUnits"
          />
        </div>
      </div>
    </div>
  </div>
</template>
