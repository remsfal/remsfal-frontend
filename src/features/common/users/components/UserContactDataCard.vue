<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/BaseCard.vue';
import PhoneInput from '@/components/PhoneInput.vue';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Skeleton from 'primevue/skeleton';
import { userService } from '@/features/common/users/services/UserService';
import { type Locale } from '@/i18n/i18n';
import { toISODateString } from '@/helper/dateHelper';

const { t } = useI18n();
const i18n = useI18n();
const appToast = useAppToast();

const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
const phoneRegex = /^\+[1-9]\d{4,14}$/;

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(nameRegex, { message: t('accountSettings.validation.nameInvalid') }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(nameRegex, { message: t('accountSettings.validation.nameInvalid') }),
  placeOfBirth: z.string().trim().or(z.literal('')),
  locale: z.string(),
});

const resolver = zodResolver(schema);
const formKey = ref(0);
const formFields = ['firstName', 'lastName', 'placeOfBirth', 'locale'];
const initialValues = ref<Record<string, string>>({
  firstName: '',
  lastName: '',
  placeOfBirth: '',
  locale: i18n.locale.value,
});

// Date of birth tracked separately (not via PrimeVue Forms, DatePicker returns a Date)
const serverDateOfBirth = ref<Date | null>(null);
const dateOfBirthValue = ref<Date | null>(null);
const dateOfBirthDirty = computed(
  () => toISODateString(dateOfBirthValue.value) !== toISODateString(serverDateOfBirth.value),
);

// Phone fields tracked separately (not via PrimeVue Forms)
const serverPhones = reactive({
  mobile: '', business: '', private: '' 
});
const currentPhones = reactive({
  mobile: '', business: '', private: '' 
});

const phoneDirty = computed(
  () =>
    currentPhones.mobile !== serverPhones.mobile ||
    currentPhones.business !== serverPhones.business ||
    currentPhones.private !== serverPhones.private,
);

function phoneFieldError(val: string) {
  return val && !phoneRegex.test(val) ? t('validation.phone') : null;
}
const mobilePhoneError = computed(() => phoneFieldError(currentPhones.mobile));
const businessPhoneError = computed(() => phoneFieldError(currentPhones.business));
const privatePhoneError = computed(() => phoneFieldError(currentPhones.private));
const hasPhoneError = computed(() => !!mobilePhoneError.value || !!businessPhoneError.value || !!privatePhoneError.value);

const email = ref('');

const serverAltEmail = ref('');
const currentAltEmail = ref('');
const altEmailLocked = ref(false);
const altEmailSuccess = ref(false);
const altEmailError = ref(false);

const altEmailDirty = computed(() => currentAltEmail.value.trim() !== serverAltEmail.value);

function validateEmailFormat(emailStr: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr);
}

function applyAltEmail(additionalEmails: string[] | undefined) {
  serverAltEmail.value = currentAltEmail.value = additionalEmails?.[0] ?? '';
  altEmailLocked.value = !!serverAltEmail.value;
}

const isLoading = ref(true);

const localeOptions = [
  { language: 'Deutsch', value: 'de' },
  { language: 'English', value: 'en' },
];

function validateLocale(locale: string): Locale {
  return locale === 'de' || locale === 'en' ? (locale as Locale) : 'en';
}

onMounted(async () => {
  try {
    const profile = await userService.getUser();
    email.value = profile.email || '';
    initialValues.value = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      placeOfBirth: profile.placeOfBirth || '',
      locale: profile.locale ? validateLocale(profile.locale) : i18n.locale.value,
    };
    if (profile.locale) {
      i18n.locale.value = validateLocale(profile.locale);
    }
    serverDateOfBirth.value = dateOfBirthValue.value = profile.dateOfBirth
      ? new Date(profile.dateOfBirth)
      : null;
    const phones = {
      mobile: profile.mobilePhoneNumber || '',
      business: profile.businessPhoneNumber || '',
      private: profile.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, phones);
    Object.assign(currentPhones, phones);
    applyAltEmail(profile.additionalEmails);
    formKey.value++;
  } catch (error) {
    console.error('Failed to load user profile', error);
  } finally {
    isLoading.value = false;
  }
});

function deleteAlternativeEmail() {
  currentAltEmail.value = '';
  altEmailLocked.value = false;
  altEmailSuccess.value = false;
  altEmailError.value = false;
}

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || hasPhoneError.value) return;
  const s = event.states;
  const enteredAltEmail = currentAltEmail.value.trim();
  const altEmailChanged = altEmailDirty.value;
  const altEmailInvalid = altEmailChanged && !!enteredAltEmail && !validateEmailFormat(enteredAltEmail);
  const sendAltEmail = altEmailChanged && !altEmailInvalid;
  try {
    const updatedUser = await userService.updateUser({
      firstName: s.firstName?.value || undefined,
      lastName: s.lastName?.value || undefined,
      placeOfBirth: s.placeOfBirth?.value?.trim() || undefined,
      dateOfBirth: toISODateString(dateOfBirthValue.value) || undefined,
      mobilePhoneNumber: currentPhones.mobile || undefined,
      businessPhoneNumber: currentPhones.business || undefined,
      privatePhoneNumber: currentPhones.private || undefined,
      locale: s.locale?.value || undefined,
      additionalEmails: sendAltEmail ? (enteredAltEmail ? [enteredAltEmail] : []) : undefined,
    });

    initialValues.value = {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      placeOfBirth: updatedUser.placeOfBirth || '',
      locale: updatedUser.locale ? validateLocale(updatedUser.locale) : i18n.locale.value,
    };
    serverDateOfBirth.value = dateOfBirthValue.value = updatedUser.dateOfBirth
      ? new Date(updatedUser.dateOfBirth)
      : null;
    formKey.value++;

    const savedPhones = {
      mobile: updatedUser.mobilePhoneNumber || '',
      business: updatedUser.businessPhoneNumber || '',
      private: updatedUser.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, savedPhones);
    Object.assign(currentPhones, savedPhones);

    appToast.success(t('accountSettings.userProfile.saveSuccess'), { summary: t('success.saved') });

    if (altEmailInvalid) {
      altEmailSuccess.value = false;
      altEmailError.value = true;
      appToast.error(t('accountSettings.userProfile.alternativeEmailInvalid'));
      return;
    }

    applyAltEmail(updatedUser.additionalEmails);
    altEmailSuccess.value = true;
    altEmailError.value = false;
    if (altEmailChanged && enteredAltEmail) {
      appToast.success(t('accountSettings.userProfile.alternativeEmailSaveSuccess'), { summary: t('success.saved') });
    }
  } catch (error) {
    console.error('Failed to update user profile', error);
    altEmailSuccess.value = false;
    altEmailError.value = true;
    if (altEmailChanged) {
      appToast.error(t('accountSettings.userProfile.alternativeEmailSaveError'));
    }
  }
}
</script>

<template>
  <BaseCard :loading="isLoading">
    <template #title>
      {{ t('accountSettings.userProfile.title') }}
    </template>

    <template #loading>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton v-for="i in 8" :key="i" height="3.5rem" />
      </div>
    </template>

    <template #content>
      <Form
        :key="formKey"
        v-slot="$form"
        :initialValues
        :resolver
        @submit="onSubmit"
      >
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- First Name -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="firstName">
                {{ t('accountSettings.userProfile.firstName') }}*
              </label>
              <InputText id="firstName" fluid name="firstName" />
              <Message
                v-if="$form.firstName?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.firstName.error?.message }}
              </Message>
            </div>

            <!-- Last Name -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="lastName">
                {{ t('accountSettings.userProfile.lastName') }}*
              </label>
              <InputText id="lastName" fluid name="lastName" />
              <Message
                v-if="$form.lastName?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.lastName.error?.message }}
              </Message>
            </div>

            <!-- Place of Birth -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="placeOfBirth">
                {{ t('accountSettings.userProfile.placeOfBirth') }}
              </label>
              <InputText id="placeOfBirth" fluid name="placeOfBirth" />
            </div>

            <!-- Date of Birth -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="dateOfBirth">
                {{ t('accountSettings.userProfile.dateOfBirth') }}
              </label>
              <DatePicker
                id="dateOfBirth"
                v-model="dateOfBirthValue"
                dateFormat="dd.mm.yy"
                fluid
                showIcon
              />
            </div>

            <!-- Primary Email (readonly) -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="primaryEmail">
                {{ t('accountSettings.userProfile.email') }}
              </label>
              <InputText id="primaryEmail" :value="email" disabled fluid />
            </div>

            <!-- Alternative Email -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="alternativeEmail">
                {{ t('accountSettings.userProfile.alternativeEmail') }}
              </label>
              <div class="flex items-center gap-2">
                <InputText
                  id="alternativeEmail"
                  v-model="currentAltEmail"
                  :disabled="altEmailLocked"
                  autocomplete="off"
                  class="flex-1"
                  inputmode="email"
                  type="text"
                />
                <i v-if="altEmailSuccess" class="pi pi-check text-green-600 font-bold" />
                <i v-if="altEmailError" class="pi pi-times text-red-600 font-bold" />
                <Button
                  v-if="altEmailLocked"
                  :aria-label="t('button.delete')"
                  icon="pi pi-trash"
                  severity="secondary"
                  type="button"
                  @click="deleteAlternativeEmail"
                />
              </div>
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-1">
              <label for="mobile-phone" class="font-medium">
                {{ t('accountSettings.userProfile.mobilePhone') }}
              </label>
              <PhoneInput
                inputId="mobile-phone"
                :modelValue="currentPhones.mobile"
                @update:modelValue="(v) => (currentPhones.mobile = v)"
              />
              <Message
                v-if="mobilePhoneError && currentPhones.mobile"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ mobilePhoneError }}
              </Message>
            </div>

            <!-- Business Phone -->
            <div class="flex flex-col gap-1">
              <label for="business-phone" class="font-medium">
                {{ t('accountSettings.userProfile.businessPhone') }}
              </label>
              <PhoneInput
                inputId="business-phone"
                :modelValue="currentPhones.business"
                @update:modelValue="(v) => (currentPhones.business = v)"
              />
              <Message
                v-if="businessPhoneError && currentPhones.business"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ businessPhoneError }}
              </Message>
            </div>

            <!-- Private Phone -->
            <div class="flex flex-col gap-1">
              <label for="private-phone" class="font-medium">
                {{ t('accountSettings.userProfile.privatePhone') }}
              </label>
              <PhoneInput
                inputId="private-phone"
                :modelValue="currentPhones.private"
                @update:modelValue="(v) => (currentPhones.private = v)"
              />
              <Message
                v-if="privatePhoneError && currentPhones.private"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ privatePhoneError }}
              </Message>
            </div>

            <!-- Language -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="locale">
                {{ t('accountSettings.userProfile.language') }}
              </label>
              <Select
                id="locale"
                :options="localeOptions"
                fluid
                name="locale"
                optionLabel="language"
                optionValue="value"
                @change="(e) => (i18n.locale.value = e.value)"
              />
            </div>
          </div>

          <Message severity="secondary" size="small" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

          <!-- Save Button -->
          <div class="flex justify-end">
            <Button
              :disabled="
                !(formFields.some(k => $form[k]?.dirty) || altEmailDirty || phoneDirty || dateOfBirthDirty) ||
                  hasPhoneError
              "
              :label="t('button.save')"
              icon="pi pi-save"
              type="submit"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
