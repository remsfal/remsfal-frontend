<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import { type OrganizationJson, organizationService } from '@/services/OrganizationService';

const props = defineProps<{ organizationId: string }>();

const { t } = useI18n();

const org = ref<OrganizationJson | null>(null);

onMounted(async () => {
  try {
    org.value = await organizationService.getOrganization(props.organizationId);
  } catch (error) {
    console.error('Failed to fetch organization', error);
  }
});
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('managerContractors.detail.title') }}
    </template>
    <template #content>
      <div v-if="org" class="flex flex-col gap-6">
        <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
          <span class="font-medium text-muted-color">{{ t('contractor.detail.companyName') }}</span>
          <span>{{ org.name }}</span>

          <template v-if="org.email">
            <span class="font-medium text-muted-color">{{ t('contractor.detail.email') }}</span>
            <span>{{ org.email }}</span>
          </template>

          <template v-if="org.phone">
            <span class="font-medium text-muted-color">{{ t('contractor.detail.phone') }}</span>
            <span>{{ org.phone }}</span>
          </template>

          <template v-if="org.trade">
            <span class="font-medium text-muted-color">{{ t('contractor.detail.trade') }}</span>
            <span>{{ org.trade }}</span>
          </template>

          <template v-if="org.vatIdentificationNumber">
            <span class="font-medium text-muted-color">{{ t('managerContractors.detail.vatId') }}</span>
            <span>{{ org.vatIdentificationNumber }}</span>
          </template>
        </div>

        <template v-if="org.address">
          <div class="border-t border-surface-200 dark:border-surface-700 pt-4">
            <p class="font-semibold mb-3">
              {{ t('managerContractors.detail.address') }}
            </p>
            <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
              <template v-if="org.address.street">
                <span class="font-medium text-muted-color">{{ t('managerContractors.detail.street') }}</span>
                <span>{{ org.address.street }}</span>
              </template>

              <template v-if="org.address.zip || org.address.city">
                <span class="font-medium text-muted-color">
                  {{ t('managerContractors.detail.zip') }} / {{ t('managerContractors.detail.city') }}
                </span>
                <span>{{ [org.address.zip, org.address.city].filter(Boolean).join(' ') }}</span>
              </template>

              <template v-if="org.address.province">
                <span class="font-medium text-muted-color">{{ t('managerContractors.detail.province') }}</span>
                <span>{{ org.address.province }}</span>
              </template>

              <template v-if="org.address.countryCode">
                <span class="font-medium text-muted-color">{{ t('managerContractors.detail.country') }}</span>
                <span>{{ org.address.countryCode }}</span>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
  </BaseCard>
</template>
