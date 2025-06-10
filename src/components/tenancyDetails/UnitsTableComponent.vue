<script lang="ts" setup>
import { EntityType, propertyService, type RentableUnitTreeNode } from '@/services/PropertyService';
import { tenancyService, type TenancyUnitItem } from '@/services/TenancyService';
import { useProjectStore } from '@/stores/ProjectStore';
import type { DataTablePassThroughMethodOptions } from 'primevue/datatable';
import Select from 'primevue/select';
import { onMounted, ref, watch } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps<{
  listOfUnits: TenancyUnitItem[];
}>();

const localListOfUnits = ref<TenancyUnitItem[]>([]);

watch(
    () => props.listOfUnits,
    (newVal) => {
        localListOfUnits.value = newVal.map(t => ({ ...t }));
    },
    { immediate: true, deep: true }
);

const projectStore = useProjectStore();

const rentalObjects = ref<Array<{ label: string; value: string }>>([]);
const unitTypes = ref<Array<{ label: string; value: string }>>([]);

async function loadDropdownOptions() {
  try {
    const response = await propertyService.getPropertyTree(projectStore.projectId || '');
    const properties = response.properties;

    console.log('Loaded properties:', properties);

    const entityTypes = Object.values(EntityType);
    rentalObjects.value = entityTypes.map((entity) => ({
      label: entity,
      value: entity,
    }));

    const getAllUnits = (
      nodes: RentableUnitTreeNode[],
    ): Array<{ label: string; value: string }> => {
      return nodes.reduce((acc: Array<{ label: string; value: string }>, node) => {
        acc.push({
          label: node.data.title || '',
          value: node.data.title ?? '',
        });

        if (node.children && node.children.length > 0) {
          acc.push(...getAllUnits(node.children));
        }

        return acc;
      }, []);
    };

    unitTypes.value = [
      ...new Map(getAllUnits(properties).map((item) => [item.value, item])).values(),
    ];
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
  unitTitle: '',
};

const addNewRow = () => {
  const newRow: TenancyUnitItem = { ...emptyRowTemplate };
    localListOfUnits.value.push(newRow);
};

const columns = ref([
  {
    field: 'rentalObject',
    header: 'Mietgegenstand',
    editor: 'Dropdown',
  },
  {
    field: 'unitTitle',
    header: 'Wohneinheit',
    editor: 'Dropdown',
  },
]);

const onCellEditComplete = async (event: any) => {
  let { newData, index } = event;
    localListOfUnits.value[index] = newData;
    await tenancyService.updateTenancyUnitItem(localListOfUnits.value[index]);
};
</script>

<template>
  <div class="text-lg font-semibold text-[2rem]">Mietobjekte</div>
  <Card>
    <template #header>
      <Button
        label="Neues Mietobjekt hinzufügen"
        icon="pi pi-plus"
        class="ml-6 mt-4"
        @click="addNewRow"
      />
    </template>
    <template #content>
      <DataTable
        :value="localListOfUnits"
        :rows="10"
        :rowHover="true"
        dataKey="id"
        tableStyle="min-width: 60rem"
        scrollable
        scrollDirection="both"
        scrollHeight="var(--custom-scroll-height)"
        editMode="cell"
        class="custom-scroll-height"
        :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state }: DataTablePassThroughMethodOptions) => ({
              class: [{ '!py-0': state['d_editing'] }],
            }),
          },
        }"
        @cellEditComplete="onCellEditComplete"
      >
        <Column
          v-for="col in columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          style="width: 25%"
        >
          <template #editor="{ data, field }">
            <Select
              v-model="data[field]"
              :options="field === 'rentalObject' ? rentalObjects : unitTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Auswählen..."
              filter
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
