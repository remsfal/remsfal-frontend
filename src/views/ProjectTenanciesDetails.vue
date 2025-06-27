<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { tenancyService, type TenancyItem } from '@/services/TenancyService';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();

const confirmationDialogVisible = ref(false);

const tenancy = ref<TenancyItem | null>(null);

const rentalStart = ref<Date | null>(null);
const rentalEnd = ref<Date | null>(null);

onMounted(() => {
  tenancy.value = tenancyService.loadMockTenancyData(window.location.href.split('/').pop() || '');
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
  tenancyService
    .deleteTenancy(tenancyId)
    .then(() => {
      redirectToTenanciesList();
    })
    .catch((error) => {
      console.error('Error deleting tenancy:', error);
    });
}

function redirectToTenanciesList() {
  router.push('/project/' + projectStore.projectId + '/tenancies/');
}

function updateTenancy(tenancy: TenancyItem | null) {
  tenancyService.updateTenancy(tenancy);
  toast.add({
    severity: 'success',
    summary: 'Speichern erfolgreich',
    detail: `Der Mietvertrag mit der ID ${tenancy?.id} wurde erfolgreich aktualisiert.`,
    life: 3000,
  });
}

function handleTenancyDataChange(updatedTenancy: TenancyItem) {
  tenancy.value = updatedTenancy;
  rentalStart.value = updatedTenancy.rentalStart;
  rentalEnd.value = updatedTenancy.rentalEnd;
}
</script>

<template>
  <div class="p-4">
    <TenancyDataComponent v-if="tenancy" :tenancy="tenancy" @onChange="handleTenancyDataChange" />
    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Tenants Section -->
      <TenantsTableComponent :tenants="tenancy?.listOfTenants || []" :isDeleteButtonEnabled="false" />
      <UnitsTableComponent :listOfUnits="tenancy?.listOfUnits || []" :isDeleteButtonEnabled="false" />

      <!-- Delete Button -->
      <div class="flex justify-end">
        <Button icon="pi pi-save" label="Speichern" text raised rounded
          class="mb-2 mr-2 hover:bg-blue-600 transition-colors" @click="updateTenancy(tenancy)" />
        <Button icon="pi pi-trash" label="Löschen" severity="danger" text raised rounded
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
