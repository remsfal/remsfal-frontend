<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataView from 'primevue/dataview';
import type { TenantIssueItem } from '../types';
import TenantIssueCard from './TenantIssueCard.vue';

defineProps<{
  issues: TenantIssueItem[];
}>();

const emit = defineEmits<{ select: [issue: TenantIssueItem] }>();

const { t } = useI18n();
</script>

<template>
  <div class="mt-4">
    <DataView v-if="issues.length > 0" :value="issues" layout="grid">
      <template #grid="{ items }">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TenantIssueCard
            v-for="issue in items"
            :key="issue.id"
            :issue="issue"
            @select="emit('select', issue)"
          />
        </div>
      </template>
    </DataView>

    <div
      v-else
      class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center text-gray-500"
    >
      <i class="pi pi-inbox text-4xl mb-4 text-gray-400" />
      <p class="text-lg">
        {{ t('tenantIssues.empty') }}
      </p>
    </div>
  </div>
</template>
