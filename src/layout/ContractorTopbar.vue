<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useUserSessionStore } from '@/stores/UserSession';

const { layoutConfig, onMenuToggle } = useLayout();
const sessionStore = useUserSessionStore();

const topbarMenuActive = ref(false);
const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
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
          class="p-link layout-topbar-button"
          @click="logout()"
        >
          <i class="pi pi-sign-out"></i>
          <span>Abmelden</span>
        </button>
        <button
          v-if="sessionStore.user == null"
          class="p-link layout-topbar-button"
          @click="login('/projects')"
        >
          <i class="pi pi-sign-in"></i>
          <span>Anmelden</span>
        </button>
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
