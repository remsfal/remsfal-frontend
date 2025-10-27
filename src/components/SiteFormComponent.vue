<script setup lang="ts">
import { ref } from 'vue';
import ReusableForm from '../components/ReusableFormComponent.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { currentTenants, formerTenants } from '../mocks/tenants';
import type { Tenant } from '../mocks/tenants';

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
const items = ref<Tenant[]>([...currentTenants]);
const formerItems = ref<Tenant[]>([...formerTenants]);

enum FieldType {
  Select = 'select',
  Textarea = 'textarea',
  Text = 'text',
  Checkbox = 'checkbox',
}

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
    type: FieldType.Text,
    required: true,
    validations: [
      (value: unknown) =>
        typeof value === 'string' && value.length > 255
          ? 'Ein Titel darf nicht mehr als 255 Zeichen lang sein.'
          : null,
    ],
  },
  { name: 'description', label: 'Beschreibung', type: FieldType.Textarea },
  {
    name: 'usableSpace',
    label: 'Nutzfläche (qm)',
    type: FieldType.Text,
    validations: [
      (value: unknown) => (!isNaN(Number(value)) ? null : 'Muss eine Zahl sein'),
    ],
  },
  { name: 'street', label: 'Straße und Hausnummer', type: FieldType.Text },
  { name: 'city', label: 'Stadt', type: FieldType.Text },
  { name: 'zip', label: 'PLZ', type: FieldType.Text },
  { name: 'province', label: 'Bundesland', type: FieldType.Text },
  { name: 'country', label: 'Land', type: FieldType.Text },
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

const showFormer = ref(false);
// Backend-Aufruf auskommentiert, da das backend mit den Daten noch nicht fertig ist.
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
  <div class="p-6 max-w-4xl mx-auto mt-10 shadow-lg bg-white rounded">
    <h2 class="text-xl font-bold mb-4">
      Aktuelle Mieter
    </h2>
    <DataTable
      :value="items"
      class="w-full mb-4"
    >
      <Column
        field="id"
        header="ID"
      />
      <Column
        field="firstName"
        header="Vorname"
      />
      <Column
        field="lastName"
        header="Nachname"
      />
      <Column
        field="email"
        header="E-Mail"
      />
      <Column
        field="period"
        header="Zeitraum"
      />
      <Column
        field="price"
        header="Preis"
      />
      <Column
        field="deposit"
        header="Anzahlung"
      />
      <Column
        field="extraCosts"
        header="Extra Kosten"
      />
    </DataTable>
    <Button
      icon="pi pi-chevron-down"
      class="mb-2"
      :aria-expanded="showFormer"
      :label="showFormer ? 'Ehemalige Mieter ausblenden' : 'Ehemalige Mieter anzeigen'"
      @click="showFormer = !showFormer"
    />
    <div
      v-if="showFormer"
      class="mt-4"
    >
      <h2 class="text-xl font-bold mb-4">
        Ehemalige Mieter
      </h2>
      <DataTable
        :value="formerItems"
        class="w-full"
      >
        <Column
          field="id"
          header="ID"
        />
        <Column
          field="firstName"
          header="Vorname"
        />
        <Column
          field="lastName"
          header="Nachname"
        />
        <Column
          field="email"
          header="E-Mail"
        />
        <Column
          field="period"
          header="Zeitraum"
        />
        <Column
          field="price"
          header="Preis"
        />
        <Column
          field="deposit"
          header="Anzahlung"
        />
        <Column
          field="extraCosts"
          header="Extra Kosten"
        />
      </DataTable>
    </div>
  </div>
</template>




