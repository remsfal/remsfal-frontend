<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useLayout } from "@/layout/composables/layout";
import { usePrimeVue } from "primevue/config";
defineOptions({
  created() {
    console.log('App created!');
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
    const projectStore = useProjectStore();
    projectStore.refreshProjectList();
  },

});

// const primeVue = usePrimeVue();
// const {init, isDarkTheme} = useLayout();
//
// init()
//
// const changeTheme = () => {
//   if (isDarkTheme.value) {
//   primeVue.changeTheme('aura-light-green', 'aura-dark-green', 'theme-css', () => {});
//   } else {
//   primeVue.changeTheme('aura-dark-green', 'aura-light-green', 'theme-css', () => {});
//   }
// };
//
// changeTheme();

</script>

<template>
  <RouterView />
</template>

<script lang="ts">
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
</script>
