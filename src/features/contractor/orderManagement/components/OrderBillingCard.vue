<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';

const { t } = useI18n();
</script>

<template>
  <!-- Placeholder until the backend provides order billing for completed orders -->
  <BaseCard>
    <template #title>
      {{ t('orderManagement.orderBilling.title') }}
    </template>
    <template #content>
      <Message severity="info">
        {{ t('orderManagement.orderBilling.notAvailable') }}
      </Message>
    </template>
  </BaseCard>
</template>
