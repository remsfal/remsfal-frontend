<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputOtp from 'primevue/inputotp';
import Message from 'primevue/message';
import { EMAIL_LOGIN_CODE_LENGTH } from '@/services/AuthService';

const props = defineProps<{
  email: string;
  loading?: boolean;
  /** i18n key of an error returned by the server */
  error?: string | null;
  cooldownSeconds: number;
}>();

const emit = defineEmits<{
  submit: [code: string];
  resend: [];
  changeEmail: [];
}>();

const { t } = useI18n();

const code = ref('');
const isComplete = computed(() => new RegExp(String.raw`^\d{${EMAIL_LOGIN_CODE_LENGTH}}$`).test(code.value));

const submit = () => {
  if (isComplete.value && !props.loading) {
    emit('submit', code.value);
  }
};

// Submit as soon as the last digit is entered (or a complete code is pasted).
const onCodeUpdate = (value: string | boolean) => {
  code.value = typeof value === 'string' ? value : '';
  submit();
};

const resend = () => {
  code.value = '';
  emit('resend');
};

const otpPassThrough = {
  pcInputText: {
    root: {
      autocomplete: 'one-time-code',
      inputmode: 'numeric',
      class: '!w-8 sm:!w-10 !h-12 !px-0 text-center text-lg',
    },
  },
};
</script>

<template>
  <form class="flex flex-col items-center gap-4" @submit.prevent="submit">
    <div class="text-center">
      <i class="pi pi-envelope text-3xl text-primary mb-2" aria-hidden="true" />
      <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
        {{ t('login.email.checkInbox') }}
      </h2>
      <p data-test="login-code-sent-to" class="text-sm text-surface-600 dark:text-surface-300 mt-1">
        {{ t('login.email.codeSentTo', { email }) }}
      </p>
    </div>

    <span id="login-code-label" class="sr-only">{{ t('login.email.codeLabel') }}</span>
    <InputOtp
      data-test="login-code-input"
      role="group"
      :modelValue="code"
      :length="EMAIL_LOGIN_CODE_LENGTH"
      :disabled="loading"
      :invalid="!!error"
      :pt="otpPassThrough"
      aria-labelledby="login-code-label"
      integerOnly
      class="flex-nowrap gap-1 sm:gap-2"
      @update:modelValue="onCodeUpdate"
    />

    <Message
      v-if="error"
      data-test="login-code-error"
      severity="error"
      size="small"
      class="w-full"
    >
      {{ t(error) }}
    </Message>

    <Button
      type="submit"
      data-test="login-code-submit"
      class="w-full h-12 !rounded-full"
      :label="t('login.email.verify')"
      :loading="loading"
      :disabled="!isComplete"
    />

    <div class="flex flex-col items-center gap-1 text-sm">
      <Button
        data-test="login-code-resend"
        link
        size="small"
        :label="cooldownSeconds > 0
          ? t('login.email.resendIn', { seconds: cooldownSeconds })
          : t('login.email.resend')"
        :disabled="cooldownSeconds > 0 || loading"
        @click="resend"
      />
      <Button
        data-test="login-code-change-email"
        link
        size="small"
        severity="secondary"
        :label="t('login.email.changeEmail')"
        @click="emit('changeEmail')"
      />
    </div>
  </form>
</template>
