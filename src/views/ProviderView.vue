<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Dienstleisterverwaltung</h2>

    <!-- 🔍 Suchleiste -->
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Dienstleister suchen..."
        class="mb-4 p-2 border rounded w-full"
    />

    <!-- ➕ Hinzufügen-Formular -->
    <div class="mb-6 border p-4 rounded bg-gray-50">
      <h3 class="font-semibold mb-2">Neuen Dienstleister hinzufügen</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="newProvider.name" placeholder="Name" class="p-2 border rounded" />
        <input v-model="newProvider.company" placeholder="Firma" class="p-2 border rounded" />
        <input v-model="newProvider.email" placeholder="E-Mail" class="p-2 border rounded" />
      </div>
      <button @click="addProvider" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Dienstleister hinzufügen
      </button>
    </div>

    <!-- 📋 Tabelle -->
    <table class="min-w-full border-collapse border border-gray-300 rounded">
      <thead class="bg-gray-100">
      <tr>
        <th class="p-2 border text-left">Name</th>
        <th class="p-2 border text-left">Firma</th>
        <th class="p-2 border text-left">E-Mail</th>
        <th class="p-2 border text-left">Aktionen</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="provider in filteredProviders"
          :key="provider.id"
          class="hover:bg-gray-50"
      >
        <template v-if="editId === provider.id">
          <td class="p-2 border">
            <input v-model="editProvider.name" class="p-1 border rounded w-full" />
          </td>
          <td class="p-2 border">
            <input v-model="editProvider.company" class="p-1 border rounded w-full" />
          </td>
          <td class="p-2 border">
            <input v-model="editProvider.email" class="p-1 border rounded w-full" />
          </td>
          <td class="p-2 border space-x-2">
            <button @click="saveEdit" class="px-2 py-1 bg-green-600 text-white rounded">Speichern</button>
            <button @click="cancelEdit" class="px-2 py-1 bg-gray-400 text-white rounded">Abbrechen</button>
          </td>
        </template>
        <template v-else>
          <td class="p-2 border" v-html="highlight(provider.name)"></td>
          <td class="p-2 border" v-html="highlight(provider.company)"></td>
          <td class="p-2 border">{{ provider.email }}</td>
          <td class="p-2 border space-x-2">
            <button @click="startEdit(provider)" class="px-2 py-1 bg-yellow-500 text-white rounded">
              Bearbeiten
            </button>
            <button @click="deleteProvider(provider.id)" class="px-2 py-1 bg-red-600 text-white rounded">
              Löschen
            </button>
          </td>
        </template>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Provider {
  id: number;
  name: string;
  company: string;
  email: string;
}

// 🔧 Dummy-Daten
const providers = ref<Provider[]>([
  { id: 1, name: 'Max Mustermann', company: 'Firma A', email: 'max@firma.de' },
  { id: 2, name: 'Erika Musterfrau', company: 'Firma B', email: 'erika@firma.de' },
  { id: 3, name: 'John Doe', company: 'ACME Corp', email: 'john@acme.com' },
]);

// 🔍 Suche
const searchQuery = ref('');

const filteredProviders = computed(() => {
  if (!searchQuery.value.trim()) return providers.value;

  const query = searchQuery.value.toLowerCase();
  return providers.value.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.company.toLowerCase().includes(query)
  );
});

function highlight(text: string): string {
  const query = searchQuery.value;
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ➕ Hinzufügen
const newProvider = ref<Provider>({
  id: 0,
  name: '',
  company: '',
  email: '',
});

function addProvider() {
  if (!newProvider.value.name || !newProvider.value.company || !newProvider.value.email) return;

  const newId = Math.max(...providers.value.map(p => p.id)) + 1;
  providers.value.push({ ...newProvider.value, id: newId });

  newProvider.value = { id: 0, name: '', company: '', email: '' };
}

// ✏️ Bearbeiten
const editId = ref<number | null>(null);
const editProvider = ref<Provider>({ id: 0, name: '', company: '', email: '' });

function startEdit(provider: Provider) {
  editId.value = provider.id;
  editProvider.value = { ...provider };
}

function cancelEdit() {
  editId.value = null;
  editProvider.value = { id: 0, name: '', company: '', email: '' };
}

function saveEdit() {
  const index = providers.value.findIndex(p => p.id === editId.value);
  if (index !== -1) {
    providers.value[index] = { ...editProvider.value };
  }
  cancelEdit();
}

// 🗑️ Löschen
function deleteProvider(id: number) {
  const confirmDelete = confirm('Bist du sicher, dass du diesen Dienstleister löschen möchtest?');
  if (!confirmDelete) return;

  providers.value = providers.value.filter(p => p.id !== id);
}
</script>
