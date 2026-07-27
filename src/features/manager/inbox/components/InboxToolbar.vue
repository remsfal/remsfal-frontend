<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useLayout } from '@/layouts/composables/layout';

const props = defineProps<{
  activeTab: 'all' | 'unread';
  searchQuery: string;
  selectedCount: number;
}>();

const emit = defineEmits<{
  'update:activeTab': [value: 'all' | 'unread'];
  'update:searchQuery': [value: string];
  markReadSelected: [];
  deleteSelected: [];
}>();

const { isDarkTheme } = useLayout();
const { t } = useI18n();

const tabOptions = computed(() => [
  { label: t('inbox.filter.statusOptions.all'), value: 'all' },
  { label: t('inbox.filter.statusOptions.unread'), value: 'unread' },
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
    <div class="flex-1 w-full">
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

