<script lang="ts">
import ProjectService from "@/services/ProjectService";
import AuthenticationService from "@/services/AuthenticationService";
import Modal from "@/components/Modal.vue";


export default {
    components: {
    Modal
  },
  data() {
    return {
      project_title: '',
      showModal: false,
    }
  },
  projectService: null,
  created() {
    this.projectService = new ProjectService(AuthenticationService.getInstance().getIdToken());
  },
  methods: {
onButtonCreate() {
  console.log("onButtonCreate");
  this.showModal = true;
},
  createProject(project_title) {
    // Now project_title will contain the value emitted from the outputValue event
    this.projectService.createProject(project_title)
      .then(data => {
        if(data && data.hasOwnProperty('id')) {
          this.$router.push({ name: 'ProjectSelection', params: { projectId: data.id }});
        } else {
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
      <Modal
    :isOpen="showModal"
    :bodyText="'Wie soll das Projekt heißen?'"
    :buttonText="' + Projekt Erstellen'"
    :headingText="'Projekt Erstellen'"
    :buttonColor="'green'"
    :hasInput="true"
    @closeModal="showModal = false"
    @outputValue="createProject"
  ></Modal>
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
