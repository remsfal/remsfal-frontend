<script lang="ts">
import { useUserSessionStore } from "@/stores/UserSession";
import UserService, { type User } from "@/services/UserService";
//import Modal from "@/components/LeoModal.vue";

export default {
  data() {
    return {
      userProfile: {} as User, // Das gesamte Benutzerprofil
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
      visible: false // Sichtbarkeit des Dialogs für Konto löschen
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
        }
      } catch (error) {
        console.error("Das Benutzerprofil konnte nicht gefunden werden", error);
      }
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    async saveProfile() {
      try {
        const userService = new UserService();
        const address = {
          street: this.editedStreet? this.editedStreet: this.userProfile.address.street,
          city: this.editedCity? this.editedCity: this.userProfile.address.city,
          zip: this.editedZip? this.editedZip: this.userProfile.address.zip,
          province: this.editedProvince? this.editedProvince: this.userProfile.address.province,
          countryCode: this.editedCountryCode? this.editedCountryCode: this.userProfile.address.countryCode,
        }
        const user = {
          id: this.userProfile.id,
          address: address, 
          firstName: this.editedFirstName? this.editedFirstName: this.userProfile.firstName,
          businessPhoneNumber: this.editedBusinessPhoneNumber? this.editedBusinessPhoneNumber: this.userProfile.businessPhoneNumber, 
          lastName: this.editedLastName? this.editedLastName: this.userProfile.lastName, 
          mobilePhoneNumber: this.editedMobilePhoneNumber? this.editedMobilePhoneNumber: this.userProfile.mobilePhoneNumber,
          privatePhoneNumber: this.editedPrivatePhoneNumber? this.editedPrivatePhoneNumber: this.userProfile.privatePhoneNumber
        }
        const updatedUser = await userService.updateUser(user);
        updatedUser ? this.userProfile = updatedUser : null;
        this.toggleEditMode();
      } catch (error) {
        console.error("Das Benutzerprofil konnte nicht geupdated werden!", error);
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
    <h1>Account Settings for {{ userProfile.email }}</h1>
    <Card>
      <template #title>Meine Daten</template>
      <template #content>
        <div v-if="userProfile">
          <div v-if="!editMode">
            <p><strong>Vorname:</strong> {{ userProfile.firstName }} {{ userProfile.lastName }}</p>
            <p><strong>Geschäftliche Telefonnummer:</strong> {{ userProfile.businessPhoneNumber }}</p>
            <p><strong>Handynummer:</strong> {{ userProfile.mobilePhoneNumber }}</p>
            <p><strong>Private Telefonnummer:</strong> {{ userProfile.privatePhoneNumber }}</p>
            <p><strong>Email:</strong> {{ userProfile.email }}</p>
            <p><strong>Registered Date:</strong> {{ userProfile.registeredDate }}</p>
            <p><strong>Last Login Date:</strong> {{ userProfile.lastLoginDate }}</p>
            <p v-if="userProfile.address"><strong>Straße</strong> {{ userProfile.address.street }}</p>
            <p v-if="userProfile.address"><strong>Postleitzahl</strong> {{ userProfile.address.zip }}</p>
            <p v-if="userProfile.address"><strong>Stadt</strong> {{ userProfile.address.city }}</p>
            <p v-if="userProfile.address"><strong>Land</strong> {{ userProfile.address.countryCode }}</p>
            <div class='buttons-container'>
              <Button icon="pi pi-user-edit" class='edit-button' @click="toggleEditMode" label="Bearbeiten" />
              <div class='delete Button'>
                <Button icon="pi pi-trash" severity="danger" aria-label="Cancel" class='delete-button'
                  label="Konto löschen" @click="visible = true" />
                <Dialog v-model:visible="visible" maximizable modal header=" " :style="{ width: '50rem' }"
                  :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                  <p class="m-0">
                    Möchtest du dein Konto wirklich löschen? Wenn das Konto gelöscht wird, dann werden alle Daten
                    entfernt und sind nicht mehr wieder herstellbar.
                  </p>
                  <Button icon="pi pi-trash" severity="danger" aria-label="Cancel" @click="deleteAccount"
                    label="Konto wirklich löschen" />
                  <Button icon="pi pi-times" class="cancelButton" severity="secondary" aria-label="Cancel"
                    @click="visible = false" label="Abbrechen" />
                </Dialog>
              </div>
            </div>
          </div>
          <div v-else>
            <FloatLabel>
              <InputText id="firstname" v-model="editedFirstName" />
              <label for="firstname">Vorname</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="lastname" v-model="editedLastName" />
              <label for="lastname">Nachname</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="businessPhoneNumber" v-model="editedBusinessPhoneNumber" pattern="^\+[1-9]\d{4,14}$" />
              <label for="businessPhoneNumber">Geschäftliche Telefonnummer</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="mobilePhoneNumber" v-model="editedMobilePhoneNumber" pattern="^\+[1-9]\d{4,14}$" />
              <label for="mobilePhoneNumber">Handynummer</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="privatePhoneNumber" v-model="editedPrivatePhoneNumber" pattern="^\+[1-9]\d{4,14}$" />
              <label for="privatePhoneNumber">Private Telefonnummer</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="street" v-model="editedStreet" />
              <label for="street">Straße</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="zip" v-model="editedZip" />
              <label for="zip">Postleitzahl</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="city" v-model="editedCity" />
              <label for="city">Stadt</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="coutryCode" v-model="editedCountryCode" />
              <label for="coutryCode">Länderkürzel</label>
            </FloatLabel>
            <Button type="button" label="Speichern" icon="pi pi-check" @click="saveProfile" />
            <Button icon="pi pi-times" class="cancelButton" severity="secondary" aria-label="Cancel"
              @click="toggleEditMode" label="Abbrechen" />
          </div>
        </div>
      </template>
    </Card>

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

.buttons-container {
  display: flex;
  width: 100%;
}

.edit-button,
.delete-button {
  flex: 1;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 16px;
}
</style>
