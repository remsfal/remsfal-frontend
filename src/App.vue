<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderMenu from "@/components/HeaderMenu.vue";
</script>

<template>
  <HeaderMenu :userEmail="userEmail"/>

  <RouterView @projectCreated="onProjectCreated"/>
</template>

<script lang="ts">
import AuthenticationService from "@/services/AuthenticationService";
import UserService from "@/services/UserService";
import ProjectService from "@/services/ProjectService";

export default {
  data() {
    return {
      userId: '',
      userEmail: '',
      accessToken: ''
    }
  },
  userService: null,
  projectService: null,
  authenticationService: AuthenticationService.getInstance(),
  created() {
    // authenticate with Google
    this.authenticationService = AuthenticationService.getInstance();
    this.accessToken = this.authenticationService.getAccessToken();
    // init backend services
    this.userService = new UserService(this.accessToken);
    this.projectService = new ProjectService();
    // update user info
    this.authenticationService.getUserId()
        .then(userId => {
          this.userId = userId;
          // authenticate at backend
          this.userService.authenticate(userId);
        });
    this.authenticationService.getUserEmail()
        .then(userEmail => this.userEmail = userEmail);
  },
  methods: {
    onProjectCreated() {
      console.log("Project created event");
    }
  }
};
</script>
