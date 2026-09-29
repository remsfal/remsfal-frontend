<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useLayout } from '@/layouts/composables/layout';

export interface ActivityFeedFilterOption {
  id: string;
  name: string;
  icon: string;
  query: string;
  count: number;
}

export interface ActivityFeedFilterGroup {
  label: string;
  items: ActivityFeedFilterOption[];
}

const props = defineProps<{
  activeTab: 'all' | 'unread';
  searchQuery: string;
  selectedCount: number;
  filterGroups: ActivityFeedFilterGroup[];
  activeFilterId: string | null;
}>();

const emit = defineEmits<{
  'update:activeTab': [value: 'all' | 'unread'];
  'update:searchQuery': [value: string];
  'update:activeFilterId': [value: string | null];
  markReadSelected: [];
  deleteSelected: [];
}>();

const { isDarkTheme } = useLayout();
const { t } = useI18n();

const activeFilter = computed(() =>
  props.filterGroups.flatMap(group => group.items).find(option => option.id === props.activeFilterId) ?? null
);

const tabOptions = computed(() => [
  { label: t('activityFeeds.filter.statusOptions.all'), value: 'all' },
  { label: t('activityFeeds.filter.statusOptions.unread'), value: 'unread' },
]);

const handleTabChange = (value: 'all' | 'unread' | null | undefined) => {
  // Ensure a tab is always selected - prevent deselection
  if (value === null || value === undefined || !['all', 'unread'].includes(value)) {
    // If invalid value, don't emit and keep current tab
    return;
  }
  // Prevent clicking the already active tab to deselect it
  if (value === props.activeTab) {
    // Don't emit if trying to deselect current tab
    return;
  }
  emit('update:activeTab', value);
};
</script>

<template>
  <div 
    class="flex flex-wrap items-center gap-4 px-4 py-3 border-b"
    :class="isDarkTheme ? 'border-surface-800' : 'border-surface-200'"
  >
    <!-- All / Unread Toggle -->
    <SelectButton 
      :modelValue="activeTab" 
      :options="tabOptions" 
      optionLabel="label" 
      optionValue="value" 
      :allowEmpty="false"
      class="p-selectbutton-sm"
      @update:modelValue="handleTabChange"
    />

    <!-- Search -->
    <InputGroup class="flex-1 min-w-60">
      <InputGroupAddon>
        <i class="pi pi-search" />
      </InputGroupAddon>
      <InputText
        :modelValue="searchQuery"
        :placeholder="t('activityFeeds.toolbar.searchPlaceholder')"
        :aria-label="t('activityFeeds.toolbar.searchPlaceholder')"
        @update:modelValue="emit('update:searchQuery', $event || '')"
      />
      <Button
        icon="pi pi-times"
        severity="secondary"
        :aria-label="t('activityFeeds.toolbar.clearSearch')"
        :disabled="!searchQuery"
        @click="emit('update:searchQuery', '')"
      />
    </InputGroup>

    <!-- Filter -->
    <InputGroup class="w-full md:w-80">
      <InputGroupAddon>
        <i class="pi pi-filter" />
      </InputGroupAddon>
      <Select
        :modelValue="activeFilterId"
        :options="filterGroups"
        optionLabel="name"
        optionValue="id"
        optionGroupLabel="label"
        optionGroupChildren="items"
        :placeholder="t('activityFeeds.filter.placeholder')"
        :ariaLabel="t('activityFeeds.filter.title')"
        @update:modelValue="emit('update:activeFilterId', $event ?? null)"
      >
        <template #value="{ placeholder }">
          <span v-if="activeFilter" class="flex items-center gap-2">
            <i class="pi text-xs" :class="activeFilter.icon" />
            <span class="truncate">{{ activeFilter.name }}</span>
          </span>
          <span v-else>{{ placeholder }}</span>
        </template>
        <template #option="{ option }">
          <span class="flex items-center justify-between gap-2 w-full">
            <span class="flex items-center gap-2 min-w-0">
              <i class="pi text-xs" :class="option.icon" />
              <span class="truncate">{{ option.name }}</span>
            </span>
            <Badge v-if="option.count > 0" :value="option.count" severity="secondary" />
          </span>
        </template>
      </Select>
      <Button
        icon="pi pi-times"
        severity="secondary"
        :aria-label="t('activityFeeds.filter.clear')"
        :disabled="!activeFilterId"
        @click="emit('update:activeFilterId', null)"
      />
    </InputGroup>

    <!-- Bulk Actions -->
    <div v-if="selectedCount > 0" class="flex items-center gap-2">
      <Tag :value="`${selectedCount} ${t('activityFeeds.toolbar.selected')}`" severity="info" rounded />
      <Button 
        v-tooltip.bottom="t('activityFeeds.actions.markAsRead')" 
        icon="pi pi-check" 
        text 
        rounded 
        size="small" 
        @click="emit('markReadSelected')" 
      />
      <Button 
        v-tooltip.bottom="t('button.delete')" 
        icon="pi pi-trash" 
        text 
        rounded 
        severity="danger" 
        size="small" 
        @click="emit('deleteSelected')" 
      />
    </div>
  </div>
</template>

