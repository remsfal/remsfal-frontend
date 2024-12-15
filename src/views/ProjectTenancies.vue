<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';

interface TenantItem {
  id: string;
  firstName: string;
  lastName: string;
  unitTitle: string;
  rentalObject: string;
  rentalStart: Date;
  rentalEnd: Date;
}

const tenantData = ref<TenantItem[]>([]);
const isLoading = ref(true);

const dialogVisible = ref(false);
const currentTenant = reactive<TenantItem>({
  id: '',
  firstName: '',
  lastName: '',
  unitTitle: '',
  rentalObject: '',
  rentalStart: new Date(),
  rentalEnd: new Date(),
});
const isEditMode = ref(false);

const confirmationDialogVisible = ref(false);
const tenantToDelete = ref<TenantItem | null>(null);

function generateMockTenantData(): TenantItem[] {
  return [
    {
      id: '1',
      firstName: 'Max',
      lastName: 'Mustermann',
      unitTitle: 'Wohnung 101',
      rentalObject: 'Wohnung',
      rentalStart: new Date('2020-01-01'),
      rentalEnd: new Date('2025-12-31'),
    },
    {
      id: '2',
      firstName: 'Erika',
      lastName: 'Musterfrau',
      unitTitle: 'Wohnung 202',
      rentalObject: 'Wohnung',
      rentalStart: new Date('2021-05-01'),
      rentalEnd: new Date('2026-04-30'),
    },
  ];
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function openAddDialog() {
  isEditMode.value = false;
  resetForm();
  dialogVisible.value = true;
}

function openEditDialog(tenant: TenantItem) {
  isEditMode.value = true;
  Object.assign(currentTenant, tenant);
  dialogVisible.value = true;
}

function saveTenant() {
  if (isEditMode.value) {
    const index = tenantData.value.findIndex((t) => t.id === currentTenant.id);
    if (index !== -1) {
      tenantData.value[index] = {
        ...currentTenant,
        rentalStart: new Date(currentTenant.rentalStart as string),  // Convert string to Date
        rentalEnd: new Date(currentTenant.rentalEnd as string),      // Convert string to Date
      };
    }
  } else {
    currentTenant.id = Date.now().toString(); // Generate a unique ID
    tenantData.value.push({
      ...currentTenant,
      rentalStart: new Date(currentTenant.rentalStart as string),  // Convert string to Date
      rentalEnd: new Date(currentTenant.rentalEnd as string),      // Convert string to Date
    });
  }
  dialogVisible.value = false;
}

function deleteTenant(tenantId: string) {
  tenantData.value = tenantData.value.filter((t) => t.id !== tenantId);
}

function confirmDelete(tenant: TenantItem) {
  tenantToDelete.value = tenant;
  confirmationDialogVisible.value = true;
}

function confirmDeletion() {
  if (tenantToDelete.value) {
    deleteTenant(tenantToDelete.value.id);
  }
  confirmationDialogVisible.value = false;
}

function resetForm() {
  Object.assign(currentTenant, {
    id: '',
    firstName: '',
    lastName: '',
    unitTitle: '',
    rentalObject: '',
    rentalStart: new Date(),
    rentalEnd: new Date(),
  });
}

onMounted(() => {
  setTimeout(() => {
    tenantData.value = generateMockTenantData();
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <main>
    <div class="grid">
      <h1>Mieterdaten Ansicht</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="!isLoading" class="col-12">
        <div class="card">
          <DataTable
              :value="tenantData"
              :rows="10"
              :rowHover="true"
              dataKey="id"
              tableStyle="min-width: 60rem"
              scrollable
              scrollDirection="both"
              scrollHeight="var(--custom-scroll-height)"
              class="custom-scroll-height"
          >
            <Column field="firstName" header="Vorname" :sortable="true" />
            <Column field="lastName" header="Nachname" :sortable="true" />
            <Column field="unitTitle" header="Wohneinheit" :sortable="true" />
            <Column field="rentalObject" header="Mietgegenstand" :sortable="true" />
            <Column field="rentalStart" header="Mietbeginn" :sortable="true" :body="(rowData: TenantItem) => formatDate(rowData.rentalStart)" />
            <Column field="rentalEnd" header="Mietende" :sortable="true" :body="(rowData: TenantItem) => formatDate(rowData.rentalEnd)" />
            <Column frozen alignFrozen="right">
              <template #body="slotProps">
                <div class="flex justify-content-end">
                  <Button
                      icon="pi pi-pencil"
                      severity="success"
                      text
                      raised
                      rounded
                      class="mb-2 mr-2"
                      @click="openEditDialog(slotProps.data)"
                  />
                  <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      raised
                      rounded
                      class="mb-2 mr-2"
                      @click="confirmDelete(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div class="flex justify-content-end mt-4">
            <Button
                type="button"
                icon="pi pi-plus"
                label="Neuen Mieter hinzufügen"
                class="mr-2 mb-2"
                @click="openAddDialog"
            />
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" :header="isEditMode ? 'Mieter bearbeiten' : 'Neuen Mieter hinzufügen'" modal>
      <div class="p-fluid">
        <div class="field">
          <label for="firstName">Vorname</label>
          <InputText id="firstName" v-model="currentTenant.firstName" />
        </div>
        <div class="field">
          <label for="lastName">Nachname</label>
          <InputText id="lastName" v-model="currentTenant.lastName" />
        </div>
        <div class="field">
          <label for="unitTitle">Wohneinheit</label>
          <InputText id="unitTitle" v-model="currentTenant.unitTitle" />
        </div>
        <div class="field">
          <label for="rentalObject">Mietgegenstand</label>
          <InputText id="rentalObject" v-model="currentTenant.rentalObject" />
        </div>
        <div class="field">
          <label for="rentalStart">Mietbeginn</label>
          <Calendar id="rentalStart" v-model="currentTenant.rentalStart" />
        </div>
        <div class="field">
          <label for="rentalEnd">Mietende</label>
          <Calendar id="rentalEnd" v-model="currentTenant.rentalEnd" />
        </div>
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="dialogVisible = false" />
        <Button label="Speichern" icon="pi pi-check" @click="saveTenant" />
      </template>
    </Dialog>

    <Dialog v-model:visible="confirmationDialogVisible" header="Bestätigung" modal>
      <div class="p-fluid">
        <p>Sind Sie sicher, dass Sie {{ tenantToDelete?.firstName }} {{ tenantToDelete?.lastName }} löschen möchten?</p>
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false" />
        <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
      </template>
    </Dialog>
  </main>
</template>

