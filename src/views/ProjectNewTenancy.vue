<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { tenancyService, type TenancyItem, type TenancyTenantItem, type TenancyUnitItem } from '@/services/TenancyService';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';

const router = useRouter();
const projectStore = useProjectStore();

// Neue Mietvertragsdaten
const tenancy = ref<TenancyItem>({
    id: '',
    rentalStart: new Date(),
    rentalEnd: new Date(),
    listOfTenants: [],
    listOfUnits: [],
    active: false
});

const rentalStart = ref<Date | null>(null);
const rentalEnd = ref<Date | null>(null);

// Berechnete Eigenschaften
const rentalActive = computed(() => {
    if (!rentalStart.value || !rentalEnd.value) return false;
    const now = new Date();
    return now >= rentalStart.value && now <= rentalEnd.value;
});

const isValidForm = computed(() => {
    return (
        tenancy.value.rentalStart &&
        tenancy.value.rentalEnd &&
        tenancy.value.listOfTenants.length > 0 &&
        tenancy.value.listOfUnits.length > 0
    );
});

async function saveTenancy() {
    if (!isValidForm.value) return;

    const newTenancy: TenancyItem = {
        ...tenancy.value,
        rentalStart: rentalStart.value!,
        rentalEnd: rentalEnd.value!
    };

    try {
        await tenancyService.createTenancy(newTenancy);
        redirectToTenanciesList();
    } catch (error) {
        console.error('Fehler beim Erstellen des Mietvertrags:', error);
    }
}

function redirectToTenanciesList() {
    router.push(`/project/${projectStore.projectId}/tenancies/`);
}

onMounted(() => {
    // Beim Erstellen eines neuen Mietvertrags setzen wir Standardwerte
    rentalStart.value = new Date();
    rentalEnd.value = new Date(new Date().getFullYear() + 1);
});
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Neuer Mietvertrag erstellen</h2>
            <Button label="Speichern & zur Übersicht" icon="pi pi-save" class="bg-green-600 hover:bg-green-700 transition-colors"
                @click="saveTenancy()" :disabled="!isValidForm" />
        </div>

        <div class="grid grid-cols-1 gap-6">
            <TenancyDataComponent v-if="tenancy" :tenancy="tenancy" @update:rentalStart="rentalStart = $event"
                @update:rentalEnd="rentalEnd = $event" />

            <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div class="space-y-4">
                    <TenantsTableComponent :tenants="tenancy.listOfTenants"
                        @update:tenants="tenancy.listOfTenants = $event" />
                </div>

                <div class="space-y-4">
                    <UnitsTableComponent :listOfUnits="tenancy.listOfUnits"
                        @update:units="tenancy.listOfUnits = $event" />
                </div>
            </div>
        </div>
    </div>
</template>