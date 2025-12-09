<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref, onMounted, watch, computed } from 'vue';
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
const searchTerm = ref('');

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

// gefilterte Liste für Suche
const filteredContractors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return contractors.value;

  return contractors.value.filter((c) => {
    const company = (c.companyName ?? '').toLowerCase();
    const email = (c.email ?? '').toLowerCase();
    const trade = (c.trade ?? '').toLowerCase();
    return (
        company.includes(term) ||
        email.includes(term) ||
        trade.includes(term)
    );
  });
});

// Ermöglicht dem Parent ein Reload nach Create/Update/Delete
defineExpose({
  reload: loadContractors,
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Toolbar über der Tabelle -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <span class="text-sm text-gray-500">
        {{ filteredContractors.length }} Auftragnehmer gefunden
      </span>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 hidden md:inline">Suche:</span>
        <InputText
            v-model="searchTerm"
            placeholder="Nach Firma, E-Mail oder Gewerk suchen"
            class="w-full md:w-96"
        />
      </div>
    </div>

    <DataTable
        v-model:expandedRows="expandedRows"
        :value="filteredContractors"
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

      <!-- Adresse kompakt -->
      <Column header="Adresse" style="min-width: 260px">
        <template #body="slotProps">
          <span v-if="slotProps.data.address">
            {{ slotProps.data.address.street }},
            {{ slotProps.data.address.zip }}
            {{ slotProps.data.address.city }}
          </span>
          <span v-else class="text-gray-400 text-sm">
            Keine Adresse
          </span>
        </template>
      </Column>

      <!-- Aktionen -->
      <Column header="Aktionen" style="width: 160px">
        <template #body="slotProps">
          <div class="flex gap-2 justify-end">
            <Button
                icon="pi pi-pencil"
                severity="secondary"
                rounded
                text
                v-tooltip.top="'Bearbeiten'"
                @click="emit('edit', slotProps.data)"
            />
            <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                text
                v-tooltip.top="'Löschen'"
                @click="emit('delete', slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <!-- Erweiterte Details -->
      <template #expansion="slotProps">
        <div class="p-4 space-y-3 border rounded-md bg-surface-50">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h4 class="font-semibold text-lg">
              {{ slotProps.data.companyName }}
            </h4>
            <!-- ID / Projekt wurden entfernt -->
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <!-- Kontakt & Gewerke -->
            <div class="space-y-1">
              <p>
                <strong>E-Mail:</strong>
                <span class="ml-1">
                  {{ slotProps.data.email || 'Keine Angabe' }}
                </span>
              </p>
              <p>
                <strong>Telefon:</strong>
                <span class="ml-1">
                  {{ slotProps.data.phone || 'Keine Angabe' }}
                </span>
              </p>
              <p>
                <strong>Gewerk:</strong>
                <span class="ml-1">
                  {{ slotProps.data.trade || 'Keine Angabe' }}
                </span>
              </p>
            </div>

            <!-- Adresse ausführlich -->
            <div class="space-y-1" v-if="slotProps.data.address">
              <p class="font-semibold">Adresse</p>
              <p>
                {{ slotProps.data.address.street }}
              </p>
              <p>
                {{ slotProps.data.address.zip }}
                {{ slotProps.data.address.city }}
              </p>
              <p v-if="slotProps.data.address.province">
                {{ slotProps.data.address.province }}
              </p>
              <p v-if="slotProps.data.address.countryCode">
                Land: {{ slotProps.data.address.countryCode }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>
