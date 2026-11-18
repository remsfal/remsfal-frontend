<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHomeRoute } from '@/composables/useHomeRoute';

const { t } = useI18n();
const { isLoggedIn, homeRoute } = useHomeRoute();
</script>

<template>
  <RouterLink
    :to="homeRoute"
    class="inline-flex items-center gap-2 font-bold text-primary hover:underline print:hidden"
    data-test="back-to-overview"
  >
    <i class="pi pi-arrow-left" aria-hidden="true" />
    <span>{{ isLoggedIn ? t('backToOverview.overview') : t('backToOverview.home') }}</span>
  </RouterLink>
</template>
