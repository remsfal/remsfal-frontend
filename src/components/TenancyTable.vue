<template>
  <div class="p-m-4">
    <div class="p-d-flex p-jc-between p-ai-center p-mb-3">
      <Dropdown
        v-model="selectedTab"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Status wählen"
        class="p-mr-2"
      />
      <Button label="Mangel melden" icon="pi pi-plus" @click="showForm = true" />
    </div>

    <DataTable :value="filteredTenancies" class="p-mb-4">
      <Column field="id" header="ID" />
      <Column field="description" header="Beschreibung" />
      <Column field="createdAt" header="Erstellt am">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column field="status" header="Status" />
    </DataTable>

    <Dialog header="Neuen Mangel melden" v-model:visible="showForm" modal>
      <div class="p-fluid">
        <label for="description">Beschreibung</label>
        <InputText id="description" v-model="newDeficiency.description" />

        <label for="status" class="p-mt-3">Status</label>
        <Dropdown
          id="status"
          v-model="newDeficiency.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <template #footer>
        <Button label="Abbrechen" icon="pi pi-times" class="p-button-text" @click="showForm = false" />
        <Button label="Melden" icon="pi pi-check" @click="reportDeficiency" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'

const tenancies = ref([
  { id: 1, description: 'Heizung defekt', createdAt: new Date().toISOString(), status: 'Offen' },
  { id: 2, description: 'Stromausfall', createdAt: new Date().toISOString(), status: 'In Bearbeitung' },
  { id: 3, description: 'Wasser tropft', createdAt: new Date().toISOString(), status: 'Erledigt' }
])

const showForm = ref(false)
const newDeficiency = ref({ description: '', status: 'Offen' })

const selectedTab = ref('Alle')

const statusOptions = [
  { label: 'Alle', value: 'Alle' },
  { label: 'Offen', value: 'Offen' },
  { label: 'In Bearbeitung', value: 'In Bearbeitung' },
  { label: 'Erledigt', value: 'Erledigt' }
]

const filteredTenancies = computed(() => {
  if (selectedTab.value === 'Alle') return tenancies.value
  return tenancies.value.filter(t => t.status === selectedTab.value)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE')
}

function reportDeficiency() {
  if (!newDeficiency.value.description.trim()) return
  tenancies.value.push({
    id: tenancies.value.length + 1,
    description: newDeficiency.value.description,
    createdAt: new Date().toISOString(),
    status: newDeficiency.value.status
  })
  newDeficiency.value = { description: '', status: 'Offen' }
  showForm.value = false
}
</script>

<style scoped>
.p-m-4 {
  margin: 2rem;
}
.p-mt-3 {
  margin-top: 1rem;
}
</style>
