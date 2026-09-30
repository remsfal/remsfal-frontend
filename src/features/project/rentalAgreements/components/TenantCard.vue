<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import Tag from 'primevue/tag';
import type { TenantItemJson } from '../services/TenantService';
import TenantContactButtons from './TenantContactButtons.vue';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Avatar from 'primevue/avatar';
import { getIconForUnitType, type UnitType } from '@/features/project/rentableUnits';

const props = withDefaults(
  defineProps<{
    tenant: TenantItemJson;
    showUnits?: boolean;
  }>(),
  { showUnits: true },
);

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

const getUnitIcon = (type?: string): string =>
  type ? getIconForUnitType(type as UnitType) : 'pi pi-question-circle';

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

const cardRef = ref<HTMLElement | null>(null);
const stacked = ref(false);
let requiredWidth = 0;
let resizeObserver: ResizeObserver | undefined;

const updateLayout = async () => {
  const card = cardRef.value;
  if (!card) return;
  if (stacked.value) {
    if (card.clientWidth < requiredWidth) return;
    stacked.value = false;
    await nextTick();
  }
  if (card.scrollWidth > card.clientWidth) {
    requiredWidth = card.scrollWidth;
    stacked.value = true;
  }
};

onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !cardRef.value) return;
  resizeObserver = new ResizeObserver(updateLayout);
  resizeObserver.observe(cardRef.value);
});

onUnmounted(() => resizeObserver?.disconnect());

watch(
  () => props.tenant,
  () => {
    requiredWidth = 0;
    updateLayout();
  },
  { flush: 'post' },
);
</script>

<template>
  <div
    ref="cardRef"
    data-testid="tenant-card"
    :data-layout="stacked ? 'stacked' : 'row'"
    class="interactive-row flex gap-6 p-4 w-full"
    :class="stacked ? 'flex-col' : 'flex-row'"
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown.enter="emit('click')"
  >
    <!-- Avatar Section -->
    <div class="flex shrink-0" :class="stacked ? 'justify-center' : 'justify-start w-40'">
      <Avatar size="xlarge" class="bg-surface-100 text-primary">
        <FontAwesomeIcon icon="fa-solid fa-building-user" class="text-2xl translate-y-0.5" />
      </Avatar>
    </div>

    <!-- Content Section -->
    <div
      class="flex gap-6"
      :class="stacked ? 'flex-col min-w-0' : 'flex-row justify-between items-center grow shrink-0'"
    >
      <!-- Name & Units -->
      <div class="flex flex-col gap-4" :class="stacked ? 'min-w-0' : 'shrink-0'">
        <!-- Name -->
        <div class="font-bold text-2xl" :class="stacked ? 'break-words' : 'whitespace-nowrap'">
          {{ fullName }}
        </div>

        <template v-if="showUnits">
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
        </template>
      </div>

      <!-- Status & Actions -->
      <div class="flex flex-col gap-4" :class="stacked ? 'items-start max-w-full' : 'items-end shrink-0'">
        <!-- Active/Inactive Status Tag (hidden when active state is not applicable) -->
        <Tag
          v-if="tenant.active !== undefined"
          :value="tenant.active ? t('tenantList.card.active') : t('tenantList.card.inactive')"
          :severity="tenant.active ? 'success' : 'secondary'"
        />

        <!-- Contact Buttons & Actions (with click.stop) -->
        <div class="flex gap-2" :class="stacked ? 'flex-col items-start' : 'items-center'" @click.stop @keydown.stop>
          <TenantContactButtons
            :vertical="stacked"
            :email="tenant.email"
            :mobilePhoneNumber="tenant.mobilePhoneNumber"
            :businessPhoneNumber="tenant.businessPhoneNumber"
            :privatePhoneNumber="tenant.privatePhoneNumber"
          />
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>
