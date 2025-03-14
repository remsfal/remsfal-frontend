<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import type { SelectChangeEvent } from 'primevue/select';
import Select from 'primevue/select';
import LocaleSwitch from '@/components/LocaleSwitch.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { layoutConfig, onMenuToggle } = useLayout();
const sessionStore = useUserSessionStore();
const projectStore = useProjectStore();

const outsideClickListener = ref<EventListenerOrEventListenerObject | null>(null);
const topbarMenuActive = ref(false);
const router = useRouter();

onMounted(() => {
  bindOutsideClickListener();
});

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};

const onProjectSelectionChange = (event: SelectChangeEvent) => {
  console.log('new project selected ', event.value.name);
  projectStore.setSelectedProject(event.value);
  topbarMenuActive.value = false;
  router.push({ name: 'ProjectDashboard', params: { projectId: projectStore.projectId } });
};

const onNewProjectClick = () => {
  topbarMenuActive.value = false;
  router.push('/new-project');
};

const onHomeClick = () => {
  topbarMenuActive.value = false;
  projectStore.refreshProjectList();
  router.push('/projects');
};

const onAccountSettingsClick = () => {
  topbarMenuActive.value = false;
  router.push('/account-settings');
};

const logout = () => {
  window.location.pathname = '/api/v1/authentication/logout';
};

const login = (route: string) => {
  window.location.href = `/api/v1/authentication/login?route=${encodeURIComponent(route)}`;
};

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value,
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event: Event) => {
  if (!topbarMenuActive.value) return;

  const sidebarEl = document.querySelector('.layout-topbar-menu');
  const topbarEl = document.querySelector('.layout-topbar-menu-button');

  return !(
    sidebarEl!.isSameNode(event.target as Node) ||
    sidebarEl!.contains(event.target as Node) ||
    topbarEl!.isSameNode(event.target as Node) ||
    topbarEl!.contains(event.target as Node)
  );
};
</script>

<template>
  <header>
    <div class="layout-topbar">
      <div class="layout-topbar-logo">
        <img src="@/assets/logo.png" alt="logo" />
      </div>

      <button
        v-if="!layoutConfig.fullscreen.value"
        class="p-link layout-menu-button layout-topbar-button"
        @click="onMenuToggle()"
      >
        <i class="pi pi-bars"></i>
      </button>

      <button
        class="p-link layout-topbar-menu-button layout-topbar-button"
        @click="onTopBarMenuButton()"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu" :class="topbarMenuClasses">
        <button
          v-if="sessionStore.user != null"
          class="p-link layout-topbar-shortcut-button"
          @click="onHomeClick()"
        >
          <i class="pi pi-home"></i>
          <span>{{ t('toolbar.projects') }}</span>
        </button>
        <div v-if="sessionStore.user != null" class="p-link layout-topbar-button">
          <Select
            v-model="projectStore.selectedProject"
            :options="projectStore.projectList"
            optionLabel="name"
            :placeholder="t('toolbar.project.placeholder')"
            @change="onProjectSelectionChange($event)"
          />
        </div>
        <button
          v-if="sessionStore.user != null"
          class="p-link layout-topbar-shortcut-button"
          @click="onNewProjectClick()"
        >
          <i class="pi pi-plus"></i>
          <span>{{ t('toolbar.newProject') }}</span>
        </button>
        <button
          v-if="sessionStore.user != null"
          class="p-link layout-topbar-button"
          @click="onAccountSettingsClick()"
        >
          <i class="pi pi-user"></i>
          <span>{{ sessionStore.user.email }}</span>
        </button>
        <button
          v-if="sessionStore.user != null"
          class="p-link layout-topbar-button"
          @click="logout()"
        >
          <i class="pi pi-sign-out"></i>
          <span>{{ t('toolbar.logout') }}</span>
        </button>
        <button
          v-if="sessionStore.user == null"
          class="p-link layout-topbar-button"
          @click="login('/projects')"
        >
          <i class="pi pi-sign-in"></i>
          <span>{{ t('toolbar.login') }}</span>
        </button>
        <LocaleSwitch></LocaleSwitch>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.p-select {
  border: 0;
  box-shadow: none;
  margin-left: -0.5rem;
}
</style>
