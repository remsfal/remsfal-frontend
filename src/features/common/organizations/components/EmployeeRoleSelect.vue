<script setup lang="ts">
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import type { EmployeeRole } from '@/services/OrganizationService';

const props = withDefaults(
  defineProps<{
    modelValue?: EmployeeRole | null;
    class?: string;
    invalid?: boolean;
    name?: string;
    inputId?: string;
  }>(),
  {
    modelValue: null,
    class: undefined,
    name: undefined,
    inputId: undefined,
  },
);
const emit = defineEmits<{ 'update:modelValue': [value: EmployeeRole | null] }>();

const { t } = useI18n();

const employeeRoles: { label: string; value: EmployeeRole }[] = [
  { label: t('organization.employeeRole.OWNER'), value: 'OWNER' },
  { label: t('organization.employeeRole.MANAGER'), value: 'MANAGER' },
  { label: t('organization.employeeRole.STAFF'), value: 'STAFF' },
];
</script>

<template>
  <Select
    :name="props.name"
    :inputId="props.inputId"
    :placeholder="t('organization.employeeRole.select')"
    :options="employeeRoles"
    optionLabel="label"
    optionValue="value"
    :modelValue="props.modelValue"
    :class="[props.class, { 'p-invalid': props.invalid }]"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
