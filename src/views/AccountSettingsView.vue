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
import { userService, type User } from '@/services/UserService';
import { RouterLink } from 'vue-router'
import AdressDisplay from '@/components/AddressDisplay.vue';
import { locales, type Locale } from '@/i18n/i18n';
import Select from 'primevue/select';

const { t } = useI18n();
const i18n = useI18n();

type UserGetResponse = paths['/api/v1/user']['get']['responses'][200]['content']['application/json'];
type UserPatchRequestBody = paths['/api/v1/user']['patch']['requestBody']['content']['application/json'];

const userProfile = ref<User | null>(null);
const editedUserProfile = ref<Partial<User>>({});

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
    const profile = (await userService.getUser()) as User;
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

function getUpdatedValue<K extends keyof User>(field: K): string | undefined {
  const value = editedUserProfile.value[field] ?? userProfile.value?.[field as keyof User];
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

async function saveProfile(): Promise<void> {
  try {
    const user: Partial<User> = {
      id: userProfile.value?.id || '',
      firstName: getUpdatedValue('firstName'),
      businessPhoneNumber: getUpdatedValue('businessPhoneNumber'),
      lastName: getUpdatedValue('lastName'),
      mobilePhoneNumber: getUpdatedValue('mobilePhoneNumber'),
      privatePhoneNumber: getUpdatedValue('privatePhoneNumber'),
      locale: getUpdatedValue('locale'),
    };

    // ===== Alternative Email =====
    const primaryEmail = (userProfile.value?.email || '').trim().toLowerCase();
    let touchedAltEmail = false;

    const currentAlt = userProfile.value?.additionalEmails ?? undefined;

    const editedAlt = editedUserProfile.value?.additionalEmails ?? undefined;
 
    const currentAltNorm = 
      typeof currentAlt === 'string' ? currentAlt.trim() : null;
    const editedAltNorm = 
      typeof editedAlt === 'string' ? editedAlt.trim() : null;

    if (currentAltNorm !== editedAltNorm) {
      touchedAltEmail = true;

      if (!editedAltNorm) {
        user.additionalEmails = undefined;
      } else {
        if (!validateEmail(editedAltNorm)) {
          altEmailSuccess.value = false;
          altEmailError.value = true;
          alert(t('projectSettings.newProjectMemberButton.invalidEmail'));
          return;
        }

        if (editedAltNorm.toLowerCase() === primaryEmail) {
          altEmailSuccess.value = false;
          altEmailError.value = true;
          alert(t('accountSettings.userProfile.alternativeEmailNotEqualPrimary'));
          return;
        }

        user.additionalEmails = editedAltNorm;
      }
    }
    const updatedUser = await userService.updateUser(user);
    console.log('Benutzer erfolgreich aktualisiert:', updatedUser);
    saveSuccess.value = true;

    // Show success icon only after backend save (only if alt email was part of the change)
    if (touchedAltEmail) {
      altEmailSuccess.value = true;
      altEmailError.value = false;
    }

  } catch (e) {
    console.error('Das Benutzerprofil konnte nicht geupdated werden!', e);
    alert('Fehler beim Aktualisieren des Benutzerprofils!');
    saveError.value = true;

    // Show error icon if backend save fails
    altEmailSuccess.value = false;
    altEmailError.value = true;
  }
}

function validateLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en';
}

function logout(): void {
  window.location.pathname = '/api/v1/authentication/logout';
}

function deleteAccount() {
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

// ===== Alternative Email (UI-only state & validation) =====
// Resets all form and validation states when closing or reopening the dialog
function resetForm() {
  alternativeEmail.value = '';
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
}

// Basic frontend email format validation using regex
function validateEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Dialog visibility + alternative email input model
const visible = ref(false);
const alternativeEmail = ref('');

const displayAlternativeEmail = computed<string | null>(() => {
  return (
    ((editedUserProfile.value as any).additionalEmails ??
      (userProfile.value as any)?.additionalEmails) ??
    null
  );
});
  
// Validation + UI state for alternative email dialog
const isEmailInvalid = ref(false);
const emailErrorMessage = ref('');

const applyAlternativeEmail = (value: string | null) => {
  // update edited profile 
  editedUserProfile.value = {
    ...editedUserProfile.value,
    additionalEmails: value,
  } as any;

  // update userProfile for immediate UI 
  if (userProfile.value) {
    (userProfile.value as any) = {
      ...userProfile.value,
      additionalEmails: value,
    };
  }

// ensure Save button appears after changing alternative email
  changes.value = true;

  // clear backend icons because change is not saved yet
  altEmailSuccess.value = false;
  altEmailError.value = false;
};

const saveAlternativeEmail = () => {
  const enteredEmail = alternativeEmail.value.trim();

  const primaryEmail = (
    editedUserProfile.value.email || userProfile.value?.email || ''
  )
    .trim()
    .toLowerCase();

  // 1) empty or invalid
  if (!enteredEmail || !validateEmail(enteredEmail)) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('projectSettings.newProjectMemberButton.invalidEmail');
    return;
  }

  // 2) must not equal primary
  if (enteredEmail.toLowerCase() === primaryEmail) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('accountSettings.userProfile.alternativeEmailNotEqualPrimary');
    return;
  }

  // ok
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';

  applyAlternativeEmail(enteredEmail);

  visible.value = false;
  alternativeEmail.value = '';
};

const deleteAlternativeEmail = () => {
  applyAlternativeEmail(null);
};
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
                <!-- Label for the alternative email section -->
                <label class="label" for="alternative-eMail">{{ t('accountSettings.userProfile.alternativeEmail') }}:</label>
                
                <!-- Button to open dialog for adding alternative email -->
                <div class="flex justify-front mt-3 mb-5">
                  <Button
                    type="button"
                    :label="t('accountSettings.userProfile.addAlternativeEmail')"
                    icon="pi pi-plus"
                    style="width: auto"
                    :disabled="!!displayAlternativeEmail"
                    @click="visible = true"
                  />
                </div>
                
                <!-- Only show the alternative email field if one exists -->
                <div 
                  v-if="displayAlternativeEmail" 
                  class="flex items-center gap-1 mt-1 mb-5"
                >
                  <div class="alt-email-wrapper">
                    <InputText 
                      id="alternative-eMail"  
                      class="alt-email-input flex-grow" 
                      :value="displayAlternativeEmail"
                      disabled 
                      required 
                    />
                
                    <!-- SUCCESS CHECKMARK shown after successful save -->
                    <span
                      v-if="altEmailSuccess"
                      class="alt-email-icon alt-email-icon-success"
                    >
                      ✔
                    </span>

                    <!-- ERROR ICON shown if backend returns an error -->
                    <span
                      v-if="altEmailError"
                      class="alt-email-icon alt-email-icon-error"
                    >
                      ✗
                    </span>
                  </div>
  
                  <!-- Trash icon deletes the existing alternative email -->
                  <i 
                    class="pi pi-trash alt-trash-icon cursor-pointer text-lg"
                    @click="deleteAlternativeEmail"
                  />
                </div>
              </div>

              <!-- Dialog for entering the alternative email -->
              <Dialog
                v-model:visible="visible"
                modal :style="{ width: '35rem' }"  
                :header="t('accountSettings.userProfile.addAlternativeEmail')"
                @hide="resetForm"
              >
                <div class="flex flex-col gap-1 mb-6">
                  <!-- Email input row -->
                  <div class="flex items-center gap-4">
                    <label 
                      for="email"
                      class="font-semibold"
                    >
                      {{ t('accountSettings.userProfile.email') }}
                    </label>
  
                    <!-- Editable input inside dialog -->
                    <InputText
                      id="email" 
                      v-model="alternativeEmail"
                      class="flex-grow"
                      type="email"
                      autocomplete="off"
                      :invalid="isEmailInvalid"
                      :placeholder="t('accountSettings.userProfile.alternativeEmail')" 
                    />
                  </div>

                  <!-- Validation error message -->
                  <small
                    v-if="isEmailInvalid"
                    class="text-red-500 mt-2 ml-36 text-sm"
                  >
                    {{ emailErrorMessage }}
                  </small>
                </div>

                <!-- Dialog buttons -->
                <div class="flex justify-end gap-2 mt-6">
                  <!-- Cancel closes the dialog with no action -->
                  <Button
                    type="button"
                    :label="t('button.cancel')"
                    severity="secondary"
                    @click="visible = false"
                  />

                  <!-- Save triggers frontend + backend validation -->
                  <Button
                    type="button"
                    :label="t('button.add')"
                    @click="saveAlternativeEmail"
                  />
                </div>
              </Dialog>

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

.alt-email-wrapper {
  position: relative;
  width: 95%;
}

.alt-email-input {
  width: 100%;
  padding-right: 10px;
}

.alt-email-icon {
  position: absolute;
  right: 15px;           
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.alt-email-icon-success {
  color: #16a34a;       
}

.alt-email-icon-error {
  color: #dc2626;       
}

.alt-trash-icon {
  padding: 11px;
  border-radius: 6px;
  transition: all 0.2s ease;
  align-items: center;
  height: 100%;
  margin-top: -5px;
  margin-left: 7px;
}

.alt-trash-icon:hover {
  color: white !important;
  background-color: #047857;
  padding: 11px;
}

</style>