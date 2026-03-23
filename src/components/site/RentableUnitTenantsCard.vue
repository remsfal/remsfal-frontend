<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

import BaseCard from '@/components/common/BaseCard.vue';
import { currentTenants, formerTenants } from '@/mocks/tenants';

defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();

const items = ref([...currentTenants]);
const formerItems = ref([...formerTenants]);
const showFormer = ref(false);

/*
 * Backend-Aufruf auskommentiert, da das Backend noch nicht fertig ist.
 * Aktivieren, sobald /projects/{projectId}/sites/{siteId}/tenancies verfügbar ist.
 *
 * onMounted(async () => {
 *   const url = `/projects/${props.projectId}/sites/${props.unitId}/tenancies`;
 *   try {
 *     const res = await fetch(url);
 *     const data = await res.json();
 *     items.value = data.current || [];
 *     formerItems.value = data.former || [];
 *   } catch {
 *     items.value = [];
 *     formerItems.value = [];
 *   }
 * });
 */
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('site.tenants.cardTitle') }}
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <h3 class="font-medium">Aktuelle Mieter</h3>
        <DataTable :value="items" class="w-full">
          <Column field="id" header="ID" />
          <Column field="firstName" header="Vorname" />
          <Column field="lastName" header="Nachname" />
          <Column field="email" header="E-Mail" />
          <Column field="period" header="Zeitraum" />
          <Column field="price" header="Preis" />
          <Column field="deposit" header="Anzahlung" />
          <Column field="extraCosts" header="Extra Kosten" />
        </DataTable>

        <div>
          <Button
            icon="pi pi-chevron-down"
            :aria-expanded="showFormer"
            :label="showFormer ? 'Ehemalige Mieter ausblenden' : 'Ehemalige Mieter anzeigen'"
            @click="showFormer = !showFormer"
          />
        </div>

        <div v-if="showFormer">
          <h3 class="font-medium mb-2">Ehemalige Mieter</h3>
          <DataTable :value="formerItems" class="w-full">
            <Column field="id" header="ID" />
            <Column field="firstName" header="Vorname" />
            <Column field="lastName" header="Nachname" />
            <Column field="email" header="E-Mail" />
            <Column field="period" header="Zeitraum" />
            <Column field="price" header="Preis" />
            <Column field="deposit" header="Anzahlung" />
            <Column field="extraCosts" header="Extra Kosten" />
          </DataTable>
        </div>
      </div>
    </template>
  </BaseCard>
</template>
