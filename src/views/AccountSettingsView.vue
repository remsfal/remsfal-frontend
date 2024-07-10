<script lang="ts">
import { useUserSessionStore } from "@/stores/UserSession";
import UserService from "@/services/UserService";
//import Modal from "@/components/LeoModal.vue";

export default {
  data() {
    return {
      userEmail: "",
    };
  },
  onMounted() {
    const sessionStore = useUserSessionStore();
    console.log(sessionStore);
    this.userEmail = sessionStore.user?.email!;
  },
  methods: {
    logout(): void {
      window.location.pathname = "/api/v1/authentication/logout";
    },
    deleteAccount() {
      const userService = new UserService();
      userService
        .deleteUser()
        .then(() => this.logout())
        .catch(() => console.error("Unable to delete this account!"));
    },
  },
};
</script>

<template>
  <div class="grid">
    <h1>This is ä account settings page for {{ userEmail }}</h1>
    <!--Modal
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
      ></Modal -->
  </div>
</template>

<style></style>
