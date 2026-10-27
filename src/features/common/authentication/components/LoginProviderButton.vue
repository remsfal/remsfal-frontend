<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import googleLogo from '@/assets/google-logo.svg';
import appleLogo from '@/assets/apple-logo.svg';
import type { LoginProvider } from '../composables/useLogin';

const props = defineProps<{
  provider: LoginProvider;
}>();

const { t } = useI18n();

// Colors follow the Google sign-in branding guidelines and Apple's Human Interface Guidelines:
// Google uses a neutral button with the multicolored "G", Apple a black (dark mode: white) button.
const providerConfig = computed(() => {
  if (props.provider === 'apple') {
    return {
      label: t('login.withApple'),
      logo: appleLogo,
      logoClass: 'dark:invert',
      buttonClass: '!bg-black !border-black !text-white hover:!bg-neutral-800 '
        + 'dark:!bg-white dark:!border-white dark:!text-black dark:hover:!bg-neutral-200',
    };
  }
  return {
    label: t('login.withGoogle'),
    logo: googleLogo,
    logoClass: '',
    buttonClass: '!bg-white !border-[#747775] !text-[#1f1f1f] hover:!bg-neutral-100 '
      + 'dark:!bg-[#131314] dark:!border-[#8e918f] dark:!text-[#e3e3e3] dark:hover:!bg-neutral-800',
  };
});
</script>

<template>
  <Button
    :data-test="`login-${provider}`"
    class="w-full h-12 !rounded-full !font-medium"
    :class="providerConfig.buttonClass"
  >
    <img :src="providerConfig.logo" alt="" class="w-5 h-5" :class="providerConfig.logoClass">
    <span>{{ providerConfig.label }}</span>
  </Button>
</template>
