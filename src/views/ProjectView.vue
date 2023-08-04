<script setup lang="ts">
defineProps<{
  projectId: string;
  projectName:string;
}>();
</script>

<template>
  <main>
    <Modal
      :isOpen="showPropertyModal"
      :bodyText="'Wie soll das Grundstück heißen?'"
      :buttonText="' + Grundstück Erstellen'"
      :headingText="'Grundstück Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showPropertyModal = false"
      @outputValue="createProperty"
    ></Modal>
    <Modal
      :isOpen="showSiteModal"
      :bodyText="'Wie soll die Baustelle heißen?'"
      :buttonText="' + Baustelle Erstellen'"
      :headingText="'Baustelle Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showSiteModal = false"
      @outputValue="createSite"
    ></Modal>
    <Modal
      :isOpen="showGarageModal"
      :bodyText="'Wie soll die Garage heißen?'"
      :buttonText="' + Garage Erstellen'"
      :headingText="'Garage Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showGarageModal = false"
      @outputValue="createGarage"
    ></Modal>
    <Modal
      :isOpen="showApartmentModal"
      :bodyText="'Wie soll die Apartment heißen?'"
      :buttonText="' + Apartment Erstellen'"
      :headingText="'Apartment Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showApartmentModal = false"
      @outputValue="createApartment"
    ></Modal>
    <div v-if="isAuthorized" class="content-wrapper">
      <div class="project">
        <h1>{{ project.title }}</h1>
        <h1 class="section">
          Grundstücke<button class="button green" @click="openAddPropertyModal">
            + Grundstück
          </button>
        </h1>
        <div class="property">
          <h2>Grundstück 1</h2>
          <div class="site">
            <h2 class="section">
              Baustellen<button class="button green" @click="showSiteModal=true">
                + Baustelle
              </button>
            </h2>
            <h3>Baustelle 1</h3>
            <h3 class="section">
              Wohnungen/ Garagen<button
                class="button green"
                @click="showApartmentModal=true"
              >
                + Wohnung</button
              ><button class="button green" @click="showGarageModal=true">+ Garage</button>
            </h3>
            <div class="apartment">
              <p>Apartment 1</p>
            </div>
            <div class="apartment">
              <p>Apartment 2</p>
            </div>
          </div>
          <div class="site">
            <h3>Site 2</h3>
            <div class="apartment">
              <p>Apartment 1</p>
            </div>
          </div>
        </div>
        <div class="property">
          <h2>Property 2</h2>
          <div class="site">
            <h3>Site 1</h3>
            <div class="apartment">
              <p>Apartment 1</p>
              <p>Garage 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="content-wrapper">
      <h1>You do not have the necessary rights to access this resource.</h1>
    </div>
  </main>
</template>

<style>
.content-wrapper {
  padding: 10%;
}
.section {
  width: 200px;
  color: aqua;
  display: flex;
  flex-direction: column;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import ProjectService from "@/services/ProjectService";
import AuthenticationService from "@/services/AuthenticationService";
import Modal from "@/components/Modal.vue";

export default defineComponent({
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      visibleLeft: true,
      items: [
        /* menu items */
      ],
      project: null,
      isAuthorized: false,
      showPropertyModal: false,
      showSiteModal: false,
      showApartmentModal: false,
      showGarageModal: false,
    };
  },
  async created() {
    try {
      const authService = AuthenticationService().getInstance();
await authService.initialize();
      const projectService = new ProjectService(authService.getIdToken());
      const project = await projectService.getProject(this.projectId);
      this.project = project;
      console.log("project", project.title)
      this.isAuthorized = true; // Update local data property, not the prop
    } catch (error) {
      console.error(`Failed to fetch the project: ${error}`);
      if (error === "403") {
        this.isAuthorized = false; // Update local data property, not the prop
      }
    }
  },
  methods: {
    openAddPropertyModal() {
      console.log("addProperty");
      this.showPropertyModal = true;
    },
    createProperty(property_title) {
      event;
      console.log("property title", property_title);
      this.projectService
        .createPrpperty(project_title)
        .then((data) => {
          if (data && data.hasOwnProperty("id")) {
            this.$router.push({
              name: "ProjectSelection",
              params: { projectId: data.id },
            });
          } else {
            console.log("Unexpected data: ", data);
          }
        })
        .finally(() => this.$emit("projectCreated"));
    },
    createSite(property_title) {
      event;
      console.log("property title", property_title);
      this.projectService
        .createPrpperty(project_title)
        .then((data) => {
          if (data && data.hasOwnProperty("id")) {
            this.$router.push({
              name: "ProjectSelection",
              params: { projectId: data.id },
            });
          } else {
            console.log("Unexpected data: ", data);
          }
        })
        .finally(() => this.$emit("projectCreated"));
    },
    createGarage(property_title) {
      event;
      console.log("property title", property_title);
      this.projectService
        .createPrpperty(project_title)
        .then((data) => {
          if (data && data.hasOwnProperty("id")) {
            this.$router.push({
              name: "ProjectSelection",
              params: { projectId: data.id },
            });
          } else {
            console.log("Unexpected data: ", data);
          }
        })
        .finally(() => this.$emit("projectCreated"));
    },
    createApartment(property_title) {
      event;
      console.log("property title", property_title);
      this.projectService
        .createPrpperty(project_title)
        .then((data) => {
          if (data && data.hasOwnProperty("id")) {
            this.$router.push({
              name: "ProjectSelection",
              params: { projectId: data.id },
            });
          } else {
            console.log("Unexpected data: ", data);
          }
        })
        .finally(() => this.$emit("projectCreated"));
    },
  },
});
</script>
