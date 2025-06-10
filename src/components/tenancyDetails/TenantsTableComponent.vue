<script setup lang="ts">
import { tenancyService, type TenancyTenantItem } from '@/services/TenancyService';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import type { DataTablePassThroughMethodOptions } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';



const props = defineProps<{
    tenants: TenancyTenantItem[];
}>();

const localTenants = ref<TenancyTenantItem[]>([]);

watch(
    () => props.tenants,
    (newVal) => {
        localTenants.value = newVal.map(t => ({ ...t }));
    },
    { immediate: true, deep: true }
);

const emptyRowTemplate = {
    id: new Date().toISOString(),
    firstName: '',
    lastName: '',
    email: '',
};


const addNewRow = () => {
    const newRow: TenancyTenantItem = { ...emptyRowTemplate };
    localTenants.value.push(newRow);
};

const columns = ref([
    { field: 'firstName', header: 'Vorname' },
    { field: 'lastName', header: 'Nachname' },
    { field: 'email', header: 'E-Mail' },
]);

const onCellEditComplete = (event: any) => {
    let { newData, index } = event;
    localTenants.value[index] = newData;
    tenancyService.updateTenancyTenantItem(localTenants.value[index]);
};
</script>

<template>
    <div class="text-lg font-semibold text-[2rem]">Mieter</div>
    <Card>
        <template #header>
            <Button label="Neuen Mieter hinzufügen" icon="pi pi-plus" class="ml-6 mt-4" @click="addNewRow" />
        </template>
        <template #content>
            <DataTable :value="localTenants" :rows="10" :rowHover="true" dataKey="localTenants.id"
                tableStyle="min-width: 60rem" scrollable scrollDirection="both"
                scrollHeight="var(--custom-scroll-height)" editMode="cell" class="custom-scroll-height" :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }: DataTablePassThroughMethodOptions) => ({
                            class: [{ '!py-0': state['d_editing'] }],
                        }),
                    },
                }" @cellEditComplete="onCellEditComplete">
                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
                    style="width: 33.333%">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>
