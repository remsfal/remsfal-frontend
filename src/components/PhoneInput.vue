<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import type { FormInstance } from '@primevue/forms';
import { COUNTRIES, type Country } from '@/constants/countries';
import { countryFlagEmoji, countryDisplayName } from '@/helper/countryHelper';

const props = defineProps<{
  modelValue?: string;
  /** Registers the field with the surrounding PrimeVue `<Form>`, like PrimeVue's own inputs. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  inputId?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

// PrimeVue's <Form> provides itself as `$pcForm`; `register` is the same hook its inputs use.
type FieldProps = { onChange?: (event: { value: string }) => void; onBlur?: () => void };
type PcForm = FormInstance & { register: (field: string, options?: object) => FieldProps };
const pcForm = inject<PcForm | undefined>('$pcForm', undefined);

let formField: FieldProps = {};
watch(
  () => props.name,
  (name) => {
    formField = (name && pcForm?.register(name)) || {};
  },
  { immediate: true },
);

const fieldState = computed(() => (props.name ? pcForm?.getFieldState(props.name) : undefined));
const value = computed<string | undefined>(() => (fieldState.value ? fieldState.value.value : props.modelValue));
const isInvalid = computed(() => props.invalid || !!fieldState.value?.invalid);

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

onMounted(() => applyValue(value.value));
watch(value, applyValue);

function emitCombined() {
  if (_applyingExternal) return;
  const digits = localNumber.value.replace(/\D/g, '');
  const combined = digits ? selectedCountry.value.dialCode + digits : '';
  emit('update:modelValue', combined);
  formField.onChange?.({ value: combined });
}

function onLocalInput(val: string | undefined) {
  localNumber.value = (val ?? '').replace(/\D/g, '');
  emitCombined();
}

function onLocalBlur() {
  formField.onBlur?.();
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
      :invalid="isInvalid"
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
      :id="inputId"
      :value="localNumber"
      type="tel"
      fluid
      :disabled="disabled"
      :invalid="isInvalid"
      @update:modelValue="onLocalInput"
      @blur="onLocalBlur"
    />
  </InputGroup>
</template>
