<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import { COUNTRIES, type Country } from '@/constants/countries';
import { countryFlagEmoji, countryDisplayName } from '@/helper/countryHelper';

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const { locale } = useI18n();

const localizedCountries = computed(() =>
  COUNTRIES.map(c => ({ ...c, displayName: countryDisplayName(c.code, locale.value) })),
);

const defaultCountry = COUNTRIES.find(c => c.code === 'DE') ?? COUNTRIES[0];

function parseE164(value?: string): { country: Country; local: string } | null {
  if (!value?.startsWith('+')) return null;
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sorted) {
    if (value?.startsWith(country.dialCode)) {
      return { country, local: value.slice(country.dialCode.length) };
    }
  }
  return null;
}

const selectedCountry = ref<Country>(defaultCountry);
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

function onLocalInput(val: string | undefined) {
  localNumber.value = val ?? '';
  emitCombined();
}
</script>

<template>
  <InputGroup>
    <Select
      v-model="selectedCountry"
      :options="localizedCountries"
      optionLabel="displayName"
      filter
      :filterFields="['displayName', 'dialCode']"
      :disabled="disabled"
      class="w-28! min-w-0! flex-none!"
      :pt="{
        label: { style: 'padding-inline: 0.375rem' },
        dropdown: { style: 'width: 1.5rem; padding: 0 0.25rem' },
      }"
      @change="emitCombined"
    >
      <template #value="{ value }">
        <span>{{ countryFlagEmoji(value.code) }} {{ value.dialCode }}</span>
      </template>
      <template #option="{ option }">
        <span>{{ countryFlagEmoji(option.code) }} {{ option.dialCode }} {{ option.displayName }}</span>
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
