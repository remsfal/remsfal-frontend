<script setup lang="ts">
defineProps<{
  projectId: string;
}>();
</script>

<template>
  <main>
    <div v-if="isAuthorized" class="content-wrapper">
        <div class="project">
    <h1>{{ projectId }}</h1>
    <div class="property">
        <h2>Property 1</h2>
        <div class="site">
            <h3>Site 1</h3>
            <div class="apartment">
                <p>Apartment 1</p>
            </div>
            <div class="apartment">
                <p>Apartment 2</p>
            </div>
        </div>
        <div class="site">
            <h3>Site 2</h3>
            <div class="apartment">
                <p>Apartment 1</p>
            </div>
        </div>
    </div>
    <div class="property">
        <h2>Property 2</h2>
        <div class="site">
            <h3>Site 1</h3>
            <div class="apartment">
                <p>Apartment 1</p>
                <p>Garage 3</p>

            </div>
        </div>
    </div>

        </div>
        
      </div>

      <div v-else class="content-wrapper">
        <h1>You do not have the necessary rights to access this resource.</h1>
      </div>
  </main>
</template>

<style>
.content-wrapper {
  padding: 10%;
}
.project {
    
}

.property {
    
}

.site {

    
}

.apartment {
    
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
  },
  data() {
    return {
      visibleLeft: true,
      items: [
        /* menu items */
      ],
      project: null,
      isAuthorized: false,
    };
  },
  async created() {
    try {
      const projectService = new ProjectService(
        AuthenticationService.getInstance().getIdToken()
      );
      const project = await projectService.getProject(this.projectId);
      this.project = project;
      this.isAuthorized = true; // Update local data property, not the prop
    } catch (error) {
      console.error(`Failed to fetch the project: ${error}`);
      if (error === "403") {
        this.isAuthorized = false; // Update local data property, not the prop
      }
    }
  },
});
</script>
