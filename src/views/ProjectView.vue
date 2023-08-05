<script setup lang="ts">
defineProps<{
  projectId: string;
  siteId: string;
  buildingId: string;
  apartmentId: string;
  garageId: string;
  propertyId: string;
  projectName: string;
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
      :isOpen="showBuildingModal"
      :bodyText="'Wie soll das Gebäude heißen?'"
      :buttonText="' + Gebäude Erstellen'"
      :headingText="'Gebäude Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showBuildingModal = false"
      @outputValue="createBuilding"
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
        <div
          v-for="(property, index) in properties"
          :key="index"
          class="property"
        >
          <h2>{{ property.title }}</h2>
          <div class="site">
            <h2 class="section">
              Baustellen
              <button
                class="button green"
                @click="showSiteModalFunction(property.id)"
              >
                + Baustelle
              </button>
            </h2>
            <div v-for="(site, index) in property.sites">
              <h3>{{ site.title }}</h3>
            </div>
            <h2 class="section">
              Gebäude
              <button
                class="button green"
                @click="showBuildingModalFunction(property.id)"
              >
                + Gebäude
              </button>
            </h2>
            <div v-for="(building, index) in property.buildings">
              <h3>{{ building.title }}</h3>
              <h3 class="section">
                Wohnungen/ Garagen<button
                  class="button green"
                  @click="showApartmentModalFunction(building.id, property.id)"
                >
                  + Wohnung
                </button>
              </h3>
              <div
                v-for="(apartment, index) in building.apartments"
                class="apartment"
              >
                <p>{{ apartment.title }}</p>
              </div>
              <h3 class="section">
                <button
                  class="button green"
              @click="showGarageModalFunction(building.id, property.id)"
                >
                  + Garage
                </button>
              </h3>
              <div v-for="(garage, index) in building.garages" class="garage">
                <p>{{ garage.title }}</p>
              </div>
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
.property {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
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
      showBuildingModal: false,
      showApartmentModal: false,
      showGarageModal: false,
      siteId: null,
      buildingId: null,
      apartmentId: null,
      garageId: null,
      propertyId: null,
      projectName: null,
    };
  },
  projectService: null,
  properties: [],

  async created() {
    try {
      const authenticationService = AuthenticationService.getInstance();
      await authenticationService.whenTokenReady();
      const idToken = authenticationService.getIdToken();
      this.projectService = new ProjectService(idToken);
      const project = await this.projectService.getProject(this.projectId);
      this.properties = await this.projectService.getProperties(this.projectId);
      for (let property of this.properties) {
        console.log("property", property.id);
        let propertySites = await this.projectService.getSites(
          this.projectId,
          property.id
        );
        property.sites = propertySites;
        let propertyBuildings = await this.projectService.getBuildings(
          this.projectId,
          property.id
        );
        property.buildings = Array.isArray(propertyBuildings)
          ? propertyBuildings
          : [];

        for (let building of property.buildings) {
          let buildingApartments = await this.projectService.getApartments(
            this.projectId,
            property.id,
            building.id
          );
          building.apartments = buildingApartments;
          console.log("buildingap", building.apartments);

          let buildingGarages = await this.projectService.getGarages(
            this.projectId,
            property.id,
            building.id
          );
          building.garages = buildingGarages;
          console.log("buildinggarages", building.garages);
        }
      }

      console.log("properties", this.properties);
      this.project = project;
      console.log("project", project.title);
      this.isAuthorized = true; // Update local data property, not the prop
    } catch (error) {
      console.error(`Failed to fetch the project: ${error}`);
      if (error === "403") {
        this.isAuthorized = false; // Update local data property, not the prop
      }
    }
  },
  methods: {
    showSiteModalFunction(propertyId) {
      this.propertyId = propertyId;
      this.showSiteModal = true;
    },
    showBuildingModalFunction(propertyId) {
      console.log("propertyId ", propertyId);

      this.propertyId = propertyId;
      this.showBuildingModal = true;
    },
    showGarageModalFunction(buildingId, propertyId) {
      this.propertyId = propertyId;
      this.buildingId = buildingId;
      this.showGarageModal = true;
    },
    showApartmentModalFunction(buildingId, propertyId) {
      console.log("buildingId ", buildingId);
      this.propertyId = propertyId;
      this.buildingId = buildingId;
      this.showApartmentModal = true;
    },
    openAddPropertyModal() {
      console.log("addProperty");
      this.showPropertyModal = true;
    },
    async createProperty(property_title) {
      console.log("property title", property_title);
      try {
        const data = await this.projectService.createProperty(
          property_title,
          this.projectId
        );
        console.log("propertydata : ", data);
        // Add newly created property to the list
        this.properties.push(data);
      } catch (error) {
        console.error("Failed to create property:", error);
      }
    },
    async createSite(site_title) {
      console.log("site title", site_title);
      try {
        const data = await this.projectService.createSite(
          site_title,
          this.projectId,
          this.propertyId
        );
        console.log("sitedata : ", data);
        // Add newly created site to the list
        this.sites.push(data);
      } catch (error) {
        console.error("Failed to create site:", error);
      }
    },
    async createBuilding(building_title) {
      console.log("building title", building_title);
      try {
        const data = await this.projectService.createBuilding(
          building_title,
          this.projectId,
          this.propertyId,
          this.siteId
        );
        console.log("building data: ", data);
        // Add newly created building to the list
        this.buildings.push(data);
      } catch (error) {
        console.error("Failed to create building:", error);
      }
    },
    async createApartment(apartment_title) {
      console.log("apartment title", apartment_title);
      try {
        const data = await this.projectService.createApartment(
          apartment_title,
          this.projectId,
          this.propertyId,
          this.buildingId
        );
        console.log("apartmentdata : ", data);
        // Add newly created apartment to the list
        this.apartments.push(data);
      } catch (error) {
        console.error("Failed to create apartment:", error);
      }
    },
    async createGarage(garage_title) {
      console.log("garage title", garage_title);
      try {
        const data = await this.projectService.createGarage(
          garage_title,
          this.projectId,
          this.propertyId,
          this.buildingId
        );
        console.log("garagedata : ", data);
        // Add newly created garage to the list
        this.garages.push(data);
      } catch (error) {
        console.error("Failed to create garage:", error);
      }
    },
  },
});
</script>
