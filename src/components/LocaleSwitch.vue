<script setup lang="ts">

</script>

<template>
  <div class="p-link layout-topbar-button">
    <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales">
      <template #value="slotProps">
        <img
          :alt="slotProps.value"
          style="width: 18px"
          :src="`/src/assets/flags/${slotProps.value}.png`"
        />
      </template>
      <template #option="slotProps">
        <img
          :alt="slotProps.option"
          style="width: 18px"
          :src="`/src/assets/flags/${slotProps.option}.png`"
        />
      </template>
    </Dropdown>
  </div>
</template>

<style scoped></style>
