<script lang="ts" setup>
import { EntityType, propertyService, type RentalUnitTreeNodeJson } from '@/services/PropertyService';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import type { DataTablePassThroughMethodOptions } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Select from 'primevue/select';
import { computed, onMounted, ref, watch } from 'vue';
import type { components } from '@/services/api/platform-schema';

// OpenAPI type
type TenancyUnitItem = components['schemas']['RentalUnitJson'];

const props = defineProps<{
  projectId?: string;
  listOfUnits: TenancyUnitItem[];
  isDeleteButtonEnabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'onChange', listOfUnits: TenancyUnitItem[]): void;
}>();

const localListOfUnits = ref<TenancyUnitItem[]>([]);

watch(
  () => props.listOfUnits,
  (newVal) => {
    localListOfUnits.value = newVal?.map((t) => ({ ...t }));
  },
  { immediate: true, deep: true },
);

const projectStore = useProjectStore();
const rentalObjects = ref<Array<{ label: string; value: string }>>([]);
const unitTypes = ref<Array<{ label: string; value: string }>>([]);

const loadDropdownOptions = async () => {
  try {
    const projectId = props.projectId || projectStore.projectId || '';
    const response = await propertyService.getPropertyTree(projectId);
    const properties: RentalUnitTreeNodeJson[] = (response.properties || []).filter(
      (p): p is RentalUnitTreeNodeJson => p !== undefined,
    );

    // Rental objects dropdown
    rentalObjects.value = Object.values(EntityType).map((entity) => ({
      label: entity,
      value: entity,
    }));

    // Recursive function to get all units
    const getAllUnits = (
      nodes: RentalUnitTreeNodeJson[],
    ): Array<{ label: string; value: string }> => {
      return nodes.reduce(
        (acc, node) => {
          if (node?.data?.title) {
            acc.push({ label: node.data.title, value: node.data.title });
          }
          if (node?.children?.length) {
            acc.push(
              ...getAllUnits(
                node.children.filter((n): n is RentalUnitTreeNodeJson => n !== undefined),
              ),
            );
          }
          return acc;
        },
        [] as Array<{ label: string; value: string }>,
      );
    };

    // Remove duplicates
    const allUnits = getAllUnits(properties);
    unitTypes.value = [...new Map(allUnits.map((item) => [item.value, item])).values()];
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

onMounted(() => {
  loadDropdownOptions();
  if (props.isDeleteButtonEnabled) addNewRow();
});

let newRowId = 1; // incremental counter for new rows

const emptyRowTemplate: TenancyUnitItem = {
  id: '', // will be set when adding a row
  type: 'PROPERTY',
  title: '',
};

const addNewRow = () => {
  const newRow = { ...emptyRowTemplate, id: `new-${newRowId++}` };
  localListOfUnits.value.push(newRow);
};

const columns = ref([
  {
 field: 'type', header: 'Mietgegenstand', editor: 'Dropdown' 
},
  {
 field: 'title', header: 'Wohneinheit', editor: 'Dropdown' 
},
]);
const onCellEditComplete = async (event: any) => {
  const { newData, index } = event;
  localListOfUnits.value[index] = newData;
  const unit = localListOfUnits.value[index];
  if (unit) {
    // TODO: updateTenancyUnitItem method not available in tenant context
    // This feature is only available in manager/contractor context
    console.warn('Update tenancy unit item not implemented');
  }
  emit('onChange', localListOfUnits.value);
};

const deleteRow = (index: number) => {
  localListOfUnits.value.splice(index, 1);
  emit('onChange', localListOfUnits.value);
};

const displayedColumns = computed(() =>
  props.isDeleteButtonEnabled
    ? [...columns.value, { field: 'actions', header: 'Aktionen' }]
    : columns.value,
);
</script>

<template>
  <div class="text-lg font-semibold text-[2rem]">
    Mietobjekte
  </div>
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
          v-for="col in displayedColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          sortable
          style="width: 25%"
        >
          <template v-if="col.field !== 'actions'" #editor="{ data, field }">
            <Select
              v-if="col.field !== 'actions'"
              v-model="data[field]"
              :options="field === 'rentalObject' ? rentalObjects : unitTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Auswählen..."
              filter
            />
          </template>
          <template v-if="col.field === 'actions'" #body="{ index }">
            <Button icon="pi pi-trash" severity="danger" text @click="deleteRow(index)" />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
