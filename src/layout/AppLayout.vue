<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import AppFooter from './AppFooter.vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView } from 'vue-router';
import {useUserSessionStore} from "@/stores/UserSession";

const props = defineProps<{
  fullscreen: boolean;
}>();

const { layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref<EventListenerOrEventListenerObject | null>(null);

onMounted(() => {
  layoutState.staticMenuDesktopInactive = props.fullscreen;
});

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
}

function isOutsideClicked(event: Event) {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.layout-menu-button');

  return !(
    sidebarEl!.isSameNode(event.target as Node) ||
    sidebarEl!.contains(event.target as Node) ||
    topbarEl!.isSameNode(event.target as Node) ||
    topbarEl!.contains(event.target as Node)
  );
}
</script>

<template>
  <div class="layout-main-container">
    <main>
      <div class="layout-main">
        <RouterView></RouterView>
      </div>
    </main>
    <AppFooter></AppFooter>
  </div>
</template>
