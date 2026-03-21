<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/common/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import { userService } from '@/services/UserService';
import { type Locale } from '@/i18n/i18n';

const { t } = useI18n();
const i18n = useI18n();
const toast = useToast();

const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

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
  mobilePhoneNumber: z
      .string()
      .regex(phoneRegex, { message: t('validation.phone') })
      .or(z.literal(''))
      .optional(),
  businessPhoneNumber: z
      .string()
      .regex(phoneRegex, { message: t('validation.phone') })
      .or(z.literal(''))
      .optional(),
  privatePhoneNumber: z
      .string()
      .regex(phoneRegex, { message: t('validation.phone') })
      .or(z.literal(''))
      .optional(),
  locale: z.string(),
});

const resolver = zodResolver(schema);
const formKey = ref(0);
const formFields = ['firstName', 'lastName', 'mobilePhoneNumber', 'businessPhoneNumber', 'privatePhoneNumber', 'locale'];
const initialValues = ref<Record<string, string>>({
  firstName: '',
  lastName: '',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  locale: i18n.locale.value,
});

const email = ref('');
const additionalEmails = ref<string[]>([]);
const altEmailDirty = ref(false);
const altEmailSuccess = ref(false);
const altEmailError = ref(false);

// Alternative email dialog state
const dialogVisible = ref(false);
const alternativeEmailInput = ref('');
const isEmailInvalid = ref(false);
const emailErrorMessage = ref('');

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
      mobilePhoneNumber: profile.mobilePhoneNumber || '',
      businessPhoneNumber: profile.businessPhoneNumber || '',
      privatePhoneNumber: profile.privatePhoneNumber || '',
      locale: profile.locale ? validateLocale(profile.locale) : i18n.locale.value,
    };
    if (profile.locale) {
      i18n.locale.value = validateLocale(profile.locale);
    }
    additionalEmails.value = Array.isArray(profile.additionalEmails)
        ? [...profile.additionalEmails]
        : [];
    formKey.value++;
  } catch (error) {
    console.error('Failed to load user profile', error);
  }
});

const displayAlternativeEmail = computed<string | null>(() =>
    additionalEmails.value.length > 0 ? (additionalEmails.value[0] ?? null) : null,
);

function validateEmailFormat(emailStr: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr);
}

function resetAltEmailDialog() {
  alternativeEmailInput.value = '';
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
}

function saveAlternativeEmail() {
  const entered = alternativeEmailInput.value.trim();
  const primary = email.value.trim().toLowerCase();

  if (!entered || !validateEmailFormat(entered)) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('projectSettings.newProjectMemberButton.invalidEmail');
    return;
  }
  if (entered.toLowerCase() === primary) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('accountSettings.userProfile.alternativeEmailNotEqualPrimary');
    return;
  }
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
  additionalEmails.value = [entered];
  altEmailDirty.value = true;
  altEmailSuccess.value = false;
  altEmailError.value = false;
  dialogVisible.value = false;
  alternativeEmailInput.value = '';
}

function deleteAlternativeEmail() {
  additionalEmails.value = [];
  altEmailDirty.value = true;
  altEmailSuccess.value = false;
  altEmailError.value = false;
}

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  try {
    const updatedUser = await userService.updateUser({
      firstName: s.firstName?.value || undefined,
      lastName: s.lastName?.value || undefined,
      mobilePhoneNumber: s.mobilePhoneNumber?.value ?? undefined,
      businessPhoneNumber: s.businessPhoneNumber?.value ?? undefined,
      privatePhoneNumber: s.privatePhoneNumber?.value ?? undefined,
      locale: s.locale?.value || undefined,
      additionalEmails: altEmailDirty.value ? additionalEmails.value : undefined,
    });

    // Reset form to saved values to clear dirty state
    initialValues.value = {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      mobilePhoneNumber: updatedUser.mobilePhoneNumber || '',
      businessPhoneNumber: updatedUser.businessPhoneNumber || '',
      privatePhoneNumber: updatedUser.privatePhoneNumber || '',
      locale: updatedUser.locale ? validateLocale(updatedUser.locale) : i18n.locale.value,
    };
    formKey.value++;

    additionalEmails.value = Array.isArray(updatedUser.additionalEmails)
        ? [...updatedUser.additionalEmails]
        : [];
    altEmailDirty.value = false;
    altEmailSuccess.value = true;
    altEmailError.value = false;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('accountSettings.userProfile.saveSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to update user profile', error);
    altEmailSuccess.value = false;
    altEmailError.value = true;
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('accountSettings.userProfile.saveError'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('accountSettings.userProfile.title') }}
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

            <!-- Primary Email (readonly) -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="primaryEmail">
                {{ t('accountSettings.userProfile.email') }}
              </label>
              <InputText id="primaryEmail" :value="email" disabled fluid />
            </div>

            <!-- Alternative Email -->
            <div class="flex flex-col gap-1">
              <label class="font-medium">
                {{ t('accountSettings.userProfile.alternativeEmail') }}
              </label>
              <div v-if="displayAlternativeEmail" class="flex items-center gap-2">
                <InputText :value="displayAlternativeEmail" class="flex-1" disabled />
                <span v-if="altEmailSuccess" class="text-green-600 font-bold">✔</span>
                <span v-if="altEmailError" class="text-red-600 font-bold">✗</span>
                <Button
                  icon="pi pi-trash"
                  severity="secondary"
                  type="button"
                  @click="deleteAlternativeEmail"
                />
              </div>
              <div>
                <Button
                  :disabled="!!displayAlternativeEmail"
                  :label="t('accountSettings.userProfile.addAlternativeEmail')"
                  icon="pi pi-plus"
                  type="button"
                  @click="dialogVisible = true"
                />
              </div>
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="mobilePhoneNumber">
                {{ t('accountSettings.userProfile.mobilePhone') }}
              </label>
              <InputText id="mobilePhoneNumber" fluid name="mobilePhoneNumber" />
              <Message
                v-if="$form.mobilePhoneNumber?.invalid && $form.mobilePhoneNumber?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.mobilePhoneNumber.error?.message }}
              </Message>
            </div>

            <!-- Business Phone -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="businessPhoneNumber">
                {{ t('accountSettings.userProfile.businessPhone') }}
              </label>
              <InputText id="businessPhoneNumber" fluid name="businessPhoneNumber" />
              <Message
                v-if="$form.businessPhoneNumber?.invalid && $form.businessPhoneNumber?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.businessPhoneNumber.error?.message }}
              </Message>
            </div>

            <!-- Private Phone -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="privatePhoneNumber">
                {{ t('accountSettings.userProfile.privatePhone') }}
              </label>
              <InputText id="privatePhoneNumber" fluid name="privatePhoneNumber" />
              <Message
                v-if="$form.privatePhoneNumber?.invalid && $form.privatePhoneNumber?.touched"
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
              :disabled="!(formFields.some(k => $form[k]?.dirty) || altEmailDirty)"
              :label="t('button.save')"
              icon="pi pi-save"
              type="submit"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>

  <!-- Alternative Email Dialog -->
  <Dialog
    v-model:visible="dialogVisible"
    :header="t('accountSettings.userProfile.addAlternativeEmail')"
    :style="{ width: '35rem' }"
    modal
    @hide="resetAltEmailDialog"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="font-semibold" for="alt-email-input">
          {{ t('accountSettings.userProfile.email') }}
        </label>
        <InputText
          id="alt-email-input"
          v-model="alternativeEmailInput"
          :invalid="isEmailInvalid"
          :placeholder="t('accountSettings.userProfile.alternativeEmail')"
          autocomplete="off"
          fluid
          type="email"
        />
        <small v-if="isEmailInvalid" class="text-red-500">
          {{ emailErrorMessage }}
        </small>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          type="button"
          @click="dialogVisible = false"
        />
        <Button
          :label="t('button.add')"
          type="button"
          @click="saveAlternativeEmail"
        />
      </div>
    </div>
  </Dialog>
</template>
