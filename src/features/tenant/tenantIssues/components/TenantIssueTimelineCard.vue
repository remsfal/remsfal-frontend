<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';

const { t } = useI18n();
</script>

<template>
  <BaseCard>
    <template #title>
      <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
    </template>
    <template #content>
      <div
        data-testid="tenant-issue-timeline-placeholder"
        class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
      >
        {{ t('tenantIssues.timeline.placeholder') }}
      </div>
    </template>
  </BaseCard>
</template>