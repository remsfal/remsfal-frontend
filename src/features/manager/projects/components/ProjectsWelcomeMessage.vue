<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import { useProjectStore } from '@/features/common/projects';
import NewProjectDialog from './NewProjectDialog.vue';

const { t } = useI18n();
const projectStore = useProjectStore();
const isLoading = ref(true);
const dialogVisible = ref(false);

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
      <button
        type="button"
        class="font-semibold underline cursor-pointer"
        @click="dialogVisible = true"
      >
        {{ t('managerDashboard.projects.emptyState.link') }}
      </button>
    </span>
  </Message>
  <!-- Outside the message: it disappears as soon as the new project is in the list -->
  <NewProjectDialog v-model:visible="dialogVisible" />
</template>
