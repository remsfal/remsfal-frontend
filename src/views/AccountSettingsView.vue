<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserSessionStore } from '@/stores/UserSession';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import type {paths} from '@/services/api/platform-schema';
import UserService from '@/services/UserService';
import { RouterLink } from 'vue-router'
import AdressDisplay from '@/components/AddressDisplay.vue';
import { locales, type Locale } from '@/i18n/i18n';
import Select from 'primevue/select';

const { t } = useI18n();
const i18n = useI18n();

type UserGetResponse = paths['/api/v1/user']['get']['responses'][200]['content']['application/json'];
type UserPatchRequestBody = paths['/api/v1/user']['patch']['requestBody']['content']['application/json'];

const userProfile = ref<UserGetResponse | null>(null);
const editedUserProfile = ref<Partial<UserPatchRequestBody>>({});

const deleteAcc = ref(false); // Sichtbarkeit des Dialogs für Konto löschen
const changes = ref(false);
const saveSuccess = ref(false);
const saveError = ref(false);

const errorMessage = ref({
  firstname: '',
  lastname: '',
  mobilePhoneNumber: '',
  businessPhoneNumber: '',
  privatePhoneNumber: '',
});

onMounted(() => {
  const sessionStore = useUserSessionStore();

  if (!userProfile.value) {
    userProfile.value = {};  // initialize as empty object so you can safely set email
  }
  userProfile.value.email = sessionStore.user?.email || '';

  fetchUserProfile();
});

async function fetchUserProfile() {
  try {
    const userService = new UserService();
    const profile = await userService.getUser();
    if (profile) {
      userProfile.value = profile;
      editedUserProfile.value = { ...profile };
      if (userProfile?.value?.locale) {
        editedUserProfile.value.locale = userProfile.value.locale;
        i18n.locale.value = validateLocale(userProfile.value.locale);
      } else {
        editedUserProfile.value.locale = i18n.locale.value;
      }
    }
  } catch (error) {
    console.error('Das Benutzerprofil konnte nicht gefunden werden', error);
  }
}

function getUpdatedValue<K extends keyof UserPatchRequestBody>(field: K): string | undefined {
  const value =
    editedUserProfile.value[field] ?? userProfile.value?.[field as keyof UserGetResponse];
  if (typeof value === 'string' && value.trim() === '') { 
    return undefined; 
  } 
  return typeof value === 'string' ? value : undefined;
}

async function saveProfile(): Promise<void> {
  try {
    const userService = new UserService();

    const user: Partial<UserGetResponse> = {
      id: userProfile.value?.id || '',
      firstName: getUpdatedValue('firstName'),
      businessPhoneNumber: getUpdatedValue('businessPhoneNumber'),
      lastName: getUpdatedValue('lastName'),
      mobilePhoneNumber: getUpdatedValue('mobilePhoneNumber'),
      privatePhoneNumber: getUpdatedValue('privatePhoneNumber'),
      locale: getUpdatedValue('locale'),
    };

    const updatedUser = await userService.updateUser(user);
    console.log('Benutzer erfolgreich aktualisiert:', updatedUser);
    saveSuccess.value = true;
  } catch (e) {
    console.error('Das Benutzerprofil konnte nicht geupdated werden!', e);
    alert('Fehler beim Aktualisieren des Benutzerprofils!');
    saveError.value = true;
  }
}

function validateLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en';
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
  field: keyof UserGetResponse,
  type: 'name' | 'phone',
  errorKey: keyof typeof errorMessage.value,
) {
  // Get the value from editedUserProfile or editedAddress depending on field
  const value = editedUserProfile.value?.[field as keyof UserGetResponse];

  const regex = /^[A-Za-zÄÖÜäöüß\s]+$/;

  if ((type === 'name') && typeof value === 'string') {
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

  // Only call checkValues if all profiles exist and are non-null
  if (
    userProfile.value &&
    editedUserProfile.value
  ) {
    changes.value = checkValues(
      userProfile.value,
      editedUserProfile.value as UserGetResponse,
    );
  } else {
    changes.value = false;
  }
}

// Determines if there are any changes between the original user and address profiles and their edited
// versions. Returns `true` if differences are detected, otherwise `false`.
function checkValues(
  userProfile: UserGetResponse,
  editedUserProfile: UserGetResponse,
): boolean {
  if (
    compareObjects(userProfile || {}, editedUserProfile || {})
  ) {
    return false;
  } else {
    return true;
  }
}

// Recursively compares two objects (UserGetResponse or Address) to check if they are identical.
// - Returns `true` if the objects have the same structure and identical values for all keys.
// - Returns `false` if the objects differ in keys or values.
function compareObjects(obj1: UserGetResponse, obj2: UserGetResponse): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1) as Array<keyof UserGetResponse>;
  const keys2 = Object.keys(obj2) as Array<keyof UserGetResponse>;

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !compareObjects(obj1[key] as UserGetResponse, obj2[key] as UserGetResponse)
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
                >
                  {{ errorMessage.firstname }}
                </Message>
              </div>

              <div class="input-container">
                <label class="label" for="lastName">{{ t('accountSettings.userProfile.lastName') }}:</label>
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
                >
                  {{ errorMessage.lastname }}
                </Message>
              </div>

              <div class="input-container">
                <label class="label" for="eMail">{{ t('accountSettings.userProfile.email') }}:</label>
                <InputText id="eMail" v-model="editedUserProfile.email" disabled required />
                <Message class="error" size="small" severity="error" variant="simple" />
              </div>
              <div class="input-container">
                <label class="label" for="mobilePhoneNumber">{{ t('accountSettings.userProfile.mobilePhone') }}:</label>
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
                >
                  {{ errorMessage.mobilePhoneNumber }}
                </Message>
              </div>
              <div class="input-container">
                <label class="label" for="businessPhoneNumber">{{ t('accountSettings.userProfile.businessPhone') }}:</label>
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
                >
                  {{ errorMessage.businessPhoneNumber }}
                </Message>
              </div>
              <div class="input-container">
                <label class="label" for="privatePhoneNumber">{{ t('accountSettings.userProfile.privatePhone') }}:</label>
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
                >
                  {{ errorMessage.privatePhoneNumber }}
                </Message>
              </div>
              <div class="input-container">
                <label class="label" for="locale">{{ t('accountSettings.userProfile.language') }}:</label>
                
                <Select
                  id="locale"
                  v-model="editedUserProfile.locale"
                  :options="[{ language: 'Deutsch', value: 'de' }, { language: 'English', value: 'en' }]"
                  optionLabel="language"
                  optionValue="value"
                  placeholder="Select language"
                  @update:modelValue="i18n.locale.value = $event"
                />
              </div>
            </div>
            <Message class="required" size="small" severity="secondary" variant="simple">
              {{ t('accountSettings.userProfile.requiredFields') }}
            </Message>
          </template>
        </Card>
        <AdressDisplay />
      </div>
    </form>
    <div>
      <div>
        <div class="buttons-container centered-buttons">
          <Button severity="info">
            <RouterLink to="/projects">
              {{ t('accountSettings.userProfile.managementView') }}
            </RouterLink>
          </Button>
          <Button severity="info">
            <RouterLink to="/tenancies">
              {{ t('accountSettings.userProfile.tenanciesView') }}
            </RouterLink>
          </Button>
          <Button severity="info">
            <RouterLink to="/contractor/overview">
              Zur Auftragnehmer Ansicht
            </RouterLink>
          </Button>
          <Button
            type="button"
            icon="pi pi-user-edit"
            class="save-button btn"
            label="Speichern"
            :disabled="isDisabled"
            @click="saveProfile"
          />
          <Button
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

.buttons-container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: center;
  gap: 20px;
}

.select-country {
  box-sizing: border-box;
  appearance: none;
  background: url('data:image/svg+xml;utf8, <svg fill="%23999" height="24" viewBox="0 0 24 24" \
    width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M7 10l5 5 5-5z"/> </svg>') no-repeat right 10px center;
  background-size: 12px 12px;
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