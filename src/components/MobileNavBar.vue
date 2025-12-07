<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import Menu from 'primevue/menu';


const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.projectId);

const navItems = computed(() => {

  if (!projectId.value) {
    return [
      {
 label: 'Projekte', to: { name: 'ProjectSelection' }, icon: 'pi-briefcase' 
},
      {
 label: 'Einstellungen', to: { name: 'AccountSettings' }, icon: 'pi-cog' 
},
    ];
  }


  return [
    {
      label: 'Dashboard',
      to: { name: 'ProjectDashboard', params: { projectId: projectId.value } },
      icon: 'pi-home'
    },
    {
      label: 'Aufgaben',
      to: {
        name: 'IssueOverview',
        params: { projectId: projectId.value },
        query: { status: 'OPEN', category: 'TASK' }
      },
      icon: 'pi-check-square'
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
      label: 'Mieter',
      to: { name: 'ProjectTenancies', params: { projectId: projectId.value } },
      icon: 'pi-users'
    },

    {
      label: 'Objekte',
      to: { name: 'RentableUnits', params: { projectId: projectId.value } },
      icon: 'pi-building'
    },
    {
      label: 'Einstellungen',
      to: { name: 'ProjectSettings', params: { projectId: projectId.value } },
      icon: 'pi-cog'
    },
    {
      label: 'Chat',
      to: { name: 'ProjectChatView', params: { projectId: projectId.value } },
      icon: 'pi-comments'
    }
  ];
});


const MAX_VISIBLE = 4;
const visibleItems = computed(() => navItems.value.slice(0, MAX_VISIBLE));


const moreItems = computed(() => {
  return navItems.value.slice(MAX_VISIBLE).map(item => ({
    label: item.label,
    icon: item.icon,

    command: () => {
      router.push(item.to);
    }
  }));
});

const hasMoreItems = computed(() => navItems.value.length > MAX_VISIBLE);


// eslint-disable-next-line vue/require-typed-ref
const menu = ref();

function toggleMoreMenu(event: Event) {
  menu.value.toggle(event);
}
</script>

<template>
  <div class="mobile-nav-bar">
    <RouterLink
      v-for="item in visibleItems"
      :key="item.label"
      :to="item.to"
      class="nav-item"
      activeClass="active"
    >
      <i class="pi" :class="[item.icon]" style="font-size: 1.2rem;" />
      <span class="sr-only">{{ item.label }}</span>
    </RouterLink>

    <button v-if="hasMoreItems" class="nav-item more-btn" @click="toggleMoreMenu">
      <i class="pi pi-ellipsis-h" style="font-size: 1.2rem;" />
    </button>

    <Menu id="overlay_menu" ref="menu" :model="moreItems" popup />
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
  background-color: white;
  border-top: 1px solid #e0e0e0;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

@media (max-width: 991px) {
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
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.active {
  color: #4CAF50;
  border-top: 3px solid #4CAF50;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>