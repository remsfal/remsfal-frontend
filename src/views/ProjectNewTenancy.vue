<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { tenancyService, type TenancyItem } from '@/services/TenancyService';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import { computed, onMounted, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const projectStore = useProjectStore();

// Neue Mietvertragsdaten
const tenancy = ref<TenancyItem>({
  id: '',
  rentalStart: new Date(),
  rentalEnd: new Date(),
  listOfTenants: [],
  listOfUnits: [],
  active: false,
});

const isValidForm = computed(() => {
  return (
    tenancy.value.rentalStart
    && tenancy.value.rentalEnd
    && tenancy.value.listOfTenants.length > 0
    && tenancy.value.listOfUnits.length > 0
  );
});

async function saveTenancy() {
  if (!isValidForm.value) return;

  const newTenancy: TenancyItem = {
    ...tenancy.value,
    rentalStart: tenancy.value.rentalStart!,
    rentalEnd: tenancy.value.rentalEnd!,
  };

  try {
    await tenancyService.createTenancy(newTenancy);
    redirectToTenanciesList();
  }
  catch (error) {
    console.error('Fehler beim Erstellen des Mietvertrags:', error);
  }
}

function redirectToTenanciesList() {
  router.push(`/project/${projectStore.projectId}/tenancies/`);
}

function updateTenants(event: any) {
  tenancy.value.listOfTenants = toRaw(event);
  console.log(tenancy.value.listOfTenants);
}

function updateUnits(event: any) {
  tenancy.value.listOfUnits = toRaw(event);
  console.log(tenancy.value.listOfUnits);
}

onMounted(() => {
  tenancy.value.rentalStart = new Date();
  tenancy.value.rentalEnd = new Date(tenancy.value.rentalStart.getFullYear() + 1, tenancy.value.rentalStart.getMonth(), tenancy.value.rentalStart.getDate());
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
        @update:rental-start="tenancy.rentalStart = $event"
        @update:rental-end="tenancy.rentalEnd = $event"
      />

      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div class="space-y-4">
          <TenantsTableComponent
            :tenants="tenancy.listOfTenants"
            :is-delete-button-enabled="true"
            @on-change="updateTenants"
          />
        </div>

        <div class="space-y-4">
          <UnitsTableComponent
            :list-of-units="tenancy.listOfUnits"
            :is-delete-button-enabled="true"
            @on-change="updateUnits"
          />
        </div>
      </div>
    </div>
  </div>
</template>
