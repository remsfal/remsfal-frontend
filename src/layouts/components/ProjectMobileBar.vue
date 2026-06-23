<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue';
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState';

interface ProjectNavItem extends MobileNavItem {
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

const route = useRoute();
const projectId = computed(() => (route.params as Record<string, string>).projectId);

const navItems = computed<ProjectNavItem[]>(() => {
  if (!projectId.value) {
    return [
      {
        label: 'Projekte',
        to: { name: 'ProjectSelection' },
        icon: 'pi-briefcase',
      },
      {
        label: 'Einstellungen',
        to: { name: 'ManagerAccountSettings' },
        icon: 'pi-cog',
      },
    ];
  }

  return [
    {
      label: 'Dashboard',
      to: { name: 'ProjectDashboard', params: { projectId: projectId.value } },
      icon: 'pi-chart-bar',
    },
    {
      label: 'Aufgaben',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', category: 'TASK' },
      },
      icon: 'pi-list',
    },
    {
      label: 'Mängel',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', category: 'DEFECT' },
      },
      icon: 'pi-exclamation-circle',
    },
    {
      label: 'Chat',
      to: { name: 'ProjectChatView', params: { projectId: projectId.value } },
      icon: 'pi-comments',
    },
  ];
});

function matchesQuery(
  targetQuery: Record<string, string>,
  routeQuery: Record<string, string | null | (string | null)[]>,
  strict: boolean,
): boolean {
  const targetKeys = Object.keys(targetQuery);
  const routeKeys = Object.keys(routeQuery);

  if (targetKeys.length > 0) {
    for (const key of targetKeys) {
      if (routeQuery[key] !== targetQuery[key]) return false;
    }
    return true;
  }

  if (strict && routeKeys.length > 0) {
    return false;
  }

  return true;
}

function isActive(item: MobileNavItem): boolean {
  if (!item.to) return false;

  const target = item.to;
  const currentRouteQuery = route.query as Record<string, string>;

  if (typeof target === 'string') {
    return route.path === target || (target !== '/' && route.path.startsWith(target));
  }

  if (typeof target === 'object' && target !== null && 'name' in target) {
    if (target.name && route.name !== target.name) return false;

    const targetQuery = (target as { query?: Record<string, string> }).query || {};
    const strict = !Object.keys(targetQuery).length && route.name === (target as { name?: string }).name;

    return matchesQuery(targetQuery, currentRouteQuery, strict);
  }

  return true;
}
</script>

<template>
  <AppRoleMobileBar :navItems="navItems" :isActiveFn="isActive">
    <ProjectMenu />
  </AppRoleMobileBar>
</template>
