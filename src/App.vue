<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HeaderMenu from "@/components/HeaderMenu.vue";
import Modal from "@/components/Modal.vue";
import Footer from "@/components/Footer.vue";

</script>

<template>
  <HeaderMenu
    :projects ="projects"
    :userEmail="userEmail"
    :loggedIn="loggedIn"
    @clickedLogout="logout()"
    @clickedLogin="openModal()"
  />
  <RouterView @projectCreated="onProjectCreated" />
  <Modal
    :isOpen="showModal"
    :bodyText="'Durch die Anmeldung bzw. Registrerung stimmst Du unser Datenschutzerklärung zu.'"
    :linkText="'Datenschutzerklärung'"
    :linkHref="'/data-protection'"
    :buttonText="'Mit Google Anmelden'"
    :headingText="'Anmeldung/Registrierung'"
    @closeModal="showModal = false"
    @pressedButton="authenticate()"
  ></Modal>
  <Footer></Footer>
</template>

<script lang="ts">
import AuthenticationService from "@/services/AuthenticationService";
import UserService from "@/services/UserService";
import ProjectService from "@/services/ProjectService";

export default {
  data() {
    return {
      userId: "",
      userEmail: "",
      idToken: "",
      showModal: false,
      loggedIn: false,
  projects: Array,

    };
  },
  userService: null,
  projectService: null,
  authenticationService: null,
  created() {
    console.log("App created");
    // authenticate user if id_token is present in localStorage or URL contains auth params
    if (window.location.href.includes("register")) {
    }
    if (
      window.location.href.includes("id_token") ||
      localStorage.getItem("remsfal/id_token") !== null
    ) {
      this.authenticate();
    }
  },
  methods: {
    onProjectCreated() {
      console.log("Project created event");
    },
    openModal() {
      console.log("Register button clicked");
      this.showModal = true;
    },
    logout() {
      console.log("Logout button clicked");
      localStorage.removeItem("remsfal/id_token");
      window.location.href = "./";
    },

    async authenticate() {
      // authenticate with Google
      this.authenticationService = AuthenticationService.getInstance();
      await this.authenticationService.whenTokenReady();
      this.idToken = this.authenticationService.getIdToken();
      this.userEmail = await this.authenticationService.getUserEmail();
      this.userId = await this.authenticationService.getUserId();
      // Wait for the userId Promise to resolve
      console.log("userId: " + this.userId, "emnail", this.userEmail);
      this.userService = new UserService(this.idToken);
      this.projectService = new ProjectService(this.idToken);
this.projectService.getProjects().then((data) => {
  this.projects = data;
  console.log("projects", data);
  this.projects = data;
});
      try {
        let isAuthenticated = await this.userService.authenticate();
        this.loggedIn = isAuthenticated; // Set loggedIn status based on authenticated status
      } catch (error) {
        console.log("Failed to authenticate user: " + error);
      }
    },
  },
};
</script>

<style></style>
