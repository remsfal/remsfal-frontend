<script setup lang="ts">
import type { TenancyTenantItem } from '@/services/TenancyService';

const { tenants } = defineProps<{
    tenants: TenancyTenantItem[];
}>();
</script>

<template>
    <div class="text-lg font-semibold text-[2rem]">Mieter</div>
    <Card>
        <template #content>
            <DataTable :value="tenants" :rows="10" :rowHover="true" dataKey="id" tableStyle="min-width: 60rem"
                scrollable scrollDirection="both" scrollHeight="var(--custom-scroll-height)"
                class="custom-scroll-height">
                <Column field="firstName" header="Vorname" />
                <Column field="lastName" header="Nachname" />
                <Column field="email" header="Email" />
            </DataTable>
        </template>
    </Card>
</template>