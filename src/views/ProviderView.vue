<script setup lang="ts">
import { ref, computed } from 'vue';

// Beispiel-Daten für die Dienstleister
const providers = ref([
  { id: 1, name: 'Max Mustermann', field: 'Elektriker', company: 'Musterfirma GmbH', state: 'Bayern', email: 'max@example.com', phone: '089123456' },
  { id: 2, name: 'Erika Musterfrau', field: 'Installateur', company: 'Installateure GmbH', state: 'Berlin', email: 'erika@example.com', phone: '030654321' },
  { id: 3, name: 'Hans Bauer', field: 'Schlosser', company: 'Bauer Metallbau', state: 'Hamburg', email: 'hans.bauer@example.com', phone: '040987654' },
  { id: 4, name: 'Lisa Schmidt', field: 'Maler', company: 'Farben Schmidt', state: 'Sachsen', email: 'lisa.schmidt@example.com', phone: '035123456' },
  { id: 5, name: 'Peter Müller', field: 'Elektriker', company: 'Müller Elektrotechnik', state: 'NRW', email: 'peter.m@example.com', phone: '0211123456' },
  { id: 6, name: 'Anna Fischer', field: 'Installateur', company: 'Fischer Haustechnik', state: 'Bremen', email: 'anna.fischer@example.com', phone: '042123456' },
  { id: 7, name: 'Wolfgang Klein', field: 'Zimmerer', company: 'Klein Holzbau', state: 'Thüringen', email: 'wolf.k@example.com', phone: '036123456' },
  { id: 8, name: 'Karla Weber', field: 'Tischler', company: 'Weber Holzdesign', state: 'Hessen', email: 'karla.w@example.com', phone: '0615123456' },
  { id: 9, name: 'Stefan Neumann', field: 'Dachdecker', company: 'Neumann Dächer', state: 'Bayern', email: 'stefan.n@example.com', phone: '089654321' },
  { id: 10, name: 'Julia Braun', field: 'Elektriker', company: 'Braun Elektro', state: 'Saarland', email: 'julia.b@example.com', phone: '0681123456' },
]);

// Beispiel-Daten für Aufträge (mehr gemockte Aufträge)
const orders = ref([
  { id: 1, jobName: 'Stromanschluss Neubau', client: 'Bau GmbH', state: 'Bayern', timeSpan: '01.01.2024 - 15.01.2024', compensation: '2000€', note: 'Neubau eines Wohnhauses', assignedProvider: null },
  { id: 2, jobName: 'Sanierung Heizung', client: 'Sanierungsfirma', state: 'Berlin', timeSpan: '05.02.2024 - 20.02.2024', compensation: '1500€', note: 'Heizungssystem im Bürogebäude', assignedProvider: null },
  { id: 3, jobName: 'Dachrenovierung', client: 'Hausbau GmbH', state: 'Hamburg', timeSpan: '10.03.2024 - 20.03.2024', compensation: '3000€', note: 'Dachsanierung für ein Mehrfamilienhaus', assignedProvider: null },
  { id: 4, jobName: 'Bodenverlegung', client: 'Bodenbau GmbH', state: 'Sachsen', timeSpan: '15.04.2024 - 30.04.2024', compensation: '1000€', note: 'Verlegung von Parkettböden', assignedProvider: null },
  { id: 5, jobName: 'Sanierung Altbau', client: 'Altbau GmbH', state: 'NRW', timeSpan: '01.05.2024 - 20.05.2024', compensation: '2500€', note: 'Komplette Altbausanierung', assignedProvider: null },
  { id: 6, jobName: 'Elektroinstallation Neubau', client: 'Neubau GmbH', state: 'Bremen', timeSpan: '01.06.2024 - 30.06.2024', compensation: '2200€', note: 'Elektroinstallation im Neubaugebiet', assignedProvider: null },
]);

// Suchbegriff für die Filterung der Dienstleister
const searchQuery = ref('');

// Berechnete Liste basierend auf dem Suchbegriff
const filteredProviders = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return providers.value;
  return providers.value.filter((provider) =>
      Object.values(provider).some(value => value.toString().toLowerCase().includes(query))
  );
});

// Funktion zur Hervorhebung
const highlightMatch = (text, query) => {
  if (!query) return text; // Keine Hervorhebung, wenn keine Suche
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape Sonderzeichen
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.toString().replace(regex, '<strong>$1</strong>'); // Übereinstimmungen fett markieren
};

// Bearbeitungs-, Lösch- und Hinzufügungsstatus
const editingRowId = ref<number | null>(null);
const deletingRowId = ref<number | null>(null);
const addingNew = ref(false);
const tempData = ref<Record<string, string | number>>({});
const showPopup = ref(false);
const popupMessage = ref('');

// Funktionen für die Dienstleisterverwaltung
const enableEdit = (id: number) => {
  editingRowId.value = id;
  deletingRowId.value = null;
  addingNew.value = false;
  const row = providers.value.find((provider) => provider.id === id);
  if (row) tempData.value = { ...row };
};

const saveEdit = (id: number) => {
  const index = providers.value.findIndex((provider) => provider.id === id);
  if (index !== -1) {
    providers.value[index] = { ...tempData.value } as any;
  }
  editingRowId.value = null;
};

const cancelEdit = () => {
  editingRowId.value = null;
};

const enableDelete = (id: number) => {
  deletingRowId.value = id;
  editingRowId.value = null;
  addingNew.value = false;
};

const confirmDelete = (id: number) => {
  providers.value = providers.value.filter((provider) => provider.id !== id);
  deletingRowId.value = null;
};

const cancelDelete = () => {
  deletingRowId.value = null;
};

const addNewProvider = () => {
  addingNew.value = true;
  editingRowId.value = null;
  deletingRowId.value = null;
  tempData.value = {
    id: providers.value.length + 1, // Dummy ID
    name: '',
    field: '',
    company: '',
    state: '',
    email: '',
    phone: '',
  };
};

const saveNewProvider = () => {
  if (!tempData.value.name || !tempData.value.field || !tempData.value.company || !tempData.value.state || !tempData.value.email || !tempData.value.phone) {
    alert('Bitte alle Felder ausfüllen, bevor der Dienstleister hinzugefügt werden kann!');
    return;
  }
  providers.value.unshift({ ...tempData.value } as any);
  addingNew.value = false;
  showPopup.value = true;
  popupMessage.value = `Der neue Dienstleister "${tempData.value.name}" wurde erfolgreich hinzugefügt!`;
  setTimeout(() => {
    showPopup.value = false;
  }, 3000);
};

const cancelNewProvider = () => {
  addingNew.value = false;
  tempData.value = {};
};

// Funktion für das Zuweisen von Dienstleistern zu Aufträgen
const assignProviderToOrder = (orderId: number, providerId: number) => {
  const order = orders.value.find(order => order.id === orderId);
  const provider = providers.value.find(provider => provider.id === providerId);
  if (order && provider) {
    order.assignedProvider = provider;
  }
};
</script>

<template>
  <div class="provider-view">
    <h1>Dienstleisterdaten</h1>

    <!-- Dienstleister-Tabelle -->
    <h2>
      Bestehende Dienstleister
      <i class="pi pi-user-plus add-icon" @click="addNewProvider" />
    </h2>

    <!-- Suchleiste -->
    <div class="search-bar">
      <i class="pi pi-search"></i>
      <input type="text" v-model="searchQuery" placeholder="Suchen..." />
    </div>

    <div class="table-container">
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Fachgebiet</th>
          <th>Firma</th>
          <th>Bundesland</th>
          <th>E-Mail</th>
          <th>Telefonnummer</th>
          <th>Aktionen</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="addingNew">
          <td><input v-model="tempData.name" placeholder="Name eingeben" /></td>
          <td><input v-model="tempData.field" placeholder="Fachgebiet eingeben" /></td>
          <td><input v-model="tempData.company" placeholder="Firma eingeben" /></td>
          <td><input v-model="tempData.state" placeholder="Bundesland eingeben" /></td>
          <td><input v-model="tempData.email" placeholder="E-Mail eingeben" /></td>
          <td><input v-model="tempData.phone" placeholder="Telefonnummer eingeben" /></td>
          <td>
            <i class="pi pi-check" @click="saveNewProvider" />
            <i class="pi pi-times" @click="cancelNewProvider" style="margin-left: 10px;" />
          </td>
        </tr>
        <tr v-for="provider in filteredProviders" :key="provider.id">
          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.name" />
          </td>
          <td v-else v-html="highlightMatch(provider.name, searchQuery)" />

          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.field" />
          </td>
          <td v-else v-html="highlightMatch(provider.field, searchQuery)" />

          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.company" />
          </td>
          <td v-else v-html="highlightMatch(provider.company, searchQuery)" />

          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.state" />
          </td>
          <td v-else v-html="highlightMatch(provider.state, searchQuery)" />

          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.email" />
          </td>
          <td v-else v-html="highlightMatch(provider.email, searchQuery)" />

          <td v-if="editingRowId === provider.id">
            <input v-model="tempData.phone" />
          </td>
          <td v-else v-html="highlightMatch(provider.phone, searchQuery)" />

          <td>
            <template v-if="editingRowId === provider.id">
              <i class="pi pi-check" @click="saveEdit(provider.id)" />
              <i class="pi pi-times" @click="cancelEdit" style="margin-left: 10px;" />
            </template>
            <template v-else-if="deletingRowId === provider.id">
              <i class="pi pi-check" @click="confirmDelete(provider.id)" />
              <i class="pi pi-times" @click="cancelDelete" style="margin-left: 10px;" />
            </template>
            <template v-else>
              <i class="pi pi-pen-to-square" @click="enableEdit(provider.id)" />
              <i class="pi pi-trash" @click="enableDelete(provider.id)" style="margin-left: 10px;" />
            </template>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Aufträge-Tabelle -->
    <h2>Aufträge</h2>
    <div class="table-container">
      <table>
        <thead>
        <tr>
          <th>Auftragsname</th>
          <th>Auftraggeber</th>
          <th>Bundesland</th>
          <th>Auftragszeitspanne</th>
          <th>Vergütung</th>
          <th>Notiz</th>
          <th>Auftrag zuordnen</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.jobName }}</td>
          <td>{{ order.client }}</td>
          <td>{{ order.state }}</td>
          <td>{{ order.timeSpan }}</td>
          <td>{{ order.compensation }}</td>
          <td>{{ order.note }}</td>
          <td>
            <input v-model="order.assignedProvider" list="provider-list" placeholder="Dienstleister zuordnen" />
            <datalist id="provider-list">
              <option v-for="provider in providers" :key="provider.id" :value="provider.name" />
            </datalist>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Pop-Up Benachrichtigung -->
    <div v-if="showPopup" class="popup">
      {{ popupMessage }}
    </div>
  </div>
</template>

<style scoped>
/* Stile für die Tabellen und Pop-Up */
.table-container {
  max-height: 250px;
  overflow-y: auto;
  border: 2px solid #ddd;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 2px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

td input, td select {
  width: 90%;
}

td i {
  cursor: pointer;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar i {
  margin-right: 10px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
}

strong {
  font-weight: bold;
}

.add-icon {
  font-size: 1.5rem;
  cursor: pointer;
}

.popup {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

/* Zentriert den Inhalt der "Aktionen"-Spalte */
.table-container td:last-child {
  text-align: center; /* Zentriert den Inhalt horizontal */
  vertical-align: middle; /* Zentriert den Inhalt vertikal */
}

.table-container td:last-child i {
  margin: 0 5px; /* Fügt Abstand zwischen den Icons hinzu */
}
</style>