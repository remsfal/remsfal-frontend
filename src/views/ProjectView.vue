<script setup lang="ts">
defineProps<{
  projectId: string;
}>();
</script>

<template>
  <div v-if="authorized">
    <Sidebar v-model:visible="visibleLeft" modal="false" showCloseIcon="false">
      Content
      <Menu :model="items" />
    </Sidebar>

    <main>
      <div class="about">
        <h1>This is an example project {{ projectId }} page</h1>
      </div>
    </main>
  </div>
  <div v-else>
        <h1>You do not have the necessary rights to access this resource.</h1>


  </div>
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

<script lang="ts">
import { defineComponent } from "vue";
import ProjectService from "@/services/ProjectService";
import AuthenticationService from "@/services/AuthenticationService";

export default defineComponent({
  props: {
    projectId: {
      type: String,
      required: true,
    },
    authorized: {
      type: Boolean,
    },
  },
  data() {
    return {
      visibleLeft: true,
      items: [
        /* menu items */
      ],
      project: null,
      isAuthorized: this.authorized // Copy prop to local data property
    };
  },
  async created() {
    try {
      const projectService = new ProjectService(AuthenticationService.getInstance().getIdToken());
      const project = await projectService.getProject(this.projectId);
      this.project = project;
      this.isAuthorized = true; // Update local data property, not the prop

    } catch (error) {
      console.error(`Failed to fetch the project: ${error}`);
      if(error==='403'){
        this.isAuthorized = false; // Update local data property, not the prop
      }
    }
  },
});

</script>
