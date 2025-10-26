<script setup lang="ts">
import { watch, ref, onBeforeUpdate, onMounted } from 'vue';
import AppFooter from './AppFooter.vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView } from 'vue-router';

const props = defineProps<{
  fullscreen: boolean;
}>();

const { layoutState, isSidebarActive, setFullscreen } = useLayout();
const outsideClickListener = ref<EventListenerOrEventListenerObject | null>(null);

onMounted(() => {
  setFullscreen(props.fullscreen);
});

onBeforeUpdate(() => {
  setFullscreen(props.fullscreen);
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
  const target = event.target as Node;

  // Check if click is inside sidebar (if it exists)
  if (sidebarEl && (sidebarEl.isSameNode(target) || sidebarEl.contains(target))) {
    return false;
  }

  // Check if click is inside burger button (if it exists)
  if (topbarEl && (topbarEl.isSameNode(target) || topbarEl.contains(target))) {
    return false;
  }

  // If we get here, it's an outside click
  return true;
}
</script>

<template>
  <div class="layout-main-container">
    <main>
      <div class="layout-main">
        <div class="flex flex-col gap-8">
          <RouterView></RouterView>
        </div>
      </div>
    </main>
    <AppFooter></AppFooter>
  </div>
</template>
