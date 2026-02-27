<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Select, { type SelectChangeEvent } from 'primevue/select';
import AppTopbar from '@/layout/AppTopbar.vue';
import { computed } from 'vue';
import { useInboxStore } from '@/stores/InboxStore';
import TopbarUserActions from '@/components/TopbarUserActions.vue';

const { t } = useI18n();

const sessionStore = useUserSessionStore();
const projectStore = useProjectStore();
const inboxStore = useInboxStore();

const router = useRouter();

const onProjectSelectionChange = (event: SelectChangeEvent) => {
  console.log('new project selected ', event.value.name);
  projectStore.setSelectedProject(event.value);
  router.push({ name: 'ProjectDashboard', params: { projectId: projectStore.projectId } });
};

const onHomeClick = () => {
  projectStore.refreshProjectList();
  router.push({ name: 'ProjectSelection' });
};

const onInboxClick = () => {
  router.push('/inbox');
};

const unreadCount = computed(() =>
  inboxStore.messages
    ? inboxStore.messages.filter(m => !m?.isRead).length
    : 0
);

const projectListOptions = computed(() => {
  try {
    const list = projectStore.projectList;
    // Ensure we always return a valid array, even if store is not initialized
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('ProjectStore not yet initialized:', error);
    return [];
  }
});
</script>

<template>
  <AppTopbar>
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-shortcut-button layout-topbar-action"
      @click="onHomeClick()"
    >
      <i class="pi pi-home" />
      <span>{{ t('toolbar.projects') }}</span>
    </Button>
    <div v-if="sessionStore.user != null" class="layout-topbar-action">
      <Select
        v-model="projectStore.selectedProject"
        :options="projectListOptions"
        optionLabel="name"
        :placeholder="t('toolbar.project.placeholder')"
        showClear
        @change="onProjectSelectionChange($event)"
      />
    </div>
    <!-- Inbox button remains separate as it has specific logic (unread count) -->
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-shortcut-button layout-topbar-action"
      @click="onInboxClick()"
    >
      <i class="pi pi-inbox" />
      <span v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount }}
      </span>
      <span>{{ t('toolbar.inbox') }}</span>
    </Button>

    <!-- Use shared component for common user actions -->
    <TopbarUserActions />
  </AppTopbar>
</template>
