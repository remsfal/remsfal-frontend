<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { buildingService, type BuildingUnit } from '@/services/BuildingService';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const router = useRouter();

// Länder für Dropdown
const countries = [
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Albanien', code: 'AL' },
  { name: 'Algerien', code: 'DZ' },
  { name: 'Andorra', code: 'AD' },
  { name: 'Angola', code: 'AO' },
  { name: 'Antigua und Barbuda', code: 'AG' },
  { name: 'Argentinien', code: 'AR' },
  { name: 'Armenien', code: 'AM' },
  { name: 'Australien', code: 'AU' },
  { name: 'Österreich', code: 'AT' },
  { name: 'Aserbaidschan', code: 'AZ' },
  { name: 'Bahamas', code: 'BS' },
  { name: 'Bahrain', code: 'BH' },
  { name: 'Bangladesch', code: 'BD' },
  { name: 'Barbados', code: 'BB' },
  { name: 'Weißrussland', code: 'BY' },
  { name: 'Belgien', code: 'BE' },
  { name: 'Belize', code: 'BZ' },
  { name: 'Benin', code: 'BJ' },
  { name: 'Bhutan', code: 'BT' },
  { name: 'Bolivien', code: 'BO' },
  { name: 'Bosnien und Herzegowina', code: 'BA' },
  { name: 'Botswana', code: 'BW' },
  { name: 'Brasilien', code: 'BR' },
  { name: 'Brunei', code: 'BN' },
  { name: 'Bulgarien', code: 'BG' },
  { name: 'Burkina Faso', code: 'BF' },
  { name: 'Burundi', code: 'BI' },
  { name: 'Kambodscha', code: 'KH' },
  { name: 'Kamerun', code: 'CM' },
  { name: 'Kanada', code: 'CA' },
  { name: 'Kap Verde', code: 'CV' },
  { name: 'Zentralafrikanische Republik', code: 'CF' },
  { name: 'Tschad', code: 'TD' },
  { name: 'Chile', code: 'CL' },
  { name: 'China', code: 'CN' },
  { name: 'Kolumbien', code: 'CO' },
  { name: 'Komoren', code: 'KM' },
  { name: 'Kongo (Brazzaville)', code: 'CG' },
  { name: 'Kongo (Kinshasa)', code: 'CD' },
  { name: 'Costa Rica', code: 'CR' },
  { name: 'Kroatien', code: 'HR' },
  { name: 'Kuba', code: 'CU' },
  { name: 'Zypern', code: 'CY' },
  { name: 'Tschechien', code: 'CZ' },
  { name: 'Dänemark', code: 'DK' },
  { name: 'Dschibuti', code: 'DJ' },
  { name: 'Dominica', code: 'DM' },
  { name: 'Dominikanische Republik', code: 'DO' },
  { name: 'Ecuador', code: 'EC' },
  { name: 'Ägypten', code: 'EG' },
  { name: 'El Salvador', code: 'SV' },
  { name: 'Äquatorialguinea', code: 'GQ' },
  { name: 'Eritrea', code: 'ER' },
  { name: 'Estland', code: 'EE' },
  { name: 'Eswatini', code: 'SZ' },
  { name: 'Äthiopien', code: 'ET' },
  { name: 'Fidschi', code: 'FJ' },
  { name: 'Finnland', code: 'FI' },
  { name: 'Frankreich', code: 'FR' },
  { name: 'Gabun', code: 'GA' },
  { name: 'Gambia', code: 'GM' },
  { name: 'Georgien', code: 'GE' },
  { name: 'Deutschland', code: 'DE' },
  { name: 'Ghana', code: 'GH' },
  { name: 'Griechenland', code: 'GR' },
  { name: 'Grenada', code: 'GD' },
  { name: 'Guatemala', code: 'GT' },
  { name: 'Guinea', code: 'GN' },
  { name: 'Guinea-Bissau', code: 'GW' },
  { name: 'Guyana', code: 'GY' },
  { name: 'Haiti', code: 'HT' },
  { name: 'Honduras', code: 'HN' },
  { name: 'Ungarn', code: 'HU' },
  { name: 'Island', code: 'IS' },
  { name: 'Indien', code: 'IN' },
  { name: 'Indonesien', code: 'ID' },
  { name: 'Iran', code: 'IR' },
  { name: 'Irak', code: 'IQ' },
  { name: 'Irland', code: 'IE' },
  { name: 'Israel', code: 'IL' },
  { name: 'Italien', code: 'IT' },
  { name: 'Jamaika', code: 'JM' },
  { name: 'Japan', code: 'JP' },
  { name: 'Jordanien', code: 'JO' },
  { name: 'Kasachstan', code: 'KZ' },
  { name: 'Kenia', code: 'KE' },
  { name: 'Kiribati', code: 'KI' },
  { name: 'Nordkorea', code: 'KP' },
  { name: 'Südkorea', code: 'KR' },
  { name: 'Kuwait', code: 'KW' },
  { name: 'Kirgisistan', code: 'KG' },
  { name: 'Laos', code: 'LA' },
  { name: 'Lettland', code: 'LV' },
  { name: 'Libanon', code: 'LB' },
  { name: 'Lesotho', code: 'LS' },
  { name: 'Liberia', code: 'LR' },
  { name: 'Libyen', code: 'LY' },
  { name: 'Liechtenstein', code: 'LI' },
  { name: 'Litauen', code: 'LT' },
  { name: 'Luxemburg', code: 'LU' },
  { name: 'Madagaskar', code: 'MG' },
  { name: 'Malawi', code: 'MW' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Malediven', code: 'MV' },
  { name: 'Mali', code: 'ML' },
  { name: 'Malta', code: 'MT' },
  { name: 'Marshallinseln', code: 'MH' },
  { name: 'Mauretanien', code: 'MR' },
  { name: 'Mauritius', code: 'MU' },
  { name: 'Mexiko', code: 'MX' },
  { name: 'Mikronesien', code: 'FM' },
  { name: 'Moldawien', code: 'MD' },
  { name: 'Monaco', code: 'MC' },
  { name: 'Mongolei', code: 'MN' },
  { name: 'Montenegro', code: 'ME' },
  { name: 'Marokko', code: 'MA' },
  { name: 'Mosambik', code: 'MZ' },
  { name: 'Myanmar', code: 'MM' },
  { name: 'Namibia', code: 'NA' },
  { name: 'Nauru', code: 'NR' },
  { name: 'Nepal', code: 'NP' },
  { name: 'Niederlande', code: 'NL' },
  { name: 'Neuseeland', code: 'NZ' },
  { name: 'Nicaragua', code: 'NI' },
  { name: 'Niger', code: 'NE' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Norwegen', code: 'NO' },
  { name: 'Oman', code: 'OM' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'Palau', code: 'PW' },
  { name: 'Panama', code: 'PA' },
  { name: 'Papua-Neuguinea', code: 'PG' },
  { name: 'Paraguay', code: 'PY' },
  { name: 'Peru', code: 'PE' },
  { name: 'Philippinen', code: 'PH' },
  { name: 'Polen', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Katar', code: 'QA' },
  { name: 'Rumänien', code: 'RO' },
  { name: 'Russland', code: 'RU' },
  { name: 'Ruanda', code: 'RW' },
  { name: 'St. Kitts und Nevis', code: 'KN' },
  { name: 'St. Lucia', code: 'LC' },
  { name: 'St. Vincent und die Grenadinen', code: 'VC' },
  { name: 'Samoa', code: 'WS' },
  { name: 'San Marino', code: 'SM' },
  { name: 'Sao Tome und Principe', code: 'ST' },
  { name: 'Saudi-Arabien', code: 'SA' },
  { name: 'Senegal', code: 'SN' },
  { name: 'Serbien', code: 'RS' },
  { name: 'Seychellen', code: 'SC' },
  { name: 'Sierra Leone', code: 'SL' },
  { name: 'Singapur', code: 'SG' },
  { name: 'Slowakei', code: 'SK' },
  { name: 'Slowenien', code: 'SI' },
  { name: 'Salomonen', code: 'SB' },
  { name: 'Somalia', code: 'SO' },
  { name: 'Südafrika', code: 'ZA' },
  { name: 'Spanien', code: 'ES' },
  { name: 'Sri Lanka', code: 'LK' },
  { name: 'Sudan', code: 'SD' },
  { name: 'Südsudan', code: 'SS' },
  { name: 'Suriname', code: 'SR' },
  { name: 'Schweden', code: 'SE' },
  { name: 'Schweiz', code: 'CH' },
  { name: 'Syrien', code: 'SY' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'Tadschikistan', code: 'TJ' },
  { name: 'Tansania', code: 'TZ' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Togo', code: 'TG' },
  { name: 'Tonga', code: 'TO' },
  { name: 'Trinidad und Tobago', code: 'TT' },
  { name: 'Tunesien', code: 'TN' },
  { name: 'Türkei', code: 'TR' },
  { name: 'Turkmenistan', code: 'TM' },
  { name: 'Tuvalu', code: 'TV' },
  { name: 'Uganda', code: 'UG' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'Vereinigte Arabische Emirate', code: 'AE' },
  { name: 'Vereinigtes Königreich', code: 'GB' },
  { name: 'Vereinigte Staaten', code: 'US' },
  { name: 'Uruguay', code: 'UY' },
  { name: 'Usbekistan', code: 'UZ' },
  { name: 'Vanuatu', code: 'VU' },
  { name: 'Venezuela', code: 'VE' },
  { name: 'Vietnam', code: 'VN' },
  { name: 'Jemen', code: 'YE' },
  { name: 'Sambia', code: 'ZM' },
  { name: 'Simbabwe', code: 'ZW' },
];

// Einzelne refs für Felder
const title = ref('');
const description = ref('');
const livingSpace = ref<number | null>(null);
const commercialSpace = ref<number | null>(null);
const usableSpace = ref<number | null>(null);
const heatingSpace = ref<number | null>(null);

// Adresse einzeln
const street = ref('');
const city = ref('');
const province = ref('');
const zip = ref('');
const country = ref('');

// Originalwerte zum Vergleich
const originalValues = ref({
  title: '',
  description: '',
  livingSpace: null as number | null,
  commercialSpace: null as number | null,
  usableSpace: null as number | null,
  heatingSpace: null as number | null,
  street: '',
  city: '',
  province: '',
  zip: '',
  country: '',
});

const hasChanges = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    livingSpace.value !== originalValues.value.livingSpace ||
    commercialSpace.value !== originalValues.value.commercialSpace ||
    usableSpace.value !== originalValues.value.usableSpace ||
    heatingSpace.value !== originalValues.value.heatingSpace ||
    street.value !== originalValues.value.street ||
    city.value !== originalValues.value.city ||
    province.value !== originalValues.value.province ||
    zip.value !== originalValues.value.zip ||
    country.value !== originalValues.value.country
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];

  if (livingSpace.value !== null && livingSpace.value < 0) {
    errors.push('Wohnfläche darf nicht negativ sein.');
  }

  if (commercialSpace.value !== null && commercialSpace.value < 0) {
    errors.push('Gewerbefläche darf nicht negativ sein.');
  }

  if (usableSpace.value !== null && usableSpace.value < 0) {
    errors.push('Nutzfläche darf nicht negativ sein.');
  }

  if (heatingSpace.value !== null && heatingSpace.value < 0) {
    errors.push('Heizfläche darf nicht negativ sein.');
  }

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchBuildingDetails = () => {
  buildingService
    .getBuilding(props.projectId, props.unitId)
    .then((building) => {
      title.value = building.title || '';
      description.value = building.description || '';
      livingSpace.value = building.livingSpace ?? null;
      commercialSpace.value = building.commercialSpace ?? null;
      usableSpace.value = building.usableSpace ?? null;
      heatingSpace.value = building.heatingSpace ?? null;

      if (building.address) {
        street.value = building.address.street || '';
        city.value = building.address.city || '';
        province.value = building.address.province || '';
        zip.value = building.address.zip || '';
        country.value = country.value = building.address.country?.replace(/^_/, '') || '';
      } else {
        street.value = '';
        city.value = '';
        province.value = '';
        zip.value = '';
        country.value = '';
      }

      originalValues.value = {
        title: title.value,
        description: description.value,
        livingSpace: livingSpace.value,
        commercialSpace: commercialSpace.value,
        usableSpace: usableSpace.value,
        heatingSpace: heatingSpace.value,
        street: street.value,
        city: city.value,
        province: province.value,
        zip: zip.value,
        country: country.value,
      };
    })
    .catch((err) => {
      console.error('Fehler beim Laden des Gebäudes:', err);
    });
};

onMounted(() => {
  if (props.unitId) {
    fetchBuildingDetails();
  }
});

const save = () => {
  if (!isValid.value) {
    alert('Bitte beheben Sie die Validierungsfehler.');
    return;
  }
  const payload: BuildingUnit = {
    title: title.value,
    description: description.value,
    address: {
      street: street.value,
      city: city.value,
      province: province.value,
      zip: zip.value,
      country: country.value,
    },
    livingSpace: livingSpace.value ?? undefined,
    commercialSpace: commercialSpace.value ?? undefined,
    usableSpace: usableSpace.value ?? undefined,
    heatingSpace: heatingSpace.value ?? undefined,
  };

  buildingService
    .updateBuilding(props.projectId, props.unitId, payload)
    .then(() => {
      alert('Gebäude erfolgreich gespeichert');
      window.location.reload();
    })
    .catch((err) => {
      console.error('Fehler beim Speichern:', err);
      alert('Fehler beim Speichern');
    });
};

const cancel = () => {
  if (window.opener) {
    window.close();
  } else {
    router.push(`/project/${props.projectId}/objects`);
  }
};
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">Bearbeite Gebäude mit ID: {{ unitId }}</h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <!-- Titel -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Titel</label>
            <input v-model="title" type="text" class="form-input w-full" />
          </div>

          <!-- Beschreibung -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Beschreibung</label>
            <textarea v-model="description" rows="3" class="form-textarea w-full" />
          </div>

          <!-- Adresse - Straße -->
          <div>
            <label class="block text-gray-700 mb-1">Straße</label>
            <input v-model="street" type="text" class="form-input w-full" />
          </div>

          <!-- Stadt -->
          <div>
            <label class="block text-gray-700 mb-1">Stadt</label>
            <input v-model="city" type="text" class="form-input w-full" />
          </div>

          <!-- Provinz / Bundesland -->
          <div>
            <label class="block text-gray-700 mb-1">Provinz / Bundesland</label>
            <input v-model="province" type="text" class="form-input w-full" />
          </div>

          <!-- PLZ -->
          <div>
            <label class="block text-gray-700 mb-1">PLZ</label>
            <input v-model="zip" type="text" class="form-input w-full" />
          </div>

          <!-- Land -->
          <div>
            <label class="block text-gray-700 mb-1">Land</label>
            <select v-model="country" class="form-input w-full">
              <option value="" disabled>Bitte Land wählen</option>
              <option v-for="c in countries" :key="c.code" :value="c.code">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Wohnfläche -->
          <div>
            <label class="block text-gray-700 mb-1">Wohnfläche (m²)</label>
            <input v-model.number="livingSpace" type="number" class="form-input w-full" />
          </div>

          <!-- Gewerbefläche -->
          <div>
            <label class="block text-gray-700 mb-1">Gewerbefläche (m²)</label>
            <input v-model.number="commercialSpace" type="number" class="form-input w-full" />
          </div>

          <!-- Nutzfläche -->
          <div>
            <label class="block text-gray-700 mb-1">Nutzfläche (m²)</label>
            <input v-model.number="usableSpace" type="number" class="form-input w-full" />
          </div>

          <!-- Heizfläche -->
          <div>
            <label class="block text-gray-700 mb-1">Heizfläche (m²)</label>
            <input v-model.number="heatingSpace" type="number" class="form-input w-full" />
          </div>
        </div>

        <!-- Validierungsfehler -->
        <div v-if="validationErrors.length" class="text-red-600 mt-4">
          <ul>
            <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
          </ul>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            :disabled="!hasChanges"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Speichern
          </button>

          <button
            type="button"
            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            @click="cancel"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-input,
.form-textarea {
  background-color: #f3f4f6;
  border-radius: 0.5rem;
}
</style>
