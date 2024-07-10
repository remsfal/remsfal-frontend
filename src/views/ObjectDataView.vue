<script lang="ts">
import { ref, onMounted } from "vue";
import ProjectService, { type PropertyItem } from "@/services/ProjectService";
import { generateDummyBuildings } from "@/helper/createBuildingData";
import { generateDummyApartments } from "@/helper/createApartmentData";
import { generateDummyGarages } from "@/helper/createGarageData";
import { useRouter } from "vue-router";

export default {
  name: "ObjectDataView",
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const projectService = new ProjectService();
    let objectData = ref<PropertyItem[]>([]);
    const isLoading = ref(true);
    const error = ref<string | null>(null);
    const expandedRows = ref<Record<string, boolean>>({});
    const expandedSubRows = ref<Record<string, boolean>>({});

    const router = useRouter();

    onMounted(() => {
      projectService
        .getProperties(props.projectId, 10, 0)
        .then((data) => {
          const dummyBuildings = generateDummyBuildings(data.properties);
          const dummyApartments = generateDummyApartments(dummyBuildings);
          const dummyGarages = generateDummyGarages(dummyBuildings);

          dummyBuildings.forEach((building) => {
            building.apartments = dummyApartments.filter(
              (apartment) => apartment.buildingId === building.id
            );
            building.garages = dummyGarages.filter(
              (garage) => garage.buildingId === building.id
            );
          });

          objectData.value = data.properties.map((property) => {
            return {
              ...property,
              buildings: dummyBuildings.filter(
                (building) => building.propertyId === property.id
              ),
            };
          });
        })
        .catch((err) => {
          error.value = `Failed to fetch object data: ${
            err.message || "Unknown error"
          }`;
        })
        .finally(() => {
          isLoading.value = false;
        });
    });

    const expandAll = () => {
      expandedRows.value = objectData.value.reduce(
        (acc: Record<string, boolean>, property) => {
          if (property?.id) {
            acc[property.id] = true;

            property.buildings?.forEach((building) => {
              if (building?.id) expandedSubRows.value[building.id] = true;
            });
          }
          return acc;
        },
        {}
      );
    };

    const collapseAll = () => {
      expandedRows.value = {};
      expandedSubRows.value = {};
    };

    const navigateToCreateProperty = () => {
      router.push(`/project/${props.projectId}/objects/create-property`);
    };

    const navigateToUpdateProperty = (propertyId: string) => {
      router.push(
        `/project/${props.projectId}/objects/update-property/${propertyId}`
      );
    };

    const navigateToDeleteProperty = (propertyId: string) => {
      router.push(
        `/project/${props.projectId}/objects/delete-property/${propertyId}`
      );
    };

    return {
      objectData,
      isLoading,
      error,
      expandedRows,
      expandedSubRows,
      expandAll,
      collapseAll,
      navigateToCreateProperty,
      navigateToUpdateProperty,
      navigateToDeleteProperty,
    };
  },
};
</script>

<template>
  <main>
    <div class="grid">
      <h1>ObjectDataView</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <div class="col-12" v-if="!isLoading && !error">
        <div class="card">
          <DataTable
            :value="objectData"
            :rows="10"
            :rowHover="true"
            v-model:expandedRows="expandedRows"
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
                    @click="expandAll"
                    class="mr-2 mb-2"
                  />

                  <Button
                    icon="pi pi-minus"
                    label="Collapse All"
                    @click="collapseAll"
                    class="mr-2 mb-2"
                  />
                </div>
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="Create New Property"
                  @click="navigateToCreateProperty"
                  class="mr-2 mb-2"
                />
              </div>
            </template>
            <Column :expander="true" headerStyle="width: 3rem" />
            <Column field="id" header="PropertyID" :sortable="true" />
            <Column field="title" header="Title" :sortable="true" />
            <Column field="description" header="Description" :sortable="true" />
            <Column
              field="landRegisterEntry"
              header="Land Register Entry"
              :sortable="true"
            />
            <Column field="plotArea" header="Plot Area" :sortable="true" />
            <Column
              field="effective_space"
              header="Effective Space"
              :sortable="true"
            />
            <Column frozen alignFrozen="right">
              <template #body="slotProps">
                <Button
                  class="mr-2 mb-2"
                  icon="pi pi-pencil"
                  @click="navigateToUpdateProperty(slotProps.data.id)"
                />
                <Button
                  class="mr-2 mb-2"
                  icon="pi pi-trash"
                  @click="navigateToDeleteProperty(slotProps.data.id)"
                />
              </template>
            </Column>
            <template #expansion="slotProps">
              <div
                v-if="
                  slotProps.data.buildings &&
                  slotProps.data.buildings.length > 0
                "
                class="p-3"
              >
                <h5>Buildings</h5>
                <DataTable
                  :value="slotProps.data.buildings"
                  v-model:expandedRows="expandedSubRows"
                  dataKey="id"
                  tableStyle="min-width: 40rem"
                >
                  <Column :expander="true" headerStyle="width: 3rem" />
                  <Column field="id" header="BuildingID" :sortable="true" />
                  <Column field="title" header="Title" :sortable="true" />
                  <Column
                    field="description"
                    header="Description"
                    :sortable="true"
                  />
                  <Column
                    field="livingSpace"
                    header="Living Space"
                    :sortable="true"
                  />
                  <Column
                    field="commercialSpace"
                    header="Commercial Space"
                    :sortable="true"
                  />
                  <Column
                    field="usableSpace"
                    header="Usable Space"
                    :sortable="true"
                  />
                  <Column
                    field="heatingSpace"
                    header="Heating Space"
                    :sortable="true"
                  />
                  <Column field="rent" header="Rent" :sortable="true" />
                  <Column frozen alignFrozen="right">
                    <template #body>
                      <Button class="mr-2 mb-2" icon="pi pi-pencil" />
                      <Button class="mr-2 mb-2" icon="pi pi-trash" />
                    </template>
                  </Column>

                  <template #expansion="buildingSlotProps">
                    <div
                      v-if="
                        buildingSlotProps.data.apartments &&
                        buildingSlotProps.data.apartments.length > 0
                      "
                      class="p-3"
                    >
                      <h5>Apartments</h5>
                      <DataTable
                        :value="buildingSlotProps.data.apartments"
                        dataKey="id"
                        tableStyle="min-width: 40rem"
                        scrollable
                        scrollDirection="both"
                      >
                        <Column
                          field="id"
                          header="ApartmentID"
                          :sortable="true"
                        />
                        <Column field="title" header="Title" :sortable="true" />
                        <Column
                          field="location"
                          header="Location"
                          :sortable="true"
                        />
                        <Column
                          field="description"
                          header="Description"
                          :sortable="true"
                        />
                        <Column
                          field="livingSpace"
                          header="Living Space"
                          :sortable="true"
                        />
                        <Column
                          field="usableSpace"
                          header="Usable Space"
                          :sortable="true"
                        />
                        <Column
                          field="heatingSpace"
                          header="Heating Space"
                          :sortable="true"
                        />
                        <Column field="rent" header="Rent" :sortable="true" />
                        <Column frozen alignFrozen="right">
                          <template #body>
                            <Button class="mr-2 mb-2" icon="pi pi-pencil" />
                            <Button class="mr-2 mb-2" icon="pi pi-trash" />
                          </template>
                        </Column>
                      </DataTable>
                    </div>
                    <div v-else class="p-3">
                      <h5>No apartments found for this building.</h5>
                    </div>
                    <div
                      v-if="
                        buildingSlotProps.data.garages &&
                        buildingSlotProps.data.garages.length > 0
                      "
                      class="p-3"
                    >
                      <h5>Garages</h5>
                      <DataTable
                        :value="buildingSlotProps.data.garages"
                        dataKey="id"
                        tableStyle="min-width: 40rem"
                        scrollable
                        scrollDirection="both"
                      >
                        <Column field="id" header="GarageID" :sortable="true" />
                        <Column field="title" header="Title" :sortable="true" />
                        <Column
                          field="location"
                          header="Location"
                          :sortable="true"
                        />
                        <Column
                          field="description"
                          header="Description"
                          :sortable="true"
                        />
                        <Column
                          field="usableSpace"
                          header="Usable Space"
                          :sortable="true"
                        />
                        <Column field="rent" header="Rent" :sortable="true" />
                        <Column
                          style="min-width: 200px"
                          frozen
                          alignFrozen="right"
                        >
                          <template #body>
                            <Button class="mr-2 mb-2" icon="pi pi-pencil" />
                            <Button class="mr-2 mb-2" icon="pi pi-trash" />
                          </template>
                        </Column>
                      </DataTable>
                    </div>
                    <div v-else class="p-3">
                      <h5>No garages found for this building.</h5>
                    </div>
                  </template>
                </DataTable>
              </div>
              <div v-else class="p-3">
                <h5>No buildings found for this property.</h5>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.custom-scroll-height {
  --custom-scroll-height: 30vw;
}
</style>
