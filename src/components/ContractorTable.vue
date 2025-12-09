<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { ref, onMounted, watch } from 'vue';
import { contractorService, type Contractor, type ContractorList } from '@/services/ContractorService';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'edit', contractor: Contractor): void;
  (e: 'delete', contractor: Contractor): void;
}>();

const isLoading = ref(false);
const contractors = ref<Contractor[]>([]);
const expandedRows = ref<Record<string, boolean>>({});

const loadContractors = async () => {
  if (!props.projectId) {
    console.warn('No projectId provided to ContractorTable');
    contractors.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const contractorList: ContractorList = await contractorService.getContractors(
        props.projectId,
    );
    contractors.value = contractorList.contractors ?? [];
  } catch (error) {
    console.error('Failed to load contractors', error);
    contractors.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadContractors();
});

watch(
    () => props.projectId,
    () => {
      loadContractors();
    },
);

// Ermöglicht dem Parent ein Reload nach Create/Update/Delete
defineExpose({
  reload: loadContractors,
});
</script>

<template>
  <DataTable
      v-model:expandedRows="expandedRows"
      :value="contractors"
      scrollable
      :loading="isLoading"
      rowHover
      :rows="10"
      dataKey="id"
      paginator
      tableStyle="min-width: 75rem"
  >
    <Column :expander="true" headerStyle="width: 3rem" />

    <Column field="companyName" header="Firma" style="min-width: 200px" />
    <Column field="email" header="E-Mail" style="min-width: 220px" />
    <Column field="phone" header="Telefon" style="min-width: 160px" />
    <Column field="trade" header="Gewerk" style="min-width: 160px" />

    <!-- Aktionen -->
    <Column header="Aktionen" style="width: 180px">
      <template #body="slotProps">
        <div class="flex gap-2">
          <Button
              icon="pi pi-pencil"
              severity="secondary"
              rounded
              text
              @click="emit('edit', slotProps.data)"
          />
          <Button
              icon="pi pi-trash"
              severity="danger"
              rounded
              text
              @click="emit('delete', slotProps.data)"
          />
        </div>
      </template>
    </Column>

    <template #expansion="slotProps">
      <div class="p-4 space-y-2">
        <h4 class="font-semibold text-lg">
          Details für "{{ slotProps.data.companyName }}"
        </h4>

        <p><strong>E-Mail:</strong> {{ slotProps.data.email || 'Keine Angabe' }}</p>
        <p><strong>Telefon:</strong> {{ slotProps.data.phone || 'Keine Angabe' }}</p>
        <p><strong>Gewerk:</strong> {{ slotProps.data.trade || 'Keine Angabe' }}</p>

        <div v-if="slotProps.data.address">
          <p class="font-semibold mt-2">Adresse</p>
          <p>
            {{ slotProps.data.address.street }}
            {{ slotProps.data.address.houseNumber }}
          </p>
          <p>
            {{ slotProps.data.address.postalCode }}
            {{ slotProps.data.address.city }}
          </p>
          <p v-if="slotProps.data.address.country">
            {{ slotProps.data.address.country }}
          </p>
        </div>

        <p class="text-sm text-gray-500 mt-2">
          ID: {{ slotProps.data.id }} – ProjectId: {{ slotProps.data.projectId }}
        </p>
      </div>
    </template>
  </DataTable>
</template>
