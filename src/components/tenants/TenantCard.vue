<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import type { TenantItem } from '@/services/TenantService';
import TenantContactButtons from './TenantContactButtons.vue';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Avatar from 'primevue/avatar';

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

// Check if rentalUnits are available
const hasRentalUnits = computed(() => {
  return props.tenant.rentalUnits && props.tenant.rentalUnits.length > 0;
});

// Icon mapping for UnitTypes (like in UnitBreadcrumb.vue)
const getUnitIcon = (type?: string): string => {
  if (!type) return 'pi pi-question-circle';

  const icons: Record<string, string> = {
    PROPERTY: 'pi pi-map',
    BUILDING: 'pi pi-building',
    APARTMENT: 'pi pi-home',
    COMMERCIAL: 'pi pi-briefcase',
    STORAGE: 'pi pi-box',
    SITE: 'pi pi-tree',
  };

  return icons[type] || 'pi pi-question-circle';
};

// Improved unitLabel function with fallbacks
const unitLabel = (unit: { type?: string; title?: string; location?: string }) => {
  const title = unit.title || unit.location;

  if (!title) {
    // Fallback: Only Type-Name or unknown
    return unit.type ? t(`unitTypes.${unit.type.toLowerCase()}`) : t('tenantList.card.unknownUnit');
  }

  // If Type is available: "Apartment 3A", otherwise only Title
  if (unit.type) {
    const typeName = t(`unitTypes.${unit.type.toLowerCase()}`);
    return `${typeName} ${title}`;
  }

  return title;
};
</script>

<template>
  <div
    data-testid="tenant-card"
    class="flex flex-col md:flex-row gap-6 p-4 w-full rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
    @click="emit('click')"
  >
    <!-- Avatar Section -->
    <div class="flex justify-center md:justify-start md:w-40">
      <Avatar size="xlarge" class="bg-surface-100 text-primary">
        <FontAwesomeIcon icon="fa-solid fa-building-user" class="text-2xl" />
      </Avatar>
    </div>

    <!-- Content Section -->
    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
      <!-- Name & Units -->
      <div class="flex flex-col gap-4">
        <!-- Name -->
        <div class="font-bold text-2xl">{{ fullName }}</div>

        <!-- Rental Units Tags (horizontal) -->
        <div v-if="hasRentalUnits" class="flex flex-wrap gap-2">
          <Tag
            v-for="(unit, index) in displayedUnits"
            :key="unit.id || index"
            :value="unitLabel(unit)"
            :icon="getUnitIcon(unit.type)"
            severity="secondary"
          />
          <Tag
            v-if="remainingUnitsCount > 0"
            :value="t('tenantList.card.moreUnits', { count: remainingUnitsCount })"
            severity="secondary"
          />
        </div>

        <!-- Fallback if no units -->
        <div v-else class="text-sm text-muted-color">
          {{ t('tenantList.card.noUnits') }}
        </div>
      </div>

      <!-- Status & Actions -->
      <div class="flex flex-col md:items-end gap-4">
        <!-- Active/Inactive Status Tag -->
        <Tag
          :value="tenant.active ? t('tenantList.card.active') : t('tenantList.card.inactive')"
          :severity="tenant.active ? 'success' : 'secondary'"
        />

        <!-- Contact Buttons (with click.stop) -->
        <div @click.stop>
          <TenantContactButtons :tenantId="tenant.id || ''" />
        </div>
      </div>
    </div>
  </div>
</template>
