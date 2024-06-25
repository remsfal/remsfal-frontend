<script lang="ts">
import { useUserSessionStore } from "@/stores/UserSession";
import UserService, { type User } from "@/services/UserService";
//import Modal from "@/components/LeoModal.vue";
import { defineComponent, ref } from "vue";



export default {
  data() {
    return {
      userProfile: {} as User, // Das gesamte Benutzerprofil
      editedUserProfile: {} as User,
      editedFirstName: "",
      editedBusinessPhoneNumber: "",
      editedLastName: "",
      editedMobilePhoneNumber: "",
      editedPrivatePhoneNumber: "",
      editedStreet: "",
      editedCity: "",
      editedZip: "",
      editedProvince: "",
      editedCountryCode: "",
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
        { name: 'United States', code: 'US' }
      ],
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
          this.editedUserProfile = {...profile};
        }
      } catch (error) {
        console.error("Das Benutzerprofil konnte nicht gefunden werden", error);
      }
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    discardChanges(){
      this.editedUserProfile = {...this.userProfile};
      this.toggleEditMode();
    },
    async saveProfile() {
      try {
        const userService = new UserService();
        const address = {
          street: this.editedStreet ? this.editedStreet : this.userProfile.address.street,
          city: this.editedCity ? this.editedCity : this.userProfile.address.city,
          zip: this.editedZip ? this.editedZip : this.userProfile.address.zip,
          province: this.editedProvince ? this.editedProvince : this.userProfile.address.province,
          countryCode: this.editedCountryCode ? this.editedCountryCode : this.userProfile.address.countryCode,
        }
        const user = {
          id: this.userProfile.id,
          address: address,
          firstName: this.editedUserProfile.firstName ? this.editedUserProfile.firstName : this.userProfile.firstName,
          businessPhoneNumber: this.editedBusinessPhoneNumber ? this.editedBusinessPhoneNumber : this.userProfile.businessPhoneNumber,
          lastName: this.editedLastName ? this.editedLastName : this.userProfile.lastName,
          mobilePhoneNumber: this.editedMobilePhoneNumber ? this.editedMobilePhoneNumber : this.userProfile.mobilePhoneNumber,
          privatePhoneNumber: this.editedPrivatePhoneNumber ? this.editedPrivatePhoneNumber : this.userProfile.privatePhoneNumber
        }
        const updatedUser = await userService.updateUser(user);
        updatedUser ? this.userProfile = updatedUser : null;
        this.toggleEditMode();
      } catch (e) {
        console.error("Das Benutzerprofil konnte nicht geupdated werden!", e);
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
              <p v-if="userProfile.businessPhoneNumber"><strong>Geschäftliche Telefonnummer:</strong> {{
                userProfile.businessPhoneNumber }}</p>
              <p v-if="userProfile.mobilePhoneNumber"><strong>Handynummer:</strong> {{ userProfile.mobilePhoneNumber }}
              </p>
              <p v-if="userProfile.privatePhoneNumber"><strong>Private Telefonnummer:</strong> {{
                userProfile.privatePhoneNumber }}</p>
              <p v-if="userProfile.email"><strong>Email:</strong> {{ userProfile.email }}</p>
              <p v-if="userProfile.registeredDate"><strong>Registered Date:</strong> {{ userProfile.registeredDate }}
              </p>
              <p v-if="userProfile.lastLoginDate"><strong>Last Login Date:</strong> {{ userProfile.lastLoginDate }}</p>
            </div>
            <div v-else>
              <div class="editInputs">
                <FloatLabel>
                  <InputText id="firstname" v-model="editedUserProfile.firstName" />
                  <label for="firstname">Vorname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="lastname" v-model="editedLastName" />
                  <label for="lastname">Nachname</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="businessPhoneNumber" v-model="userProfile.businessPhoneNumber"
                    pattern="^\+[1-9]\d{4,14}$" />
                  {{ userProfile.businessPhoneNumber }}
                  <label for="businessPhoneNumber">Geschäftliche Telefonnummer</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="mobilePhoneNumber" v-model="editedMobilePhoneNumber" pattern="^\+[1-9]\d{4,14}$" />
                  <label for="mobilePhoneNumber">Handynummer</label>
                </FloatLabel>
                <FloatLabel>
                  {{ userProfile.privatePhoneNumber }}
                  <InputText id="privatePhoneNumber" v-model="editedPrivatePhoneNumber" pattern="^\+[1-9]\d{4,14}$" />
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
              <p v-if="userProfile.address?.street"><strong>Straße:</strong> {{ userProfile.address.street }}</p>
              <p v-if="userProfile.address?.zip"><strong>Postleitzahl:</strong> {{ userProfile.address.zip }}</p>
              <p v-if="userProfile.address?.city"><strong>Stadt:</strong> {{ userProfile.address.city }}</p>
              <p v-if="userProfile.address?.countryCode"><strong>Land:</strong> {{ userProfile.address.countryCode }}
              </p>
            </div>
            <div v-else>
              <div class="editInputs">
                <FloatLabel>
                  <InputText id="street" v-model="editedStreet" />
                  <label for="street">Straße</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="zip" v-model="editedZip" />
                  <label for="zip">Postleitzahl</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="city" v-model="editedCity" class="countryCode" />
                  <label for="city">Stadt</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText id="province" v-model="editedProvince" />
                  <label for="province">Bundesland</label>
                </FloatLabel>
                <div class="country">
                  <select id="countryCode" v-model="editedCountryCode" class="selectCountry">
                    <option disabled value="">Land</option>
                    <option v-for="country in countries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                  <FloatLabel>
                    <InputText id="countryCodeInput" v-model="editedCountryCode" />
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
        <div class='buttons-container'>
          <Button type="button" icon="pi pi-user-edit" class='edit-button' @click="toggleEditMode" label="Bearbeiten" />
          <Button type="button" icon="pi pi-trash" severity="danger" aria-label="Cancel" class='edit-button'
            label="Konto löschen" @click="visible = true" />
        </div>
        <div class='delete Button'>
          <Dialog v-model:visible="visible" maximizable modal header=" " :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <p>Bist du sicher, dass du dein Konto löschen möchtest? Alle deine Daten werden unwiderruflich gelöscht.</p>
            <div class='buttons-container'>
              <Button type="button" icon="pi pi-trash" severity="danger" aria-label="Cancel" @click="deleteAccount"
                label="Konto wirklich löschen" class='delete-button' />
              <Button type="button" icon="pi pi-times" class="cancel-button" severity="secondary" aria-label="Cancel"
                @click="visible = false" label="Abbrechen" />
            </div>
          </Dialog>
        </div>
      </div>
      <div v-else>
        <div class='buttons-container'>
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
</style>
