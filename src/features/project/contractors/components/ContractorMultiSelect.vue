<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MultiSelect from 'primevue/multiselect';
import Message from 'primevue/message';
import { type ContractorJson, contractorService } from '@/features/project/contractors/services/ContractorService';

const props = defineProps<{
  projectId: string;
  modelValue: ContractorJson[];
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ContractorJson[]];
  blur: [];
}>();

const { t } = useI18n();

const contractors = ref<ContractorJson[]>([]);
const isLoading = ref(false);

const hasNoContractors = computed(() => !isLoading.value && contractors.value.length === 0);

async function fetchContractors() {
  isLoading.value = true;
  try {
    const result = await contractorService.getContractors(props.projectId);
    contractors.value = result.contractors ?? [];
  } catch (error) {
    console.error('Failed to load contractors:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchContractors);

// Lets a caller (e.g. a "create contractor" dialog nested inside the same
// form) hand over a freshly created contractor so it appears selectable and
// selected immediately, without a second fetch against the server.
function addContractor(contractor: ContractorJson) {
  contractors.value = [...contractors.value, contractor];
  emit('update:modelValue', [...props.modelValue, contractor]);
}

defineExpose({ addContractor });
</script>

<template>
  <div class="flex flex-col gap-1">
    <MultiSelect
      :inputId="inputId"
      :modelValue="modelValue"
      :options="contractors"
      optionLabel="name"
      dataKey="id"
      :loading="isLoading"
      :disabled="hasNoContractors"
      :placeholder="t('contractorMultiSelect.placeholder')"
      :class="{ 'p-invalid': invalid }"
      display="chip"
      fluid
      @update:modelValue="emit('update:modelValue', $event)"
      @blur="emit('blur')"
    />
    <Message v-if="hasNoContractors" severity="warn" size="small" variant="simple">
      {{ t('contractorMultiSelect.noneAvailable') }}
    </Message>
  </div>
</template>
