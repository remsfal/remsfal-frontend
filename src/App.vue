<script setup lang="ts">
import { RouterView } from 'vue-router';
defineOptions({
  created() {
    console.log('App created!');
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
    const projectStore = useProjectStore();
    projectStore.refreshProjectList();
  },
});
</script>

<template>
  <RouterView />
</template>

<script lang="ts">
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
</script>
