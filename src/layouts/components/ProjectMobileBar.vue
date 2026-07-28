<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue';
import { useUserSessionStore } from '@/stores/UserSession';
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState';
import { matchesRouteTarget } from '@/layouts/composables/useRouteActiveMatch';

interface ProjectNavItem extends MobileNavItem {
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

const { t } = useI18n();
const route = useRoute();
const sessionStore = useUserSessionStore();
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
      label: t('projectMenu.home.label'),
      to: { name: 'ProjectDashboard', params: { projectId: projectId.value } },
      icon: 'pi-chart-bar',
    },
    {
      label: t('projectMenu.tenantCommunication.new'),
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'PENDING' },
      },
      icon: 'pi-envelope',
    },
    {
      label: t('projectMenu.issueManagement.mine'),
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: sessionStore.user?.id ? { assigneeId: sessionStore.user.id } : {},
      },
      icon: 'pi-list-check',
    },
    {
      label: t('projectMenu.masterData.tenants'),
      to: { name: 'TenantList', params: { projectId: projectId.value } },
      icon: 'pi-address-book',
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
