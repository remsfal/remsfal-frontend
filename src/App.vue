<script setup lang="ts">
import {RouterView} from "vue-router";
import HeaderMenu from "@/components/HeaderMenu.vue";
import Modal from "@/components/LeoModal.vue";
</script>

<template>
  <HeaderMenu />
  <RouterView />
  <Modal
      :isOpen="showModal"
      :bodyText="'Durch die Anmeldung bzw. Registrierung stimmst Du unser Datenschutzerklärung zu.'"
      :linkText="'Datenschutzerklärung'"
      :linkHref="'/data-protection'"
      :buttonText="'Mit Google Anmelden'"
      :headingText="'Anmeldung/Registrierung'"
      :buttonColor="'green'"
      @closeModal="showModal = false"
  ></Modal>
  <Modal
      :isOpen="showDeleteModal"
      :bodyText="'Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.'"
      :buttonText="'Konto löschen'"
      :headingText="'Konto löschen'"
      :buttonColor="'red'"
      @closeModal="showDeleteModal = false"
  ></Modal>
</template>

<script lang="ts">
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
  created() {
    console.log("App created!");
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    openDeleteModal() {
      this.showDeleteModal = true;
    },
  },
};
</script>

