import { reactive, ref, computed, onMounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { FormSubmitEvent } from '@primevue/forms';
import { z } from 'zod';
import { countryDisplayName } from '@/helper/countryHelper';
import AddressService from '@/services/AddressService';
import type { AddressJson } from '@/services/AddressService';
import { COUNTRIES } from '@/constants/countries';

export const streetRegex = /^(?=.*[A-Za-zÄÖÜäöüß])(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/;
export const nameRegex = /^[A-Za-zÄÖÜäöüß\s-]+$/;

type Translate = ReturnType<typeof useI18n>['t'];

export function buildAddressSchema(t: Translate, extra?: z.ZodRawShape) {
  return z.object({
    street: z
      .string()
      .trim()
      .min(1, { message: t('validation.required') })
      .regex(streetRegex, { message: t('address.validation.streetInvalid') }),
    zip: z.string().trim().min(1, { message: t('validation.required') }),
    city: z
      .string()
      .trim()
      .min(1, { message: t('validation.required') })
      .regex(nameRegex, { message: t('address.validation.nameInvalid') }),
    province: z
      .string()
      .trim()
      .min(1, { message: t('validation.required') })
      .regex(nameRegex, { message: t('address.validation.nameInvalid') }),
    countryCode: z.string().min(2, { message: t('address.validation.countryRequired') }),
    ...extra,
  });
}

interface AddressFormFields {
  street: string;
  zip: string;
  city: string;
  province: string;
  countryCode: string;
}

const baseFieldDefaults: AddressFormFields = {
  street: '', zip: '', city: '', province: '', countryCode: ''
};

export interface UseAddressFormOptions<E extends Record<string, string>> {
  /** Extra non-address fields (e.g. owner/careOf) to merge into the reactive state. */
  extraFieldDefaults?: E;
  /** Loads the initial values; missing fields default to an empty string. */
  load: () => Promise<(Partial<AddressFormFields> & Partial<E>) | undefined>;
  /** Persists the current form values. Should throw on failure. */
  save: (payload: AddressJson & E) => Promise<void>;
  /** console.error label used when load() rejects. */
  loadErrorLogLabel?: string;
  /** console.error label used when save() rejects. */
  errorLogLabel?: string;
}

export function useAddressForm<E extends Record<string, string> = Record<string, never>>(
  options: UseAddressFormOptions<E>,
): {
  currentValues: AddressFormFields & E;
  initialValues: Ref<AddressFormFields & E>;
  formKey: Ref<number>;
  isDirty: ComputedRef<boolean>;
  localizedCountries: ComputedRef<{ code: string; displayName: string }[]>;
  handleZipBlur: () => Promise<void>;
  onSubmit: (event: FormSubmitEvent) => Promise<void>;
} {
  const { t, locale } = useI18n();
  const toast = useToast();
  const addressService = new AddressService();

  const extraDefaults = (options.extraFieldDefaults ?? {}) as E;
  const defaults = { ...baseFieldDefaults, ...extraDefaults } as AddressFormFields & E;

  const localizedCountries = computed(() =>
    COUNTRIES.map(c => ({ ...c, displayName: countryDisplayName(c.code, locale.value) })),
  );

  // serverValues = baseline from backend (for dirty comparison)
  const serverValues = reactive({ ...defaults }) as AddressFormFields & E;

  // currentValues = what the user has typed (tracked via @update:modelValue)
  const currentValues = reactive({ ...defaults }) as AddressFormFields & E;

  // initialValues drives what the Form component displays
  const initialValues = ref({ ...currentValues }) as Ref<AddressFormFields & E>;
  const formKey = ref(0);

  const isDirty = computed(() =>
    (Object.keys(serverValues) as (keyof (AddressFormFields & E))[]).some(
      key => currentValues[key] !== serverValues[key],
    ),
  );

  onMounted(async () => {
    try {
      const loaded = await options.load();
      const merged = {
        ...defaults,
        ...loaded,
      } as AddressFormFields & E;
      Object.assign(serverValues, merged);
      Object.assign(currentValues, merged);
      initialValues.value = { ...merged };
      formKey.value++;
    } catch (error) {
      console.error(options.loadErrorLogLabel ?? 'Failed to load address', error);
    }
  });

  async function handleZipBlur() {
    const zip = currentValues.zip;
    if (!zip) return;
    try {
      const result = await addressService.getCityFromZip(zip);
      if (result?.city) {
        currentValues.city = result.city;
        currentValues.province = result.province || '';
        currentValues.countryCode = result.countryCode || '';
        initialValues.value = { ...currentValues };
        formKey.value++;
      }
    } catch (error) {
      console.error('ZIP lookup failed', error);
    }
  }

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid) return;
    const s = event.states;
    const payload = Object.fromEntries(
      (Object.keys(defaults) as (keyof (AddressFormFields & E))[]).map(key => [
        key,
        s[key as string]?.value || undefined,
      ]),
    ) as AddressJson & E;

    try {
      await options.save(payload);
      const saved = { ...defaults, ...payload } as AddressFormFields & E;
      Object.assign(serverValues, saved);
      Object.assign(currentValues, saved);
      initialValues.value = { ...saved };
      formKey.value++;
      toast.add({
        severity: 'success',
        summary: t('success.saved'),
        detail: t('address.saveSuccess'),
        life: 3000,
      });
    } catch (error) {
      console.error(options.errorLogLabel ?? 'Failed to save address', error);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: t('address.saveError'),
        life: 4000,
      });
    }
  }

  return {
    currentValues, initialValues, formKey, isDirty, localizedCountries, handleZipBlur, onSubmit,
  };
}
