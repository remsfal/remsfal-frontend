<script setup lang="ts">
import { tenancyService } from '@/services/TenancyService';
import type { components } from '@/services/api/platform-schema';
import DatePicker from 'primevue/datepicker';
import { computed, ref, watch } from 'vue';

// OpenAPI type
type TenancyJson = components['schemas']['TenancyJson'];

const { tenancy } = defineProps<{
  tenancy: TenancyJson;
}>();

const emit = defineEmits<{ (e: 'onChange', tenancy: TenancyJson): void }>();

// Local reactive copy of tenancy
const localTenancy = ref<TenancyJson>({ ...tenancy });

// Computed for Date objects for DatePicker
const startOfRentalDate = computed<Date | null>({
  get(): Date | null {
    return localTenancy.value.startOfRental ? new Date(localTenancy.value.startOfRental) : null;
  },
  set(value: Date | null) {
    if (value) {
      localTenancy.value.startOfRental = value.toISOString();
    } else {
      localTenancy.value.startOfRental = undefined;
    }
  },
});

const endOfRentalDate = computed<Date | null>({
  get(): Date | null {
    return localTenancy.value.endOfRental ? new Date(localTenancy.value.endOfRental) : null;
  },
  set(value: Date | null) {
    if (value) {
      localTenancy.value.endOfRental = value.toISOString();
    } else {
      localTenancy.value.endOfRental = undefined;
    }
  },
});

// Computed to check if rental is active
const rentalActive = computed(() => {
  if (!localTenancy.value.startOfRental || !localTenancy.value.endOfRental) return false;
  const now = new Date();
  const start = new Date(localTenancy.value.startOfRental);
  const end = new Date(localTenancy.value.endOfRental);
  return now >= start && now <= end;
});

// Watch changes and emit to parent
watch(
  localTenancy,
  (newVal) => {
    emit('onChange', newVal);
  },
  { deep: true }
);
</script>

<template>
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="col-span-1">
      <label for="rentalStart" class="block text-sm font-medium mb-2">Mietbeginn</label>
      <DatePicker id="rentalStart" v-model="startOfRentalDate" :showIcon="true" dateFormat="dd/mm/yy" />
    </div>
    <div class="col-span-1">
      <label for="rentalEnd" class="block text-sm font-medium mb-2">Mietende</label>
      <DatePicker id="rentalEnd" v-model="endOfRentalDate" :showIcon="true" dateFormat="dd/mm/yy" />
    </div>
    <div class="col-span-1 flex items-center">
      <div class="flex items-center gap-2">
        <input type="checkbox" id="rentalActive" :checked="rentalActive" disabled
          class="h-4 w-4 rounded border-gray-300 bg-white checked:bg-blue-500 checked:border-blue-500 focus-visible:ring-blue-500" />
        <label for="rentalActive" class="text-sm font-medium">Miete aktiv</label>
      </div>
    </div>
  </div>
</template>
