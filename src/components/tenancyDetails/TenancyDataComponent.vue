<script setup lang="ts">
import { type TenancyItem } from '@/services/TenancyService';
import { computed } from 'vue';

const { tenancy } = defineProps<{
    tenancy: TenancyItem;
}>();

const rentalActive = computed(() => {
    if (!tenancy.rentalStart || !tenancy.rentalEnd) return false;
    const now = new Date();
    return now >= tenancy.rentalStart && now <= tenancy.rentalEnd;
});
</script>

<template>
    <!-- Date Pickers Section -->
    <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="col-span-1">
            <label for="rentalStart" class="block text-sm font-medium mb-2">Mietbeginn</label>
            <Calendar id="rentalStart" v-model="tenancy.rentalStart" :showIcon="true" dateFormat="dd/mm/yy" />
        </div>
        <div class="col-span-1">
            <label for="rentalEnd" class="block text-sm font-medium mb-2">Mietende</label>
            <Calendar id="rentalEnd" v-model="tenancy.rentalEnd" :showIcon="true" dateFormat="dd/mm/yy" />
        </div>
        <div class="col-span-1 flex items-center">
            <div class="flex items-center gap-2">
                <input type="checkbox" id="rentalActive" v-model="rentalActive" disabled
                    class="h-4 w-4 rounded border-gray-300 bg-white checked:bg-blue-500 checked:border-blue-500 focus-visible:ring-blue-500" />
                <label for="rentalActive" class="text-sm font-medium">Miete aktiv</label>
            </div>
        </div>
    </div>

</template>