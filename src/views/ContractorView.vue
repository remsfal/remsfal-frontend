<script setup lang="ts">
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import ContractorTable from '@/components/ContractorTable.vue';
import { contractorService, type Contractor } from '@/services/ContractorService';

const props = defineProps<{
  projectId: string;
}>();

const contractorTableRef = ref<InstanceType<typeof ContractorTable> | null>(null);

const showDialog = ref(false);
const isEditMode = ref(false);
const currentContractor = ref<Contractor | null>(null);

// ---------- Formular-Model ----------

type ContractorForm = {
  companyName: string;
  email: string;
  phone?: string;
  trade?: string;
  address: {
    street: string;
    city: string;
    province?: string;
    zip: string;
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

// ---------- Errors & Validation ----------

const globalError = ref<string | null>(null);
const showErrors = ref(false);

const normalize = (val?: string) => {
  const v = val?.trim();
  return v && v.length > 0 ? v : undefined;
};

// Pflichtfeld-Checks
const isCompanyValid = computed(() => !!form.value.companyName.trim());
const isEmailValid = computed(() => !!form.value.email.trim());
const isStreetValid = computed(() => !!form.value.address.street.trim());
const isZipValid = computed(() => !!form.value.address.zip.trim());
const isCityValid = computed(() => !!form.value.address.city.trim());

// Telefon: nur prüfen, wenn etwas eingetragen ist
const isPhoneValid = computed(() => {
  const phone = form.value.phone?.trim();
  if (!phone) return true;
  return /^\+?[0-9]{10,14}$/.test(phone);
});

const validate = (): boolean => {
  showErrors.value = true;
  globalError.value = null;

  const missing: string[] = [];

  if (!isCompanyValid.value) missing.push('Firma');
  if (!isEmailValid.value) missing.push('E-Mail');
  if (!isStreetValid.value) missing.push('Straße');
  if (!isZipValid.value) missing.push('PLZ');
  if (!isCityValid.value) missing.push('Ort');

  if (missing.length > 0) {
    globalError.value = `Bitte folgende Pflichtfelder ausfüllen: ${missing.join(', ')}.`;
    return false;
  }

  if (!isPhoneValid.value) {
    globalError.value =
        'Telefonnummer muss 10–14 Ziffern enthalten und darf optional mit + beginnen.';
    return false;
  }

  return true;
};

// ---------- Payload für Backend ----------

const buildPayload = (): Contractor => {
  if (!validate()) {
    throw new Error('invalid-form');
  }

  const f = form.value;
  const addr = f.address;

  // Pflichtfelder sind durch validate() garantiert gesetzt
  const street = addr.street.trim();
  const zip = addr.zip.trim();
  const city = addr.city.trim();

  // Province & CountryCode automatisch für Backend setzen
  let province = normalize(addr.province);
  if (!province) {
    province = city; // z.B. Berlin -> Province Berlin
  }

  let countryCode = normalize(addr.countryCode);
  if (!countryCode) {
    countryCode = 'DE';
  }

  const addressPayload = {
    street,
    city,
    province,
    zip,
    countryCode,
  };

  return {
    companyName: f.companyName.trim(),
    email: f.email.trim(),
    phone: normalize(f.phone),
    trade: normalize(f.trade),
    address: addressPayload,
  } as Contractor;
};

// ---------- Dialog-Handling ----------

const openCreateDialog = () => {
  isEditMode.value = false;
  currentContractor.value = null;
  form.value = createEmptyForm();
  globalError.value = null;
  showErrors.value = false;
  showDialog.value = true;
};

const openEditDialog = (contractor: Contractor) => {
  isEditMode.value = true;
  currentContractor.value = contractor;
  globalError.value = null;
  showErrors.value = false;

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
  globalError.value = null;
  showErrors.value = false;
};

// ---------- Speichern & Löschen ----------

const submitForm = async () => {
  try {
    if (!props.projectId) return;

    const payload = buildPayload(); // wirft 'invalid-form', wenn Pflichtfelder fehlen

    if (isEditMode.value && currentContractor.value?.id) {
      await contractorService.updateContractor(
          props.projectId,
          currentContractor.value.id,
          payload,
      );
    } else {
      await contractorService.createContractor(props.projectId, payload);
    }

    showDialog.value = false;
    contractorTableRef.value?.reload();
  } catch (err: any) {
    if (err?.message === 'invalid-form') {
      // Nur Frontend-Validation, kein Request wurde gesendet
      return;
    }
    console.error('Error saving contractor', err);
    globalError.value = 'Beim Speichern ist ein Fehler aufgetreten. Details in der Konsole.';
  }
};

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
    globalError.value = 'Beim Löschen ist ein Fehler aufgetreten. Details in der Konsole.';
  }
};
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
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

    <Dialog
        v-model:visible="showDialog"
        :header="isEditMode ? 'Auftragnehmer bearbeiten' : 'Neuen Auftragnehmer anlegen'"
        :modal="true"
        :style="{ width: '40rem' }"
    >
      <div class="flex flex-col gap-4 mt-2">
        <p v-if="globalError" class="text-red-600 text-sm">
          {{ globalError }}
        </p>

        <div class="text-xs text-gray-500 mb-1">
          <span class="text-red-500">*</span> kennzeichnet Pflichtfelder.
        </div>

        <!-- Stammdaten -->
        <div class="font-semibold text-sm text-gray-600">Stammdaten</div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">
            Firma <span class="text-red-500">*</span>
          </label>
          <InputText
              v-model="form.companyName"
              :class="{ 'p-invalid': showErrors && !isCompanyValid }"
          />
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              E-Mail <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.email"
                :class="{ 'p-invalid': showErrors && !isEmailValid }"
            />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              Telefon <span class="text-xs text-gray-500">(optional)</span>
            </label>
            <InputText
                v-model="form.phone"
                :class="{ 'p-invalid': showErrors && !isPhoneValid }"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">
            Gewerk <span class="text-xs text-gray-500">(optional)</span>
          </label>
          <InputText v-model="form.trade" />
        </div>

        <!-- Adresse -->
        <div class="border-t pt-3 font-semibold text-sm text-gray-600">
          Adresse
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">
            Straße <span class="text-red-500">*</span>
          </label>
          <InputText
              v-model="form.address.street"
              :class="{ 'p-invalid': showErrors && !isStreetValid }"
          />
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              PLZ <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.address.zip"
                :class="{ 'p-invalid': showErrors && !isZipValid }"
            />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              Ort <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.address.city"
                :class="{ 'p-invalid': showErrors && !isCityValid }"
            />
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              Bundesland / Region
              <span class="text-xs text-gray-500">(optional)</span>
            </label>
            <InputText v-model="form.address.province" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-medium">
              Ländercode (z. B. DE)
              <span class="text-xs text-gray-500">(optional, Standard DE)</span>
            </label>
            <InputText v-model="form.address.countryCode" />
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
