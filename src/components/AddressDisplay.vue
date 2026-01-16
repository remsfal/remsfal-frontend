<script setup lang="ts">
import AddressService from '@/services/AddressService';
import UserService, { type UserUpdateRequest } from '@/services/UserService';
import type {paths} from '@/services/api/platform-schema';
import { ref, computed, onMounted, watch } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { COUNTRIES } from '@/constants/countries';

const { t } = useI18n();

type AddressListResponse = paths['/api/v1/address']['get']['responses'][200]['content']['application/json'];
type Address = AddressListResponse extends Array<infer U> ? U : never;

const addressProfile = ref<Address | null>(null);
const editedAddress = ref<Partial<Address>>({});
const toast = useToast();

const changes = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);
const countries = ref(COUNTRIES);

const emptyAddress: Address = {
  street: '',
  zip: '',
  city: '',
  province: '',
  countryCode: ''
};

const errorMessage = ref<{
  street?: string;
  zip?: string;
  city?: string;
  province?: string;
  countryCode?: string;
}>({
  street: '',
  zip: '',
  city: '',
  province: '',
  countryCode: ''
});

onMounted(async () => {
  if (!addressProfile.value) {
    addressProfile.value = {};
  }

  fetchAddress();
});

// Lade Adresse aus dem User-Objekt
async function fetchAddress() {
  try {
    const userService = new UserService();
    const user = await userService.getUser();
    
    if (user?.address) {
      addressProfile.value = user.address;
      editedAddress.value = { ...user.address };
    } else { // wenn noch keine Adresse vorhanden ist, leeres Objekt initialisieren
      addressProfile.value = { ...emptyAddress};
      editedAddress.value = { ...emptyAddress };
    }
  } catch (error) {
    console.error('Die Adresse konnte nicht gefunden werden', error);
  }
}

function getUpdatedAddressValue(field: keyof Address): string {
  const value =
    (editedAddress.value as Record<keyof Address, unknown>)?.[field] ??
    (addressProfile.value as Record<keyof Address, unknown>)?.[field];
  return typeof value === 'string' ? value : '';
}

// Speichert die bearbeitete Adresse über den UserService
async function saveAddress() {
  try {
    const userService = new UserService();
    
    if (editedAddress.value && validateAddress(editedAddress.value)) {
      const address: Address = {
        street: getUpdatedAddressValue('street'),
        city: getUpdatedAddressValue('city'),
        zip: getUpdatedAddressValue('zip'),
        province: getUpdatedAddressValue('province'),
        countryCode: getUpdatedAddressValue('countryCode'),
      } as Address;

      await userService.updateUser({ address } as UserUpdateRequest);
      console.log('Adresse erfolgreich aktualisiert:', address);
      addressProfile.value = address;
      editedAddress.value = { ...address };
      changes.value = false;
      saveSuccess.value = true;
    }
  } catch (e) {
    console.error('Fehler beim Aktualisieren der Adresse:', e);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('error.savingAddress'),
      life: 4000,
    });
    saveError.value = true;
  }
}

function validateAddress(address: Partial<Address>): boolean {
  return Object.values(address)
    .filter((value): value is string => typeof value === 'string')
    .every((value) => value.trim().length > 0);
}

function cancel() {
  editedAddress.value = { ...addressProfile.value };
  changes.value = false;
  Object.keys(errorMessage.value).forEach((key) => {
    errorMessage.value[key as keyof typeof errorMessage.value] = '';
  });
}

function validateField(field: keyof Address, errorKey: keyof typeof errorMessage.value) {
  const value = editedAddress.value?.[field as keyof Address];

  const regexMap = {
    default: /^[A-Za-zÄÖÜäöüß\s-]+$/,
    street: /^(?=.*[A-Za-zÄÖÜäöüß])(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/,
  };

  const regex = field === 'street' ? regexMap.street : regexMap.default;

  if (!value || (typeof value === 'string' && value.length === 0)) {
    errorMessage.value[errorKey] = 'Bitte eingeben!';
  } else if (typeof value === 'string' && !regex.test(value)) {
    errorMessage.value[errorKey] = 'Eingabe bitte überprüfen!';
  } else {
    errorMessage.value[errorKey] = '';
  }

  if (addressProfile.value && editedAddress.value) {
    changes.value = checkValues(
      addressProfile.value,
      editedAddress.value as Address,
    );
  } else {
    changes.value = false;
  }
}

// Validates the entered country code by checking if it matches a known country.
// If no match is found an error indicating the country code is invalid will be displayed.
function updateCountryFromCode() {
  const code = editedAddress.value?.countryCode?.toUpperCase();

  if (!code) {
    errorMessage.value.countryCode = 'Ungültiges Länderkürzel!';
    return;
  }

  const matchingCountry = countries.value.find(
    (country) => country.code === code,
  );

  if (matchingCountry) {
    editedAddress.value.countryCode = matchingCountry.code;
    errorMessage.value.countryCode = '';
  } else {
    errorMessage.value.countryCode = 'Ungültiges Länderkürzel!';
  }
}

// Fetches city, province, and country code based on the entered zip code.
// Displays an error message if the zip code is invalid or the service call fails.
async function getCity() {
  const addressService = new AddressService();

  const zip = editedAddress.value.zip;
  if (!zip) {
    errorMessage.value.zip = 'Bitte geben Sie eine Postleitzahl ein!';
    return;
  }

  try {
    errorMessage.value.zip = 'Bitte eingeben!';

    const address = await addressService.getCityFromZip(zip);

    if (address && address.city) {
      editedAddress.value.city = address.city;
      editedAddress.value.province = address.province;
      editedAddress.value.countryCode = address.countryCode;
      errorMessage.value.zip = '';
      errorMessage.value.city = '';
      errorMessage.value.province = '';
      
      // Update changes after automatic address update
      if (addressProfile.value && editedAddress.value) {
        changes.value = checkValues(
          addressProfile.value,
          editedAddress.value as Address,
        );
      }
    }
  } catch (error) {
    console.log(error);
    errorMessage.value.zip = 'Postleitzahl bitte überprüfen!';
  }
}

// gibt zurück, ob es Änderungen zwischen der gespeicherten und der bearbeiteten Adresse gibt
function checkValues(
  addressProfile: Address,
  editedAddress: Address,
): boolean {
  return !compareObjects(addressProfile || {}, editedAddress || {});
}

watch(changes, (val) => {
  if (val) {
    saveSuccess.value = false;
    saveError.value = false;
  }
});

// Vergleicht zwei Objekte rekursiv auf Gleichheit und gibt Wahrheitswert zurück
function compareObjects(obj1: Address, obj2: Address): boolean {
  // Schneller Vergleich auf Referenzgleichheit oder primitive Gleichheit
  if (obj1 === obj2) {
    return true;
  }
  // Wenn einer der Werte null ist, ist nur Gleichheit bei beiden null erlaubt
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }
  // Wenn einer der Werte kein Objekt ist, vergleiche direkt
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    // Hier landen primitive Werte (string, number, boolean, etc.)
    return obj1 === obj2;
  }
  const keys1 = Object.keys(obj1) as Array<keyof Address>;
  const keys2 = Object.keys(obj2) as Array<keyof Address>;
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    const val1 = obj1[key] as unknown;
    const val2 = obj2[key] as unknown;
    const bothAreObjects =
      typeof val1 === 'object' &&
      val1 !== null &&
      typeof val2 === 'object' &&
      val2 !== null;
    if (bothAreObjects) {
      if (!compareObjects(val1 as Address, val2 as Address)) {
        return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

const isDisabled = computed(() => {
  return Object.values(errorMessage.value).some((message) => message !== '');
});
</script>

<template>
  <Card>
    <template #title>
      <h4>{{ t('accountSettings.address.title') }}</h4>
    </template>
    <template #content>
      <div>
        <div class="input-container">
          <label class="label" for="street">{{ t('accountSettings.address.street') }}*:</label>
          <InputText
            id="street"
            v-model="editedAddress.street"
            :invalid="errorMessage.street !== ''"
            @blur="validateField('street', 'street')"
          />
          <Message
            class="error"
            :class="{ active: errorMessage.street }"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ errorMessage.street }}
          </Message>
        </div>
        <div class="input-container">
          <label class="label" for="zip">{{ t('accountSettings.address.zip') }}*:</label>
          <InputText
            id="zip"
            v-model="editedAddress.zip"
            :invalid="errorMessage.zip !== ''"
            @blur="getCity()"
          />
          <Message
            class="error"
            :class="{ active: errorMessage.zip }"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ errorMessage.zip }}
          </Message>
        </div>
        <div class="input-container">
          <label class="label" for="city">{{ t('accountSettings.address.city') }}*:</label>
          <InputText
            id="city"
            v-model="editedAddress.city"
            :invalid="errorMessage.city !== ''"
            @blur="validateField('city', 'city')"
          />
          <Message
            class="error"
            :class="{ active: errorMessage.city }"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ errorMessage.city }}
          </Message>
        </div>
        <div class="input-container">
          <label class="label" for="province">{{ t('accountSettings.address.province') }}*:</label>
          <InputText
            id="province"
            v-model="editedAddress.province"
            :invalid="errorMessage.province !== ''"
            @blur="validateField('province', 'province')"
          />
          <Message
            class="error"
            :class="{ active: errorMessage.province }"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ errorMessage.province }}
          </Message>
        </div>
        <div class="input-container">
          <label class="label" for="countryCode">{{ t('accountSettings.address.country') }}*:</label>
          <InputText
            id="countryCode"
            v-model="editedAddress.countryCode"
            :invalid="errorMessage.countryCode !== ''"
            @blur="updateCountryFromCode()"
          />
          <Message
            class="error"
            :class="{ active: errorMessage.countryCode }"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ errorMessage.countryCode }}
          </Message>
        </div>

        <Message class="required" size="small" severity="secondary" variant="simple">
          {{ t('accountSettings.userProfile.requiredFields') }}
        </Message>
      </div>
    </template>
    <template #footer>
      <div class="buttons-container">
        <Button
          v-if="changes"
          label="Speichern"
          icon="pi pi-save"
          class="save-button"
          :disabled="isDisabled"
          @click="saveAddress()"
        />
        <Button
          v-if="changes"
          label="Abbrechen"
          icon="pi pi-times"
          severity="secondary"
          class="cancel-button"
          @click="cancel()"
        />
      </div>
      <Message v-if="saveSuccess" severity="success">
        Das Speichern der Adresse war erfolgreich!
      </Message>
      <Message v-if="saveError" severity="error">
        Das Speichern der Adresse war leider nicht erfolgreich
      </Message>
    </template>
  </Card>
</template>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.buttons-container {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.required {
  font-size: 0.75rem;
  margin-top: 1rem;
}

.error {
  margin-top: 0.5rem;
  font-size: 10px;
  color: red;
  height: 1rem;
  visibility: hidden;
  border: none;
}

.error.active {
  visibility: visible;
}
</style>