<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import { ref, onMounted, watch, computed } from 'vue';
import {contractorService,
  type Contractor,
  type ContractorList,} from '@/services/ContractorService';

const props = defineProps<{
  projectId?: string;
}>();

const emit = defineEmits<{
  (e: 'edit', contractor: Contractor): void;
  (e: 'delete', contractor: Contractor): void;
}>();

const isLoading = ref(false);
const contractors = ref<Contractor[]>([]);
const expandedRows = ref<Record<string, boolean>>({});
const searchTerm = ref('');
const showArchive = ref(false);

// Merkt sich (nur im Frontend), welche Auftragnehmer "archiviert" sind
const archiveState = ref<Record<string, boolean>>({});

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

const isArchived = (c: Contractor) => {
  const id = c.id as string | undefined;
  if (!id) return false;
  return !!archiveState.value[id];
};

const toggleArchived = (id: string | undefined, value: boolean) => {
  if (!id) return;
  archiveState.value = {
    ...archiveState.value,
    [id]: value,
  };
};

// Liste je nach Archiv-Ansicht
const baseList = computed(() => {
  if (showArchive.value) {
    return contractors.value.filter((c) => isArchived(c));
  } else {
    return contractors.value.filter((c) => !isArchived(c));
  }
});

// Suche
const filteredContractors = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const source = baseList.value;

  if (!term) return source;

  return source.filter((c) => {
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

const countLabel = computed(() =>
    showArchive.value ? 'archivierte Auftragnehmer' : 'Auftragnehmer',
);

// Erlaubt dem Parent ein Reload nach Create/Update/Delete
defineExpose({reload: loadContractors,});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <span class="text-sm text-gray-500">
        {{ filteredContractors.length }} {{ countLabel }} gefunden
      </span>

      <div class="flex items-center gap-2">
        <!-- Archiv / Aktiv umschalten -->
        <Button
          :label="showArchive ? 'Aktive anzeigen' : 'Archiv anzeigen'"
          :icon="showArchive ? 'pi pi-list' : 'pi pi-archive'"
          :severity="showArchive ? 'success' : 'secondary'"
          size="small"
          class="min-w-[11rem]"
          @click="showArchive = !showArchive"
        />

        <span class="text-sm text-gray-500 hidden md:inline">Suche:</span>
        <InputText
          v-model="searchTerm"
          placeholder="Nach Firma, E-Mail oder Gewerk suchen"
          class="w-full md:w-96"
        />
      </div>
    </div>

    <!-- Tabelle mit Transition zwischen Aktiv/Archiv -->
    <Transition name="fade-scale">
      <DataTable
        :key="showArchive ? 'archive' : 'active'"
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
              {{ slotProps.data.address.street }}
              <span v-if="slotProps.data.address.houseNumber">
                {{ ' ' + slotProps.data.address.houseNumber }}
              </span>,
              {{ slotProps.data.address.zip }}
              {{ slotProps.data.address.city }}
            </span>
            <span v-else class="text-gray-400 text-sm">
              Keine Adresse
            </span>
          </template>
        </Column>

        <!-- Abgeschlossen -->
        <Column header="Abgeschlossen" style="width: 140px">
          <template #body="slotProps">
            <div class="flex justify-center">
              <Checkbox
                binary
                :modelValue="isArchived(slotProps.data)"
                :pt="{
                  box: {
                    class: isArchived(slotProps.data)
                      ? 'bg-green-500 border-green-500'
                      : '',
                  },
                  icon: {
                    class: isArchived(slotProps.data)
                      ? 'text-white'
                      : '',
                  },
                }"
                @update:modelValue="(val) =>
                  toggleArchived(slotProps.data.id as string | undefined, val)"
              />
            </div>
          </template>
        </Column>

        <!-- Aktionen -->
        <Column header="Aktionen" style="width: 160px">
          <template #body="slotProps">
            <div class="flex gap-2 justify-end">
              <Button
                v-tooltip.top="'Bearbeiten'"
                icon="pi pi-pencil"
                severity="secondary"
                rounded
                text
                @click="emit('edit', slotProps.data)"
              />
              <Button
                v-tooltip.top="'Löschen'"
                icon="pi pi-trash"
                severity="danger"
                rounded
                text
                @click="emit('delete', slotProps.data)"
              />
            </div>
          </template>
        </Column>

        <!-- Detailansicht -->
        <template #expansion="slotProps">
          <Transition name="expand-row">
            <div
              :key="slotProps.data.id"
              class="p-6 border rounded-2xl bg-surface-50/80 shadow-sm"
            >
              <div class="flex flex-col gap-4">
                <!-- Header -->
                <div
                  class="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <h4 class="font-semibold text-lg text-gray-800">
                      {{ slotProps.data.companyName }}
                    </h4>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ slotProps.data.email || 'Keine E-Mail hinterlegt' }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <span
                      v-if="isArchived(slotProps.data)"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                    >
                      <i class="pi pi-check-circle mr-1 text-xs" />
                      Abgeschlossen (Archiv)
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      <i class="pi pi-briefcase mr-1 text-xs" />
                      Aktiv
                    </span>
                  </div>
                </div>

                <!-- Zwei Spalten -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-16 text-sm">
                  <!-- Kontakt + Gewerk -->
                  <div class="space-y-4">
                    <div>
                      <div
                        class="text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                      >
                        Kontakt
                      </div>
                      <div class="mt-1 space-y-1">
                        <p v-if="slotProps.data.phone">
                          <span class="font-medium text-gray-700">Telefon:</span>
                          <span class="ml-1 text-gray-800">
                            {{ slotProps.data.phone }}
                          </span>
                        </p>
                        <p v-else class="text-gray-400">
                          Keine Telefonnummer hinterlegt.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div
                        class="text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                      >
                        Gewerk
                      </div>
                      <div class="mt-1">
                        <span
                          v-if="slotProps.data.trade"
                          class="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                        >
                          {{ slotProps.data.trade }}
                        </span>
                        <span v-else class="text-gray-400 text-sm">
                          Kein Gewerk hinterlegt.
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Adresse -->
                  <div class="space-y-3">
                    <div>
                      <div
                        class="text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                      >
                        Adresse
                      </div>

                      <div v-if="slotProps.data.address" class="mt-1 space-y-1">
                        <p class="text-gray-800">
                          {{ slotProps.data.address.street }}
                          <span v-if="slotProps.data.address.houseNumber">
                            {{ ' ' + slotProps.data.address.houseNumber }}
                          </span>
                        </p>
                        <p class="text-gray-800">
                          {{ slotProps.data.address.zip }}
                          {{ slotProps.data.address.city }}
                        </p>
                        <p
                          v-if="slotProps.data.address.province"
                          class="text-gray-700"
                        >
                          {{ slotProps.data.address.province }}
                        </p>
                        <p
                          v-if="slotProps.data.address.countryCode"
                          class="text-gray-700"
                        >
                          Land: {{ slotProps.data.address.countryCode }}
                        </p>
                      </div>

                      <p v-else class="mt-1 text-gray-400">
                        Keine Adresse hinterlegt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </template>
      </DataTable>
    </Transition>
  </div>
</template>

<style scoped>
/* Wechsel zwischen Aktiv- und Archiv-Ansicht */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Animation für das Auf-/Zuklappen der Detailansicht */
.expand-row-enter-active,
.expand-row-leave-active {
  transition: opacity 0.16s ease-out, transform 0.16s ease-out;
}

.expand-row-enter-from,
.expand-row-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
