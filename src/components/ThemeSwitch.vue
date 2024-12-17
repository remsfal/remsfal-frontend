<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { usePrimeVue } from 'primevue/config';

const { toggleTheme, isDarkTheme, init } = useLayout();
const primeVue = usePrimeVue();

const toggleDarkMode = () => {
  toggleTheme();
  changeTheme();
};

const changeTheme = () => {
  if (isDarkTheme.value) {
    primeVue.changeTheme('aura-light-green', 'aura-dark-green', 'theme-css', () => {});
  } else {
    primeVue.changeTheme('aura-dark-green', 'aura-light-green', 'theme-css', () => {});
  }
};

init();
changeTheme();

</script>
<template>
  <button @click="toggleDarkMode" class="p-link layout-topbar-button">
    <i v-if="!isDarkTheme" class="pi pi-sun"></i>
    <i v-if="isDarkTheme" class="pi pi-moon"></i>
  </button>
</template>

<style scoped></style>
