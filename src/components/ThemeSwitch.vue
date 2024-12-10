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

init()
changeTheme();

</script>
<template>
  <InputSwitch :model-value="isDarkTheme" @change="toggleDarkMode" />
</template>

<style scoped></style>
