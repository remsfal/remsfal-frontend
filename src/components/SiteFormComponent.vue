<script setup lang="ts">
import { ref } from 'vue';
import ReusableForm from '../components/ReusableFormComponent.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  siteId: string;
  headline: string;
  saveButtonText: string;
  cancelButtonText: string;
  onSubmit?: (formValues: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
}>();

type FieldType = 'select' | 'textarea' | 'text' | 'checkbox';

interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: unknown[];
  required?: boolean;
  validations?: ((value: unknown) => string | null)[];
}

const fields: Field[] = [
  {
    name: 'title',
    label: 'Titel',
    type: 'text',
    required: true,
    validations: [
      (value: unknown) =>
          typeof value === 'string' && value.length > 255
              ? 'Ein Titel darf nicht mehr als 255 Zeichen lang sein.'
              : null,
    ],
  },
  { name: 'description', label: 'Beschreibung', type: 'textarea' },
  {
    name: 'usableSpace',
    label: 'Nutzfläche (qm)',
    type: 'text',
    validations: [
      (value: unknown) => (!isNaN(Number(value)) ? null : 'Muss eine Zahl sein'),
    ],
  },
  { name: 'street', label: 'Straße und Hausnummer', type: 'text' },
  { name: 'city', label: 'Stadt', type: 'text' },
  { name: 'zip', label: 'PLZ', type: 'text' },
  { name: 'province', label: 'Bundesland', type: 'text' },
  { name: 'country', label: 'Land', type: 'text' },
];

const initialValues = ref<Record<string, unknown>>(props.initialValues ?? {
  title: '',
  description: '',
  usableSpace: '',
  street: '',
  city: '',
  zip: '',
  province: '',
  country: '',
});

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  period: string;
  price: number;
  deposit: number;
  extraCosts: number;
  email: string;
}

const items = ref<Tenant[]>([
  {
    id: 1,
    firstName: 'Lena',
    lastName: 'Schneider',
    period: '01.06.2025 - 11.06.2025',
    price: 125,
    deposit: 10,
    extraCosts: 13,
    email: 'lena.schneider@example.com',
  },
]);

const formerItems = ref<Tenant[]>([
  {
    id: 2,
    firstName: 'Tobias',
    lastName: 'Keller',
    period: '01.01.2023 - 31.12.2024',
    price: 120,
    deposit: 10,
    extraCosts: 12,
    email: 'tobias.keller@example.com',
  },
  {
    id: 3,
    firstName: 'Miriam',
    lastName: 'Fischer',
    period: '01.01.2021 - 31.12.2023',
    price: 115,
    deposit: 9,
    extraCosts: 12,
    email: 'miriam.fischer@example.com',
  },
]);

const showFormer = ref(false);
// Backend-Aufruf auskommentiert
/*
onMounted(async () => {
  const url = `/projects/${props.projectId}/sites/${props.siteId}/tenancies`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    items.value = data.current || [];
    formerItems.value = data.former || [];
  } catch {
    items.value = [];
    formerItems.value = [];
  }
});
*/

</script>

<template>
  <ReusableForm
      :fields="fields"
      :initialValues="initialValues"
      :headline="headline"
      :saveButtonText="saveButtonText"
      :cancelButtonText="cancelButtonText"
      :onSubmit="onSubmit"
      :onCancel="onCancel"
  />
  <div class="p-6 w-full mx-auto mt-10 shadow-lg bg-white rounded">
    <h2 class="text-xl font-bold mb-4">Aktuelle Mieter</h2>
    <DataTable :value="items" class="w-full mb-4">
      <Column field="id" header="ID" />
      <Column field="firstName" header="Vorname" />
      <Column field="lastName" header="Nachname" />
      <Column field="period" header="Zeitraum" />
<Column field="price" header="Preis">
  <template #body="{ data }">
    {{ data.price.toFixed(2) }} €
  </template>
</Column>

      <Column field="deposit" header="Anzahlung" />
      <Column field="extraCosts" header="Extra Kosten" />
      <Column field="email" header="E-Mail" />
    </DataTable>
    <Button
        icon="pi pi-chevron-down"
        class="mb-2"
        @click="showFormer = !showFormer"
        :aria-expanded="showFormer"
        :label="showFormer ? 'Ehemalige Mieter ausblenden' : 'Ehemalige Mieter anzeigen'"
    />
    <div v-if="showFormer" class="mt-4">
      <h2 class="text-xl font-bold mb-4">Ehemalige Mieter</h2>
      <DataTable :value="formerItems" class="w-full">
        <Column field="id" header="ID" />
        <Column field="firstName" header="Vorname" />
        <Column field="lastName" header="Nachname" />
        <Column field="period" header="Zeitraum" />
        <Column field="price" header="Preis" />
        <Column field="deposit" header="Anzahlung" />
        <Column field="extraCosts" header="Extra Kosten" />
        <Column field="email" header="E-Mail" />
      </DataTable>
    </div>
  </div>
</template>



