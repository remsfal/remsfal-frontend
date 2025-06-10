<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { tenancyService, type TenancyUnitItem } from '@/services/TenancyService';
import { propertyService, EntityType, toRentableUnitView } from '@/services/PropertyService';
import { useProjectStore } from '@/stores/ProjectStore';

const { listOfUnits } = defineProps<{
    listOfUnits: TenancyUnitItem[];
}>();

const projectStore = useProjectStore();

const rentalObjects = ref<Array<{ label: string, value: string }>>([]);
const unitTypes = ref<Array<{ label: string, value: string }>>([]);

async function loadDropdownOptions() {
    try {
        const response = await propertyService.getPropertyTree(projectStore.projectId || '');
        const properties = response.properties;

        console.log('Loaded properties:', properties);

        const entityTypes = Object.values(EntityType);
        rentalObjects.value = entityTypes.map(entity => ({
            label: entity,
            value: entity
        }));

        const getAllUnits = (nodes: RentableUnitTreeNode[]): Array<{ label: string, value: string }> => {
            return nodes.reduce((acc, node) => {
                acc.push({
                    label: node.data.title || '',
                    value: node.data.title
                });

                if (node.children && node.children.length > 0) {
                    acc.push(...getAllUnits(node.children));
                }

                return acc;
            }, []);
        };

        unitTypes.value = [...new Map(getAllUnits(properties)
            .map(item => [item.value, item]))
            .values()];
    } catch (error) {
        console.error('Failed to load dropdown options:', error);
    }
}

onMounted(() => {
    loadDropdownOptions();
});

const emptyRowTemplate = {
    id: new Date().toISOString(),
    rentalObject: '',
    unitTitle: ''
};

const addNewRow = () => {
    const newRow: TenancyUnitItem = { ...emptyRowTemplate };
    listOfUnits.push(newRow);
};

const columns = ref([
    {
        field: 'rentalObject',
        header: 'Mietgegenstand',
        editor: 'Dropdown'
    },
    {
        field: 'unitTitle',
        header: 'Wohneinheit',
        editor: 'Dropdown'
    }
]);

const onCellEditComplete = async (event: any) => {
    let { newData, index } = event;
    listOfUnits[index] = newData;
    await tenancyService.updateTenancyUnitItem(listOfUnits[index]);
};
</script>

<template>
    <div class="text-lg font-semibold text-[2rem]">Mietobjekte</div>
    <Card>
        <template #header>
            <Button label="Neues Mietobjekt hinzufügen" icon="pi pi-plus" @click="addNewRow" class="ml-6 mt-4" />
        </template>
        <template #content>
            <DataTable :value="listOfUnits" :rows="10" :rowHover="true" dataKey="id" tableStyle="min-width: 60rem"
                scrollable scrollDirection="both" scrollHeight="var(--custom-scroll-height)" editMode="cell"
                @cell-edit-complete="onCellEditComplete" class="custom-scroll-height" :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }) => ({
                            class: [{ '!py-0': state['d_editing'] }]
                        })
                    }
                }">
                <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"
                    style="width: 25%">
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="field === 'rentalObject' ? rentalObjects : unitTypes"
                            optionLabel="label" optionValue="value" placeholder="Auswählen..." :showClear="true"
                            :filter="true" filterPlaceholder="Suchen..." />
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>