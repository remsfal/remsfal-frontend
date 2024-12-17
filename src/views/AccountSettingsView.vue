<script setup lang="ts">
import { useUserSessionStore } from '@/stores/UserSession';
import UserService, { type User, type Address } from '@/services/UserService';
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';

const userProfile = ref({} as User); // Das gesamte Benutzerprofil
const editedUserProfile = ref({} as User);
const addressProfile = ref({} as Address);
const editedAddress = ref({} as Address);
const visible = ref(false); // Sichtbarkeit des Dialogs für Konto löschen
const changes = ref(false);
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
    const profile = await userService.getUser(); // Ruft das Benutzerprofil vom Server ab
    if (profile) {
      userProfile.value = profile; // Speichert das gesamte Benutzerprofil
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

    // Zusammenstellen des aktualisierten Benutzerobjekts
    const user: Partial<User> = {
      id: userProfile.value?.id || '',
      firstName: getUpdatedValue('firstName'),
      businessPhoneNumber: getUpdatedValue('businessPhoneNumber'),
      lastName: getUpdatedValue('lastName'),
      mobilePhoneNumber: getUpdatedValue('mobilePhoneNumber'),
      privatePhoneNumber: getUpdatedValue('privatePhoneNumber'),
    };

    // Optional: Adresse hinzufügen, falls sie valide ist
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
  } catch (e) {
    console.error('Das Benutzerprofil konnte nicht geupdated werden!', e);
    alert('Fehler beim Aktualisieren des Benutzerprofils!');
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

function cancel() {
  editedUserProfile.value = { ...userProfile.value };
  editedAddress.value = { ...addressProfile.value };
  changes.value = false;
  Object.keys(errorMessage.value).forEach((key) => {
    errorMessage.value[key as keyof typeof errorMessage.value] = '';
  });
}

function validateField(
  field: keyof User | keyof Address,
  type: 'name' | 'phone' | 'address',
  errorKey: keyof typeof errorMessage.value,
) {
  // Wähle das Feld entweder aus `editedUserProfile` oder `editedAddress`
  const value =
    field in editedUserProfile.value
      ? editedUserProfile.value[field as keyof User]
      : editedAddress.value[field as keyof Address];

  const regexMap = {
    default: /^[A-Za-zÄÖÜäöüß\s]+$/,
    street: /^[A-Za-zÄÖÜäöüß0-9\s.,\-/]+$/,
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

function updateCountryFromCode() {
  const matchingCountry = countries.value.find(
    (country) => country.code === editedAddress.value.countryCode.toUpperCase(),
  );

  if (!matchingCountry) {
    errorMessage.value.countryCode = 'Ungültiges Länderkürzel!';
  } else {
    editedAddress.value.countryCode = matchingCountry.code; // Kein Fehler
  }
}

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

function compareObjects(obj1: User | Address, obj2: User | Address): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof (User & Address)>;
  const keys2 = Object.keys(obj2) as Array<keyof (User & Address)>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    // Use optional chaining for safety
    if (
      !keys2.includes(key) ||
      !compareObjects(obj1[key as keyof typeof obj1], obj2[key as keyof typeof obj2])
    ) {
      return false;
    }
  }

  return true;
}
</script>

<template>
  <div class="grid">
    <h1>Mein Benutzerprofil</h1>
    <form>
      <div class="card-container">
        <Card>
          <template #title>
            <h4>Meine Daten</h4>
          </template>

          <template #content>
            <div>
              <div class="input-container">
                <label class="label" for="firstName">Vorname*:</label>
                <input
                  id="firstName"
                  v-model="editedUserProfile.firstName"
                  required
                  @input="
                    (event) =>
                      (editedUserProfile.firstName = (event.target as HTMLInputElement).value)
                  "
                  @blur="validateField('firstName', 'name', 'firstname')"
                />
                <span class="error" :class="{ active: errorMessage.firstname }">
                  {{ errorMessage.firstname }}
                </span>
              </div>

              <div class="input-container">
                <label class="label" for="lastName">Nachname*:</label>
                <input
                  id="lastName"
                  v-model="editedUserProfile.lastName"
                  required
                  @input="
                    (event) =>
                      (editedUserProfile.lastName = (event.target as HTMLInputElement).value)
                  "
                  @blur="validateField('lastName', 'name', 'lastname')"
                />
                <span class="error" :class="{ active: errorMessage.lastname }">
                  {{ errorMessage.lastname }}
                </span>
              </div>

              <div class="input-container">
                <label class="label" for="eMail">E-Mail:</label>
                <input
                  id="eMail"
                  v-model="editedUserProfile.email"
                  disabled
                  required
                  @input="
                    (event) => (editedUserProfile.email = (event.target as HTMLInputElement).value)
                  "
                />
                <span class="error"></span>
              </div>
              <div class="input-container">
                <label class="label" for="mobilePhoneNumber">Mobile Telefonnummer:</label>
                <input
                  id="mobilePhoneNumber"
                  v-model="editedUserProfile.mobilePhoneNumber"
                  @input="
                    (event) =>
                      (editedUserProfile.mobilePhoneNumber = (
                        event.target as HTMLInputElement
                      ).value)
                  "
                  @blur="validateField('mobilePhoneNumber', 'phone', 'mobilePhoneNumber')"
                />
                <span class="error" :class="{ active: errorMessage.mobilePhoneNumber }">
                  {{ errorMessage.mobilePhoneNumber }}
                </span>
              </div>
              <div class="input-container">
                <label class="label" for="businessPhoneNumber">Geschäftliche Telefonnummer:</label>
                <input
                  id="businessPhoneNumber"
                  v-model="editedUserProfile.businessPhoneNumber"
                  @input="
                    (event) =>
                      (editedUserProfile.businessPhoneNumber = (
                        event.target as HTMLInputElement
                      ).value)
                  "
                  @blur="validateField('businessPhoneNumber', 'phone', 'businessPhoneNumber')"
                />
                <span class="error" :class="{ active: errorMessage.businessPhoneNumber }">
                  {{ errorMessage.businessPhoneNumber }}
                </span>
              </div>

              <div class="input-container">
                <label class="label" for="privatePhoneNumber">Handynummer:</label>
                <input
                  id="privatePhoneNumber"
                  v-model="editedUserProfile.privatePhoneNumber"
                  @input="
                    (event) =>
                      (editedUserProfile.privatePhoneNumber = (
                        event.target as HTMLInputElement
                      ).value)
                  "
                  @blur="validateField('privatePhoneNumber', 'phone', 'privatePhoneNumber')"
                />
                <span class="error" :class="{ active: errorMessage.privatePhoneNumber }">
                  {{ errorMessage.privatePhoneNumber }}
                </span>
              </div>
            </div>
            <span class="required">*Pflichtfelder</span>
          </template>
        </Card>
        <Card>
          <template #title>
            <h4>Meine Adresse</h4>
          </template>
          <template #content>
            <div>
              <div class="input-container">
                <label class="label" for="street">Straße*:</label>
                <input
                  id="street"
                  v-model="editedAddress.street"
                  @input="
                    (event) => (editedAddress.street = (event.target as HTMLInputElement).value)
                  "
                  @blur="validateField('street', 'address', 'street')"
                />
                <span class="error" :class="{ active: errorMessage.street }">
                  {{ errorMessage.street }}
                </span>
              </div>
              <div class="input-container">
                <label class="label" for="zip">Postleitzahl*:</label>
                <input
                  id="zip"
                  v-model="editedAddress.zip"
                  @input="(event) => (editedAddress.zip = (event.target as HTMLInputElement).value)"
                  @blur="getCity()"
                />
                <span class="error" :class="{ active: errorMessage.zip }">
                  {{ errorMessage.zip }}
                </span>
              </div>
              <div class="input-container">
                <label class="label" for="zip">Stadt*:</label>
                <input
                  id="city"
                  v-model="editedAddress.city"
                  @input="
                    (event) => (editedAddress.city = (event.target as HTMLInputElement).value)
                  "
                  @blur="validateField('city', 'address', 'city')"
                />
                <span class="error" :class="{ active: errorMessage.city }">
                  {{ errorMessage.city }}
                </span>
              </div>
              <div class="input-container">
                <label class="label" for="zip">Bundesland*:</label>
                <input
                  id="province"
                  v-model="editedAddress.province"
                  @input="
                    (event) => (editedAddress.province = (event.target as HTMLInputElement).value)
                  "
                  @blur="validateField('province', 'address', 'province')"
                />
                <span class="error" :class="{ active: errorMessage.province }">
                  {{ errorMessage.province }}
                </span>
              </div>
              <div class="input-container">
                <label for="country" class="label">Land*:</label>
                <select id="country" v-model="editedAddress.countryCode" class="select-country">
                  <option disabled value="">Land auswählen*</option>
                  <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                  </option>
                </select>
                <span class="error"></span>
              </div>

              <div class="input-container">
                <label for="countryCode" class="label">Länderkürzel*:</label>
                <input
                  id="countryCode"
                  v-model="editedAddress.countryCode"
                  required
                  style="text-transform: uppercase"
                  @input="updateCountryFromCode"
                />
                <span class="error" :class="{ active: errorMessage.countryCode }">
                  {{ errorMessage.countryCode }}</span
                >
              </div>
            </div>
            <span class="required">*Pflichtfelder</span>
          </template>
        </Card>
      </div>
    </form>
    <div>
      <div>
        <div class="buttons-container centered-buttons">
          <div v-if="changes">
            <Button
              type="button"
              icon="pi pi-user-edit"
              class="save-button"
              label="Speichern"
              @click="saveProfile"
            />
            <Button
              type="button"
              icon="pi pi-times"
              class="cancel-button"
              label="Abbrechen"
              @click="cancel"
            />
          </div>
          <Button
            type="button"
            icon="pi pi-trash"
            severity="danger"
            aria-label="Cancel"
            class="delete-button"
            label="Konto löschen"
            @click="visible = true"
          />
        </div>
        <div class="delete Button">
          <Dialog
            v-model:visible="visible"
            maximizable
            modal
            header=" "
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
          >
            <p>
              Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden
              unwiderruflich gelöscht.
            </p>
            <div class="buttons-container centered-buttons">
              <Button
                type="button"
                icon="pi pi-trash"
                severity="danger"
                aria-label="Cancel"
                label="Konto wirklich löschen"
                class="delete-button"
                @click="deleteAccount"
              />
            </div>
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
}

.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  width: 100%;
}

.label {
  margin-bottom: 0.5rem;
  font-size: 12px;
  font-weight: 500;
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
}

.error.active {
  visibility: visible;
}

.required {
  font-size: 10px;
}
</style>
