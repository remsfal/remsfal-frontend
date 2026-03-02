import { useRoute, type RouteLocationRaw } from 'vue-router';

export interface MobileNavItem {
  label: string;
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

export function useMobileBarActiveState() {
  const route = useRoute();

  function isActive(item: MobileNavItem): boolean {
    if (!item.to) return false;

    if (typeof item.to === 'object' && item.to !== null && 'name' in item.to) {
      return route.name === item.to.name;
    }

    if (typeof item.to === 'string') {
      return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
    }

    return false;
  }

  return { isActive };
}
