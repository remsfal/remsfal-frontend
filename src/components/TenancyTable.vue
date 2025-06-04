<script setup lang="ts">
import { ref } from 'vue';

const tenancies = ref([
  { id: 1, tenant: 'Max Mustermann', unit: 'Wohnung 1A', startDate: '2023-01-01', rent: '850 €' },
  { id: 2, tenant: 'Erika Musterfrau', unit: 'Wohnung 2B', startDate: '2022-06-15', rent: '920 €' },
  { id: 3, tenant: 'Max 2', unit: 'Wohnung 3C', startDate: '2024-03-01', rent: '800 €' },
]);
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full table-auto border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left">Mieter:in</th>
          <th class="px-4 py-2 text-left">Einheit</th>
          <th class="px-4 py-2 text-left">Beginn</th>
          <th class="px-4 py-2 text-left">Miete</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="tenancy in tenancies"
          :key="tenancy.id"
          class="border-t hover:bg-gray-50"
        >
          <td class="px-4 py-2">{{ tenancy.tenant }}</td>
          <td class="px-4 py-2">{{ tenancy.unit }}</td>
          <td class="px-4 py-2">{{ tenancy.startDate }}</td>
          <td class="px-4 py-2">{{ tenancy.rent }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
