<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <span class="text-muted-color">{{ t('order.table.placeholder') }}</span>
</template>
