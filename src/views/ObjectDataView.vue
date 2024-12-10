<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProjectService, { type PropertyItem } from '@/services/ProjectService';
import { generateDummyBuildings } from '@/helper/createBuildingData';
import { generateDummyApartments } from '@/helper/createApartmentData';
import { generateDummyGarages } from '@/helper/createGarageData';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  projectId: string;
}>();

const projectService = new ProjectService();
let objectData = ref<PropertyItem[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedRows = ref<Record<string, boolean>>({});
const expandedSubRows = ref<Record<string, boolean>>({});

const router = useRouter();

function fetchProperties(projectId: string): Promise<PropertyItem[]> {
  return projectService
      .getProperties(projectId, 10, 0)
      .then((data) => data.properties)
      .catch((err) => {
        error.value = `Failed to fetch object data: ${err.message || 'Unknown error'}`;
        return [];
      });
}

function generateDummyData(properties: PropertyItem[]) {
  const dummyBuildings = generateDummyBuildings(properties);
  const dummyApartments = generateDummyApartments(dummyBuildings);
  const dummyGarages = generateDummyGarages(dummyBuildings);

  dummyBuildings.forEach((building) => {
    building.apartments = dummyApartments.filter(
        (apartment) => apartment.buildingId === building.id,
    );
    building.garages = dummyGarages.filter((garage) => garage.buildingId === building.id);
  });

  objectData.value = properties.map((property) => ({
    ...property,
    buildings: dummyBuildings.filter((building) => building.propertyId === property.id),
  }));
}

onMounted(() => {
  fetchProperties(props.projectId)
      .then((properties) => {
        if (properties.length > 0) {
          generateDummyData(properties);
        }
      })
      .finally(() => {
        isLoading.value = false;
      });
});

const expandAll = () => {
  expandedRows.value = objectData.value.reduce((acc: Record<string, boolean>, property) => {
    if (property?.id) {
      acc[property.id] = true;

      property.buildings?.forEach((building) => {
        if (building?.id) expandedSubRows.value[building.id] = true;
      });
    }
    return acc;
  }, {});
};

const collapseAll = () => {
  expandedRows.value = {};
  expandedSubRows.value = {};
};

const navigateToProperty = (action: string, propertyId?: string) => {
  if (action === 'create') {
    // Navigiere zu `property/create`
    router.push({
      path: `/project/${props.projectId}/property/create`,
    });
  } else if (action === 'update' && propertyId) {
    // Navigiere zu `property/:propertyId/update`
    router.push({
      path: `/project/${props.projectId}/property/${propertyId}/update`,
    });
  }
};

</script>

<template>
  <main>
    <div class="grid">
      <h1>Objektdaten Ansicht</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="!isLoading && !error" class="col-12">
        <div class="card">
          <DataTable
              v-model:expandedRows="expandedRows"
              :value="objectData"
              :rows="10"
              :rowHover="true"
              dataKey="id"
              tableStyle="min-width: 60rem"
              scrollable
              scrollDirection="both"
              scrollHeight="var(--custom-scroll-height)"
              class="custom-scroll-height"
          >
            <template #header>
              <div class="flex justify-content-between flex-column sm:flex-row">
                <div>
                  <Button
                      icon="pi pi-search"
                      label="Expand All"
                      class="mr-2 mb-2"
                      @click="expandAll"
                  />

                  <Button
                      icon="pi pi-minus"
                      label="Collapse All"
                      class="mr-2 mb-2"
                      @click="collapseAll"
                  />
                </div>
              </div>
            </template>
            <Column :expander="true" headerStyle="width: 3rem"/>
            <Column field="id" header="PropertyID" :sortable="true"/>
            <Column field="title" header="Title" :sortable="true"/>
            <Column field="description" header="Description" :sortable="true"/>
            <Column field="landRegisterEntry" header="Land Register Entry" :sortable="true"/>
            <Column field="plotArea" header="Plot Area" :sortable="true"/>
            <Column field="effective_space" header="Effective Space" :sortable="true"/>
            <Column frozen alignFrozen="right">
              <template #body="slotProps">
                <div class="flex justify-content-end">
                  <Button
                      icon="pi pi-pencil"
                      severity="success"
                      text
                      raised
                      rounded
                      class="mb-2 mr-2"
                      @click="navigateToProperty('update', slotProps.data.id)"
                  />

                  <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      raised
                      rounded
                      class="mb-2 mr-2"
                      @click="navigateToProperty('delete', slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>

            <template #expansion="slotProps">
              <div class="p-3">
                <h5>Gebäude für Eigentum: {{ slotProps.data.title }}</h5>
                <DataTable
                    v-model:expandedRows="expandedSubRows"
                    :value="slotProps.data.buildings"
                    dataKey="id"
                    tableStyle="min-width: 40rem"
                >
                  <Column :expander="true" headerStyle="width: 3rem"/>
                  <Column field="id" header="BuildingID" :sortable="true"/>
                  <Column field="title" header="Title" :sortable="true"/>
                  <Column field="description" header="Description" :sortable="true"/>
                  <Column field="livingSpace" header="Living Space" :sortable="true"/>
                  <Column field="commercialSpace" header="Commercial Space" :sortable="true"/>
                  <Column field="usableSpace" header="Usable Space" :sortable="true"/>
                  <Column field="heatingSpace" header="Heating Space" :sortable="true"/>
                  <Column field="rent" header="Rent" :sortable="true"/>
                  <Column frozen alignFrozen="right">
                    <template #body>
                      <div class="flex justify-content-end">
                        <Button
                            icon="pi pi-pencil"
                            severity="success"
                            text
                            raised
                            rounded
                            class="mb-2 mr-2"
                        />

                        <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            raised
                            rounded
                            class="mb-2 mr-2"
                        />
                      </div>
                    </template>
                  </Column>

                  <template #expansion="buildingSlotProps">
                    <div class="p-3">
                      <h5>
                        Apartments für Gebäude:
                        {{ buildingSlotProps.data.title }}
                      </h5>
                      <DataTable
                          :value="buildingSlotProps.data.apartments"
                          dataKey="id"
                          tableStyle="min-width: 40rem"
                          scrollable
                          scrollDirection="both"
                      >
                        <Column field="id" header="ApartmentID" :sortable="true"/>
                        <Column field="title" header="Title" :sortable="true"/>
                        <Column field="location" header="Location" :sortable="true"/>
                        <Column field="description" header="Description" :sortable="true"/>
                        <Column field="livingSpace" header="Living Space" :sortable="true"/>
                        <Column field="usableSpace" header="Usable Space" :sortable="true"/>
                        <Column field="heatingSpace" header="Heating Space" :sortable="true"/>
                        <Column field="rent" header="Rent" :sortable="true"/>
                        <Column frozen alignFrozen="right">
                          <template #body>
                            <div class="flex justify-content-end">
                              <Button
                                  icon="pi pi-pencil"
                                  severity="success"
                                  text
                                  raised
                                  rounded
                                  class="mb-2 mr-2"
                              />

                              <Button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  text
                                  raised
                                  rounded
                                  class="mb-2 mr-2"
                              />
                            </div>
                          </template>
                        </Column>
                      </DataTable>
                      <div class="flex justify-content-end mt-4">
                        <Button
                            type="button"
                            icon="pi pi-plus"
                            label="Erstelle ein neues Apartment"
                            class="mr-2 mb-2"
                        />
                      </div>
                    </div>

                    <div class="p-3">
                      <h5>
                        Garagen für Gebäude:
                        {{ buildingSlotProps.data.title }}
                      </h5>
                      <DataTable
                          :value="buildingSlotProps.data.garages"
                          dataKey="id"
                          tableStyle="min-width: 40rem"
                          scrollable
                          scrollDirection="both"
                      >
                        <Column field="id" header="GarageID" :sortable="true"/>
                        <Column field="title" header="Title" :sortable="true"/>
                        <Column field="location" header="Location" :sortable="true"/>
                        <Column field="description" header="Description" :sortable="true"/>
                        <Column field="usableSpace" header="Usable Space" :sortable="true"/>
                        <Column field="rent" header="Rent" :sortable="true"/>
                        <Column style="min-width: 200px" frozen alignFrozen="right">
                          <template #body>
                            <div class="flex justify-content-end">
                              <Button
                                  icon="pi pi-pencil"
                                  severity="success"
                                  text
                                  raised
                                  rounded
                                  class="mb-2 mr-2"
                              />

                              <Button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  text
                                  raised
                                  rounded
                                  class="mb-2 mr-2"
                              />
                            </div>
                          </template>
                        </Column>
                      </DataTable>
                      <div class="flex justify-content-end mt-4">
                        <Button
                            type="button"
                            icon="pi pi-plus"
                            label="Erstelle eine neue Garage"
                            class="mr-2 mb-2"
                        />
                      </div>
                    </div>
                  </template>
                </DataTable>
                <div class="flex justify-content-end mt-4">
                  <Button
                      type="button"
                      icon="pi pi-plus"
                      label="Erstelle ein neues Gebäude"
                      class="mr-2 mb-2"
                  />
                </div>
              </div>
            </template>
          </DataTable>
          <div class="flex justify-content-end mt-4">
            <Button
                type="button"
                icon="pi pi-plus"
                label="Erstelle ein neues Eigentum"
                class="mr-2 mb-2"
                @click="navigateToProperty('create')"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.custom-scroll-height {
  --custom-scroll-height: 30vw;
}

.outline-button {
  border: 1px solid #000;
}

.create-button {
  margin-left: auto;
}
</style>
