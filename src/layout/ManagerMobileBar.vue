<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, RouterLink, type RouteLocationRaw } from 'vue-router';
import Drawer from 'primevue/drawer';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ManagerMenu from '@/layout/ManagerMenu.vue';

interface MobileNavItem {
  label: string;
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

const route = useRoute();
const sidebarVisible = ref(false);

const projectId = computed(() => route.params.projectId);

const navItems = computed<MobileNavItem[]>(() => {
  if (!projectId.value) {
    return [
      {
        label: 'Projekte',
        to: { name: 'ProjectSelection' },
        icon: 'pi-briefcase'
      },
      {
        label: 'Einstellungen',
        to: { name: 'AccountSettings' },
        icon: 'pi-cog'
      }
    ];
  }

  return [
    {
      label: 'Dashboard',
      to: { name: 'ProjectDashboard', params: { projectId: projectId.value } },
      icon: 'pi-chart-bar'
    },
    {
      label: 'Aufgaben',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', category: 'TASK' }
      },
      icon: 'pi-list'
    },
    {
      label: 'Mängel',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', category: 'DEFECT' }
      },
      icon: 'pi-exclamation-circle'
    },
     {
      label: 'Chat',
      to: { name: 'ProjectChatView', params: { projectId: projectId.value } },
      icon: 'pi-comments'
    }
  ];
});

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
}

// Helper to check query parameters logic from original file
function matchesQuery(
  targetQuery: Record<string, string>, 
  routeQuery: Record<string, string | null | (string | null)[]>, 
  strict: boolean
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


function isActive(item: MobileNavItem) {
  if (!item.to) return false;
  
  const target = item.to;
  const currentRouteQuery = route.query as Record<string, string>;

  // String Path matching
  if (typeof target === 'string') {
     return route.path === target || (target !== '/' && route.path.startsWith(target));
  }
  
  // Named Route matching
  if (typeof target === 'object' && target !== null && 'name' in target) {
      if (target.name && route.name !== target.name) return false;
      
      // Cast safely instead of using any, assuming standard router object structure
      const targetQuery = (target as { query?: Record<string, string> }).query || {};
      
      // Determine strictness: if target has no query, do we require route to have no query?
      // For tasks/defects (same route name, different query), we need rigorous checking.
      // If we are navigating to IssueOverview with task query, strict mode doesn't matter much as long as we match.
      // BUT if we navigate to base IssueOverview without query, we shouldn't highlight if we are on task view.
      
      // Original logic was: !target.query && route.name === target.name
      const strict = !Object.keys(targetQuery).length && route.name === (target as { name?: string }).name;
      
      return matchesQuery(targetQuery, currentRouteQuery, strict);
  }

  return true;
}

function getIconClass(item: MobileNavItem) {
    if (typeof item.icon === 'string') {
        return item.icon;
    }
    if (item.icon && item.icon.type === 'pi') {
        return item.icon.name;
    }
    return '';
}
</script>

<template>
  <div class="mobile-nav-bar">
    <RouterLink
      v-for="item in navItems"
      :key="item.label"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item) }"
    >
      <i
        v-if="typeof item.icon === 'string' || item.icon?.type === 'pi'"
        class="pi"
        :class="getIconClass(item)"
        style="font-size: 1.2rem;"
      />

      <FontAwesomeIcon
        v-else-if="item.icon?.type === 'fa'"
        :icon="item.icon.name"
        style="font-size: 1.2rem;"
      />
      <span class="sr-only">{{ item.label }}</span>
    </RouterLink>

    <button type="button" class="nav-item more-btn" @click="toggleSidebar">
      <i class="pi pi-ellipsis-h" style="font-size: 1.2rem;" />
    </button>

    <Drawer
      v-model:visible="sidebarVisible"
      position="right"
      class="mobile-sidebar-drawer"
      style="width: 80vw; max-width: 300px;"
    >
      <ManagerMenu />
    </Drawer>
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  height: 60px;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.active {
  color: var(--p-primary-color, #4CAF50);
  border-top: 3px solid var(--p-primary-color, #4CAF50);
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color-secondary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
