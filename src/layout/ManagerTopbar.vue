<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Select, { type SelectChangeEvent } from 'primevue/select';
import LocaleSwitch from '@/components/LocaleSwitch.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import { computed } from 'vue';
import { useInboxStore } from '@/stores/InboxStore';
import TopbarUserActions from '@/components/TopbarUserActions.vue';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';

const { t } = useI18n();

const sessionStore = useUserSessionStore();
const projectStore = useProjectStore();
const inboxStore = useInboxStore();

const router = useRouter();

// Use the composable for shared actions to avoid duplication
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { onAccountSettingsClick, logout, login, loginDev, showDevLoginButton } = useTopbarUserActions();

const onProjectSelectionChange = (event: SelectChangeEvent) => {
  console.log('new project selected ', event.value.name);
  projectStore.setSelectedProject(event.value);
  router.push({ name: 'ProjectDashboard', params: { projectId: projectStore.projectId } });
};

const onNewProjectClick = () => {
  router.push('/new-project');
};

const onHomeClick = () => {
  projectStore.refreshProjectList();
  router.push('/projects');
};

const onInboxClick = () => {
  router.push('/inbox');
};

const unreadCount = computed(() =>
  inboxStore.messages
    ? inboxStore.messages.filter(m => !m?.isRead).length
    : 0
);
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
        :options="projectStore.projectList"
        optionLabel="name"
        :placeholder="t('toolbar.project.placeholder')"
        @change="onProjectSelectionChange($event)"
      />
    </div>
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-shortcut-button layout-topbar-action"
      @click="onNewProjectClick()"
    >
      <i class="pi pi-plus" />
      <span>{{ t('toolbar.newProject') }}</span>
    </Button>
    
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

    <LocaleSwitch />
  </AppTopbar>
</template>
