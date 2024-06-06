<script setup lang="ts">
import ConsultantMenu from './ConsultantMenu.vue';
import ManagerMenu from './ManagerMenu.vue';
import TenancyMenu from './TenancyMenu.vue';
import { useProjectStore } from "@/stores/ProjectStore";

const projectStore = useProjectStore();
</script>

<template>
  <div v-if="projectStore.selectedProject?.memberRole === 'MANAGER' || projectStore.selectedProject?.memberRole === 'PROPRIETOR'" class="layout-sidebar">
    <manager-menu></manager-menu>
  </div>
  <div  v-if="projectStore.selectedProject?.memberRole === 'CONSULTANT' || projectStore.selectedProject?.memberRole === 'CARETAKER'" class="layout-sidebar">
    <consultant-menu></consultant-menu>
  </div>
  <div  v-if="projectStore.selectedProject?.memberRole === 'LESSEE'" class="layout-sidebar">
    <tenancy-menu></tenancy-menu>
  </div>
</template>
