import { ref, watch } from 'vue';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import { matchesRouteTarget } from '@/layouts/composables/useRouteActiveMatch';

export interface MobileNavItem {
  label: string;
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

export function useMobileBarActiveState() {
  const route = useRoute();
  const sidebarVisible = ref(false);

  watch(() => route.fullPath, () => {
    sidebarVisible.value = false;
  });

  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
  }

  function isActive(item: MobileNavItem): boolean {
    return matchesRouteTarget(route, item.to);
  }

  return {
    sidebarVisible,
    toggleSidebar,
    isActive,
  };
}
