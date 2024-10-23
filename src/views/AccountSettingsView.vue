<script setup lang="ts">
import {useUserSessionStore} from '@/stores/UserSession';
import UserService, {type User, type Address} from '@/services/UserService';
import {onMounted, ref} from "vue";

interface PhoneValid {
  businessPhoneNumber: boolean;
  mobilePhoneNumber: boolean;
  privatePhoneNumber: boolean;
}

const userProfile = ref({} as User); // Das gesamte Benutzerprofil
const editedUserProfile = ref({} as User);
const editMode = ref(false); // Modus für die Bearbeitung der Benutzerdaten
const visible = ref(false); // Sichtbarkeit des Dialogs für Konto löschen
const countries = ref([
  {name: 'Australia', code: 'AU'},
  {name: 'Brazil', code: 'BR'},
  {name: 'China', code: 'CN'},
  {name: 'Egypt', code: 'EG'},
  {name: 'France', code: 'FR'},
  {name: 'Germany', code: 'DE'},
  {name: 'India', code: 'IN'},
  {name: 'Japan', code: 'JP'},
  {name: 'Spain', code: 'ES'},
  {name: 'United States', code: 'US'},
  {name: 'Austria', code: 'AT'},
  {name: 'Belgium', code: 'BE'},
  {name: 'Bulgaria', code: 'BG'},
  {name: 'Croatia', code: 'HR'},
  {name: 'Cyprus', code: 'CY'},
  {name: 'Czech Republic', code: 'CZ'},
  {name: 'Denmark', code: 'DK'},
  {name: 'Estonia', code: 'EE'},
  {name: 'Finland', code: 'FI'},
  {name: 'Greece', code: 'GR'},
  {name: 'Hungary', code: 'HU'},
  {name: 'Ireland', code: 'IE'},
  {name: 'Italy', code: 'IT'},
  {name: 'Latvia', code: 'LV'},
  {name: 'Lithuania', code: 'LT'},
  {name: 'Luxembourg', code: 'LU'},
  {name: 'Malta', code: 'MT'},
  {name: 'Netherlands', code: 'NL'},
  {name: 'Poland', code: 'PL'},
  {name: 'Portugal', code: 'PT'},
  {name: 'Romania', code: 'RO'},
  {name: 'Slovakia', code: 'SK'},
  {name: 'Slovenia', code: 'SI'},
  {name: 'Sweden', code: 'SE'},
]);
const isPhoneValid = ref({
  businessPhoneNumber: true,
  mobilePhoneNumber: true,
  privatePhoneNumber: true,
} as PhoneValid);

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
      editedUserProfile.value = {...profile};
    }
  } catch (error) {
    console.error('Das Benutzerprofil konnte nicht gefunden werden', error);
  }
}

function toggleEditMode() {
  editedUserProfile.value = editMode.value ? editedUserProfile.value : {...userProfile.value};
  editedUserProfile.value.address = editMode.value
      ? editedUserProfile.value.address
      : {...userProfile.value.address};
  editMode.value = !editMode.value;
}

function discardChanges() {
  editedUserProfile.value = {...userProfile.value};
  editedUserProfile.value.address = {...userProfile.value.address};
  toggleEditMode();
}

async function saveProfile() {
  if (Object.values(isPhoneValid).every(Boolean) && validateAddress()) {
    try {
      const userService = new UserService();
      const user = {
        id: userProfile.value.id,
        firstName: editedUserProfile.value.firstName
            ? editedUserProfile.value.firstName
            : userProfile.value.firstName,
        businessPhoneNumber: editedUserProfile.value.businessPhoneNumber
            ? editedUserProfile.value.businessPhoneNumber
            : userProfile.value.businessPhoneNumber,
        lastName: editedUserProfile.value.lastName
            ? editedUserProfile.value.lastName
            : userProfile.value.lastName,
        mobilePhoneNumber: editedUserProfile.value.mobilePhoneNumber
            ? editedUserProfile.value.mobilePhoneNumber
            : userProfile.value.mobilePhoneNumber,
        privatePhoneNumber: editedUserProfile.value.privatePhoneNumber
            ? editedUserProfile.value.privatePhoneNumber
            : userProfile.value.privatePhoneNumber,
      } as User;

      if (validateAddress()) {
        const address = {
          street: editedUserProfile.value.address.street
              ? editedUserProfile.value.address.street
              : userProfile.value.address.street,
          city: editedUserProfile.value.address.city
              ? editedUserProfile.value.address.city
              : userProfile.value.address.city,
          zip: editedUserProfile.value.address.zip
              ? editedUserProfile.value.address.zip
              : userProfile.value.address.zip,
          province: editedUserProfile.value.address.province
              ? editedUserProfile.value.address.province
              : userProfile.value.address.province,
          countryCode: editedUserProfile.value.address.countryCode
              ? editedUserProfile.value.address.countryCode
              : userProfile.value.address.countryCode,
        } as Address;
        user.address = address;
      }
      const updatedUser = await userService.updateUser(user);
      userProfile.value = updatedUser ? updatedUser : userProfile.value;
      toggleEditMode();
    } catch (e) {
      console.error('Das Benutzerprofil konnte nicht geupdated werden!', e);
    }
  } else {
    alert('Bitte überprüfen Sie Ihre Eingaben!');
  }
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

function validatePhone(phoneCategory: string) {
  const phonePattern = /^\+?[1-9]\d{1,14}$/;
  isPhoneValid.value[phoneCategory as keyof PhoneValid] = phonePattern.test(
      editedUserProfile.value[phoneCategory as keyof PhoneValid]
  );
}

function validateAddress() {
  if (Object.keys(editedUserProfile.value.address).length == 5) {
    if (Object.values(editedUserProfile.value.address).every((value) => value.length > 0)) {
      return true;
    }
  }
  return false;
}

async function getCity() {
  const userService = new UserService();
  const address = await userService.getCityFromZip(editedUserProfile.value.address.zip);
  try {
    if (address) {
      editedUserProfile.value.address.city = address[0].city;
      editedUserProfile.value.address.province = address[0].province;
      editedUserProfile.value.address.countryCode = address[0].countryCode;
    }
  } catch (error) {
    console.log(error);
    alert('Bitte überprüfen Sie Ihre Postleitzahl!');
  }
}
</script>

<template>
  <div class="grid">
    <h1>Mein Benutzerprofil</h1>
    <div class="card-container">
      <Card>
        <template #title>
          <h4>Meine Daten</h4>
        </template>
        <template #content>
          <div v-if="userProfile">
            <div v-if="!editMode">
              <p v-if="userProfile.firstName || userProfile.lastName">
                <strong>Name:</strong> {{ userProfile.firstName }}
                {{ userProfile.lastName }}
              </p>
              <p v-if="userProfile.businessPhoneNumber">
                <strong>Geschäftliche Telefonnummer:</strong>
                {{ userProfile.businessPhoneNumber }}
              </p>
              <p v-if="userProfile.mobilePhoneNumber">
                <strong>Handynummer:</strong>
                {{ userProfile.mobilePhoneNumber }}
              </p>
              <p v-if="userProfile.privatePhoneNumber">
                <strong>Private Telefonnummer:</strong>
                {{ userProfile.privatePhoneNumber }}
              </p>
              <p v-if="userProfile.email"><strong>Email:</strong> {{ userProfile.email }}</p>
              <p v-if="userProfile.registeredDate">
                <strong>Mitglied seit:</strong> {{ userProfile.registeredDate }}
              </p>
              <p v-if="userProfile.lastLoginDate">
                <strong>Letzter Login:</strong> {{ userProfile.lastLoginDate }}
              </p>
            </div>
            <div v-else>
              <div class="edit-inputs">
                <FloatLabel>
                  <InputText id="firstname" v-model="editedUserProfile.firstName"/>
                  <label for="firstname">Vorname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="lastname" v-model="editedUserProfile.lastName"/>
                  <label for="lastname">Nachname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText
                      id="businessPhoneNumber"
                      v-model="editedUserProfile.businessPhoneNumber"
                      :class="{ 'is-invalid': !isPhoneValid.businessPhoneNumber }"
                      @change="() => validatePhone('businessPhoneNumber')"
                  />
                  <label for="businessPhoneNumber">Geschäftliche Telefonnummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText
                      id="mobilePhoneNumber"
                      v-model="editedUserProfile.mobilePhoneNumber"
                      :class="{ 'is-invalid': !isPhoneValid.mobilePhoneNumber }"
                      @change="() => validatePhone('mobilePhoneNumber')"
                  />
                  <label for="mobilePhoneNumber">Handynummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText
                      id="privatePhoneNumber"
                      v-model="editedUserProfile.privatePhoneNumber"
                      :class="{ 'is-invalid': !isPhoneValid.privatePhoneNumber }"
                      @change="() => validatePhone('privatePhoneNumber')"
                  />
                  <label for="privatePhoneNumber">Private Telefonnummer</label>
                </FloatLabel>
              </div>
            </div>
          </div>
        </template>
      </Card>
      <Card>
        <template #title>
          <h4>Meine Adresse</h4>
        </template>
        <template #content>
          <div v-if="userProfile">
            <div v-if="!editMode">
              <p v-if="userProfile.address">
                <strong>Straße:</strong> {{ userProfile.address.street }}
              </p>
              <p v-if="userProfile.address">
                <strong>Postleitzahl:</strong> {{ userProfile.address.zip }}
              </p>
              <p v-if="userProfile.address">
                <strong>Stadt:</strong> {{ userProfile.address.city }}
              </p>
              <p v-if="userProfile.address">
                <strong>Bundesland:</strong> {{ userProfile.address.province }}
              </p>
              <p v-if="userProfile.address">
                <strong>Land:</strong> {{ userProfile.address.countryCode }}
              </p>
            </div>
            <div v-else>
              <div class="edit-inputs">
                <FloatLabel>
                  <InputText id="street" v-model="editedUserProfile.address.street"/>
                  <label for="street">Straße und Hausnummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="zip" v-model="editedUserProfile.address.zip" @change="getCity"/>
                  <label for="zip">Postleitzahl</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="city" v-model="editedUserProfile.address.city"/>
                  <label for="city">Stadt</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="province" v-model="editedUserProfile.address.province"/>
                  <label for="province">Bundesland</label>
                </FloatLabel>
                <div class="country">
                  <select
                      id="countryCode"
                      v-model="editedUserProfile.address.countryCode"
                      class="select-country"
                  >
                    <option disabled value="">Land</option>
                    <option v-for="country in countries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                  <FloatLabel>
                    <InputText
                        id="countryCodeInput"
                        v-model="editedUserProfile.address.countryCode"
                    />
                    <label for="countryCodeInput">Länderkürzel</label>
                  </FloatLabel>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-if="userProfile">
      <div v-if="!editMode">
        <div class="buttons-container centered-buttons">
          <Button
              type="button"
              icon="pi pi-user-edit"
              class="edit-button"
              label="Bearbeiten"
              @click="toggleEditMode"
          />
          <Button
              type="button"
              icon="pi pi-trash"
              severity="danger"
              aria-label="Cancel"
              class="edit-button"
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
              <Button
                  type="button"
                  icon="pi pi-times"
                  class="cancel-button"
                  severity="secondary"
                  aria-label="Cancel"
                  label="Abbrechen"
                  @click="visible = false"
              />
            </div>
          </Dialog>
        </div>
      </div>
      <div v-else>
        <div class="buttons-container centered-buttons">
          <Button
              type="button"
              label="Speichern"
              icon="pi pi-check"
              class="save-button"
              @click="saveProfile"
          />
          <Button
              icon="pi pi-times"
              class="cancel-button"
              severity="secondary"
              aria-label="Cancel"
              label="Abbrechen"
              @click="toggleEditMode"
          />
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

.country {
  display: flex;
  align-items: center;
  gap: 10px;
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

input {
  padding: 8px;
  font-size: 16px;
  margin-left: 10px;
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

.edit-inputs {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.edit-inputs label {
  padding-left: 10px;
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
  margin-left: 10px;
  box-sizing: border-box;
  appearance: none;
  background: url('data:image/svg+xml;utf8,<svg fill="%23999" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 10px center;
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
</style>
