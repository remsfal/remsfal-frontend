<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { tenancyService, type TenantItem, type TenancyItem } from '@/services/TenancyService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';

defineProps<{
  projectId: string;
}>();
const { t } = useI18n();

const router = useRouter();
const projectStore = useProjectStore();

const tenantData = ref<TenantItem[]>([]);
const isLoading = ref(true);

const tenancyData = ref<TenancyItem[]>([]);

const confirmationDialogVisible = ref(false);
const tenantToDelete = ref<TenantItem | null>(null);

function deleteTenant(tenantId: string) {
  tenantData.value = tenantData.value.filter((t) => t.id !== tenantId);
}

function confirmDeletion() {
  if (tenantToDelete.value) {
    deleteTenant(tenantToDelete.value.id);
  }
  confirmationDialogVisible.value = false;
}

function navigateToTenancyDetails(id: string) {
  //richtige url bauen und nicht hardcodieren
  router.push('/project/' + projectStore.projectId + '/tenancies/' + id);
}

function navigateToNewTenancy() {
  router.push(`/project/${projectStore.projectId}/tenancies/new-tenancy`);
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
      <h1 class="col-span-12">
        {{ t('projectTenancies.title', [projectId]) }} Mieterdaten Ansicht
      </h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="!isLoading" class="col-span-12 card">
        <DataTable
          :value="tenancyData"
          :rows="10"
          :rowHover="true"
          dataKey="id"
          tableStyle="min-width: 60rem"
          scrollable
          scrollDirection="both"
          scrollHeight="var(--custom-scroll-height)"
          class="custom-scroll-height cursor-pointer"
          @rowClick="navigateToTenancyDetails($event.data.id)"
        >
        
          <Column field="rentalStart" header="Mietbeginn" :sortable="true" />
          <Column field="rentalEnd" header="Mietende" :sortable="true" />

          <Column field="listOfTenants" header="Mieter">
            <template #body="slotProps">
              <div class="space-y-2">
                <div
                  v-for="(tenant, index) in slotProps.data.listOfTenants"
                  :key="`${tenant.id}-${index}`"
                  class="border-b last:border-none py-2"
                >
                  {{ tenant.firstName }} {{ tenant.lastName }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="listOfUnits" header="Wohneinheiten">
            <template #body="slotProps">
              <div class="space-y-2">
                <div
                  v-for="(unit, index) in slotProps.data.listOfUnits"
                  :key="`${unit.id}-${index}`"
                  class="border-b last:border-none py-2"
                >
                  {{ unit.rentalObject }} - {{ unit.unitTitle }}
                </div>
              </div>
            </template>
          </Column>
        </DataTable>

        <div class="flex justify-end mt-6">
          <Button
            type="button"
            icon="pi pi-plus"
            label="Neuen Mieter hinzufügen"
            class="mr-2 mb-2"
            @click="navigateToNewTenancy"
          />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="confirmationDialogVisible" header="Bestätigung" modal>
      <div class="p-fluid">
        <p>
          Sind Sie sicher, dass Sie {{ tenantToDelete?.firstName }}
          {{ tenantToDelete?.lastName }} löschen möchten?
        </p>
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false" />
        <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
      </template>
    </Dialog>
  </main>
</template>
