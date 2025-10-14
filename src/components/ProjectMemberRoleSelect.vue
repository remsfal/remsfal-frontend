// src/components/MemberRoleSelect.vue
<script setup lang="ts">
import { computed } from 'vue';
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import type { MemberRole } from '@/services/ProjectMemberService';

const props = defineProps<{
  modelValue: MemberRole | null;
  class?: string;
  invalid?: boolean;
}>();
const emit = defineEmits<(e: 'update:modelValue', value: MemberRole | null) => void>();

const { t } = useI18n();

// Compute translated role labels
const memberRoles: { label: string; value: MemberRole }[] = [
  { label: t('roles.proprietor'), value: 'PROPRIETOR' },
  { label: t('roles.manager'), value: 'MANAGER' },
  { label: t('roles.lessor'), value: 'LESSOR' },
  { label: t('roles.staff'), value: 'STAFF' },
  { label: t('roles.collaborator'), value: 'COLLABORATOR' },
];
const translatedRoles = computed(() =>
  memberRoles.map((role) => ({
    value: role.value,
    label: t(`roles.${role.value.toLowerCase()}`), // dynamic i18n key
  })),
);
</script>

<template>
  <Select
    inputId="role"
    :placeholder="t('roles.select')"
    :options="translatedRoles"
    optionLabel="label"
    optionValue="value"
    :modelValue="props.modelValue"
    :class="[props.class, { 'p-invalid': props.invalid }]"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
