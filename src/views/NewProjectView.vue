<script lang="ts">
import NewProjectForm from "@/components/NewProjectForm.vue";
import {defineComponent} from "vue";

export default defineComponent({
  components: {NewProjectForm}
})
</script>
<template>
  <div class="grid align-items-center justify-content-center">
    <div class="card flex mt-5">
      <NewProjectForm></NewProjectForm>
    </div>
  </div>
</template>
