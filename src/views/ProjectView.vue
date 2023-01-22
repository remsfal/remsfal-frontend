<script setup lang="ts">
defineProps<{
  projectId: string
}>();
</script>

<template>
  <Sidebar v-model:visible="visibleLeft" modal="false" showCloseIcon="false">
    Content
    <Menu :model="items" />
  </Sidebar>

  <main>
  <div class="about">
    <h1>This is an example project {{ projectId }} page</h1>
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

<script lang="ts">
export default {
  data() {
    return {
      visibleLeft: true,
      items: [
        {
          label: 'Options',
          items: [{label: 'New', icon: 'pi pi-fw pi-plus', command:() => {} },
            {label: 'Delete', icon: 'pi pi-fw pi-trash', url: 'https://www.primetek.com.tr'}]
        },
        {
          label: 'Account',
          items: [{label: 'Options', icon: 'pi pi-fw pi-cog', to: '/options'},
            {label: 'Sign Out', icon: 'pi pi-fw pi-power-off', to: '/logout'} ]
        }
      ]
    }
  }
}
</script>