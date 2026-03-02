<script setup lang="ts">
import Button from 'primevue/button';
import { useTopbarUserActions } from '@/composables/useTopbarUserActions';

const {
  t,
  sessionStore,
  onAccountSettingsClick,
  logout,
  login,
  loginDev,
  showDevLoginButton,
} = useTopbarUserActions();
</script>

<template>
  <Button
    v-if="sessionStore.user != null"
    class="layout-topbar-action"
    @click="onAccountSettingsClick()"
  >
    <i class="pi pi-user" />
    <span>{{ sessionStore.user.email }}</span>
  </Button>
  <Button v-if="sessionStore.user != null" class="layout-topbar-action" @click="logout()">
    <i class="pi pi-sign-out" />
    <span>{{ t('toolbar.logout') }}</span>
  </Button>
  <Button
    v-if="sessionStore.user == null && !showDevLoginButton"
    class="layout-topbar-action"
    @click="login()"
  >
    <i class="pi pi-sign-in" />
    <span>{{ t('toolbar.login') }}</span>
  </Button>
  <Button
    v-if="showDevLoginButton"
    class="layout-topbar-action"
    @click="loginDev()"
  >
    <i class="pi pi-code" />
    <span>{{ t('toolbar.devLogin') }}</span>
  </Button>
</template>