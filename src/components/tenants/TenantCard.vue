<script setup lang="ts">
import { computed } from 'vue';
import type { TenantItem } from '@/services/TenantService';
import TenantContactButtons from './TenantContactButtons.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  tenant: TenantItem;
}>();

const emit = defineEmits<{
  click: [];
}>();

const { t } = useI18n();

const displayedUnits = computed(() => {
  const units = props.tenant.rentalUnits || [];
  return units.slice(0, 3);
});

const remainingUnitsCount = computed(() => {
  const total = props.tenant.rentalUnits?.length || 0;
  return total > 3 ? total - 3 : 0;
});

const fullName = computed(() => {
  return `${props.tenant.firstName || ''} ${props.tenant.lastName || ''}`.trim();
});

const unitLabel = (unit: { type?: string; title?: string; location?: string }) => {
  const type = unit.type || '';
  const name = unit.title || unit.location || '';
  return `${type} ${name}`.trim();
};
</script>

<template>
  <Card
    class="cursor-pointer hover:shadow-lg transition-shadow border border-surface-200 dark:border-surface-700"
    @click="emit('click')"
  >
    <template #header>
      <div class="flex items-center justify-between p-4 pb-0">
        <h3 class="font-bold text-lg">
          {{ fullName }}
        </h3>
        <Tag
          :value="tenant.active ? t('tenantList.card.active') : t('tenantList.card.inactive')"
          :severity="tenant.active ? 'success' : 'secondary'"
        />
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <!-- Rental Units -->
        <div v-if="tenant.rentalUnits && tenant.rentalUnits.length > 0">
          <p class="text-sm font-semibold text-muted-color mb-2">
            {{ t('tenantList.card.units') }}
          </p>
          <ul class="list-none p-0 m-0 space-y-1">
            <li
              v-for="(unit, index) in displayedUnits"
              :key="index"
              class="text-sm"
            >
              {{ unitLabel(unit) }}
            </li>
            <li v-if="remainingUnitsCount > 0" class="text-sm text-muted-color">
              {{ t('tenantList.card.moreUnits', { count: remainingUnitsCount }) }}
            </li>
          </ul>
        </div>

        <!-- Contact Buttons -->
        <TenantContactButtons :tenantId="tenant.id || ''" />
      </div>
    </template>
  </Card>
</template>
