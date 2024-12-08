<script setup lang="ts">
import DataTable from 'primevue/datatable';
import { ref } from 'vue';

const isLoading = ref(false);
</script>

<template>
  <DataTable
    scrollable
    :loading="isLoading"
    rowHover
    :rows="10"
    dataKey="id"
    lazy
    paginator
    tableStyle="min-width: 75rem"
  ></DataTable>
</template>