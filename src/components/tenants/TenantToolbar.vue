<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

defineProps<{
  activeFilter: ActiveFilter;
  searchQuery: string;
}>();

const emit = defineEmits<{
  'update:activeFilter': [value: ActiveFilter];
  'update:searchQuery': [value: string];
}>();

const { t } = useI18n();

const filterOptions = [
  { label: t('tenantList.filter.all'), value: 'ALL' },
  { label: t('tenantList.filter.active'), value: 'ACTIVE' },
  { label: t('tenantList.filter.inactive'), value: 'INACTIVE' },
];
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 mb-4">
    <!-- Filter -->
    <SelectButton
      :modelValue="activeFilter"
      :options="filterOptions"
      optionLabel="label"
      optionValue="value"
      :allowEmpty="false"
      @update:modelValue="emit('update:activeFilter', $event as ActiveFilter)"
    />

    <!-- Search -->
    <IconField class="flex-1">
      <InputIcon class="pi pi-search" />
      <InputText
        :modelValue="searchQuery"
        :placeholder="t('tenantList.search.placeholder')"
        fluid
        @update:modelValue="emit('update:searchQuery', $event || '')"
      />
    </IconField>
  </div>
</template>
