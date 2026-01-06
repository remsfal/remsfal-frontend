<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Divider from 'primevue/divider';
import ScrollPanel from 'primevue/scrollpanel';
import type { InboxMessage } from '@/services/InboxService';
import { useLayout } from '@/layout/composables/layout';

const props = defineProps<{
  activeNavItem: 'inbox' | 'done';
  unreadCount: number;
  doneCount: number;
  activeFilterId: string | null;
  customFilters: CustomFilter[];
  projectOptions: ProjectOption[];
  filterProject: string[];
  messages: InboxMessage[];
}>();

const emit = defineEmits<{
  'update:activeNavItem': [value: 'inbox' | 'done'];
  filterApplied: [filter: CustomFilter];
  projectFilterToggled: [projectId: string];
  clearFilters: [];
}>();

const { isDarkTheme } = useLayout();
const { t } = useI18n();

export interface CustomFilter {
  id: string;
  name: string;
  icon: string;
  query: string;
}

export interface ProjectOption {
  label: string;
  value: string;
}

const getFilterCount = (filter: CustomFilter) => {
  const parts = filter.query.split(' ');
  return props.messages.filter(msg => {
    return parts.every(part => {
      const [key, val] = part.split(':');
      if (key === 'status') return msg.issueStatus === val;
      if (key === 'type') return msg.issueType === val;
      return true;
    });
  }).length;
};

const getProjectCount = (projectId: string) => {
  return props.messages.filter(m => m.projectId === projectId).length;
};

const handleFilterClick = (filter: CustomFilter) => {
  if (props.activeFilterId === filter.id) {
    emit('clearFilters');
  } else {
    emit('filterApplied', filter);
  }
};

const handleProjectClick = (projectId: string) => {
  emit('projectFilterToggled', projectId);
};

const handleNavClick = (navItem: 'inbox' | 'done') => {
  emit('update:activeNavItem', navItem);
  if (navItem === 'inbox') {
    emit('clearFilters');
  }
};

// Gruppiere Filter nach Kategorien
const smartFilters = computed(() => 
  props.customFilters.filter(f => f.id.startsWith('smart-'))
);

const statusFilters = computed(() => 
  props.customFilters.filter(f => f.id.startsWith('status-'))
);

const typeFilters = computed(() => 
  props.customFilters.filter(f => f.id.startsWith('type-'))
);
</script>

<template>
  <aside 
    class="w-72 m-4 p-4 shadow-md rounded-xl"
    :class="isDarkTheme ? 'bg-surface-900' : 'bg-surface-0'"
  >
    <div class="flex flex-col h-full">
      <!-- Navigation Buttons -->
      <div class="space-y-1 mb-4">
        <Button 
          text
          severity="secondary"
          class="w-full justify-start"
          :class="isDarkTheme ? '!text-surface-0' : '!text-surface-900'"
          :style="props.activeNavItem === 'inbox' 
            ? { backgroundColor: isDarkTheme ? 'var(--p-surface-600)' : 'var(--p-surface-200)' } 
            : {}"
          @click="handleNavClick('inbox')"
        >
          <template #default>
            <span class="flex items-center justify-between w-full">
              <span class="flex items-center gap-2">
                <i class="pi pi-inbox" />
                {{ t('inbox.sidebar.inbox') }}
              </span>
              <Badge v-if="unreadCount > 0" :value="unreadCount" severity="secondary" />
            </span>
          </template>
        </Button>
        
        <Button 
          text
          severity="secondary"
          class="w-full justify-start"
          :class="isDarkTheme ? '!text-surface-0' : '!text-surface-900'"
          :style="props.activeNavItem === 'done' 
            ? { backgroundColor: isDarkTheme ? 'var(--p-surface-600)' : 'var(--p-surface-200)' } 
            : {}"
          @click="handleNavClick('done')"
        >
          <template #default>
            <span class="flex items-center justify-between w-full">
              <span class="flex items-center gap-2">
                <i class="pi pi-check" />
                <span>{{ t('inbox.sidebar.done') }}</span>
              </span>
              <Badge v-if="doneCount > 0" :value="doneCount" severity="secondary" />
            </span>
          </template>
        </Button>
      </div>

      <Divider />

      <!-- Filters Section -->
      <div class="flex-1 overflow-hidden flex flex-col min-h-0">
        <div class="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 px-2 flex-shrink-0">
          {{ t('inbox.filter.title') }}
        </div>
        
        <div class="flex-1 min-h-0">
          <ScrollPanel style="width: 100%; height: 100%;">
            <div class="space-y-3 pb-6 pr-2">
              <!-- Smart Filters -->
              <div v-if="smartFilters.length > 0">
                <div 
                  class="text-xs font-medium mb-1 px-2"
                  :class="isDarkTheme ? 'text-surface-400' : 'text-surface-600'"
                >
                  {{ t('inbox.filter.smart') }}
                </div>
                <div class="space-y-0.5">
                  <Button 
                    v-for="filter in smartFilters" 
                    :key="filter.id"
                    text
                    :severity="activeFilterId === filter.id ? 'success' : 'secondary'"
                    class="w-full justify-start"
                    :class="activeFilterId === filter.id 
                      ? (isDarkTheme ? '!bg-surface-700' : '!bg-surface-200')
                      : (isDarkTheme ? '!text-surface-0 hover:!bg-surface-800' : '!text-surface-900 hover:!bg-surface-100')"
                    @click="handleFilterClick(filter)"
                  >
                    <template #default>
                      <span class="flex items-center justify-between w-full">
                        <span class="flex items-center gap-2">
                          <i class="pi text-xs" :class="[filter.icon]" />
                          {{ filter.name }}
                        </span>
                        <Badge v-if="getFilterCount(filter) > 0" :value="getFilterCount(filter)" severity="secondary" />
                      </span>
                    </template>
                  </Button>
                </div>
              </div>

              <!-- Status Filters -->
              <div v-if="statusFilters.length > 0">
                <div 
                  class="text-xs font-medium mb-1 px-2"
                  :class="isDarkTheme ? 'text-surface-400' : 'text-surface-600'"
                >
                  {{ t('inbox.filter.status') }}
                </div>
                <div class="space-y-0.5">
                  <Button 
                    v-for="filter in statusFilters" 
                    :key="filter.id"
                    text
                    :severity="activeFilterId === filter.id ? 'success' : 'secondary'"
                    class="w-full justify-start"
                    :class="activeFilterId === filter.id 
                      ? (isDarkTheme ? '!bg-surface-700' : '!bg-surface-200')
                      : (isDarkTheme ? '!text-surface-0 hover:!bg-surface-800' : '!text-surface-900 hover:!bg-surface-100')"
                    @click="handleFilterClick(filter)"
                  >
                    <template #default>
                      <span class="flex items-center justify-between w-full">
                        <span class="flex items-center gap-2">
                          <i class="pi text-xs" :class="[filter.icon]" />
                          {{ filter.name }}
                        </span>
                        <Badge v-if="getFilterCount(filter) > 0" :value="getFilterCount(filter)" severity="secondary" />
                      </span>
                    </template>
                  </Button>
                </div>
              </div>

              <!-- Type Filters -->
              <div v-if="typeFilters.length > 0">
                <div 
                  class="text-xs font-medium mb-1 px-2"
                  :class="isDarkTheme ? 'text-surface-400' : 'text-surface-600'"
                >
                  {{ t('inbox.filter.type') }}
                </div>
                <div class="space-y-0.5">
                  <Button 
                    v-for="filter in typeFilters" 
                    :key="filter.id"
                    text
                    :severity="activeFilterId === filter.id ? 'success' : 'secondary'"
                    class="w-full justify-start"
                    :class="activeFilterId === filter.id 
                      ? (isDarkTheme ? '!bg-surface-700' : '!bg-surface-200')
                      : (isDarkTheme ? '!text-surface-0 hover:!bg-surface-800' : '!text-surface-900 hover:!bg-surface-100')"
                    @click="handleFilterClick(filter)"
                  >
                    <template #default>
                      <span class="flex items-center justify-between w-full">
                        <span class="flex items-center gap-2">
                          <i class="pi text-xs" :class="[filter.icon]" />
                          {{ filter.name }}
                        </span>
                        <Badge v-if="getFilterCount(filter) > 0" :value="getFilterCount(filter)" severity="secondary" />
                      </span>
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollPanel>
        </div>
      </div>

      <Divider />

      <!-- Projects Section -->
      <div>
        <div class="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 px-2">
          {{ t('inbox.sidebar.projects') }}
        </div>
        <ScrollPanel style="width: 100%; height: 120px">
          <div class="space-y-1">
            <Button 
              v-for="proj in projectOptions" 
              :key="proj.value"
              text
              :severity="filterProject.includes(proj.value) ? 'success' : 'secondary'"
              size="small"
              class="w-full justify-start"
              :class="filterProject.includes(proj.value) 
                ? (isDarkTheme ? '!bg-surface-700' : '!bg-surface-200')
                : (isDarkTheme ? '!text-surface-0 hover:!bg-surface-800' : '!text-surface-900 hover:!bg-surface-100')"
              @click="handleProjectClick(proj.value)"
            >
              <template #default>
                <span class="flex items-center justify-between w-full">
                  <span class="truncate">{{ proj.label }}</span>
                  <Badge v-if="getProjectCount(proj.value) > 0" :value="getProjectCount(proj.value)" severity="secondary" />
                </span>
              </template>
            </Button>
          </div>
        </ScrollPanel>
      </div>
    </div>
  </aside>
</template>

