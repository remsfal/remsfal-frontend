<script setup lang="ts">
import { ref } from 'vue';

interface Provider {
  id: number;
  name: string;
  company: string;
  email: string;
}

// Dummy-Daten – später durch Service/Backend ersetzen
const providers = ref<Provider[]>([
  { id: 1, name: 'Max Mustermann', company: 'Firma A', email: 'max@firma.de' },
  { id: 2, name: 'Erika Musterfrau', company: 'Firma B', email: 'erika@firma.de' },
  { id: 3, name: 'John Doe', company: 'ACME Corp', email: 'john@acme.com' },
]);
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Dienstleisterverwaltung</h2>

    <table class="min-w-full border-collapse border border-gray-300 rounded">
      <thead class="bg-gray-100">
      <tr>
          <th class="p-2 border text-left">Name</th>
        <th class="p-2 border text-left">Firma</th>
        <th class="p-2 border text-left">E-Mail</th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="provider in providers"
        :key="provider.id"
        class="hover:bg-gray-50"
      >
        <td class="p-2 border">{{ provider.name }}</td>
        <td class="p-2 border">{{ provider.company }}</td>
          <td class="p-2 border">{{ provider.email }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
