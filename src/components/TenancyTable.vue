<script setup lang="ts">
import { ref, computed } from 'vue'

const tenancies = ref([
  { id: 1, description: 'Heizung defekt', createdAt: new Date().toISOString(), status: 'Offen' },
  { id: 2, description: 'Stromausfall', createdAt: new Date().toISOString(), status: 'In Bearbeitung' },
  { id: 3, description: 'Wasser tropft', createdAt: new Date().toISOString(), status: 'Erledigt' },
])

const showForm = ref(false)
const newDeficiency = ref({ description: '', status: 'Offen' })

const selectedTab = ref('Alle')

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
    description: newDeficiency.value.description.trim(),
    createdAt: new Date().toISOString(),
    status: newDeficiency.value.status,
  })
  newDeficiency.value = { description: '', status: 'Offen' }
  showForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tabs -->
    <div class="flex space-x-4 border-b pb-2">
      <button
        v-for="tab in ['Alle', 'Offen', 'In Bearbeitung', 'Erledigt']"
        :key="tab"
        @click="selectedTab = tab"
        :class="[
          'px-4 py-2 rounded-t',
          selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Create Button -->
    <button
      @click="showForm = !showForm"
      class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Mangel melden
    </button>

    <!-- Form -->
    <div v-if="showForm" class="space-y-2 border p-4 rounded bg-gray-50">
      <input v-model="newDeficiency.description" placeholder="Mangelbeschreibung" class="input" />
      <select v-model="newDeficiency.status" class="input">
        <option value="Offen">Offen</option>
        <option value="In Bearbeitung">In Bearbeitung</option>
        <option value="Erledigt">Erledigt</option>
      </select>
      <button @click="reportDeficiency" class="bg-blue-600 text-white px-3 py-1 rounded">
        Speichern
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full table-auto border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Beschreibung</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Erstellt am</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in filteredTenancies" :key="entry.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-2">{{ entry.description }}</td>
            <td class="px-4 py-2">
              <select v-model="entry.status" class="input">
                <option value="Offen">Offen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Erledigt">Erledigt</option>
              </select>
            </td>
            <td class="px-4 py-2">{{ formatDate(entry.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.input {
  display: block;
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
}
</style>
