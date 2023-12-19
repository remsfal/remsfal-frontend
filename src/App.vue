<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HeaderMenu from "@/components/HeaderMenu.vue";
import Modal from "@/components/Modal.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
  <HeaderMenu
    :userEmail="userEmail"
    :loggedIn="loggedIn"
    @clickedLogout="logout()"
    @clickedLogin="openModal()"
    @clickedDelete="openDeleteModal()"
  />
  <RouterView @projectCreated="onProjectCreated" />
  <Modal
    :isOpen="showModal"
    :bodyText="'Durch die Anmeldung bzw. Registrerung stimmst Du unser Datenschutzerklärung zu.'"
    :linkText="'Datenschutzerklärung'"
    :linkHref="'/data-protection'"
    :buttonText="'Mit Google Anmelden'"
    :headingText="'Anmeldung/Registrierung'"
    :buttonColor="'green'"
    @closeModal="showModal = false"
    @pressedButton="authenticate()"
  ></Modal>
  <Modal
    :isOpen="showDeleteModal"
    :bodyText="'Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.'"
    :buttonText="'Konto löschen'"
    :headingText="'Konto löschen'"
    :buttonColor="'red'"
    @closeModal="showDeleteModal = false"
    @pressedButton="deleteAccount()"
  ></Modal>
  <Footer></Footer>
</template>

<script lang="ts">
import UserService from "@/services/UserService";
import {useUserSessionStore} from "@/stores/userSession";

export default {
  data() {
    return {
      userId: "",
      userEmail: "",
      idToken: "",
      showModal: false,
      showDeleteModal: false,
      loggedIn: false,
      projects: Array,
    };
  },
  // userService: null,
  projectService: null,
  created() {
    console.log("App created!");
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
  },
  methods: {
    onProjectCreated() {
    },
    openModal() {
      this.showModal = true;
    },
    openDeleteModal() {
      this.showDeleteModal = true;
    },
    deleteAccount() {
      console.log("deleteUser");
    try {
      // Call the deleteAccount() method from the OriginalClass
      userService.deleteUser(this.userId).then((data) => {
        this.logout();
      })
        .catch((error) => {});
      // this.logout();
    } catch (error) {
      console.error("Error occurred while deleting account.", error);
    }
      // this.logout();
    },
    logout() {
      localStorage.removeItem("remsfal/id_token");
      window.location.href = "./";
    },
  },
};
</script>

