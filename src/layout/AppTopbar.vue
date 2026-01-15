<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
import { RouterLink } from 'vue-router';
import Button from 'primevue/button';
import { ref, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue';

const { toggleMenu, toggleDarkMode, isDarkTheme, isFullscreen } = useLayout();

const isMobileMenuOpen = ref(false);
const menuButtonRef = ref<ComponentPublicInstance>();
const menuRef = ref<HTMLElement>();

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Close menu when clicking outside
const handleOutsideClick = (event: Event) => {
  const target = event.target as Element;
  
  if (isMobileMenuOpen.value && 
      menuButtonRef.value?.$el && !menuButtonRef.value.$el.contains(target) &&
      menuRef.value && !menuRef.value.contains(target)) {
    closeMobileMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <header>
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <RouterLink to="/" class="layout-topbar-logo">
          <img src="@/assets/logo.svg" alt="logo">
        </RouterLink>
      </div>

      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <Button type="button" class="layout-topbar-action" @click="toggleDarkMode">
            <i class="pi" :class="[{ 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
          </Button>
        </div>

        <Button
          ref="menuButtonRef"
          class="layout-topbar-menu-button layout-topbar-action"
          @click="toggleMobileMenu"
        >
          <i class="pi pi-ellipsis-v" />
        </Button>

        <div 
          ref="menuRef"
          class="layout-topbar-menu lg:!block"
          :class="{
            'hidden': !isMobileMenuOpen,
            'block animate-scalein': isMobileMenuOpen
          }"
        >
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
