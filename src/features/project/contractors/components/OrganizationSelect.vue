<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AutoComplete from 'primevue/autocomplete';
import { organizationService, type OrganizationJson } from '@/services/OrganizationService.ts';

const props = defineProps<{
  modelValue: string | null;
  disabled?: boolean;
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const { t } = useI18n();

const MIN_QUERY_LENGTH = 3;

type OrganizationOption = OrganizationJson & { label: string };

function toOption(org: OrganizationJson): OrganizationOption {
  return { ...org, label: org.name ?? '' };
}

const selectedOption = ref<OrganizationOption | null>(null);
const suggestions = ref<OrganizationOption[]>([]);
const isLoading = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (value === null) selectedOption.value = null;
  },
);

async function onComplete(event: { query: string }) {
  const query = event.query.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    suggestions.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const result = await organizationService.searchOrganizations(query);
    suggestions.value = (result.organizations ?? []).map(toOption);
  } catch (error) {
    console.error('Failed to search organizations:', error);
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
}

function onModelValueUpdate(value: OrganizationOption | string | null) {
  if (typeof value === 'string') return;
  selectedOption.value = value;
  emit('update:modelValue', value?.id ?? null);
}
</script>

<template>
  <AutoComplete
    :inputId="inputId"
    :modelValue="selectedOption"
    :suggestions="suggestions"
    :loading="isLoading"
    :disabled="disabled"
    :placeholder="t('organizationSelect.placeholder')"
    :emptySearchMessage="t('organizationSelect.noResults')"
    dataKey="id"
    optionLabel="label"
    :class="{ 'p-invalid': invalid }"
    forceSelection
    fluid
    dropdown
    @complete="onComplete"
    @update:modelValue="onModelValueUpdate"
  >
    <template #option="slotProps">
      <div class="flex flex-col">
        <span class="font-semibold">{{ slotProps.option.name }}</span>
        <span v-if="slotProps.option.trade" class="text-sm text-gray-600">{{ slotProps.option.trade }}</span>
      </div>
    </template>
  </AutoComplete>
</template>
