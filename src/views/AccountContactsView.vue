<script>
export default {
  data() {
    const HOST = import.meta.env.VITE_BACKEND_HOST;
    return {
      project_title: import.meta.env.VITE_BACKEND_HOST
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
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
