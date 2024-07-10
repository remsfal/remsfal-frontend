<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ProjectService, { type PropertyItem } from "@/services/ProjectService";

export default {
  name: "PropertyView",
  props: {
    projectId: {
      type: String,
      required: true,
    },
    propertyId: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const projectService = new ProjectService();

    const id = ref(props.propertyId);
    const title = ref("");
    const landRegisterEntry = ref("");
    const description = ref("");
    const effectiveSpace = ref(0);

    const plotArea = ref(0);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    onMounted(() => {
      if (route.name === "UpdateProperty" || route.name === "DeleteProperty") {
        fetchPropertyDetails();
      }
    });

    const fetchPropertyDetails = () => {
      if (!props.propertyId) return;
      isLoading.value = true;
      projectService
        .getProperty(props.projectId, props.propertyId)
        .then((property: PropertyItem) => {
          title.value = property.title;
          description.value = property.description;
          landRegisterEntry.value = property.landRegisterEntry;
          plotArea.value = property.plotArea;
          effectiveSpace.value = property.effective_space;
        })
        .catch((err) => {
          error.value = `Failed to fetch property details: ${
            err.message || "Unknown error"
          }`;
        })
        .finally(() => {
          isLoading.value = false;
        });
    };

    const createProperty = () => {
      const newProperty: PropertyItem = {
        title: title.value,
        description: description.value,
        landRegisterEntry: landRegisterEntry.value,
        plotArea: plotArea.value,
        effective_space: effectiveSpace.value,
      };

      projectService
        .createProperty(props.projectId, newProperty)
        .then(() => {
          router.push(`/project/${props.projectId}/objects`);
        })
        .catch((err) => {
          console.error("Error creating property:", err);
        });
    };

    const updateProperty = () => {
      if (!props.propertyId) return;
      const updatedProperty: PropertyItem = {
        title: title.value,
        description: description.value,
        landRegisterEntry: landRegisterEntry.value,
        plotArea: plotArea.value,
        effective_space: effectiveSpace.value,
      };

      projectService
        .updateProperty(props.projectId, props.propertyId, updatedProperty)
        .then(() => {
          router.push(`/project/${props.projectId}/objects`);
        })
        .catch((err) => {
          console.error("Error updating property:", err);
        });
    };

    const deleteProperty = () => {
      if (!props.propertyId) return;
      projectService
        .deleteProperty(props.projectId, props.propertyId)
        .then(() => {
          router.push(`/project/${props.projectId}/objects`);
        })
        .catch((err) => {
          console.error("Error deleting property:", err);
        });
    };

    return {
      id,
      title,
      description,
      landRegisterEntry,
      effectiveSpace,
      plotArea,
      createProperty,
      updateProperty,
      deleteProperty,
      fetchPropertyDetails,
      error,
      isLoading,
      route,
    };
  },
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5 v-if="route.name === 'CreateProperty'">Create New Property</h5>
      <h5 v-if="route.name === 'UpdateProperty'">Update Property: {{ id }}</h5>
      <h5 v-if="route.name === 'DeleteProperty'">Delete Property: {{ id }}</h5>
      <div v-if="isLoading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <div v-if="!isLoading && !error" class="p-fluid formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="title">Title</label>
          <InputText
            v-model="title"
            id="title"
            type="text"
            :disabled="route.name === 'DeleteProperty'"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="landRegisterEntry">Land Register Entry</label>
          <InputText
            v-model="landRegisterEntry"
            id="landRegisterEntry"
            type="text"
            :disabled="route.name === 'DeleteProperty'"
          />
        </div>
        <div class="field col-12">
          <label for="description">Description</label>
          <Textarea
            v-model="description"
            id="description"
            rows="4"
            :disabled="route.name === 'DeleteProperty'"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="plotArea">Plot Area</label>
          <InputText
            v-model="plotArea"
            id="plotArea"
            type="number"
            :disabled="route.name === 'DeleteProperty'"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="effectiveSpace">Effective Space</label>
          <InputText
            v-model="effectiveSpace"
            id="effectiveSpace"
            type="number"
          />
        </div>
        <div class="field col-12 text-right">
          <Button
            v-if="route.name === 'CreateProperty'"
            label="Create Property"
            icon="pi pi-check"
            @click="createProperty"
            class="p-buttonProperty"
          />
          <Button
            v-if="route.name === 'UpdateProperty'"
            label="Update Property"
            icon="pi pi-check"
            @click="updateProperty"
            class="p-buttonProperty"
          />
          <Button
            v-if="route.name === 'DeleteProperty'"
            label="Delete Property"
            icon="pi pi-trash"
            @click="deleteProperty"
            class="p-buttonProperty p-button-danger"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scope>
.text-right {
  text-align: right;
}

.p-buttonProperty {
  width: auto;
}
</style>
