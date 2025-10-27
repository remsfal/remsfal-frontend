<script setup lang="ts">
import { useUserSessionStore } from '@/stores/UserSession';
import AppTopbar from '@/layout/AppTopbar.vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const sessionStore = useUserSessionStore();
const router = useRouter();

const onAccountSettingsClick = () => {
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
  <AppTopbar>
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
  </AppTopbar>
</template>
