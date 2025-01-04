<script setup lang="ts">
import ContractorMenu from './ContractorMenu.vue';
import ManagerMenu from './ManagerMenu.vue';
import TenancyMenu from './TenancyMenu.vue';
import { useProjectStore } from '@/stores/ProjectStore';

const projectStore = useProjectStore();
</script>

<template>
  <div
    v-if="
      projectStore.selectedProject?.memberRole === 'MANAGER' ||
      projectStore.selectedProject?.memberRole === 'PROPRIETOR'
    "
    class="layout-sidebar"
  >
    <ManagerMenu></ManagerMenu>
  </div>
  <div
    v-if="
      projectStore.selectedProject?.memberRole === 'CONSULTANT' ||
      projectStore.selectedProject?.memberRole === 'CARETAKER'
    "
    class="layout-sidebar"
  >
    <ContractorMenu></ContractorMenu>
  </div>
  <div v-if="projectStore.selectedProject?.memberRole === 'LESSEE'" class="layout-sidebar">
    <TenancyMenu></TenancyMenu>
  </div>
</template>
