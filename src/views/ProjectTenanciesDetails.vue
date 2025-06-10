


<script setup lang="ts">
import { ref, computed } from 'vue';
import { tenancyService, type TenancyItem, type TenancyTenantItem, type TenancyUnitItem } from '@/services/TenancyService';
import { type TenantItem } from '@/services/TenancyService';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';


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
  
<style scoped>
.grid {
    display: grid;
    gap: 1rem;
}

.card {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card__content {
    padding: 1rem;
}
</style>

<template>
  <div class="p-4">
    <!-- Date Pickers Section -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="col-span-1">
        <label for="rentalStart" class="block text-sm font-medium mb-2">Mietbeginn</label>
        <Calendar id="rentalStart" v-model="rentalStart" :showIcon="true" dateFormat="dd/mm/yy" />
      </div>
      <div class="col-span-1">
        <label for="rentalEnd" class="block text-sm font-medium mb-2">Mietende</label>
        <Calendar id="rentalEnd" v-model="rentalEnd" :showIcon="true" dateFormat="dd/mm/yy" />
      </div>
      <div class="col-span-1 flex items-center">
        <div class="flex items-center gap-2">
          <input type="checkbox" id="rentalActive" v-model="rentalActive" disabled class="h-4 w-4">
          <label for="rentalActive" class="text-sm font-medium">
            Miete aktiv
          </label>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Tenants Section -->
      <TenantsTableComponent :tenants="tenancy?.listOfTenants || []" />

      <UnitsTableComponent :listOfUnits="tenancy?.listOfUnits || []" />

      <div class="flex justify-end">
        <Button icon="pi pi-trash" severity="danger" text raised rounded class="mb-2 mr-2" @click="confirmDelete()" />
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