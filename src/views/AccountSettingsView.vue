<script lang="ts">
import AuthenticationService from "@/services/AuthenticationService";
import UserService from "@/services/UserService";

export default {
  data() {
    return {
      userEmail: ''
    }
  },
  userService: null,
  created() {
    // init backend services
    this.userService = new UserService(AuthenticationService.getInstance().getAccessToken());
    console.log("Service initialized");
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
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
