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
      :isOpen="showDeleteUserModal"
      :bodyText="'Bist du sicher, dass du den Nutzer aus dem Projekt löschen möchtest? Der Nutzer wird daraufhin kein zugriff mehr auf das Projekt haben.'"
      :buttonText="'Nutzer entfernen'"
      :headingText="'Nutzer entfernen'"
      :buttonColor="'red'"
      @closeModal="showDeleteUserModal = false"
      @pressedButton="deleteUser()"
    ></Modal>
    <Modal
      :isOpen="showEditUserModal"
      :options="[
        'Proprietor',
        'Manager',
        'Lessor',
        'Caretaker',
        'Consultant',
        'Lessee',
      ]"
      :bodyText="'Ändere die Rolle des Nutzers in dem Projekt'"
      :buttonText="'Nutzerrolle ändern'"
      :headingText="'Nutzerrolle ändern'"
      :buttonColor="'orange'"
      :hasSelect="true"
      @closeModal="showEditUserModal = false"
      @pressedButton="editUser"
    ></Modal>
    <Modal
      :isOpen="showAddUserModal"
      :options="[
        'Proprietor',
        'Manager',
        'Lessor',
        'Caretaker',
        'Consultant',
        'Lessee',
      ]"
      :bodyText="'Gebe die Email-Adresse des Nutzers ein, den du hinzufügen möchtest. Wenn es den Nutzer gibt, wird er hinzugefügt.'"
      :buttonText="' + Nutzer hinzufügen'"
      :headingText="'Nutzer hinzufügen'"
      :buttonColor="'green'"
      :hasSelect="true"
      :hasInput="true"
      @closeModal="showAddUserModal = false"
      @pressedButton="addUser"
    ></Modal>
    <Modal
      :isOpen="showPropertyModal"
      :bodyText="'Wie soll das Grundstück heißen?'"
      :buttonText="' + Grundstück Erstellen'"
      :headingText="'Grundstück Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      :hasSelect="false"
      @closeModal="showPropertyModal = false"
      @pressedButton="createProperty"
    ></Modal>
    <Modal
      :isOpen="showSiteModal"
      :bodyText="'Wie soll die Baustelle heißen?'"
      :buttonText="' + Baustelle Erstellen'"
      :headingText="'Baustelle Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showSiteModal = false"
      @pressedButton="createSite"
    ></Modal>
    <Modal
      :isOpen="showBuildingModal"
      :bodyText="'Wie soll das Gebäude heißen?'"
      :buttonText="' + Gebäude Erstellen'"
      :headingText="'Gebäude Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showBuildingModal = false"
      @pressedButton="createBuilding"
    ></Modal>
    <Modal
      :isOpen="showGarageModal"
      :bodyText="'Wie soll die Garage heißen?'"
      :buttonText="' + Garage Erstellen'"
      :headingText="'Garage Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showGarageModal = false"
      @pressedButton="createGarage"
    ></Modal>
    <Modal
      :isOpen="showApartmentModal"
      :bodyText="'Wie soll die Apartment heißen?'"
      :buttonText="' + Apartment Erstellen'"
      :headingText="'Apartment Erstellen'"
      :buttonColor="'green'"
      :hasInput="true"
      @closeModal="showApartmentModal = false"
      @pressedButton="createApartment"
    ></Modal>
    <div v-if="isAuthorized" class="content-wrapper">
      <div class="project">
        <h1 class="section">{{ project.title }}</h1>
        <h1 class="section">
          Nutzer<span @click="showAddUserModal = true" v-if="isRoleAuthorized(userRole, createMemberRoles)" class="add"> + </span>
        </h1>
        <p v-if="isRoleAuthorized(userRole, createMemberRoles)" class="section">
          Hier kannst du als Manager andere Nutzer hinzufügen, entfernen und
          ihre Projektrollen ändern.
        </p>
        <div class="user-wrapper">
          <div v-if="isRoleAuthorized(userRole, getMembersRoles)" v-for="(member, index) in members" :key="index">
            <div class="user" v-if="member.role != 'MANAGER'">
              <div>{{ member.email }}</div>
              <span>{{ member.role }}</span>

              <span
              v-if="isRoleAuthorized(userRole, updateMemberRoles)"
                @click="showEditUserModalFunction(member)"
                class="checkmark pi pi-fw pi-pencil"
              ></span>
              <span
              v-if="isRoleAuthorized(userRole, deleteMemberRoles)"
                @click="showDeleteUserModalFunction(member.id)"
                class="checkmark pi pi-fw pi-trash"
              ></span>
            </div>
          </div>
        </div>
        <h1 v-if="isRoleAuthorized(userRole, getPropertiesRoles)" class="section">
          Grundstücke<span v-if="isRoleAuthorized(userRole, createPropertyRoles)" class="add" @click="openAddPropertyModal"> + </span>
        </h1>
        <div class="property-wrapper">
          <div v-for="(property, index) in properties" :key="index">
            <div class="property-card">
              <h2 class="section">{{ property.title }}</h2>
              <div class="site">
                <h3 v-if="isRoleAuthorized(userRole, getSitesRoles)" class="section">
                  Baustellen
                  <span v-if="isRoleAuthorized(userRole, createSiteRoles)" class="add" @click="showSiteModalFunction(property.id)"
                    >+
                  </span>
                </h3>
                <div v-if="isRoleAuthorized(userRole, getSitesRoles)" class="site-building-wrapper">
                  <div v-for="(site, index) in property.sites">
                    <div class="site-building-card">
                      <h4 v-if="isRoleAuthorized(userRole, getSitesRoles)" class="section">
                        {{ site.title }}
                      </h4>
                    </div>
                  </div>
                </div>
                <h3 v-if="isRoleAuthorized(userRole, getBuildingsRoles)" class="section">
                  Gebäude
                  <span
                  v-if="isRoleAuthorized(userRole, createBuildingRoles)"
                    class="add"
                    @click="showBuildingModalFunction(property.id)"
                  >
                    +
                  </span>
                </h3>
                <div class="site-building-wrapper">
                  <div v-if="isRoleAuthorized(userRole, getBuildingsRoles)" v-for="(building, index) in property.buildings">
                    <div class="site-building-card">
                      <h4 class="section">{{ building.title }}</h4>

                      <h5 v-if="isRoleAuthorized(userRole, getApartmentsRoles)" class="section">
                        Wohnungen<span v-if="isRoleAuthorized(userRole, createApartmentRoles)"
                          class="add"
                          @click="
                            showApartmentModalFunction(building.id, property.id)
                          "
                        >
                          +
                        </span>
                      </h5>
                      <div
                        v-for="(apartment, index) in building.apartments"
                        class="apartment"
                        v-if="isRoleAuthorized(userRole, getApartmentsRoles)"
                      >
                        <div class="garage-apartment-card">
                          <h6 class="section">
                            {{ apartment.title }}
                          </h6>
                        </div>
                      </div>
                      <h5 v-if="isRoleAuthorized(userRole, getGaragesRoles)" class="section">
                        Garage
                        <span
                          class="add"
                          @click="
                            showGarageModalFunction(building.id, property.id)
                          "
                          v-if="isRoleAuthorized(userRole, createGarageRoles)"
                        >
                          +
                        </span>
                      </h5>
                      <div v-if="isRoleAuthorized(userRole, getGaragesRoles)"
                        v-for="(garage, index) in building.garages"
                        class="garage"
                      >
                        <div class="garage-apartment-card">
                          <h6 class="section">
                            {{ garage.title }}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
      changedActiveRole: false,
      activeRole: "Manager",
      showPropertyModal: false,
      showDeleteUserModal: false,
      showEditUserModal: false,
      showAddUserModal: false,
      showSiteModal: false,
      showBuildingModal: false,
      showApartmentModal: false,
      showGarageModal: false,
      siteId: null,
      buildingId: null,
      email: null,
      apartmentId: null,
      garageId: null,
      memberId: null,
      propertyId: null,
      projectName: null,
      userRole: null,
      createApartmentRoles: ["MANAGER", "PROPRIETOR", "LESSOR"],
      getApartmentsRoles: [
        "MANAGER",
        "PROPRIETOR",
        "LESSOR",
        "CONSULTANT",
        "CARETAKER",
        "LESSEE",
      ],
      createBuildingRoles: ["MANAGER", "PROPRIETOR"],
      getBuildingsRoles: [
        "MANAGER",
        "PROPRIETOR",
        "LESSOR",
        "CONSULTANT",
        "CARETAKER",
        "LESSEE",
      ],

      createGarageRoles: ["MANAGER", "PROPRIETOR", "LESSOR"],
      getGaragesRoles: [
        "MANAGER",
        "PROPRIETOR",
        "LESSOR",
        "CONSULTANT",
        "CARETAKER",
        "LESSEE",
      ],
      createSiteRoles: ["MANAGER", "PROPRIETOR"],
      getSitesRoles: ["MANAGER", "PROPRIETOR", "CONSULTANT", "CARETAKER"],
      getMembersRoles: [
        "MANAGER",
        "PROPRIETOR",
        "LESSOR",
        "CONSULTANT",
        "CARETAKER",
        "LESSEE",
      ],
      createMemberRoles: ["MANAGER"],
      updateMemberRoles: ["MANAGER"],
      deleteMemberRoles: ["MANAGER"],
      createPropertyRoles: ["MANAGER", "PROPRIETOR"],
      getPropertiesRoles: [
        "MANAGER",
        "PROPRIETOR",
        "LESSOR",
        "CONSULTANT",
        "CARETAKER",
        "LESSEE",
      ],
    };
  },
  projectService: null,
  properties: [],
  members: [],

  async created() {
    try {
      const authenticationService = AuthenticationService.getInstance();
      await authenticationService.whenTokenReady();
      const idToken = authenticationService.getIdToken();
      this.projectService = new ProjectService(idToken);
      this.userRole = await this.projectService.getRole(this.projectId);
      console.log("user ", this.userRole);
      const project = await this.projectService.getProject(this.projectId);
      const members = await this.projectService.getMembers(this.projectId);
      this.members = Array.isArray(members) ? members : [];
      console.log("members", members.members);
      this.members = members.members;

      const properties = await this.projectService.getProperties(
        this.projectId
      );
      this.properties = Array.isArray(properties) ? properties : [];
      for (let property of this.properties) {
        console.log("property", property.id);
        let propertySites = await this.projectService.getSites(
          this.projectId,
          property.id
        );
        property.sites = Array.isArray(propertySites) ? property.sites : [];
        property.sites = propertySites;
        let propertyBuildings = await this.projectService.getBuildings(
          this.projectId,
          property.id
        );
        property.buildings = Array.isArray(propertyBuildings)
          ? propertyBuildings
          : [];

        for (let building of property.buildings) {
          building.apartments = await this.projectService.getApartments(
            this.projectId,
            property.id,
            building.id
          );

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
    async deleteUser() {
      console.log("deleteUser", this.memberId);
      const data = await this.projectService.deleteMember(
        this.projectId,
        this.memberId
      );
    },
    async addUser(userObj) {
      console.log("addUSerRol");

      try {
        const email = userObj.text;
        const role = userObj.select;
        console.log("addUSerRol", role, "email", email);
        const data = await this.projectService.addMember(
          this.projectId,
          email,
          role.toUpperCase()
        );
        console.log("sitedata : ", data);
        // Add newly created site to the list
        this.sites.push(data);
      } catch (error) {
        console.error("Failed to create site:", error);
      }
    },
    async editUser(role) {
      try {
        console.log("edUSerRol", role);
        const data = await this.projectService.updateMember(
          this.projectId,
          this.memberId,
          role.toUpperCase(),
          this.email
        );
        console.log("sitedata : ", data);
        // Add newly created site to the list
        this.sites.push(data);
      } catch (error) {
        console.error("Failed to create site:", error);
      }
    },
    showEditUserModalFunction(member) {
      this.role = member.role;
      this.email = member.email;
      this.memberId = member.id;
      this.showEditUserModal = true;
    },
    showDeleteUserModalFunction(memberId) {
      this.memberId = memberId;
      this.showDeleteUserModal = true;
    },
    changeActiveRole(event) {
      console.log("event", event.target.innerHTML);
      this.activeRole = event.target.innerHTML;
      this.changedActiveRole = true;
    },
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
    isRoleAuthorized(role, roles) {
      console.log("role", role, "roles", roles);
      if (roles.includes(role)) {
        return true;
      }
      return false;
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
