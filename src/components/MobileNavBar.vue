<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, RouterLink, type RouteLocationRaw } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { useLayout } from '@/layout/composables/layout';
import ManagerMenu from '@/layout/ManagerMenu.vue';
import AppMenuItem, { type MenuItem } from '@/layout/AppMenuItem.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Drawer from 'primevue/drawer';

interface MobileNavItem {
  label: string;
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

const route = useRoute();
const sessionStore = useUserSessionStore();
const { layoutState } = useLayout();

const projectId = computed(() => route.params.projectId);
const userRole = computed(() => sessionStore.user?.userRoles?.[0]);


const managerItems = computed<MobileNavItem[]>(() => {
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

const contractorItems = computed<MobileNavItem[]>(() => [
  {
    label: 'Übersicht',
    to: { name: 'ContractorView' }, 
    icon: 'pi-home'
  },
  {
    label: 'Aufträge',
    to: { name: 'ContractorView', query: { tab: 'orders' } },
    icon: 'pi-id-card'
  }
]);

const contractorMenuModel = ref<MenuItem[]>([
  {
    label: 'consultantMenu.home',
    items: [
      {
        label: 'consultantMenu.home.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/customers',
        command: () => { sidebarVisible.value = false; }
      },
      {
        label: 'consultantMenu.home.client',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/customers',
        command: () => { sidebarVisible.value = false; }
      },
    ],
  },
  {
    label: 'consultantMenu.clientManagement',
    items: [
      {
        label: 'consultantMenu.clientManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/customers', 
        command: () => { sidebarVisible.value = false; }
      },
      {
        label: 'consultantMenu.clientManagement.ongoing',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/customers',
        command: () => { sidebarVisible.value = false; }
      },
      {
        label: 'consultantMenu.clientManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
        to: '/customers',
        command: () => { sidebarVisible.value = false; }
      },
    ],
  },
]);

// Local Tenant Menu Model (replacing TenantMenu.vue)
const tenantMenuModel = ref<MenuItem[]>([
  {
    label: 'Mietverhältnis',
    items: [
      {
        label: 'Überblick',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/',
        command: () => { sidebarVisible.value = false; }
      },
      {
        label: 'Meldungen',
        icon: { type: 'pi', name: 'pi pi-fw pi-comment' },
        to: { name: 'Inbox' },
        command: () => { sidebarVisible.value = false; }
      },
    ],
  },
]);

const tenantItems = computed<MobileNavItem[]>(() => [
  {
    label: 'Überblick',
    to: '/',
    icon: 'pi-home'
  },
  {
    label: 'Meldungen',
    to: { name: 'Inbox' },
    icon: 'pi-comment'
  }
]);

const navItems = computed<MobileNavItem[]>(() => {
  if (userRole.value === 'TENANT') {
    return tenantItems.value;
  } else if (userRole.value === 'CONTRACTOR') {
    return contractorItems.value;
  } else {
    return managerItems.value;
  }
});


const MAX_VISIBLE = 4;
const visibleItems = computed(() => navItems.value.slice(0, MAX_VISIBLE));

const sidebarVisible = ref(false);

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
}

// Close sidebar automatically when resizing to desktop view
const checkWindowSize = () => {
  if (window.innerWidth > 991) {
    sidebarVisible.value = false;
    layoutState.staticMenuMobileActive = false;
    layoutState.overlayMenuActive = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', checkWindowSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowSize);
});

function isActive(item: MobileNavItem) {
  if (!item.to) return false;
  
  // Special check for Contractor bottom items to avoid duplicates
  if (userRole.value === 'CONTRACTOR') {
      const target = item.to;
      // Use 'as any' to safely access properties that might not exist on all union members
      if (typeof target === 'object' && target !== null && 'name' in target) {
          if (route.name !== (target as any).name) return false;
          
          const targetQuery = (target as any).query || {};
          const routeQuery = route.query || {};
          
          const targetKeys = Object.keys(targetQuery);
          if (targetKeys.length > 0) {
             for (const key of targetKeys) {
               if (routeQuery[key] !== targetQuery[key]) return false;
             }
             return true;
          } else {
             if (Object.keys(routeQuery).length > 0) return false; 
          }
      }
  }

  if (typeof item.to === 'string') {
     return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
  }

  const target = item.to;
  
  if (typeof target === 'object' && target !== null) {
      // Safe access using casting or checking existence
      const targetName = 'name' in target ? (target as any).name : undefined;
      
      if (targetName && route.name !== targetName) {
        return false;
      }
      
      if ('query' in target && (target as any).query) {
        const keys = Object.keys((target as any).query);
        for (const key of keys) {
          if (route.query[key] !== (target as any).query[key]) return false;
        }
      } else if (Object.keys(route.query).length > 0 && targetName && route.name === targetName) {
          return false;
      }
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
      v-for="item in visibleItems"
      :key="item.label"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item) }"
    >
      <!-- Support both string icons and object icons -->
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

    <!-- Always show More button to open the full sidebar -->
    <button type="button" class="nav-item more-btn" @click="toggleSidebar">
      <i class="pi pi-ellipsis-h" style="font-size: 1.2rem;" />
    </button>

    <!-- Drawer for full menu -->
    <Drawer
      v-model:visible="sidebarVisible"
      position="right"
      class="mobile-sidebar-drawer"
      style="width: 80vw; max-width: 300px;"
    >
      <!-- Dynamically render the correct menu based on role -->
      <ManagerMenu v-if="!userRole || userRole === 'MANAGER'" />
      
      <!-- Use local implementation for Contractor to fix broken links -->
      <div v-else-if="userRole === 'CONTRACTOR'" class="layout-sidebar">
         <ul class="layout-menu">
            <template v-for="(item, i) in contractorMenuModel" :key="item.label">
                <AppMenuItem :item="item" :index="i" />
            </template>
         </ul>
      </div>

      <div v-else-if="userRole === 'TENANT'" class="layout-sidebar">
         <ul class="layout-menu">
            <template v-for="(item, i) in tenantMenuModel" :key="item.label">
                <AppMenuItem :item="item" :index="i" />
            </template>
         </ul>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

@media (width <= 991px) {
  .mobile-nav-bar {
    display: flex !important;
  }
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