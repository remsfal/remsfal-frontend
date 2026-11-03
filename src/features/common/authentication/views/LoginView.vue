<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import LoginProviderButton from '../components/LoginProviderButton.vue';
import EmailLoginForm from '../components/EmailLoginForm.vue';
import EmailCodeForm from '../components/EmailCodeForm.vue';
import { useLogin } from '../composables/useLogin';
import { useEmailLogin } from '../composables/useEmailLogin';

const { t } = useI18n();
const { loginWith, loginDev, showDevLogin } = useLogin();
const {
  step,
  email,
  loading,
  error,
  cooldownSeconds,
  requestCode,
  resendCode,
  submitCode,
  changeEmail,
} = useEmailLogin();
</script>

<template>
  <div
    class="w-full max-w-lg rounded-[1.5rem] p-[0.3rem]
      bg-[linear-gradient(180deg,var(--p-primary-color)_10%,transparent_30%)]"
  >
    <div class="w-full rounded-[1.3rem] bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-16">
      <div class="flex flex-col items-center text-center mb-10">
        <img src="@/assets/remsfal-logo.svg" alt="REMSFAL Icon" class="w-70 h-20 mb-6">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-3">
          {{ t('login.title') }}
        </h1>
        <p class="text-surface-600 dark:text-surface-300">
          {{ t('login.subtitle') }}
        </p>
      </div>

      <div v-if="step === 'code'">
        <EmailCodeForm
          :email
          :loading
          :error
          :cooldownSeconds
          @submit="submitCode"
          @resend="resendCode"
          @changeEmail="changeEmail"
        />
      </div>

      <div v-else class="flex flex-col gap-4">
        <LoginProviderButton provider="google" @click="loginWith('google')" />
        <LoginProviderButton provider="apple" @click="loginWith('apple')" />
        <p class="text-xs text-surface-500 dark:text-surface-400 text-center leading-relaxed">
          {{ t('login.description') }}
        </p>

        <Divider align="center">
          <span class="text-sm text-surface-500 dark:text-surface-400">{{ t('login.or') }}</span>
        </Divider>

        <EmailLoginForm
          :initialEmail="email"
          :loading
          :error
          @submit="requestCode"
        />

        <template v-if="showDevLogin">
          <Divider />
          <Button
            data-test="login-dev"
            class="w-full h-12 !rounded-full"
            severity="secondary"
            icon="pi pi-code"
            :label="t('login.devLogin')"
            @click="loginDev()"
          />
        </template>
      </div>

      <div class="text-center mt-8">
        <RouterLink
          :to="{ name: 'LandingPage' }"
          class="text-sm font-medium text-primary hover:underline"
        >
          <i class="pi pi-arrow-left text-xs mr-1" />
          {{ t('login.backToHome') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
