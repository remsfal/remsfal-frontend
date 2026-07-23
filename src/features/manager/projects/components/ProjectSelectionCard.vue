<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import ProjectSelectionTable from './ProjectSelectionTable.vue';
import NewProjectButton from './NewProjectButton.vue';

const { t } = useI18n();
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('projectSelection.title') }}
    </template>
    <template #content>
      <ProjectSelectionTable />
      <div class="flex justify-end mt-6">
        <NewProjectButton />
      </div>
    </template>
  </BaseCard>
</template>
