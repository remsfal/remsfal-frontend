<!-- eslint-disable prettier/prettier -->
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

const { t } = useI18n();

type UserGetResponse = paths['/api/v1/user']['get']['responses'][200]['content']['application/json'];
type UserPatchRequestBody = paths['/api/v1/user']['patch']['requestBody']['content']['application/json'];
type AddressListResponse = paths['/api/v1/address']['get']['responses'][200]['content']['application/json'];
type Address = AddressListResponse extends (infer U)[] ? U : never;
type User = UserGetResponse & { address?: Address };

const userProfile = ref<UserGetResponse | null>(null);
const editedUserProfile = ref<Partial<UserPatchRequestBody>>({});

const addressProfile = ref<Address | null>(null);
const editedAddress = ref<Partial<Address>>({});

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
      if (userProfile?.value?.address) {
        addressProfile.value = userProfile.value.address;
        editedAddress.value = { ...userProfile.value.address };
      }
    }
  } catch (error) {
    console.error('Das Benutzerprofil konnte nicht gefunden werden', error);
  }
}

function getUpdatedValue<K extends keyof UserPatchRequestBody>(field: K): string {
  const value =
    editedUserProfile.value[field] ?? userProfile.value?.[field as keyof UserGetResponse];
  return typeof value === 'string' ? value : '';
}


function getUpdatedAddressValue(field: keyof Address): string {
  const value =
    (editedAddress.value as Record<keyof Address, unknown>)?.[field] ??
    (addressProfile.value as Record<keyof Address, unknown>)?.[field];
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
  // Get the value from editedUserProfile or editedAddress depending on field
  const value =
    field in (editedUserProfile.value ?? {})
      ? editedUserProfile.value?.[field as keyof User]
      : editedAddress.value?.[field as keyof Address];

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

  // Only call checkValues if all profiles exist and are non-null
  if (
    userProfile.value &&
    editedUserProfile.value &&
    addressProfile.value &&
    editedAddress.value
  ) {
    changes.value = checkValues(
      userProfile.value,
      editedUserProfile.value as User,
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

  const zip = editedAddress.value.zip;
  if (!zip) {
    errorMessage.value.zip = 'Bitte geben Sie eine Postleitzahl ein!';
    return;
  }

  try {
    errorMessage.value.zip = 'Bitte eingeben!';

    const address = await userService.getCityFromZip(zip);

    if (address && address.city) {
      editedAddress.value.city = address.city;
      editedAddress.value.province = address.province;
      editedAddress.value.countryCode = address.countryCode;
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

// Defines the structure of an alternative email object
type AlternativeEmail = {
  id: string;
  email: string;
};

// Reactive list that stores all alternative email entries
const alternativeEmails = ref<AlternativeEmail[]>([]);

// Controls the visibility of the dialog popup
const visible = ref(false);

const alternativeEmail = ref<string>(''); 
// Computed value: true if at least one alternative email exists
const hasAlternativeEmail = computed(() => alternativeEmails.value.length > 0);
// Validation state flags
const isEmailInvalid = ref(false);
const emailErrorMessage = ref('');
// Success/error indicators for UI feedback
const altEmailSuccess = ref(false);
const altEmailError = ref(false);

// Generates a unique ID for each alternative email entry
function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

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

// Extends the UserPatchRequestBody to include optional alternative email
type UserPatchRequestBodyWithAlt = UserPatchRequestBody & {
  alternativeEmail?: string;
};

// Handles saving the alternative email to backend and updating UI state
const saveAlternativeEmail = async () => {
  // Read entered alternative email and primary email from the profile
  const enteredEmail = alternativeEmail.value.trim();
  const primaryEmail = (
    editedUserProfile.value.email ||
    userProfile.value?.email ||
    ''
  ).trim().toLowerCase();

 // 1. Check for empty value or invalid email format
  if (!enteredEmail || !validateEmail(enteredEmail)) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('projectSettings.newProjectMemberButton.invalidEmail');
    return;
  }

  // 2. Email must not match the primary email
  if (enteredEmail.toLowerCase() === primaryEmail) {
    isEmailInvalid.value = true;
    // eigenen Text-Key benutzen (oder testweise einfach String)
    // emailErrorMessage.value = t('accountSettings.userProfile.alternativeEmailMustDiffer');
    emailErrorMessage.value =
      'Die alternative E-Mail darf nicht der primären entsprechen.';
    return;
  }

 // Reset validation state because input is valid
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';

  try {
    const userService = new UserService();

    // Send PATCH request to update the user with a new alternative email
    await userService.updateUser(
      { alternativeEmail: enteredEmail } as UserPatchRequestBodyWithAlt,
    );

     // Show success state
    altEmailSuccess.value = true;
    altEmailError.value = false;

    // Add the new email to the local list (UI update)
    alternativeEmails.value.push({
      id: createId(),
      email: enteredEmail,
    });

     // Close the dialog and reset the form
    visible.value = false;
    resetForm();
  } catch {
    // Show error state if backend update fails
    altEmailSuccess.value = false;
    altEmailError.value = true;
  }
};

// Removes an alternative email entry by ID
function removeAlternativeEmail(id: string) {
  alternativeEmails.value = alternativeEmails.value.filter((e) => e.id !== id);
  // Reset success/error indicators after deletion
  altEmailSuccess.value = false;
  altEmailError.value = false;
}
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
                <label class="label" for="alternative-eMail">{{ t('accountSettings.userProfile.alternative-email') }}:</label>
                
                <!-- Button to open dialog for adding alternative email -->
                <div class="flex justify-front mt-3 mb-5">
                <Button
                  label="Alternative E-Mail hinzufügen"
                  icon="pi pi-plus"
                  style="width: auto"
                  @click="visible = true"
                  :disabled="hasAlternativeEmail"
                />
                </div>
                
                 <!-- Only show the alternative email field if one exists -->
                <div v-if="alternativeEmails.length > 0" class="flex items-center gap-1 mt-1 mb-5">
                <div class="alt-email-wrapper">
                  <InputText 
                    id="alternative-eMail"  
                    class="alt-email-input flex-grow" 
                    :value="alternativeEmails[0]?.email || ''" 
                    disabled 
                    required />
                
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
                <i class="pi pi-trash alt-trash-icon cursor-pointer text-lg"
                @click="removeAlternativeEmail(alternativeEmails[0]!.id)">
                </i>

              </div>
            </div>

              <!-- Dialog for entering the alternative email -->
              <Dialog
                v-model:visible="visible"
                modal :style="{ width: '35rem' }"  
                header="Alternative E-Mail hinzufügen"
                @hide="resetForm">

              <div class="flex flex-col gap-1 mb-6">
               <!-- Email input row -->
               <div class="flex items-center gap-6">
                <label for="email"
                  class="font-semibold w-29">E-Mail Adresse
                </label>
  
                <!-- Editable input inside dialog -->
                <InputText
                  id="email" class="flex-grow"
                  v-model="alternativeEmail"
                  type="email"
                  autocomplete="off"
                  :invalid="isEmailInvalid"
                  placeholder="Alternative E-Mail-Adresse"/>
              </div>

              <!-- Validation error message -->
              <small
                v-if="isEmailInvalid"
                class="text-red-500 mt-2 ml-36 text-sm">{{ emailErrorMessage }}
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
                @click= "saveAlternativeEmail"
              />
             </div>
             </Dialog>

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
            </div>
            <Message class="required" size="small" severity="secondary" variant="simple">
              {{ t('accountSettings.userProfile.requiredFields') }}
            </Message>
          </template>
        </Card>
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
                  @blur="validateField('street', 'address', 'street')"
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
                  @blur="validateField('city', 'address', 'city')"
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
                  @blur="validateField('province', 'address', 'province')"
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
                <label for="country" class="label">{{ t('accountSettings.address.country') }}*:</label>
                <select
                  id="country"
                  v-model="editedAddress.countryCode"
                  class="select-country"
                  @change="updateCountryFromCode"
                >
                  <option disabled value="">
                    Land auswählen*
                  </option>
                  <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                  </option>
                </select>
                <Message class="error" size="small" severity="error" variant="simple" />
              </div>

              <div class="input-container">
                <label for="countryCode" class="label">{{ t('accountSettings.address.countryCode') }}*:</label>
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
                >
                  {{ errorMessage.countryCode }}
                </Message>
              </div>
            </div>
            <Message class="required" size="small" variant="simple">
              {{ t('accountSettings.userProfile.requiredFields') }}
            </Message>
          </template>
        </Card>
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
            <RouterLink to="/customers">
              Zur Auftragnehmer Ansicht
            </RouterLink>
          </Button>
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
  margin-left: 7px
}

.alt-trash-icon:hover {
  color: white !important;
  background-color: #0FA57A;
  padding: 11px;
}

</style>