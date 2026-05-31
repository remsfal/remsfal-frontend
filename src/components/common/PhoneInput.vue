<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import { PHONE_DIAL_CODES, type PhoneDialCode } from '@/constants/phoneDialCodes';

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function flagEmoji(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
}

const defaultCountry = PHONE_DIAL_CODES.find(c => c.code === 'DE') ?? PHONE_DIAL_CODES[0];

function parseE164(value?: string): { country: PhoneDialCode; local: string } | null {
  if (!value?.startsWith('+')) return null;
  const sorted = [...PHONE_DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sorted) {
    if (value?.startsWith(country.dialCode)) {
      return { country, local: value.slice(country.dialCode.length) };
    }
  }
  return null;
}

const selectedCountry = ref<PhoneDialCode>(defaultCountry);
const localNumber = ref('');
let _applyingExternal = false;

function applyValue(value?: string) {
  _applyingExternal = true;
  if (!value) {
    localNumber.value = '';
  } else {
    const parsed = parseE164(value);
    if (parsed) {
      selectedCountry.value = parsed.country;
      localNumber.value = parsed.local;
    } else {
      localNumber.value = value;
    }
  }
  _applyingExternal = false;
}

onMounted(() => applyValue(props.modelValue));
watch(() => props.modelValue, applyValue);

function emitCombined() {
  if (_applyingExternal) return;
  const digits = localNumber.value.replace(/\D/g, '');
  emit('update:modelValue', digits ? selectedCountry.value.dialCode + digits : '');
}

function onLocalInput(val: string) {
  localNumber.value = val;
  emitCombined();
}
</script>

<template>
  <InputGroup>
    <Select
      v-model="selectedCountry"
      :options="PHONE_DIAL_CODES"
      optionLabel="name"
      filter
      :filterFields="['name', 'dialCode']"
      :disabled="disabled"
      class="w-28! min-w-0! flex-none!"
      :pt="{
        label: { style: 'padding-inline: 0.375rem' },
        dropdown: { style: 'width: 1.5rem; padding: 0 0.25rem' },
      }"
      @change="emitCombined"
    >
      <template #value="{ value }">
        <span>{{ flagEmoji(value.code) }} {{ value.dialCode }}</span>
      </template>
      <template #option="{ option }">
        <span>{{ flagEmoji(option.code) }} {{ option.dialCode }} {{ option.name }}</span>
      </template>
    </Select>
    <InputText
      :value="localNumber"
      type="tel"
      fluid
      :disabled="disabled"
      @update:modelValue="onLocalInput"
    />
  </InputGroup>
</template>
