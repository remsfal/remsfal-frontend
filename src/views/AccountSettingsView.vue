<script lang="ts">
import {useUserSessionStore} from "@/stores/userSession";

export default {
  data() {
    return {
      userEmail: String
    }
  },
  onMounted() {
    const sessionStore = useUserSessionStore();
    this.userEmail = sessionStore.user?.email;
  },
};
</script>

<template>
  <main>
  <div class="about">
    <h1>This is an account settings page for {{ userEmail }}</h1>

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
