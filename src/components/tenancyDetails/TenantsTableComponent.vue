<script setup lang="ts">
import { tenancyService, type TenancyTenantItem } from '@/services/TenancyService';
import type { DataTablePassThroughMethodOptions } from 'primevue/datatable';
import { ref } from 'vue';

const { tenants } = defineProps<{
    tenants: TenancyTenantItem[];
}>();

const emptyRowTemplate = {
    id: new Date().toISOString(),
    firstName: '',
    lastName: '',
    email: ''
};

const addNewRow = () => {
    const newRow: TenancyTenantItem = { ...emptyRowTemplate };
    tenants.push(newRow);
};

const columns = ref([
    { field: 'firstName', header: 'Vorname' },
    { field: 'lastName', header: 'Nachname' },
    { field: 'email', header: 'E-Mail' }
]);

const onCellEditComplete = (event: any) => {
    let { newData, index } = event;
    tenants[index] = newData;
    tenancyService.updateTenancyTenantItem(tenants[index]);
};
</script>

<template>
    <div class="text-lg font-semibold text-[2rem]">Mieter</div>
    <Card>
        <template #header>
            <Button label="Neuen Mieter hinzufügen" icon="pi pi-plus" @click="addNewRow" class="ml-6 mt-4" />
        </template>
        <template #content>
            <DataTable :value="tenants" :rows="10" :rowHover="true" dataKey="id" tableStyle="min-width: 60rem"
                scrollable scrollDirection="both" scrollHeight="var(--custom-scroll-height)" editMode="cell"
                @cell-edit-complete="onCellEditComplete" class="custom-scroll-height" :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }: DataTablePassThroughMethodOptions) => ({
                            class: [{ '!py-0': state['d_editing'] }]
                        })
                    }
                }">
                <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"
                    style="width: 33.333%">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>