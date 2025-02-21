<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { useUserSessionStore } from '@/stores/UserSession';
import UserService, { type Address, type User } from '@/services/UserService';
import { computed, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const userProfile = ref({} as User); // Das gesamte Benutzerprofil
const editedUserProfile = ref({} as User);
const addressProfile = ref({} as Address);
const editedAddress = ref({} as Address);
const deleteAcc = ref(false); // Sichtbarkeit des Dialogs für Konto löschen
const changes = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);
const countries = ref([
  { name: 'Australia', code: 'AU' },
  { name: 'Brazil', code: 'BR' },
  { name: 'China', code: 'CN' },
  { name: 'Egypt', code: 'EG' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'India', code: 'IN' },
  { name: 'Japan', code: 'JP' },
  { name: 'Spain', code: 'ES' },
  { name: 'United States', code: 'US' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Bulgaria', code: 'BG' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Cyprus', code: 'CY' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Estonia', code: 'EE' },
  { name: 'Finland', code: 'FI' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hungary', code: 'HU' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Italy', code: 'IT' },
  { name: 'Latvia', code: 'LV' },
  { name: 'Lithuania', code: 'LT' },
  { name: 'Luxembourg', code: 'LU' },
  { name: 'Malta', code: 'MT' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Romania', code: 'RO' },
  { name: 'Slovakia', code: 'SK' },
  { name: 'Slovenia', code: 'SI' },
  { name: 'Sweden', code: 'SE' },
]);

const errorMessage = ref({
  firstname: '',
  lastname: '',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
  street: '',
  zip: '',
  city: '',
  province: '',
  countryCode: '',
});

onMounted(() => {
  const sessionStore = useUserSessionStore();
  userProfile.value.email = sessionStore.user?.email || ''; // Sicherstellen, dass userEmail initialisiert wird
  fetchUserProfile();
});

async function fetchUserProfile() {
  try {
    const userService = new UserService();
    const profile = await userService.getUser();
    if (profile) {
      userProfile.value = profile;
      editedUserProfile.value = { ...profile };
      if (userProfile.value.address) {
        addressProfile.value = userProfile.value.address;
        editedAddress.value = { ...userProfile.value.address };
      }
    }
  } catch (error) {
    console.error('Das Benutzerprofil konnte nicht gefunden werden', error);
  }
}

function getUpdatedValue(field: keyof User): string {
  const value = editedUserProfile.value?.[field] || userProfile.value?.[field];
  return typeof value === 'string' ? value : '';
}

function getUpdatedAddressValue(field: keyof Address): string {
  const value = editedAddress.value?.[field] || addressProfile.value?.[field];
  return typeof value === 'string' ? value : '';
}

async function saveProfile(): Promise<void> {
  try {
    const userService = new UserService();

    const user: Partial<User> = {
      id: userProfile.value?.id || '',
      firstName: getUpdatedValue('firstName'),
      businessPhoneNumber: getUpdatedValue('businessPhoneNumber'),
      lastName: getUpdatedValue('lastName'),
      mobilePhoneNumber: getUpdatedValue('mobilePhoneNumber'),
      privatePhoneNumber: getUpdatedValue('privatePhoneNumber'),
    };

    if (editedAddress.value && validateAddress(editedAddress.value)) {
      const address: Address = {
        street: getUpdatedAddressValue('street'),
        city: getUpdatedAddressValue('city'),
        zip: getUpdatedAddressValue('zip'),
        province: getUpdatedAddressValue('province'),
        countryCode: getUpdatedAddressValue('countryCode'),
      };
      user.address = address;
    }

    const updatedUser = await userService.updateUser(user);
    console.log('Benutzer erfolgreich aktualisiert:', updatedUser);
    saveSuccess.value = true;
  } catch (e) {
    console.error('Das Benutzerprofil konnte nicht geupdated werden!', e);
    alert('Fehler beim Aktualisieren des Benutzerprofils!');
    saveError.value = true;
  }
}

function validateAddress(address: Partial<Address>): boolean {
  return Object.values(address)
    .filter((value): value is string => typeof value === 'string')
    .every((value) => value.trim().length > 0);
}

function logout(): void {
  window.location.pathname = '/api/v1/authentication/logout';
}

function deleteAccount() {
  const userService = new UserService();
  userService
    .deleteUser()
    .then(() => logout())
    .catch(() => console.error('Das Benutzerprofil konnte nicht gelöscht werden!'));
}

// Reverts all changes made to the user and address profiles
function cancel() {
  editedUserProfile.value = { ...userProfile.value };
  editedAddress.value = { ...addressProfile.value };
  changes.value = false;
  Object.keys(errorMessage.value).forEach((key) => {
    errorMessage.value[key as keyof typeof errorMessage.value] = '';
  });
}

// Validates a specific field in the user or address profile based on its type and content.
// Uses regex patterns to enforce rules:
// - Default: Only allows alphabetic characters and spaces.
// - Street: Allows numbers, alphabetic characters, spaces, and certain symbols (.,-).
// Validates names and addresses for emptiness or incorrect format and validates phone numbers
// Updates the appropriate error message if validation fails.
// Also checks for any changes between the original and edited profiles to update `changes`.
function validateField(
  field: keyof User | keyof Address,
  type: 'name' | 'phone' | 'address',
  errorKey: keyof typeof errorMessage.value,
) {
  const value =
    field in editedUserProfile.value
      ? editedUserProfile.value[field as keyof User]
      : editedAddress.value[field as keyof Address];

  const regexMap = {
    default: /^[A-Za-zÄÖÜäöüß\s]+$/,
    street: /^(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/,
  };

  const regex = field === 'street' ? regexMap.street : regexMap.default;

  if ((type === 'name' || type === 'address') && typeof value === 'string') {
    if (!value || value.length === 0) {
      errorMessage.value[errorKey] = 'Bitte eingeben!';
    } else if (!regex.test(value)) {
      errorMessage.value[errorKey] = 'Eingabe bitte überprüfen!';
    } else {
      errorMessage.value[errorKey] = '';
    }
  } else {
    if (typeof value === 'string' && value.length > 0 && !/^\+?[1-9]\d{1,14}$/.test(value)) {
      errorMessage.value[errorKey] = 'Telefonnummer ist ungültig!';
    } else {
      errorMessage.value[errorKey] = '';
    }
  }

  changes.value = checkValues(
    userProfile.value,
    editedUserProfile.value,
    addressProfile.value,
    editedAddress.value,
  );
}

// Validates the entered country code by checking if it matches a known country.
// If no match is found an error indicating the country code is invalid will be displayed.
function updateCountryFromCode() {
  const matchingCountry = countries.value.find(
    (country) => country.code === editedAddress.value.countryCode.toUpperCase(),
  );

  if (!matchingCountry) {
    errorMessage.value.countryCode = 'Ungültiges Länderkürzel!';
  } else {
    editedAddress.value.countryCode = matchingCountry.code;
    errorMessage.value.countryCode = '';
  }
}

// Fetches city, province, and country code based on the entered zip code.
// Displays an error message if the zip code is invalid or the service call fails.
async function getCity() {
  const userService = new UserService();
  const address = await userService.getCityFromZip(editedAddress.value.zip);
  try {
    errorMessage.value.zip = 'Bitte eingeben!';
    if (address) {
      editedAddress.value.city = address[0].city;
      editedAddress.value.province = address[0].province;
      editedAddress.value.countryCode = address[0].countryCode;
      errorMessage.value.zip = '';
      errorMessage.value.city = '';
      errorMessage.value.province = '';
    }
  } catch (error) {
    console.log(error);
    errorMessage.value.zip = 'Postleitzahl bitte überprüfen!';
  }
}

// Determines if there are any changes between the original user and address profiles and their edited
// versions. Returns `true` if differences are detected, otherwise `false`.
function checkValues(
  userProfile: User,
  editedUserProfile: User,
  addressProfile: Address,
  editedAddress: Address,
): boolean {
  if (
    compareObjects(userProfile || {}, editedUserProfile || {}) &&
    compareObjects(addressProfile || {}, editedAddress || {})
  ) {
    return false;
  } else {
    return true;
  }
}

// Recursively compares two objects (User or Address) to check if they are identical.
// - Returns `true` if the objects have the same structure and identical values for all keys.
// - Returns `false` if the objects differ in keys or values.
function compareObjects(obj1: User | Address, obj2: User | Address): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof (User & Address)>;
  const keys2 = Object.keys(obj2) as Array<keyof (User & Address)>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !compareObjects(obj1[key as keyof typeof obj1], obj2[key as keyof typeof obj2])
    ) {
      return false;
    }
  }

  return true;
}

// Check if any error message is not empty to disable save button
const isDisabled = computed(() => {
  return Object.values(errorMessage.value).some((message) => message !== '');
});
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <h1>{{ t('accountSettings.title') }}</h1>
    <form>
      <div class="card-container">
        <Card>
          <template #title>
            <h4>{{ t('accountSettings.userProfile.title') }}</h4>
          </template>

          <template #content>
            <div>
              <div class="input-container">
                <label class="label" for="firstName">{{ t('accountSettings.userProfile.name') }}:</label>
                <InputText
                  id="firstName"
                  v-model="editedUserProfile.firstName"
                  required
                  :invalid="errorMessage.firstname !== ''"
                  @blur="validateField('firstName', 'name', 'firstname')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.firstname }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.firstname }}</Message
                >
              </div>

              <div class="input-container">
                <label class="label" for="lastName">Nachname*:</label>
                <InputText
                  id="lastName"
                  v-model="editedUserProfile.lastName"
                  required
                  :invalid="errorMessage.lastname !== ''"
                  @blur="validateField('lastName', 'name', 'lastname')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.lastname }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.lastname }}</Message
                >
              </div>

              <div class="input-container">
                <label class="label" for="eMail">E-Mail:</label>
                <InputText id="eMail" v-model="editedUserProfile.email" disabled required />
                <Message class="error" size="small" severity="error" variant="simple"></Message>
              </div>
              <div class="input-container">
                <label class="label" for="mobilePhoneNumber">Mobile Telefonnummer:</label>
                <InputText
                  id="mobilePhoneNumber"
                  v-model="editedUserProfile.mobilePhoneNumber"
                  :invalid="errorMessage.mobilePhoneNumber !== ''"
                  @blur="validateField('mobilePhoneNumber', 'phone', 'mobilePhoneNumber')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.mobilePhoneNumber }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.mobilePhoneNumber }}</Message
                >
              </div>
              <div class="input-container">
                <label class="label" for="businessPhoneNumber">Geschäftliche Telefonnummer:</label>
                <InputText
                  id="businessPhoneNumber"
                  v-model="editedUserProfile.businessPhoneNumber"
                  :invalid="errorMessage.businessPhoneNumber !== ''"
                  @blur="validateField('businessPhoneNumber', 'phone', 'businessPhoneNumber')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.businessPhoneNumber }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.businessPhoneNumber }}</Message
                >
              </div>

              <div class="input-container">
                <label class="label" for="privatePhoneNumber">Handynummer:</label>
                <InputText
                  id="privatePhoneNumber"
                  v-model="editedUserProfile.privatePhoneNumber"
                  :invalid="errorMessage.privatePhoneNumber !== ''"
                  @blur="validateField('privatePhoneNumber', 'phone', 'privatePhoneNumber')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.privatePhoneNumber }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.privatePhoneNumber }}</Message
                >
              </div>
            </div>
            <Message class="required" size="small" severity="secondary" variant="simple">*Pflichtfelder</Message>
          </template>
        </Card>
        <Card>
          <template #title>
            <h4>Meine Adresse</h4>
          </template>
          <template #content>
            <div>
              <div class="input-container">
                <label class="label" for="street">Straße und Hausnummer*:</label>
                <InputText
                  id="street"
                  v-model="editedAddress.street"
                  :invalid="errorMessage.street !== ''"
                  @blur="validateField('street', 'address', 'street')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.street }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.street }}</Message
                >
              </div>
              <div class="input-container">
                <label class="label" for="zip">Postleitzahl*:</label>
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
                  >{{ errorMessage.zip }}</Message
                >
              </div>
              <div class="input-container">
                <label class="label" for="zip">Stadt*:</label>
                <InputText
                  id="city"
                  v-model="editedAddress.city"
                  :invalid="errorMessage.city !== ''"
                  @blur="validateField('city', 'address', 'city')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.city }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.city }}</Message
                >
              </div>
              <div class="input-container">
                <label class="label" for="zip">Bundesland*:</label>
                <InputText
                  id="province"
                  v-model="editedAddress.province"
                  :invalid="errorMessage.province !== ''"
                  @blur="validateField('province', 'address', 'province')"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.province }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.province }}</Message
                >
              </div>
              <div class="input-container">
                <label for="country" class="label">Land*:</label>
                <select
                  id="country"
                  v-model="editedAddress.countryCode"
                  class="select-country"
                  @change="updateCountryFromCode"
                >
                  <option disabled value="">Land auswählen*</option>
                  <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                  </option>
                </select>
                <Message class="error" size="small" severity="error" variant="simple"></Message>
              </div>

              <div class="input-container">
                <label for="countryCode" class="label">Länderkürzel*:</label>
                <InputText
                  id="countryCode"
                  v-model="editedAddress.countryCode"
                  required
                  style="text-transform: uppercase"
                  :invalid="errorMessage.countryCode !== ''"
                  @input="updateCountryFromCode"
                />
                <Message
                  class="error"
                  :class="{ active: errorMessage.countryCode }"
                  size="small"
                  severity="error"
                  variant="simple"
                  >{{ errorMessage.countryCode }}</Message
                >
              </div>
            </div>
            <Message class="required" size="small" variant="simple">*Pflichtfelder</Message>
          </template>
        </Card>
      </div>
    </form>
    <div>
      <div>
        <div class="buttons-container centered-buttons">
          <Button
            v-if="changes"
            type="button"
            icon="pi pi-user-edit"
            class="save-button btn"
            label="Speichern"
            :disabled="isDisabled"
            @click="saveProfile"
          />
          <Button
            v-if="changes"
            type="button"
            icon="pi pi-times"
            class="cancel-button btn"
            label="Abbrechen"
            @click="cancel"
          />
          <Button
            type="button"
            icon="pi pi-trash"
            severity="danger"
            aria-label="Cancel"
            class="delete-button btn"
            label="Konto löschen"
            @click="deleteAcc = true"
          />
        </div>
        <div class="delete Button">
          <Dialog
            v-model:visible="deleteAcc"
            maximizable
            modal
            header=" "
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
          >
            <p>
              {{ t('accountSettings.delete.deleteWarning') }}
            </p>
            <div class="buttons-container centered-buttons">
              <Button
                type="button"
                icon="pi pi-trash"
                severity="danger"
                :aria-label="t('accountSettings.delete.confirmDelete')"
                :label="t('accountSettings.delete.confirmDelete')"
                class="delete-button"
                @click="deleteAccount"
              />
            </div>
          </Dialog>
        </div>
        <div class="saveSuccess">
          <Dialog
            v-model:visible="saveSuccess"
            maximizable
            modal
            header=" "
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
          >
            <p>Daten wurden erfolgreich gespeichert!</p>
          </Dialog>
        </div>
        <div class="saveError">
          <Dialog
            v-model:visible="saveError"
            maximizable
            modal
            header=" "
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
          >
            <p>Daten konnten nicht gespeichert werden!</p>
          </Dialog>
       </div>
      </div>
    </div>
  </div>
</template>

<style>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.card-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (width <= 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .buttons-container {
    grid-template-columns: 1fr;
  }
}

h1 {
  font-size: 24px;
}

p {
  font-size: 12px;
}

.btn {
  width: 150px;
}

input,
.select-country {
  padding: 6px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

.select-country:focus,
input:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 0.25);
}

.title {
  padding-bottom: 50px;
}

.buttons-container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: center;
  gap: 20px;
}

.select-country {
  box-sizing: border-box;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg fill="%23999" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')
    no-repeat right 10px center;
  background-color: white;
  background-size: 12px 12px;
}

.country-code {
  width: fit-content;
}

.is-invalid {
  border: 2px solid red;
}

.centered-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
}

input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 0.25);
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

.required {
  font-size: 10px;
  border: none;
}
</style>
