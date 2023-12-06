<template>
  <footer class="footer">
    <div class="container">
      <div class="content has-text-centered">
        <p>
          <router-link to="/imprint">Impressum</router-link> |
          <router-link to="/data-protection">Datenschutzerklärung</router-link>
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
}
</script>

<style scoped>
.footer {
  background-color: rgb(248, 249, 250);
  padding: 20px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.container {
  display: flex;
  justify-content: center;
}
</style>
