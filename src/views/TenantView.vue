<script setup lang="ts">
import ContractorTable from '@/components/ContractorTable.vue';
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-10">
        <div class="card">
          <h5>Übersicht aller Auftraggeber</h5>
          <ContractorTable />
        </div>
      </div>
    </div>
  </main>
</template>
