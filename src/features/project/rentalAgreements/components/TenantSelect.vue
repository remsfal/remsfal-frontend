<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import AutoComplete from 'primevue/autocomplete';

// Services & Types
import { tenantService, type TenantItemJson } from '../services/TenantService';

// Props & Emits
const props = defineProps<{
  projectId: string;
  modelValue: TenantItemJson | null;
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: TenantItemJson | null];
  blur: [];
}>();

const { t } = useI18n();

// State
const allTenants = ref<TenantItemJson[]>([]);
const filteredTenants = ref<TenantItemJson[]>([]);
const isLoading = ref(false);

type TenantOption = TenantItemJson & { label: string };

function toOption(tenant: TenantItemJson): TenantOption {
  const emailSuffix = tenant.email ? ` (${tenant.email})` : '';
  return { ...tenant, label: `${tenant.firstName} ${tenant.lastName}${emailSuffix}` };
}

// Computed property for AutoComplete options with a synthetic display label
const tenantOptions = computed<TenantOption[]>(() => filteredTenants.value.map(toOption));

// The bound modelValue may come from the caller without a synthetic `label`;
// always derive the display value here so AutoComplete never falls back to
// rendering the raw object.
const displayValue = computed<TenantOption | null>(() =>
  props.modelValue ? toOption(props.modelValue) : null,
);

// Load tenants on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    allTenants.value = await tenantService.fetchTenants(props.projectId);
    filteredTenants.value = allTenants.value;
  } catch (error) {
    console.error('Failed to load tenants:', error);
  } finally {
    isLoading.value = false;
  }
});

// AutoComplete (non-multiple) emits update:modelValue for the transient text
// the user is typing while searching too, not only for a genuine selection —
// it's a raw string, not a tenant. Only forward real selections (a tenant
// object) or an explicit clear (null).
function onModelValueUpdate(value: TenantOption | string | null) {
  if (typeof value === 'string') return;
  emit('update:modelValue', value);
}

// AutoComplete Filter Function (client-side, no search endpoint exists)
const searchTenants = (event: { query: string }) => {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    // Always assign a new array reference: AutoComplete only opens its
    // overlay when its `suggestions` prop changes, so reusing the exact
    // same array (e.g. on the very first dropdown click, before any
    // filtering happened) would silently no-op and leave the dropdown closed.
    filteredTenants.value = [...allTenants.value];
    return;
  }

  filteredTenants.value = allTenants.value.filter(
    (tenant) =>
      tenant.firstName?.toLowerCase().includes(query) ||
      tenant.lastName?.toLowerCase().includes(query) ||
      tenant.email?.toLowerCase().includes(query),
  );
};
</script>

<template>
  <AutoComplete
    :inputId="inputId"
    :modelValue="displayValue"
    :suggestions="tenantOptions"
    :loading="isLoading"
    :placeholder="t('tenantSelect.placeholder')"
    :emptySearchMessage="t('tenantSelect.empty')"
    dataKey="id"
    optionLabel="label"
    :class="{ 'p-invalid': invalid }"
    forceSelection
    fluid
    dropdown
    @complete="searchTenants"
    @update:modelValue="onModelValueUpdate"
    @blur="emit('blur')"
  >
    <template #option="slotProps">
      <div class="flex flex-col">
        <span class="font-semibold">{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</span>
        <span v-if="slotProps.option.email" class="text-sm text-gray-600">{{ slotProps.option.email }}</span>
      </div>
    </template>
  </AutoComplete>
</template>
