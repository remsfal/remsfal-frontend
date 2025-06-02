<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { tenancyService, type TenantItem, type TenancyItem } from '@/services/TenancyService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

defineProps<{
  projectId: string;
}>();
const { t } = useI18n();

const router = useRouter();

const tenantData = ref<TenantItem[]>([]);
const isLoading = ref(true);

const tenancyData = ref<TenancyItem[]>([]);

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
        rentalStart: new Date(currentTenant.rentalStart),
        rentalEnd: new Date(currentTenant.rentalEnd),
      };
    }
  } else {
    currentTenant.id = Date.now().toString(); // Generate a unique ID
    tenantData.value.push({
      ...currentTenant,
      rentalStart: new Date(currentTenant.rentalStart),
      rentalEnd: new Date(currentTenant.rentalEnd),
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

function navigateToTenancyDetails(id: string) {
  // get the projectId from the route params or props
  router.push("/project/eb2a1b67-0bf7-46b7-bf35-94724210cc52/tenancies/" + id);
}

onMounted(async () => {
  tenantData.value = await tenancyService.fetchTenantData();
  isLoading.value = false;

  tenancyData.value = await tenancyService.fetchTenancyData();
});
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1>{{ t('projectTenancies.title', [projectId]) }} Mieterdaten Ansicht</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="!isLoading" class="col-span-12">
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
            <Column field="firstName" header="Vorname" :sortable="true"/>
            <Column field="lastName" header="Nachname" :sortable="true"/>
            <Column field="unitTitle" header="Wohneinheit" :sortable="true"/>
            <Column field="rentalObject" header="Mietgegenstand" :sortable="true"/>
            <Column field="rentalStart" header="Mietbeginn" :sortable="true"/>
            <Column field="rentalEnd" header="Mietende" :sortable="true"/>
            <Column frozen alignFrozen="right">
              <template #body="slotProps">
                <div class="flex justify-end">
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
          <div class="flex justify-end mt-6">
            

            <DataTable
              :value="tenancyData"
              :rows="10"
              :rowHover="true"
              dataKey="id"
              tableStyle="min-width: 60rem"
              scrollable
              scrollDirection="both"
              scrollHeight="var(--custom-scroll-height)"
              class="custom-scroll-height"
            >
              <!-- Basis-Spalten -->
              <Column field="rentalStart" header="Mietbeginn" :sortable="true"/>
              <Column field="rentalEnd" header="Mietende" :sortable="true"/>
              
              <!-- Mieter-Spalte mit Mehrfachanzeige -->
              <Column field="listOfTenants" header="Mieter">
                  <template #body="slotProps">
                      <div class="space-y-2">
                          <div v-for="(tenant, index) in slotProps.data.listOfTenants" 
                              :key="`${tenant.id}-${index}`"
                              class="border-b last:border-none py-2">
                              {{ tenant.firstName }} {{ tenant.lastName }}
                          </div>
                      </div>
                  </template>
              </Column>

              <!-- Wohneinheiten-Spalte mit Mehrfachanzeige -->
              <Column field="listOfUnits" header="Wohneinheiten">
                  <template #body="slotProps">
                      <div class="space-y-2">
                          <div v-for="(unit, index) in slotProps.data.listOfUnits" 
                              :key="`${unit.id}-${index}`"
                              class="border-b last:border-none py-2">
                              {{ unit.rentalObject }} - {{ unit.unitTitle }}
                          </div>
                      </div>
                  </template>
              </Column>

              <!-- Aktionen-Spalte -->
              <Column frozen alignFrozen="right">
                  <template #body="slotProps">
                      <div class="flex justify-end">
                          <Button
                              icon="pi pi-pencil"
                              severity="success"
                              text
                              raised
                              rounded
                              class="mb-2 mr-2"
                              @click="navigateToTenancyDetails( slotProps.data.id )"
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
            <Button
              label="Neuen Mieter hinzufügen"
              icon="pi pi-plus"
              severity="primary"
              @click="openAddDialog"
            />
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" :header="isEditMode ? 'Mieter bearbeiten' : 'Neuen Mieter hinzufügen'" modal>
      <div class="p-fluid">
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="firstName" class="w-32">Vorname</label>
            <InputText id="firstName" v-model="currentTenant.firstName" class="flex-1"/>
          </div>
        </div>
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="lastName" class="w-32">Nachname</label>
            <InputText id="lastName" v-model="currentTenant.lastName" class="flex-1"/>
          </div>
        </div>
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="unitTitle" class="w-32">Wohneinheit</label>
            <InputText id="unitTitle" v-model="currentTenant.unitTitle" class="flex-1"/>
          </div>
        </div>
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="rentalObject" class="w-32">Mietgegenstand</label>
            <InputText id="rentalObject" v-model="currentTenant.rentalObject" class="flex-1"/>
          </div>
        </div>
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="rentalStart" class="w-32">Mietbeginn</label>
            <Calendar id="rentalStart" v-model="currentTenant.rentalStart" class="flex-1"/>
          </div>
        </div>
        <div class="field">
          <div class="flex items-center gap-4">
            <label for="rentalEnd" class="w-32">Mietende</label>
            <Calendar id="rentalEnd" v-model="currentTenant.rentalEnd" class="flex-1"/>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="dialogVisible = false"/>
        <Button label="Speichern" icon="pi pi-check" @click="saveTenant"/>
      </template>
    </Dialog>

    <Dialog v-model:visible="confirmationDialogVisible" header="Bestätigung" modal>
      <div class="p-fluid">
        <p>Sind Sie sicher, dass Sie {{ tenantToDelete?.firstName }} {{ tenantToDelete?.lastName }} löschen möchten?</p>
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false"/>
        <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion"/>
      </template>
    </Dialog>
  </main>
</template>

