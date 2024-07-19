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
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const projectService = new ProjectService();

    const id = ref(route.query.propertyId || "");
    const title = ref("");
    const landRegisterEntry = ref("");
    const description = ref("");
    const effectiveSpace = ref(0);
    const plotArea = ref(0);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    const action = ref(route.query.action || "");

    onMounted(() => {
      if (action.value === "update" || action.value === "delete") {
        fetchPropertyDetails();
      }
    });

    const fetchPropertyDetails = () => {
      if (!id.value) return;
      isLoading.value = true;
      projectService
        .getProperty(props.projectId, id.value.toString())
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
      if (!id.value) return;
      const updatedProperty: PropertyItem = {
        title: title.value,
        description: description.value,
        landRegisterEntry: landRegisterEntry.value,
        plotArea: plotArea.value,
        effective_space: effectiveSpace.value,
      };

      projectService
        .updateProperty(props.projectId, id.value.toString(), updatedProperty)
        .then(() => {
          router.push(`/project/${props.projectId}/objects`);
        })
        .catch((err) => {
          console.error("Error updating property:", err);
        });
    };

    const deleteProperty = () => {
      if (!id.value) return;
      projectService
        .deleteProperty(props.projectId, id.value.toString())
        .then(() => {
          router.push(`/project/${props.projectId}/objects`);
        })
        .catch((err) => {
          console.error("Error deleting property:", err);
        });
    };

    const close = () => {
      router.push(`/project/${props.projectId}/objects`);
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
      close,
      error,
      isLoading,
      route,
      action,
    };
  },
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5 v-if="action === 'create'">Erstelle Eigentum</h5>
      <h5 v-if="action === 'update'">Update Eigentum mit ID: {{ id }}</h5>
      <h5 v-if="action === 'delete'">Lösche Eigentum mit ID: {{ id }}</h5>
      <div v-if="isLoading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <div v-if="!isLoading && !error" class="p-fluid formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="title">Title</label>
          <InputText
            v-model="title"
            id="title"
            type="text"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-12 md:col-6">
          <label for="landRegisterEntry">Grundbucheintrag</label>
          <InputText
            v-model="landRegisterEntry"
            id="landRegisterEntry"
            type="text"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-12">
          <label for="description">Beschreibung</label>
          <Textarea
            v-model="description"
            id="description"
            rows="4"
            :disabled="action === 'delete'"
            class="no-resize"
          />
        </div>
        <div class="field col-10 md:col-6">
          <label for="plotArea">Grundstücksfläche</label>
          <InputText
            v-model="plotArea"
            id="plotArea"
            type="number"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-10 md:col-6">
          <label for="effectiveSpace">Nutzfläche</label>
          <InputText
            v-model="effectiveSpace"
            id="effectiveSpace"
            type="number"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-12 text-right">
          <Button
            v-if="action === 'create'"
            label="Erstellen"
            icon="pi pi-check"
            @click="createProperty"
            class="p-button-property mr-2 mb-2"
          />
          <Button
            v-if="action === 'update'"
            label="Updaten"
            icon="pi pi-check"
            @click="updateProperty"
            class="p-button-property mr-2 mb-2"
          />
          <Button
            v-if="action === 'delete'"
            label="Löschen"
            icon="pi pi-trash"
            @click="deleteProperty"
            class="p-button-property p-button-danger mr-2 mb-2"
          />
          <Button
            label="Abbrechen"
            icon="pi pi-times"
            @click="close"
            class="p-button-property mr-2 mb-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.text-right {
  text-align: right;
}

.p-button-property {
  width: auto;
}

.no-resize {
  resize: none;
}
</style>
