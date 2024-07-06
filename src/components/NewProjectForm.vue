<script lang="ts">
import { defineComponent } from "vue";
import ProjectService, {type Project} from "@/services/ProjectService";
import {useProjectStore} from "@/stores/ProjectStore";

export default defineComponent({
  data() {
    return {
      projectTitle: "",
      errorMessage: "",
      maxLength: 100,
    };
  },
  methods: {
    createProject() {
      const projectService = new ProjectService();
      const projectStore = useProjectStore();

      if (this.projectTitle.length > this.maxLength) return;

      projectService
          .createProject(this.projectTitle)
          .then((newProject: Project) => {
            projectStore.setSelectedProject(newProject);
            console.info("new project has been created: ", newProject);
            this.$router.push({
              name: "ProjectDashboard",
              params: { projectId: newProject.id },
            });
          });
    },
    abort() {
      this.$router.push({ name: "ProjectSelection" });
      this.$emit('abort');
    },
  },
  watch: {
    projectTitle(newVal) {
      if (newVal.length > this.maxLength) {
        this.errorMessage = `Der Projekttitel darf nicht mehr als ${this.maxLength} Zeichen lang sein`;
      } else {
        this.errorMessage = "";
      }
    },
  },
});
</script>

<template>
  <form @submit.prevent="createProject" class="flex flex-column gap-2 w-23rem">
    <span class="p-float-label">
      <InputText
          id="value"
          v-model="projectTitle"
          type="text"
          :class="{ 'p-invalid': errorMessage }"
          aria-describedby="text-error"
      />
      <label for="value">Projekttitel</label>
    </span>
    <small class="p-error" id="text-error">
      {{ errorMessage || "&nbsp;" }}
    </small>
    <Button
        type="submit"
        label="Erstellen"
        icon="pi pi-plus"
        iconPos="left"
    />
    <Button
        @click="abort"
        type="reset"
        label="Abbrechen"
        icon="pi pi-times"
        iconPos="left"
    />
  </form>
</template>



