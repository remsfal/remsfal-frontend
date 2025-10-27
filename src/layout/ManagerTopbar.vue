<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Select, { type SelectChangeEvent } from 'primevue/select';
import LocaleSwitch from '@/components/LocaleSwitch.vue';
import AppTopbar from '@/layout/AppTopbar.vue';
import { inboxService, type InboxMessage } from '@/services/InboxService';
import { ref } from 'vue';

const { t } = useI18n();

const sessionStore = useUserSessionStore();
const projectStore = useProjectStore();

const router = useRouter();

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

const onAccountSettingsClick = () => {
  router.push('/account-settings');
};

const logout = () => {
  window.location.pathname = '/api/v1/authentication/logout';
};

const login = (route: string) => {
  window.location.href = `/api/v1/authentication/login?route=${encodeURIComponent(route)}`;
};

const onInboxClick = () => {
  router.push('/inbox');
};

const unreadCount = ref<number>(0);
const loadUnreadCount = async () => {
  try {
    const data: InboxMessage[] = await inboxService.fetchInboxData();
    unreadCount.value = data.filter((msg) => !msg.isRead).length;
  } catch (err) {
    console.error('Fehler beim Laden der Inbox-Daten:', err);
    unreadCount.value = 0;
  }
};
loadUnreadCount();
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
    <div
      v-if="sessionStore.user != null"
      class="layout-topbar-action"
    >
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
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-action"
      @click="onAccountSettingsClick()"
    >
      <i class="pi pi-user" />
      <span>{{ sessionStore.user.email }}</span>
    </Button>
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-shortcut-button layout-topbar-action"
      @click="onInboxClick()"
    >
      <i class="pi pi-inbox" />
      <span
        v-if="unreadCount > 0"
        class="unread-badge"
      >
        {{ unreadCount }}
      </span>
      <span>{{ t('toolbar.inbox') }}</span>
    </Button>
    <Button
      v-if="sessionStore.user != null"
      class="layout-topbar-action"
      @click="logout()"
    >
      <i class="pi pi-sign-out" />
      <span>{{ t('toolbar.logout') }}</span>
    </Button>
    <Button
      v-if="sessionStore.user == null"
      class="layout-topbar-action"
      @click="login('/projects')"
    >
      <i class="pi pi-sign-in" />
      <span>{{ t('toolbar.login') }}</span>
    </Button>
    <LocaleSwitch />
  </AppTopbar>
</template>
