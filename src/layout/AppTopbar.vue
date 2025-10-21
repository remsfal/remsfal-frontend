<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { RouterLink } from 'vue-router';
import Button from 'primevue/button';

const { toggleMenu, toggleDarkMode, isDarkTheme, isFullscreen } = useLayout();
</script>

<template>
  <header>
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <Button
          v-if="!isFullscreen"
          class="layout-menu-button layout-topbar-menu-button layout-topbar-action"
          @click="toggleMenu"
        >
          <i class="pi pi-bars"></i>
        </Button>
        <RouterLink to="/" class="layout-topbar-logo">
          <img src="@/assets/logo.svg" alt="logo" />
        </RouterLink>
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
          }"
          class="layout-topbar-menu-button layout-topbar-action"
        >
          <i class="pi pi-ellipsis-v"></i>
        </Button>

        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <slot />
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
