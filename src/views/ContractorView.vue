<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
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

const isCompanyValid = computed(() => !!form.value.companyName.trim());
const isEmailValid = computed(() => !!form.value.email.trim());
const isStreetValid = computed(() => !!form.value.address.street.trim());
const isZipValid = computed(() => !!form.value.address.zip.trim());
const isCityValid = computed(() => !!form.value.address.city.trim());

// Hilfstypen für Fehler-Handling
type ErrorWithResponse = {
  response?: {
    status?: number;
  };
};

const isErrorWithMessage = (e: unknown): e is { message: string } =>
    typeof (e as { message?: unknown }).message === 'string';

// Telefon: nur prüfen, wenn etwas eingetragen ist
const isPhoneValid = computed(() => {
  const phone = form.value.phone?.trim();
  if (!phone) return true;
  return /^\+?\d{10,14}$/.test(phone);
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
    globalError.value =
        'Bitte folgende Pflichtfelder ausfüllen: ' + missing.join(', ') + '.';
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

  const street = addr.street.trim();
  const zip = addr.zip.trim();
  const city = addr.city.trim();

  // Province & CountryCode automatisch für Backend setzen
  let province = normalize(addr.province);
  if (!province) {
    province = city;
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

    let payload = buildPayload();

    if (isEditMode.value && currentContractor.value?.id) {
      payload = {
        ...payload,
        id: currentContractor.value.id,
      } as Contractor;

      await contractorService.updateContractor(
          props.projectId,
          currentContractor.value.id,
          payload
      );
    } else {
      await contractorService.createContractor(props.projectId, payload);
    }

    showDialog.value = false;
    globalError.value = null;
    showErrors.value = false;
    contractorTableRef.value?.reload();
  } catch (err: unknown) {
    console.error('Error saving contractor', err);

    if (isErrorWithMessage(err) && err.message === 'invalid-form') {
      return;
    }

    const status = (err as ErrorWithResponse).response?.status;

    if (status === 400) {
      globalError.value =
          'Die eingegebene Adresse wurde vom Backend als ungültig abgelehnt. ' +
          'Bitte prüfen Sie Straße, PLZ, Ort und den Ländercode.';
    } else {
      globalError.value =
          'Beim Speichern ist ein Fehler aufgetreten. Details in der Konsole.';
    }
  }
};

const deleteContractor = async (contractor: Contractor) => {
  if (!props.projectId || !contractor.id) return;

  const hasConfirm = typeof globalThis.confirm === 'function';
  const confirmed = hasConfirm
      ? globalThis.confirm(
          `Auftragnehmer "${contractor.companyName}" wirklich löschen?`
      )
      : false;

  if (!confirmed) return;

  try {
    await contractorService.deleteContractor(props.projectId, contractor.id);
    contractorTableRef.value?.reload();
  } catch (err: unknown) {
    console.error('Error deleting contractor', err);
    globalError.value =
        'Beim Löschen ist ein Fehler aufgetreten. Details in der Konsole.';
  }
};
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <Card class="w-full">
          <template #title>
            <div
                class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div class="text-xl font-semibold">
                  Auftraggeber &amp; Dienstleister
                </div>
                <div class="text-sm text-gray-500">
                  Verwalte hier externe Firmen, die für dieses Projekt beauftragt
                  werden können.
                </div>
              </div>
              <Button
                  label="Neuen Auftragnehmer hinzufügen"
                  icon="pi pi-plus"
                  @click="openCreateDialog"
              />
            </div>
          </template>
        </Card>
      </div>

      <div class="col-span-12">
        <Card class="w-full">
          <template #title>
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold">Übersicht</span>
            </div>
          </template>
          <template #content>
            <ContractorTable
                ref="contractorTableRef"
                :projectId="props.projectId"
                @edit="openEditDialog"
                @delete="deleteContractor"
            />
          </template>
        </Card>
      </div>
    </div>

    <Dialog
        v-model:visible="showDialog"
        :header="isEditMode ? 'Auftragnehmer bearbeiten' : 'Neuen Auftragnehmer anlegen'"
        modal
        :style="{ width: '42rem' }"
    >
      <div class="flex flex-col gap-4 mt-2">
        <p v-if="globalError" class="text-red-600 text-sm">
          {{ globalError }}
        </p>

        <p class="text-xs text-gray-500 mb-1">
          <span class="text-red-500">*</span> kennzeichnet Pflichtfelder.
        </p>

        <div class="border-b pb-2">
          <h4 class="font-semibold text-sm text-gray-700">
            Stammdaten
          </h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="font-medium" for="companyName">
              Firma <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.companyName"
                inputId="companyName"
                :class="{ 'p-invalid': showErrors && !isCompanyValid }"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium" for="email">
              E-Mail <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.email"
                inputId="email"
                :class="{ 'p-invalid': showErrors && !isEmailValid }"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium" for="phone">
              Telefon <span class="text-xs text-gray-500">(optional)</span>
            </label>
            <InputText
                v-model="form.phone"
                inputId="phone"
                :class="{ 'p-invalid': showErrors && !isPhoneValid }"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium" for="trade">
              Gewerk <span class="text-xs text-gray-500">(optional)</span>
            </label>
            <InputText
                v-model="form.trade"
                inputId="trade"
            />
          </div>
        </div>

        <div class="border-b pt-2 pb-2">
          <h4 class="font-semibold text-sm text-gray-700">
            Adresse
          </h4>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-1">
            <label class="font-medium" for="street">
              Straße <span class="text-red-500">*</span>
            </label>
            <InputText
                v-model="form.address.street"
                inputId="street"
                :class="{ 'p-invalid': showErrors && !isStreetValid }"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="zip">
                PLZ <span class="text-red-500">*</span>
              </label>
              <InputText
                  v-model="form.address.zip"
                  inputId="zip"
                  :class="{ 'p-invalid': showErrors && !isZipValid }"
              />
            </div>

            <div class="flex flex-col gap-1 md:col-span-2">
              <label class="font-medium" for="city">
                Ort <span class="text-red-500">*</span>
              </label>
              <InputText
                  v-model="form.address.city"
                  inputId="city"
                  :class="{ 'p-invalid': showErrors && !isCityValid }"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="province">
                Bundesland / Region
                <span class="text-xs text-gray-500">(optional)</span>
              </label>
              <InputText
                  v-model="form.address.province"
                  inputId="province"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-medium" for="countryCode">
                Ländercode (z. B. DE)
                <span class="text-xs text-gray-500">
                  (optional, Standard DE)
                </span>
              </label>
              <InputText
                  v-model="form.address.countryCode"
                  inputId="countryCode"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between w-full">
          <span class="text-xs text-gray-500 self-center">
            Pflichtfelder müssen ausgefüllt sein, bevor gespeichert werden kann.
          </span>

          <div class="flex gap-2">
            <Button
                label="Abbrechen"
                severity="secondary"
                @click="closeDialog"
            />
            <Button
                :label="isEditMode ? 'Speichern' : 'Anlegen'"
                @click="submitForm"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </main>
</template>
