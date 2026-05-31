<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import NewOrganizationDialog from './NewOrganizationDialog.vue';

const { t } = useI18n();
const dialogVisible = ref(false);
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('organization.benefits.title') }}
    </template>
    <template #subtitle>
      {{ t('organization.benefits.subtitle') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <ul class="flex flex-col gap-3">
          <li class="flex items-start gap-3">
            <i class="pi pi-users text-primary mt-0.5 text-xl" />
            <span class="text-base">{{ t('organization.benefits.feature1') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <i class="pi pi-building text-primary mt-0.5 text-xl" />
            <span class="text-base">{{ t('organization.benefits.feature2') }}</span>
          </li>
        </ul>

        <div class="flex">
          <Button
            :label="t('organization.createButton')"
            icon="pi pi-plus"
            @click="dialogVisible = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <NewOrganizationDialog v-model:visible="dialogVisible" />
</template>
