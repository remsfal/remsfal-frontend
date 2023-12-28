<script lang="ts">
export default {
  props: {
    projectId: String
  }
}
</script>

<template>
  <main>
    <div class="about">
      <h1>This is an my contacts page and config is {{ projectId }}.</h1>
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
