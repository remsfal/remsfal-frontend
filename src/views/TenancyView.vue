<script setup lang="ts">
import ContractorTable from '@/components/ContractorTable.vue';
import TenancyTable from '@/components/TenancyTable.vue';
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-10">
        <div class="card">
          <h5>Übersicht der Aufträge</h5>
          <TenancyTable />
        </div>
      </div>
    </div>
  </main>
</template>