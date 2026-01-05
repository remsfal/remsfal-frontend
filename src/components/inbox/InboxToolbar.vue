<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import { useLayout } from '@/layout/composables/layout';

const { isDarkTheme } = useLayout();

const props = defineProps<{
  activeTab: 'all' | 'unread';
  searchQuery: string;
  selectedCount: number;
  grouping: 'date' | 'project' | null;
}>();

const emit = defineEmits<{
  'update:activeTab': [value: 'all' | 'unread'];
  'update:searchQuery': [value: string];
  'update:grouping': [value: 'date' | 'project' | null];
  'mark-read-selected': [];
  'delete-selected': [];
}>();

const { t } = useI18n();

const tabOptions = computed(() => [
  { label: t('inbox.filter.statusOptions.all'), value: 'all' },
  { label: t('inbox.filter.statusOptions.unread'), value: 'unread' },
]);

const groupingMenu = ref<InstanceType<typeof Menu> | null>(null);
const groupingButton = ref<HTMLElement | null>(null);

const groupingOptions = computed(() => [
  { label: t('inbox.grouping.date'), value: 'date' as const },
  { label: t('inbox.grouping.project'), value: 'project' as const },
]);

const groupingLabel = computed(() => {
  if (!props.grouping) return t('inbox.grouping.none');
  const option = groupingOptions.value.find(opt => opt.value === props.grouping);
  return option ? option.label : t('inbox.grouping.none');
});

const groupingButtonLabel = computed(() => {
  if (!props.grouping) {
    return t('inbox.grouping.buttonLabel');
  }
  return `${t('inbox.grouping.buttonLabel')}: ${groupingLabel.value}`;
});

type MenuItem = {
  label: string;
  command: () => void;
  class?: string;
  separator?: boolean;
};

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = groupingOptions.value.map(option => ({
    label: option.label,
    command: () => {
      if (props.grouping === option.value) {
        emit('update:grouping', null);
      } else {
        emit('update:grouping', option.value);
      }
    },
    class: props.grouping === option.value 
      ? (isDarkTheme.value ? 'bg-primary-900/20' : 'bg-primary-50') 
      : '',
  }));

  if (props.grouping) {
    items.push({
      label: t('inbox.grouping.clear'),
      command: () => emit('update:grouping', null),
      separator: true,
    });
  }

  return items;
});

const toggleGroupingMenu = (event: Event) => {
  groupingMenu.value?.toggle(event);
};

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
    class="flex items-center gap-4 px-4 py-3 border-b"
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
    <div class="flex-1 max-w-md">
      <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText 
          :modelValue="searchQuery" 
          :placeholder="t('inbox.toolbar.searchPlaceholder')" 
          class="w-full rounded-lg"
          :class="isDarkTheme ? 'border-surface-600' : 'border-surface-300'"
          @update:modelValue="emit('update:searchQuery', $event || '')"
        />
      </IconField>
    </div>

    <!-- Grouping Button -->
    <div class="relative">
      <Button
        ref="groupingButton"
        :label="groupingButtonLabel"
        icon="pi pi-chevron-down"
        iconPos="right"
        outlined
        size="small"
        :class="isDarkTheme ? 'grouping-button-dark' : 'grouping-button-light'"
        @click="toggleGroupingMenu"
      />
      <Menu
        ref="groupingMenu"
        :model="menuItems"
        popup
      />
    </div>

    <div class="flex-1" />

    <!-- Bulk Actions -->
    <div v-if="selectedCount > 0" class="flex items-center gap-2">
      <Tag :value="`${selectedCount} ${t('inbox.toolbar.selected')}`" severity="info" rounded />
      <Button 
        v-tooltip.bottom="t('inbox.actions.markAsDone')" 
        icon="pi pi-check" 
        text 
        rounded 
        size="small" 
        @click="emit('mark-read-selected')" 
      />
      <Button 
        v-tooltip.bottom="t('button.delete')" 
        icon="pi pi-trash" 
        text 
        rounded 
        severity="danger" 
        size="small" 
        @click="emit('delete-selected')" 
      />
    </div>
  </div>
</template>

<style scoped>
.grouping-button-light {
  background-color: #f6f8fa;
  border-color: #d0d7de;
  color: #24292f;
  font-weight: 500;
}

.grouping-button-light:hover {
  background-color: #f3f4f6;
  border-color: #d0d7de;
}

.grouping-button-dark {
  background-color: #21262d;
  border-color: #30363d;
  color: #c9d1d9;
  font-weight: 500;
}

.grouping-button-dark:hover {
  background-color: #30363d;
  border-color: #30363d;
}
</style>

