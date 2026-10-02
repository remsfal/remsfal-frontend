<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent, FormFieldState } from '@primevue/forms';
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
import { nameSchema, phoneSchema, optionalEmailSchema } from '@/helper/validationHelper';

const { t } = useI18n();
const i18n = useI18n();
const appToast = useAppToast();

const schema = z.object({
  firstName: nameSchema(t),
  lastName: nameSchema(t),
  placeOfBirth: z.string().trim().or(z.literal('')),
  alternativeEmail: optionalEmailSchema(t),
  mobilePhoneNumber: phoneSchema(t),
  businessPhoneNumber: phoneSchema(t),
  privatePhoneNumber: phoneSchema(t),
  locale: z.string(),
});

const resolver = zodResolver(schema);
const formKey = ref(0);
const formFields = [
  'firstName',
  'lastName',
  'placeOfBirth',
  'alternativeEmail',
  'mobilePhoneNumber',
  'businessPhoneNumber',
  'privatePhoneNumber',
  'locale',
];
const initialValues = ref<Record<string, string>>({
  firstName: '',
  lastName: '',
  placeOfBirth: '',
  alternativeEmail: '',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  locale: i18n.locale.value,
});

// Date of birth tracked separately (not via PrimeVue Forms, DatePicker returns a Date)
const serverDateOfBirth = ref<Date | null>(null);
const dateOfBirthValue = ref<Date | null>(null);
const dateOfBirthDirty = computed(
  () => toISODateString(dateOfBirthValue.value) !== toISODateString(serverDateOfBirth.value),
);

const email = ref('');

const serverAltEmail = ref('');
const altEmailLocked = ref(false);
const altEmailVerified = ref(false);
const altEmailSuccess = ref(false);
const altEmailError = ref(false);

const altEmailUnverified = computed(() => altEmailLocked.value && !altEmailVerified.value);

function applyAltEmail(additionalEmails?: string[], verifiedAdditionalEmails?: string[]) {
  serverAltEmail.value = additionalEmails?.[0] ?? '';
  altEmailLocked.value = !!serverAltEmail.value;
  altEmailVerified.value = !!verifiedAdditionalEmails?.some(
    (verified) => verified.toLowerCase() === serverAltEmail.value.toLowerCase(),
  );
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
      alternativeEmail: profile.additionalEmails?.[0] ?? '',
      mobilePhoneNumber: profile.mobilePhoneNumber || '',
      businessPhoneNumber: profile.businessPhoneNumber || '',
      privatePhoneNumber: profile.privatePhoneNumber || '',
      locale: profile.locale ? validateLocale(profile.locale) : i18n.locale.value,
    };
    if (profile.locale) {
      i18n.locale.value = validateLocale(profile.locale);
    }
    serverDateOfBirth.value = dateOfBirthValue.value = profile.dateOfBirth
      ? new Date(profile.dateOfBirth)
      : null;
    applyAltEmail(profile.additionalEmails, profile.verifiedAdditionalEmails);
    formKey.value++;
  } catch (error) {
    console.error('Failed to load user profile', error);
  } finally {
    isLoading.value = false;
  }
});

function deleteAlternativeEmail(form: Record<string, FormFieldState>) {
  if (form.alternativeEmail) form.alternativeEmail.value = '';
  altEmailLocked.value = false;
  altEmailSuccess.value = false;
  altEmailError.value = false;
}

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const enteredAltEmail = (s.alternativeEmail?.value ?? '').trim();
  const altEmailChanged = enteredAltEmail !== serverAltEmail.value;
  let additionalEmails: string[] | undefined;
  if (altEmailChanged) {
    additionalEmails = enteredAltEmail ? [enteredAltEmail] : [];
  }
  try {
    const updatedUser = await userService.updateUser({
      firstName: s.firstName?.value || undefined,
      lastName: s.lastName?.value || undefined,
      placeOfBirth: s.placeOfBirth?.value?.trim() || undefined,
      dateOfBirth: toISODateString(dateOfBirthValue.value) || undefined,
      mobilePhoneNumber: s.mobilePhoneNumber?.value || undefined,
      businessPhoneNumber: s.businessPhoneNumber?.value || undefined,
      privatePhoneNumber: s.privatePhoneNumber?.value || undefined,
      locale: s.locale?.value || undefined,
      additionalEmails,
    });

    initialValues.value = {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      placeOfBirth: updatedUser.placeOfBirth || '',
      alternativeEmail: updatedUser.additionalEmails?.[0] ?? '',
      mobilePhoneNumber: updatedUser.mobilePhoneNumber || '',
      businessPhoneNumber: updatedUser.businessPhoneNumber || '',
      privatePhoneNumber: updatedUser.privatePhoneNumber || '',
      locale: updatedUser.locale ? validateLocale(updatedUser.locale) : i18n.locale.value,
    };
    serverDateOfBirth.value = dateOfBirthValue.value = updatedUser.dateOfBirth
      ? new Date(updatedUser.dateOfBirth)
      : null;
    formKey.value++;

    appToast.success(t('accountSettings.userProfile.saveSuccess'), { summary: t('success.saved') });

    applyAltEmail(updatedUser.additionalEmails, updatedUser.verifiedAdditionalEmails);
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
                  name="alternativeEmail"
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
                  @click="deleteAlternativeEmail($form)"
                />
              </div>
              <Message
                v-if="$form.alternativeEmail?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.alternativeEmail.error?.message }}
              </Message>
              <Message
                v-if="altEmailUnverified"
                severity="warn"
                size="small"
                variant="simple"
              >
                {{ t('accountSettings.userProfile.alternativeEmailUnverified') }}
              </Message>
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-1">
              <label for="mobile-phone" class="font-medium">
                {{ t('accountSettings.userProfile.mobilePhone') }}
              </label>
              <PhoneInput inputId="mobile-phone" name="mobilePhoneNumber" />
              <Message
                v-if="$form.mobilePhoneNumber?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.mobilePhoneNumber.error?.message }}
              </Message>
            </div>

            <!-- Business Phone -->
            <div class="flex flex-col gap-1">
              <label for="business-phone" class="font-medium">
                {{ t('accountSettings.userProfile.businessPhone') }}
              </label>
              <PhoneInput inputId="business-phone" name="businessPhoneNumber" />
              <Message
                v-if="$form.businessPhoneNumber?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.businessPhoneNumber.error?.message }}
              </Message>
            </div>

            <!-- Private Phone -->
            <div class="flex flex-col gap-1">
              <label for="private-phone" class="font-medium">
                {{ t('accountSettings.userProfile.privatePhone') }}
              </label>
              <PhoneInput inputId="private-phone" name="privatePhoneNumber" />
              <Message
                v-if="$form.privatePhoneNumber?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.privatePhoneNumber.error?.message }}
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
              :disabled="!(formFields.some(k => $form[k]?.dirty) || dateOfBirthDirty) || !$form.valid"
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
