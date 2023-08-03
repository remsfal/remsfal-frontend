<script lang="ts">
import AuthenticationService from "@/services/AuthenticationService";
import UserService from "@/services/UserService";
import Modal from '@/components/Modal.vue';


export default {
  data() {
    return {
      userEmail: '',
      showModal: true,
    }
  },
  userService: null,
  async created() {
    // init backend services
    this.userService = await new UserService(AuthenticationService.getInstance().getIdToken());
    this.userEmail = await
    AuthenticationService.getInstance().getUserEmail();
  },
  deleteAccount(){
    console.log('deleteUSer');
  }
};
</script>

<template>
  <main>
  <div class="about">
    <h1>This is an account settings page for {{ this.userEmail }}</h1>

    <button @click="showModal=true" class="button red">Delete Account</button>
  <Modal
    :isOpen="showModal"
    :bodyText="'Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.'"
    :buttonText="'Konto löschen'"
    :headingText="'Konto löschen'"
    @closeModal="showModal = false"
    @pressedButton="deleteAccount()"
  ></Modal>

  </div>
  </main>
</template>

<style>
  .about {
  padding-top: 10%;
  }
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
