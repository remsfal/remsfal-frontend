<script lang="ts">
import ProjectService, {type Project} from "@/services/ProjectService";

export default {
  data() {
    return {
      projectTitle: "",
      errorMessage: "Der Projekttitel darf nicht mehr als 250 Zeichen lang sein",
    };
  },
  methods: {
    createProject() {

      const projectService = new ProjectService();
      // Now project_title will contain the value emitted from the pressedButton event
      projectService
        .createProject(this.projectTitle)
        .then((newProject: Project) => {
          console.info("new project has been created: ", newProject);
          this.$router.push({name: "ProjectDashboard", params: {projectId: newProject.id}});
        })
    },
    abort() {
      this.$router.push({name: "ProjectSelection"})
    }
  },
};
</script>

<template>
  <div class="grid">
    <div class="card flex justify-content-center">
      <!-- form @submit="onSubmit" class="flex flex-column gap-2"-->
      <form @submit.prevent="createProject" class="flex flex-column gap-2">
            <span class="p-float-label">
                <InputText id="value" v-model="projectTitle" type="text" :class="{ 'p-invalid': errorMessage }" aria-describedby="text-error" />
                <label for="value">Projekttitel</label>
            </span>
        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
        <Button type="submit" label="Erstellen" icon="pi pi-plus" iconPos="left"/>
        <Button
            @click="abort"
            type="reset"
            label="Abbrechen"
            icon="pi pi-times"
            iconPos="left"
        />
      </form>
    </div>
  </div>
</template>
