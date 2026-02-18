<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { rentalAgreementService, type RentalAgreement, type TenantItem } from '@/services/RentalAgreementService';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import { computed, onMounted, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import type { components } from '@/services/api/platform-schema';

type TenancyUnitItem = components['schemas']['RentalUnitJson'];

const router = useRouter();
const projectStore = useProjectStore();

// Reactive rental agreement state using OpenAPI types
const rentalAgreement = ref<RentalAgreement>({
  id: '',
  tenants: [] as TenantItem[],
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
    rentalAgreement.value.startOfRental &&
    rentalAgreement.value.endOfRental &&
    (rentalAgreement.value.tenants?.length ?? 0) > 0 &&
    (units.value?.length ?? 0) > 0
  );
});

// Save rental agreement
async function saveRentalAgreement() {
  if (!isValidForm.value || !projectStore.projectId) return;

  try {
    await rentalAgreementService.createRentalAgreement(projectStore.projectId, {
      ...toRaw(rentalAgreement.value),
      tenants: toRaw(rentalAgreement.value.tenants) ?? [],
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
function updateTenants(event: TenantItem[]) {
  rentalAgreement.value.tenants = toRaw(event);
  console.log('Updated tenants:', rentalAgreement.value.tenants);
}

// Update units from child component
function updateUnits(event: TenancyUnitItem[]) {
  units.value = toRaw(event);
  console.log('Updated units:', units.value);
}

// Initialize rental dates
onMounted(() => {
  const now = new Date();
  rentalAgreement.value.startOfRental = now.toISOString();
  rentalAgreement.value.endOfRental = new Date(
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
        @click="saveRentalAgreement()"
      />
    </div>

    <div class="grid grid-cols-1 gap-6">
      <TenancyDataComponent
        v-if="rentalAgreement"
        :tenancy="rentalAgreement"
        @update:startOfRental="rentalAgreement.startOfRental = $event"
        @update:endOfRental="rentalAgreement.endOfRental = $event"
      />

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div class="space-y-4">
          <TenantsTableComponent
            :tenants="rentalAgreement.tenants ?? []"
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
