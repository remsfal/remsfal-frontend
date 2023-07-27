<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HeaderMenu from "@/components/HeaderMenu.vue";
import Modal from "@/components/Modal.vue";
</script>

<template>
  <HeaderMenu
    :userEmail="userEmail"
    :loggedIn="loggedIn"
    @clickedLogout="logout()"
    @clickedRegister="openRegister()"
    @clickedLogin="login()"
  />
  <RouterView @projectCreated="onProjectCreated" />
  <Modal
    :isOpen="showRegisterModal"
    :bodyText="'Durch die Anmeldung stimmst Du unser Datenschutzerklärung zu.'"
    :linkText="'Datenschutzerklärung'"
    :linkHref="'/data-protection'"
    :buttonText="'Mit Google Anmelden'"
    :headingText="'Registrierung'"
    @closeModal="showRegisterModal = false"
    @pressedButton="register()"
  ></Modal>
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
      showRegisterModal: false,
      loggedIn: false,
    };
  },
  userService: null,
  projectService: null,
  authenticationService: null,
  created() {
    console.log("App created");
    // authenticate user if id_token is present in localStorage or URL contains auth params
        if (
      window.location.href.includes("register")
    ) {
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
    login() {
      console.log("Login button clicked");
      this.authenticate();
    },
    openRegister() {
      console.log("Register button clicked");
      this.showRegisterModal = true;
    },
    register() {
      this.authenticate("register");
    },
    logout() {
      console.log("Logout button clicked");
      localStorage.removeItem("remsfal/id_token");
      window.location.href = "./";
    },

async authenticate() {
      // authenticate with Google
      this.authenticationService = AuthenticationService.getInstance();
      await this.authenticationService.whenTokenReady(); // <=== wait for the token to be ready
      this.idToken = this.authenticationService.getIdToken();
      // Wait for the userId Promise to resolve
      this.userId = await this.authenticationService.getUserId();
      console.log("userId: " + this.userId);
      if (this.userId !== "") {
        this.loggedIn = true;
        console.log("user currently logged in: " + this.loggedIn);
      }
      this.userService = new UserService(this.idToken);
      this.projectService = new ProjectService();
      this.userEmail = await this.authenticationService.getUserEmail();
      this.userService.authenticate(this.userId);
    },
  },
};
</script>

<style></style>
