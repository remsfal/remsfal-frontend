<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue';
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState';
import { matchesRouteTarget } from '@/layouts/composables/useRouteActiveMatch';

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
        query: { status: 'OPEN', type: 'TASK' },
      },
      icon: 'pi-list',
    },
    {
      label: 'Mängel',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', type: 'DEFECT' },
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

function isActive(item: MobileNavItem): boolean {
  return matchesRouteTarget(route, item.to);
}
</script>

<template>
  <AppRoleMobileBar :navItems="navItems" :isActiveFn="isActive">
    <ProjectMenu />
  </AppRoleMobileBar>
</template>
