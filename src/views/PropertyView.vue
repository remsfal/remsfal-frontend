<script lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import ProjectService, { type PropertyItem } from "@/services/ProjectService";

export default {
  name: "ObjectDataView",
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const projectService = new ProjectService();

    const title = ref("");
    const landRegisterEntry = ref("");
    const description = ref("");
    const plotArea = ref(0);
    const effectiveSpace = ref(0);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    const createProperty = () => {
      const newProperty: PropertyItem = {
        title: title.value,
        description: description.value,
        landRegisterEntry: landRegisterEntry.value,
        plotArea: plotArea.value,
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

    return {
      title,
      description,
      landRegisterEntry,
      plotArea,
      createProperty,
      effectiveSpace,
      error,
      isLoading,
    };
  },
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5>Create New Property</h5>
      <div class="p-fluid formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="title">Title</label>
          <InputText v-model="title" id="title" type="text" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="landRegisterEntry">Land Register Entry</label>
          <InputText
            v-model="landRegisterEntry"
            id="landRegisterEntry"
            type="text"
          />
        </div>
        <div class="field col-12">
          <label for="description">Description</label>
          <Textarea v-model="description" id="description" rows="4" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="plotArea">Plot Area</label>
          <InputText v-model="plotArea" id="plotArea" type="number" />
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
            label="Create Property"
            icon="pi pi-check"
            @click="createProperty"
            class="p-button"
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

.p-button {
  width: auto;
}
</style>
