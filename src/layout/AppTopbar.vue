<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterLink } from 'vue-router';
import Button from 'primevue/button';

const { toggleMenu, toggleDarkMode, isDarkTheme, isFullscreen } = useLayout();

const topbarMenuButton = ref<InstanceType<typeof Button> | null>(null);
const topbarMenu = ref<HTMLDivElement | null>(null);
const isTopbarMenuActive = ref(false);
let isToggling = false;

const toggleTopbarMenu = () => {
  isToggling = true;
  isTopbarMenuActive.value = !isTopbarMenuActive.value;

  // Reset the toggling flag after a delay to ensure the click has fully propagated
  setTimeout(() => {
    isToggling = false;
  }, 200);
};

const handleOutsideClick = (event: MouseEvent) => {
  // Skip if we're currently toggling or menu is not active
  if (isToggling || !isTopbarMenuActive.value) {
    return;
  }

  const target = event.target as Node;

  // Get the actual DOM elements from the refs
  const menuElement = topbarMenu.value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonElement = (topbarMenuButton.value as any)?.$el as HTMLElement | undefined;

  // Check if click is inside the menu
  if (menuElement && menuElement.contains && menuElement.contains(target)) {
    return;
  }

  // Check if click is inside the toggle button
  if (buttonElement && buttonElement.contains && buttonElement.contains(target)) {
    return;
  }

  // Click is outside, close the menu
  isTopbarMenuActive.value = false;
};

onMounted(() => {
  // Use capture phase to handle the event before it reaches the button's click handler
  document.addEventListener('click', handleOutsideClick, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick, true);
});
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
            <i class="pi" :class="[{ 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
          </Button>
        </div>

        <Button ref="topbarMenuButton" class="layout-topbar-menu-button layout-topbar-action" @click="toggleTopbarMenu">
          <i class="pi pi-ellipsis-v"></i>
        </Button>

        <div ref="topbarMenu" class="layout-topbar-menu lg:block" :class="{ hidden: !isTopbarMenuActive }">
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
