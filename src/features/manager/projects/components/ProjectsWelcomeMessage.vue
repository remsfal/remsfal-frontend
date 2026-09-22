<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import { useProjectStore } from '@/stores/ProjectStore';

const { t } = useI18n();
const projectStore = useProjectStore();
const isLoading = ref(true);

onMounted(async () => {
  try {
    await projectStore.refreshProjectList();
  } finally {
    isLoading.value = false;
  }
});

const showWelcome = computed(() => !isLoading.value && projectStore.projectList.length === 0);
</script>

<template>
  <Message v-if="showWelcome" severity="success" closable class="mb-6">
    <template #icon>
      <i class="pi pi-sparkles text-xl" />
    </template>
    <span>
      {{ t('managerDashboard.projects.emptyState.text') }}
      <br>
      <RouterLink :to="{ name: 'ProjectSelection' }" class="font-semibold underline">
        {{ t('managerDashboard.projects.emptyState.link') }}
      </RouterLink>
    </span>
  </Message>
  <template v-else />
</template>
