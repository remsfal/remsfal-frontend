<script lang="ts">
export default {
  data() {
    return {
      project_title: "Just a Test"
    }
  }
}
</script>

<template>
  <main>
  <div class="about">
    <h1>This is an my contacts page and config is {{ project_title }}.</h1>
  </div>
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    color: #495057;
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
