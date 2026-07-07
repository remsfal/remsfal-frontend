<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import AutoComplete from 'primevue/autocomplete';
import type { ProjectMemberJson } from '@/services/ProjectMemberService';
import { useProjectMembers } from '@/composables/useProjectMembers';

const props = defineProps<{
  modelValue: string | null;     // Member ID (UUID)
  projectId: string;              // Required for fetching
  disabled?: boolean;
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const { t } = useI18n();

// State
const { members, loading: loadingMembers } = useProjectMembers(toRef(props, 'projectId'));
const filteredMembers = ref<MemberOption[]>([]);

// Member with computed label for display
type MemberOption = ProjectMemberJson & { label: string };

// Transform members to options with labels
const memberOptions = computed<MemberOption[]>(() =>
  members.value.map(m => ({
    ...m,
    label: `${m.name} (${m.email})`,
  }))
);

// Find selected member object from ID
const selectedMember = computed(() => {
  if (!props.modelValue) return null;
  return memberOptions.value.find(m => m.id === props.modelValue) || null;
});

// Search/filter members by name or email
const searchMembers = (event: { query: string }) => {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    filteredMembers.value = memberOptions.value;
    return;
  }

  filteredMembers.value = memberOptions.value.filter(m =>
    m.name?.toLowerCase().includes(query) ||
    m.email?.toLowerCase().includes(query)
  );
};

// Handle member selection
const onMemberChange = (member: MemberOption | null) => {
  emit('update:modelValue', member?.id || null);
};
</script>

<template>
  <AutoComplete
    :modelValue="selectedMember"
    :inputId="inputId"
    :suggestions="filteredMembers"
    :invalid="invalid"
    dataKey="id"
    optionLabel="label"
    :placeholder="t('memberAutoComplete.placeholder')"
    :disabled="disabled || loadingMembers"
    :loading="loadingMembers"
    :emptySearchMessage="t('memberAutoComplete.noResults')"
    fluid
    dropdown
    @update:modelValue="onMemberChange"
    @complete="searchMembers"
  >
    <template #option="slotProps">
      <div class="flex flex-col">
        <span class="font-semibold">{{ slotProps.option.name }}</span>
        <span class="text-sm text-gray-600">{{ slotProps.option.email }}</span>
      </div>
    </template>
  </AutoComplete>
</template>
