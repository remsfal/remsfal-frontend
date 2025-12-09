<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import ContractorTable from '@/components/ContractorTable.vue';
import { contractorService, type Contractor } from '@/services/ContractorService';

const props = defineProps<{
  projectId: string;
}>();

// Referenz auf die Tabelle, damit wir nach Create/Update/Delete neu laden können
const contractorTableRef = ref<InstanceType<typeof ContractorTable> | null>(null);

// Dialog-Status
const showDialog = ref(false);
const isEditMode = ref(false);

// aktuell bearbeiteter Contractor (bei Edit/Delete)
const currentContractor = ref<Contractor | null>(null);

// Formular-Typ passend zu ContractorJson & AddressJson
type ContractorForm = {
  companyName: string;
  email?: string;
  phone?: string;
  trade?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zip?: string;
    countryCode?: string;
  };
};

const createEmptyForm = (): ContractorForm => ({
  companyName: '',
  email: '',
  phone: '',
  trade: '',
  address: {
    street: '',
    city: '',
    province: '',
    zip: '',
    countryCode: '',
  },
});

const form = ref<ContractorForm>(createEmptyForm());

// Hilfsfunktion: leere Strings zu undefined machen
const normalize = (value?: string) => {
  const v = value?.trim();
  return v && v.length > 0 ? v : undefined;
};

const buildPayload = (): Contractor => {
  const f = form.value;
  const addr = f.address ?? {};

  const normalizedAddress = {
    street: normalize(addr.street),
    city: normalize(addr.city),
    province: normalize(addr.province),
    zip: normalize(addr.zip),
    countryCode: normalize(addr.countryCode),
  };

  let hasAddress = Object.values(normalizedAddress).some((v) => v !== undefined);

  // Workaround für Backend: Wenn irgendeine Adresse da ist, brauchen wir ein Land.
  if (hasAddress && !normalizedAddress.countryCode) {
    normalizedAddress.countryCode = 'DE';
  }

  // nach Default ggf. nochmal prüfen (theoretisch nicht nötig, aber sauber)
  hasAddress = Object.values(normalizedAddress).some((v) => v !== undefined);

  return {
    companyName: (f.companyName || '').trim(),
    email: normalize(f.email) as string | undefined,
    phone: normalize(f.phone) as string | undefined,
    trade: normalize(f.trade) as string | undefined,
    ...(hasAddress ? { address: normalizedAddress } : {}),
  } as Contractor;
};


// Dialog öffnen: Neuer Auftragnehmer
const openCreateDialog = () => {
  isEditMode.value = false;
  currentContractor.value = null;
  form.value = createEmptyForm();
  showDialog.value = true;
};

// Dialog öffnen: Bearbeiten
const openEditDialog = (contractor: Contractor) => {
  isEditMode.value = true;
  currentContractor.value = contractor;
  form.value = {
    companyName: contractor.companyName ?? '',
    email: contractor.email ?? '',
    phone: contractor.phone ?? '',
    trade: contractor.trade ?? '',
    address: {
      street: contractor.address?.street ?? '',
      city: contractor.address?.city ?? '',
      province: contractor.address?.province ?? '',
      zip: contractor.address?.zip ?? '',
      countryCode: contractor.address?.countryCode ?? '',
    },
  };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

// Speichern (Create oder Update)
const submitForm = async () => {
  try {
    if (!props.projectId) return;

    const payload = buildPayload();

    if (isEditMode.value && currentContractor.value?.id) {
      await contractorService.updateContractor(
          props.projectId,
          currentContractor.value.id,
          payload,
      );
    } else {
      await contractorService.createContractor(
          props.projectId,
          payload,
      );
    }

    showDialog.value = false;
    contractorTableRef.value?.reload();
  } catch (err) {
    console.error('Error saving contractor', err);
  }
};

// Löschen
const deleteContractor = async (contractor: Contractor) => {
  if (!props.projectId || !contractor.id) return;

  const confirmed = window.confirm(
      `Auftragnehmer "${contractor.companyName}" wirklich löschen?`,
  );
  if (!confirmed) return;

  try {
    await contractorService.deleteContractor(props.projectId, contractor.id);
    contractorTableRef.value?.reload();
  } catch (err) {
    console.error('Error deleting contractor', err);
  }
};
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <!-- Header-Card -->
      <div class="col-span-12">
        <div class="card flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Auftragnehmer Ansicht</h2>
          <Button
              label="Neuen Auftragnehmer hinzufügen"
              icon="pi pi-plus"
              @click="openCreateDialog"
          />
        </div>
      </div>

      <!-- Tabelle -->
      <div class="col-span-12">
        <div class="card">
          <ContractorTable
              ref="contractorTableRef"
              :projectId="props.projectId"
              @edit="openEditDialog"
              @delete="deleteContractor"
          />
        </div>
      </div>
    </div>

    <!-- Dialog für Neu / Bearbeiten -->
    <Dialog
        v-model:visible="showDialog"
        :header="isEditMode ? 'Auftragnehmer bearbeiten' : 'Neuen Auftragnehmer anlegen'"
        :modal="true"
        :style="{ width: '40rem' }"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-1">
          <label class="font-medium">Firma *</label>
          <InputText v-model="form.companyName" />
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">E-Mail</label>
            <InputText v-model="form.email" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">Telefon</label>
            <InputText v-model="form.phone" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">Gewerk</label>
          <InputText v-model="form.trade" />
        </div>

        <div class="border-t pt-3 text-sm font-semibold">
          Adresse (optional)
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">Straße</label>
          <InputText v-model="form.address!.street" />
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">PLZ</label>
            <InputText v-model="form.address!.zip" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">Ort</label>
            <InputText v-model="form.address!.city" />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">Bundesland / Region</label>
            <InputText v-model="form.address!.province" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">Ländercode (z. B. DE)</label>
            <InputText v-model="form.address!.countryCode" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
            label="Abbrechen"
            severity="secondary"
            @click="closeDialog"
        />
        <Button
            :label="isEditMode ? 'Speichern' : 'Anlegen'"
            @click="submitForm"
        />
      </template>
    </Dialog>
  </main>
</template>
