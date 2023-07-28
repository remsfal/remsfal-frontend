<script lang="ts">
import ProjectService from "@/services/ProjectService";

export default {
  data() {
    return {
      project_title: ''
    }
  },
  projectService: null,
  created() {
    this.projectService = new ProjectService();
  },
  methods: {
onButtonCreate() {
  this.projectService.createProject(this.project_title)
      .then(data => {
        if(data && data.hasOwnProperty('id')) {
          this.$router.push({ name: 'ProjectSelection', params: { projectId: data.id }});
        } else {
          // handle the case where data is undefined or doesn't have an id
          console.log("Unexpected data: ", data);
        }
      })
      .finally(() => this.$emit('projectCreated'));
}

  }
}
</script>


<template>
  <main>
  <div class="card">
    <div class="grid p-fluid">
      <div class="field col-12 md:col-4">
        <div class="p-inputgroup">
                    <span class="p-inputgroup-addon">
                        <i class="pi pi-home"></i>
                    </span>
          <InputText v-model="project_title" placeholder="Projekt Titel"/>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <Button @click="onButtonCreate" label="Erstellen" icon="pi pi-plus" iconPos="left"/>
        <div />
        <Button @click="$router.push({ name: 'ProjectSelection' })" label="Abbrechen" icon="pi pi-times" iconPos="left"/>
      </div>
    </div>
  </div>
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
