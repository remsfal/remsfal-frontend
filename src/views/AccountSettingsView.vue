<script lang="ts">
import { useUserSessionStore } from "@/stores/UserSession";
import UserService, { type User, type Address } from "@/services/UserService";
//import Modal from "@/components/LeoModal.vue";

interface PhoneValid {
  businessPhoneNumber: boolean,
  mobilePhoneNumber: boolean,
  privatePhoneNumber: boolean
}

export default {
  data() {
    return {
      userProfile: {} as User, // Das gesamte Benutzerprofil
      editedUserProfile: {} as User,
      editMode: false, // Modus für die Bearbeitung der Benutzerdaten
      visible: false, // Sichtbarkeit des Dialogs für Konto löschen
      countries: [
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
        { name: 'Sweden', code: 'SE' }
      ],
      isPhoneValid: {
        businessPhoneNumber: true,
        mobilePhoneNumber: true,
        privatePhoneNumber: true
      } as PhoneValid
    };
  },
  async mounted() {
    const sessionStore = useUserSessionStore();
    this.userProfile.email = sessionStore.user?.email || ""; // Sicherstellen, dass userEmail initialisiert wird
    await this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const userService = new UserService();
        const profile = await userService.getUser(); // Ruft das Benutzerprofil vom Server ab
        if (profile) {
          this.userProfile = profile; // Speichert das gesamte Benutzerprofil
          this.editedUserProfile = { ...profile };
        }
      } catch (error) {
        console.error("Das Benutzerprofil konnte nicht gefunden werden", error);
      }
    },
    toggleEditMode() {
      this.editedUserProfile = this.editMode ? this.editedUserProfile : { ...this.userProfile };
      this.editedUserProfile.address = this.editMode ? this.editedUserProfile.address : { ...this.userProfile.address };
      this.editMode = !this.editMode;
    },
    discardChanges() {
      this.editedUserProfile = { ...this.userProfile };
      this.editedUserProfile.address = { ...this.userProfile.address };
      this.toggleEditMode();
    },
    async saveProfile() {
      if (Object.values(this.isPhoneValid).every(Boolean) && this.validateAddress()) {
        try {
          const userService = new UserService();
          const user = {
            id: this.userProfile.id,
            firstName: this.editedUserProfile.firstName ? this.editedUserProfile.firstName : this.userProfile.firstName,
            businessPhoneNumber: this.editedUserProfile.businessPhoneNumber ? this.editedUserProfile.businessPhoneNumber : this.userProfile.businessPhoneNumber,
            lastName: this.editedUserProfile.lastName ? this.editedUserProfile.lastName : this.userProfile.lastName,
            mobilePhoneNumber: this.editedUserProfile.mobilePhoneNumber ? this.editedUserProfile.mobilePhoneNumber : this.userProfile.mobilePhoneNumber,
            privatePhoneNumber: this.editedUserProfile.privatePhoneNumber ? this.editedUserProfile.privatePhoneNumber : this.userProfile.privatePhoneNumber
          } as User

          if (this.validateAddress()) {
            const address = {
              street: this.editedUserProfile.address.street ? this.editedUserProfile.address.street : this.userProfile.address.street,
              city: this.editedUserProfile.address.city ? this.editedUserProfile.address.city : this.userProfile.address.city,
              zip: this.editedUserProfile.address.zip ? this.editedUserProfile.address.zip : this.userProfile.address.zip,
              province: this.editedUserProfile.address.province ? this.editedUserProfile.address.province : this.userProfile.address.province,
              countryCode: this.editedUserProfile.address.countryCode ? this.editedUserProfile.address.countryCode : this.userProfile.address.countryCode,
            } as Address
            user.address = address
          }
          const updatedUser = await userService.updateUser(user);
          this.userProfile = updatedUser ? updatedUser : this.userProfile;
          this.toggleEditMode();
        } catch (e) {
          console.error("Das Benutzerprofil konnte nicht geupdated werden!", e);
        }
      } else {
        alert('Bitte überprüfen Sie Ihre Eingaben!')
      }
    },
    logout(): void {
      window.location.pathname = "/api/v1/authentication/logout";
    },
    deleteAccount() {
      const userService = new UserService();
      userService.deleteUser()
        .then(() => this.logout())
        .catch(() => console.error("Das Benutzerprofil konnte nicht gelöscht werden!"));
    },
    validatePhone(phoneCategory: string) {
      const phonePattern = /^\+?[1-9]\d{1,14}$/;
      this.isPhoneValid[phoneCategory as keyof PhoneValid] = phonePattern.test(this.editedUserProfile[phoneCategory as keyof PhoneValid]);
    },
    validateAddress() {
      if (Object.keys(this.editedUserProfile.address).length == 5) {
        if (Object.values(this.editedUserProfile.address).every(value => value.length > 0)) {
          return true;
        }
      }
      return false;
    },
    async getCity() {
      const userService = new UserService();
      const address = await userService.getCityFromZip(this.editedUserProfile.address.zip);
      try {
        if (address) {
          this.editedUserProfile.address.city = address[0].city;
          this.editedUserProfile.address.province = address[0].province;
          this.editedUserProfile.address.countryCode = address[0].countryCode;
        }
      } catch (error) {
        console.log(error);
        alert('Bitte überprüfen Sie Ihre Postleitzahl!');
      }
    }
  }
};
</script>


<template>
  <div class="grid">
    <h1>Mein Benutzerprofil</h1>
    <div class="cardContainer">
      <Card>
        <template #title>
          <h4>Meine Daten</h4>
        </template>
        <template #content>
          <div v-if="userProfile">
            <div v-if="!editMode">
              <p v-if="userProfile.firstName || userProfile.lastName"><strong>Name:</strong> {{ userProfile.firstName }}
                {{ userProfile.lastName }}</p>
              <p v-if="userProfile.businessPhoneNumber"><strong>Geschäftliche Telefonnummer:</strong>
                {{ userProfile.businessPhoneNumber }}</p>
              <p v-if="userProfile.mobilePhoneNumber"><strong>Handynummer:</strong> {{ userProfile.mobilePhoneNumber }}
              </p>
              <p v-if="userProfile.privatePhoneNumber"><strong>Private Telefonnummer:</strong>
                {{ userProfile.privatePhoneNumber }}</p>
              <p v-if="userProfile.email"><strong>Email:</strong> {{ userProfile.email }}</p>
              <p v-if="userProfile.registeredDate"><strong>Mitglied seit:</strong> {{ userProfile.registeredDate }}
              </p>
              <p v-if="userProfile.lastLoginDate"><strong>Letzter Login:</strong> {{ userProfile.lastLoginDate }}</p>
            </div>
            <div v-else>
              <div class="editInputs">
                <FloatLabel>
                  <InputText id="firstname" v-model="editedUserProfile.firstName" />
                  <label for="firstname">Vorname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="lastname" v-model="editedUserProfile.lastName" />
                  <label for="lastname">Nachname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="businessPhoneNumber" v-model="editedUserProfile.businessPhoneNumber"
                    @change="() => validatePhone('businessPhoneNumber')"
                    :class="{ 'is-invalid': !isPhoneValid.businessPhoneNumber }" />
                  <label for="businessPhoneNumber">Geschäftliche Telefonnummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="mobilePhoneNumber" v-model="editedUserProfile.mobilePhoneNumber"
                    @change="() => validatePhone('mobilePhoneNumber')"
                    :class="{ 'is-invalid': !isPhoneValid.mobilePhoneNumber }" />
                  <label for="mobilePhoneNumber">Handynummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="privatePhoneNumber" v-model="editedUserProfile.privatePhoneNumber"
                    @change="() => validatePhone('privatePhoneNumber')"
                    :class="{ 'is-invalid': !isPhoneValid.privatePhoneNumber }" />
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
              <p v-if="userProfile.address"><strong>Straße:</strong> {{ userProfile.address.street }}</p>
              <p v-if="userProfile.address"><strong>Postleitzahl:</strong> {{ userProfile.address.zip }}</p>
              <p v-if="userProfile.address"><strong>Stadt:</strong> {{ userProfile.address.city }}</p>
              <p v-if="userProfile.address"><strong>Bundesland:</strong> {{ userProfile.address.province }}</p>
              <p v-if="userProfile.address"><strong>Land:</strong> {{ userProfile.address.countryCode }}
              </p>
            </div>
            <div v-else>
              <div class="editInputs">
                <FloatLabel>
                  <InputText id="street" v-model="editedUserProfile.address.street" />
                  <label for="street">Straße und Hausnummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="zip" @change="getCity" v-model="editedUserProfile.address.zip" />
                  <label for="zip">Postleitzahl</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="city" v-model="editedUserProfile.address.city" />
                  <label for="city">Stadt</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="province" v-model="editedUserProfile.address.province" />
                  <label for="province">Bundesland</label>
                </FloatLabel>
                <div class="country">
                  <select id="countryCode" v-model="editedUserProfile.address.countryCode" class="selectCountry">
                    <option disabled value="">Land</option>
                    <option v-for="country in countries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                  <FloatLabel>
                    <InputText id="countryCodeInput" v-model="editedUserProfile.address.countryCode" />
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
        <div class='buttons-container centered-buttons'>
          <Button type="button" icon="pi pi-user-edit" class='edit-button' @click="toggleEditMode" label="Bearbeiten" />
          <Button type="button" icon="pi pi-trash" severity="danger" aria-label="Cancel" class='edit-button'
            label="Konto löschen" @click="visible = true" />
        </div>
        <div class='delete Button'>
          <Dialog v-model:visible="visible" maximizable modal header=" " :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <p>Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.</p>
            <div class='buttons-container centered-buttons'>
              <Button type="button" icon="pi pi-trash" severity="danger" aria-label="Cancel" @click="deleteAccount"
                label="Konto wirklich löschen" class='delete-button' />
              <Button type="button" icon="pi pi-times" class="cancel-button" severity="secondary" aria-label="Cancel"
                @click="visible = false" label="Abbrechen" />
            </div>
          </Dialog>
        </div>
      </div>
      <div v-else>
        <div class='buttons-container centered-buttons'>
          <Button type="button" label="Speichern" icon="pi pi-check" @click="saveProfile" class='save-button' />
          <Button icon="pi pi-times" class="cancel-button" severity="secondary" aria-label="Cancel"
            @click="toggleEditMode" label="Abbrechen" />
        </div>
      </div>
    </div>
  </div>
  <!--Modal
          :isOpen="showModal"
          :bodyText="'Durch die Anmeldung bzw. Registrierung stimmst Du unser Datenschutzerklärung zu.'"
          :linkText="'Datenschutzerklärung'"
          :linkHref="'/data-protection'"
          :buttonText="'Mit Google Anmelden'"
          :headingText="'Anmeldung/Registrierung'"
          :buttonColor="'green'"
          @closeModal="showModal = false"
      ></Modal>
      <Modal
          :isOpen="showDeleteModal"
          :bodyText="'Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.'"
          :buttonText="'Konto löschen'"
          :headingText="'Konto löschen'"
          :buttonColor="'red'"
          @closeModal="showDeleteModal = false"
      ></Modal -->
</template>

<style>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.cardContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.country {
  display: flex;
  align-items: center;
  gap: 10px;
}


@media (max-width: 768px) {
  .cardContainer {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
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
.selectCountry {
  padding: 6px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
}

.selectCountry:focus,
input:focus {
  border-color: #80bdff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.editInputs {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.editInputs label {
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

.selectCountry {
  margin-left: 10px;
  box-sizing: border-box;
  -webkit-appearance: none;
  /* Entfernt das native Dropdown-Styling in WebKit-Browsern */
  -moz-appearance: none;
  /* Entfernt das native Dropdown-Styling in Firefox */
  appearance: none;
  /* Entfernt das native Dropdown-Styling in allen Browsern */
  background: url('data:image/svg+xml;utf8,<svg fill="%23999" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 10px center;
  background-color: white;
  background-size: 12px 12px;
}

.countryCode {
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