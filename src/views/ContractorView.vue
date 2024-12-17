<script setup lang="ts">
import { onMounted } from 'vue';
import { useContractorStore } from '@/stores/ContractorStore';
import ContractorTable from '@/components/ContractorTable.vue';

const contractorStore = useContractorStore();

onMounted(() => {
  contractorStore.refreshTaskList('yourOwnerId');
});

</script>

<template>
  <main>
    <div class="grid">
      <div class="col-10">
      <div class="card">
        <h5>Übersicht der Aufträge</h5>
        <ContractorTable />
      </div>
    </div>
    </div>
  </main>
</template>