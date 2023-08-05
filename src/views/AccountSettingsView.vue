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
    this.$emit('deleteAccount');
  }
};
</script>

<template>
  <main>
  <div class="about">
    <h1>This is an account settings page for {{ this.userEmail }}</h1>

  </div>
  </main>
</template>

<style>
  .about {
  padding-top: 10%;
  }
@media (min-width: 1024px) {
  .about {
    color: #495057;

    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
