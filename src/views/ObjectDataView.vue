<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import ProjectService from "@/services/ProjectService";

export default defineComponent({
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const projectService = new ProjectService();
    const objectData = ref<any[]>([]);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const fetchData = async () => {
      try {
        await projectService.createProperty("NewProperty", props.projectId);
        const properties = await projectService.getProperties(props.projectId);
        const sites = await Promise.all(
          properties.map((property: any) =>
            projectService.getSites(props.projectId, property.id)
          )
        );
        const buildings = await Promise.all(
          sites
            .flat()
            .map((site: any) =>
              projectService.getBuildings(
                props.projectId,
                site.propertyId,
                site.id
              )
            )
        );
        const apartments = await Promise.all(
          buildings
            .flat()
            .map((building: any) =>
              projectService.getApartments(
                props.projectId,
                building.propertyId,
                building.id
              )
            )
        );
        const garages = await Promise.all(
          buildings
            .flat()
            .map((building: any) =>
              projectService.getGarages(
                props.projectId,
                building.propertyId,
                building.id
              )
            )
        );

        objectData.value = [
          ...properties,
          ...sites.flat(),
          ...buildings.flat(),
          ...apartments.flat(),
          ...garages.flat(),
        ];
        console.log("Fetched object data: ", objectData.value);
      } catch (err) {
        error.value = "Failed to fetch object data";
        console.error("An error occurred while fetching object data:", err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      objectData,
      isLoading,
      error,
    };
  },
});
</script>

<template>
  <main>
    <div class="grid">
      <h1>This is the Objektdaten page for project {{ projectId }}.</h1>
      <div v-if="isLoading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <table v-if="!isLoading && !error">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name/Title</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="object in objectData" :key="object.id">
            <td>{{ object.id }}</td>
            <td>{{ object.name || object.title }}</td>
            <td>
              <span
                v-if="object.propertyId && object.buildingId && object.garageId"
                >Garage</span
              >
              <span v-else-if="object.propertyId && object.buildingId"
                >Apartment</span
              >
              <span v-else-if="object.propertyId">Building</span>
              <span v-else-if="object.siteId">Site</span>
              <span v-else>Property</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style>
/* Your styles here */
</style>
