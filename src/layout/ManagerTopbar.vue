<script setup lang="ts">
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import Select, { type SelectChangeEvent} from 'primevue/select';
import LocaleSwitch from '@/components/LocaleSwitch.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { toggleMenu, toggleDarkMode, isDarkTheme, isFullscreen } = useLayout();

const sessionStore = useUserSessionStore();
const projectStore = useProjectStore();

const topbarMenuActive = ref(false);
const router = useRouter();

const onProjectSelectionChange = (event: SelectChangeEvent) => {
  console.log('new project selected ', event.value.name);
  projectStore.setSelectedProject(event.value);
  topbarMenuActive.value = false;
  router.push({name: 'ProjectDashboard', params: {projectId: projectStore.projectId}});
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
</script>

<template>
  <header>
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <!-- Button v-if="!isFullscreen" class="layout-menu-button layout-topbar-action" @click="toggleMenu" -->
        <Button class="layout-menu-button layout-topbar-menu-button layout-topbar-action" @click="toggleMenu">
          <i class="pi pi-bars"></i>
        </Button>
        <router-link to="/" class="layout-topbar-logo">
          <img src="@/assets/logo.png" alt="logo" />
        </router-link>
      </div>

      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <Button type="button" class="layout-topbar-action" @click="toggleDarkMode">
            <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
          </Button>
        </div>

        <Button
          v-styleclass="{
            selector: '@next',
            enterFromClass: 'hidden',
            enterActiveClass: 'animate-scalein',
            leaveToClass: 'hidden',
            leaveActiveClass: 'animate-fadeout',
            hideOnOutsideClick: true,
toggleClass: 'hidden'
          }"
          class="layout-topbar-menu-button layout-topbar-action"
        >
          <i class="pi pi-ellipsis-v"></i>
        </Button>

        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <button
              v-if="sessionStore.user != null"
              class="layout-topbar-shortcut-button layout-topbar-action"
              @click="onHomeClick()"
            >
              <i class="pi pi-home"></i>
              <span>{{ t('toolbar.projects') }}</span>
            </button>
            <div v-if="sessionStore.user != null" class="layout-topbar-action">
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
              class="layout-topbar-shortcut-button layout-topbar-action"
              @click="onNewProjectClick()"
            >
              <i class="pi pi-plus"></i>
              <span>{{ t('toolbar.newProject') }}</span>
            </button>
            <button
              v-if="sessionStore.user != null"
              class="layout-topbar-action"
              @click="onAccountSettingsClick()"
            >
              <i class="pi pi-user"></i>
              <span>{{ sessionStore.user.email }}</span>
            </button>
            <Button
              v-if="sessionStore.user != null"
              class="layout-topbar-action"
              @click="logout()"
            >
              <i class="pi pi-sign-out"></i>
              <span>{{ t('toolbar.logout') }}</span>
            </Button>
            <Button
              v-if="sessionStore.user == null"
              class="layout-topbar-action"
              @click="login('/projects')"
            >
              <i class="pi pi-sign-in"></i>
              <span>{{ t('toolbar.login') }}</span>
            </Button>
            <LocaleSwitch></LocaleSwitch>
          </div>
        </div>
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
