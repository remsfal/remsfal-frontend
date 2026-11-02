<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { z } from 'zod';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { emailSchema } from '@/helper/validationHelper';

const props = defineProps<{
  initialEmail?: string;
  loading?: boolean;
  /** Translated message of an error returned by the server */
  error?: string | null;
}>();

const emit = defineEmits<(e: 'submit', email: string) => void>();

const { t } = useI18n();

const resolver = zodResolver(z.object({ email: emailSchema(t) }));
const initialValues = { email: props.initialEmail ?? '' };

const onSubmit = (event: FormSubmitEvent) => {
  if (!event.valid) {
    return;
  }
  emit('submit', String(event.states.email?.value ?? '').trim());
};
</script>

<template>
  <Form
    v-slot="$form"
    :initialValues
    :resolver
    :validateOnValueUpdate="false"
    validateOnBlur
    class="flex flex-col gap-3"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-1 text-left">
      <label for="login-email" class="font-medium text-surface-900 dark:text-surface-0">
        {{ t('login.email.label') }}
      </label>
      <InputText
        id="login-email"
        data-test="login-email-input"
        name="email"
        type="email"
        autocomplete="email"
        inputmode="email"
        class="h-12 !rounded-full !px-5"
        :placeholder="t('login.email.placeholder')"
        :invalid="!!$form.email?.invalid"
        fluid
      />
      <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
        {{ $form.email?.error?.message }}
      </Message>
    </div>

    <Message v-if="error" data-test="login-email-error" severity="error" size="small">
      {{ error }}
    </Message>

    <Button
      type="submit"
      data-test="login-email-submit"
      class="w-full h-12 !rounded-full"
      icon="pi pi-envelope"
      :label="t('login.email.submit')"
      :loading="loading"
    />
  </Form>
</template>
