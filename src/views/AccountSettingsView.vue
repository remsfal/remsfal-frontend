<script lang="ts">
import {useUserSessionStore} from "@/stores/UserSession";
import UserService from "@/services/UserService";

export default {
  data() {
    return {
      userEmail: ""
    }
  },
  onMounted() {
    const sessionStore = useUserSessionStore();
    this.userEmail = sessionStore.user?.email!;
  },
  methods: {
    logout(): void {
      window.location.pathname = "/api/v1/authentication/logout";
    },
    deleteAccount() {
      const userService = new UserService();
      userService.deleteUser()
          .then(() => this.logout())
          .catch(() => console.error("Unable to delete this account!"))
    },
  }
};
</script>

<template>
    <div class="grid">
    <h1>This is an account settings page for {{ userEmail }}</h1>

  </div>
</template>

<style>
</style>
