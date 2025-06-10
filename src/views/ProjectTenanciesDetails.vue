


<script setup lang="ts">
import { ref, computed } from 'vue';
import { tenancyService, type TenancyItem, type TenancyTenantItem, type TenancyUnitItem } from '@/services/TenancyService';
import { type TenantItem } from '@/services/TenancyService';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';


const router = useRouter();
const projectStore = useProjectStore();

const confirmationDialogVisible = ref(false);

const tenancy = ref<TenancyItem | null>(null);

const rentalStart = ref<Date | null>(null);
const rentalEnd = ref<Date | null>(null);
const rentalActive = computed(() => {
    if (!rentalStart.value || !rentalEnd.value) return false;
    const now = new Date();
    return now >= rentalStart.value && now <= rentalEnd.value;
});
  
onMounted(() => {
  // hier promise result simulieren?
  tenancy.value = tenancyService.loadMockTenancyData(window.location.href.split('/').pop() || '');
  //warum funktioniert nicht im template tenancy.value?.rentalStart?
  rentalStart.value = tenancy.value?.rentalStart || null;
  rentalEnd.value = tenancy.value?.rentalEnd || null;
});

  
function confirmDelete() {
  confirmationDialogVisible.value = true;
}

function confirmDeletion() {
  if (tenancy.value) {
    deleteTenancy(tenancy.value.id);
  }
  confirmationDialogVisible.value = false;
}

function deleteTenancy(tenancyId: string) {
  tenancyService.deleteTenancy(tenancyId) .then(() => {
    redirectToTenanciesList();
  }).catch((error) => {
    console.error("Error deleting tenancy:", error);
  });
}

function redirectToTenanciesList() {
  router.push("/project/" + projectStore.projectId + "/tenancies/");
}
</script>
  

<template>
  <div class="p-4">
    <TenancyDataComponent v-if="tenancy" :tenancy="tenancy" />
    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Tenants Section -->
      <TenantsTableComponent :tenants="tenancy?.listOfTenants || []" />
      <UnitsTableComponent :listOfUnits="tenancy?.listOfUnits || []" />

      <!-- Delete Button -->
      <div class="flex justify-end">
        <Button icon="pi pi-trash" severity="danger" text raised rounded
          class="mb-2 mr-2 hover:bg-red-600 transition-colors" @click="confirmDelete()" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="confirmationDialogVisible" header="Bestätigung" modal>
    <div class="p-fluid">
      <p>Sind Sie sicher, dass Sie den Mietvertrag mit der ID {{ tenancy?.id }} löschen möchten?</p>
    </div>
    <template #footer>
      <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false" />
      <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
    </template>
  </Dialog>
</template>