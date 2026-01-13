<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  hasSearchQuery: boolean;
}>();

const { t } = useI18n();

</script>

<template>
  <div class="flex flex-col items-center justify-center h-64 text-surface-400">
    <i :class="hasSearchQuery ? 'pi pi-search' : 'pi pi-inbox'" class="text-5xl mb-3" />
    <span class="text-lg">{{ hasSearchQuery ? t('inbox.empty.noResults') : t('inbox.empty.allCaughtUp') }}</span>
    <span v-if="hasSearchQuery" class="text-sm mt-1">{{ t('inbox.empty.tryDifferentSearch') }}</span>
  </div>
</template>

